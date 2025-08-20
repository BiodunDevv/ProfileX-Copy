interface SlugAvailabilityResult {
  available: boolean;
  message?: string;
}

export async function checkSlugAvailability(slug: string): Promise<SlugAvailabilityResult> {
  try {
    const response = await fetch(`/api/portfolio1/check-slug/${encodeURIComponent(slug)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Note: Add auth header if needed for protected endpoints
        ...(localStorage.getItem('auth-storage') && {
          'Authorization': `Bearer ${JSON.parse(localStorage.getItem('auth-storage') || '{}')?.state?.token}`
        })
      },
    });

    if (!response.ok) {
      throw new Error('Failed to check slug availability');
    }

    const data = await response.json();
    return {
      available: data.available === true,
      message: data.message
    };
  } catch (error) {
    console.error('Error checking slug availability:', error);
    return {
      available: false,
      message: 'Error checking availability'
    };
  }
}
