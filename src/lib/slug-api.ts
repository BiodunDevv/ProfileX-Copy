const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

export interface SlugCheckResponse {
  available: boolean;
  suggestions?: string[];
  message?: string;
}

export interface SlugUpdateResponse {
  success: boolean;
  slug?: string;
  message?: string;
}

// Check if slug is available (using suggestions endpoint)
export async function checkSlugAvailability(slug: string): Promise<SlugCheckResponse> {
  try {
    const token = JSON.parse(localStorage.getItem('auth-storage') || '{}')?.state?.token;
    
    if (!token) {
      throw new Error('Authentication required');
    }

    // For now, we'll do basic validation since we need a portfolio ID for the suggestions endpoint
    if (!slug || slug.length < 2) {
      return {
        available: false,
        message: 'Slug must be at least 2 characters long'
      };
    }

    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(slug)) {
      return {
        available: false,
        message: 'Slug can only contain lowercase letters, numbers, and hyphens'
      };
    }

    return {
      available: true,
      message: 'Slug format is valid'
    };
  } catch (error) {
    console.error('Error checking slug availability:', error);
    return {
      available: false,
      message: 'Failed to check slug availability',
    };
  }
}

// Get slug suggestions using your backend API
export async function getSlugSuggestions(baseName: string, portfolioId?: string): Promise<string[]> {
  try {
    const token = JSON.parse(localStorage.getItem('auth-storage') || '{}')?.state?.token;
    
    if (!token || !portfolioId) {
      // Generate basic suggestions client-side if no auth or portfolio ID
      const baseSlug = baseName
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

      return [
        baseSlug,
        `${baseSlug}-1`,
        `${baseSlug}-portfolio`,
        `${baseSlug}-dev`,
        `${baseSlug}-2025`
      ].filter(Boolean);
    }

    const response = await fetch(
      `${API_BASE_URL}/portfolio1/${portfolioId}/slug-suggestions?base=${encodeURIComponent(baseName)}`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.ok) {
      const result = await response.json();
      if (result.success && result.data?.suggestions) {
        return result.data.suggestions
          .filter((s: any) => s.available)
          .map((s: any) => s.slug);
      }
    }

    // Fallback to client-side generation
    const baseSlug = baseName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    return [baseSlug, `${baseSlug}-1`, `${baseSlug}-portfolio`];
  } catch (error) {
    console.error('Error getting slug suggestions:', error);
    return [];
  }
}

// Update portfolio slug using your unified manage-slug endpoint
export async function updatePortfolioSlug(
  portfolioId: string,
  slug: string
): Promise<SlugUpdateResponse> {
  try {
    const token = JSON.parse(localStorage.getItem('auth-storage') || '{}')?.state?.token;
    
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/portfolio1/${portfolioId}/manage-slug`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ 
        action: 'update',
        customSlug: slug 
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: result.message || 'Failed to update slug',
      };
    }

    return {
      success: true,
      slug: result.data?.portfolio?.newSlug || slug,
      message: result.message || 'Slug updated successfully'
    };
  } catch (error) {
    console.error('Error updating slug:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update slug',
    };
  }
}

// Remove custom slug using your unified manage-slug endpoint
export async function removeCustomSlug(portfolioId: string): Promise<SlugUpdateResponse> {
  try {
    const token = JSON.parse(localStorage.getItem('auth-storage') || '{}')?.state?.token;
    
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/portfolio1/${portfolioId}/manage-slug`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ action: 'remove' }),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: result.message || 'Failed to remove custom slug',
      };
    }

    return {
      success: true,
      slug: result.data?.portfolio?.newSlug,
      message: result.message || 'Custom slug removed successfully'
    };
  } catch (error) {
    console.error('Error removing custom slug:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to remove custom slug',
    };
  }
}

// Get current portfolio slugs using your custom-slug-info endpoint
export async function getCurrentSlugs(portfolioId: string) {
  try {
    const token = JSON.parse(localStorage.getItem('auth-storage') || '{}')?.state?.token;
    
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/portfolio1/${portfolioId}/custom-slug-info`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get current slugs');
    }

    const result = await response.json();
    
    if (result.success && result.data) {
      return {
        defaultSlug: result.data.defaultSlug,
        customSlug: result.data.customSlug,
        activeSlug: result.data.activeSlug,
        hasCustomSlug: result.data.hasCustomSlug,
        shareableLink: result.data.shareableLink,
        links: result.data.links
      };
    }

    return {
      defaultSlug: '',
      customSlug: null,
    };
  } catch (error) {
    console.error('Error getting current slugs:', error);
    return {
      defaultSlug: '',
      customSlug: null,
    };
  }
}

// Create portfolio slug from preferred name using your unified manage-slug endpoint
export async function createPortfolioSlug(
  portfolioId: string,
  preferredName: string
): Promise<SlugUpdateResponse> {
  try {
    const token = JSON.parse(localStorage.getItem('auth-storage') || '{}')?.state?.token;
    
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/portfolio1/${portfolioId}/manage-slug`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ 
        action: 'create',
        preferredName: preferredName 
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: result.message || 'Failed to create slug',
      };
    }

    return {
      success: true,
      slug: result.data?.portfolio?.newSlug,
      message: result.message || 'Slug created successfully'
    };
  } catch (error) {
    console.error('Error creating slug:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to create slug',
    };
  }
}
