import { z } from 'zod';

// Slug validation schema
export const slugSchema = z
  .string()
  .min(3, 'Slug must be at least 3 characters')
  .max(32, 'Slug must be less than 32 characters')
  .regex(
    /^[a-z0-9-]+$/,
    'Slug can only contain lowercase letters, numbers, and hyphens'
  )
  .refine(
    (slug) => !slug.startsWith('-') && !slug.endsWith('-'),
    'Slug cannot start or end with a hyphen'
  )
  .refine(
    (slug) => !slug.includes('--'),
    'Slug cannot contain consecutive hyphens'
  );

// Generate slug from name
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove invalid characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

// Generate slug suggestions
export function generateSlugSuggestions(
  baseSlug: string,
  takenSlugs: string[] = []
): string[] {
  const suggestions: string[] = [];
  
  // If base slug is available, return it first
  if (!takenSlugs.includes(baseSlug)) {
    suggestions.push(baseSlug);
  }
  
  // Add numbered variations
  for (let i = 1; i <= 5; i++) {
    const numberedSlug = `${baseSlug}-${i}`;
    if (!takenSlugs.includes(numberedSlug)) {
      suggestions.push(numberedSlug);
    }
  }
  
  // Add year suffix
  const currentYear = new Date().getFullYear();
  const yearSlug = `${baseSlug}-${currentYear}`;
  if (!takenSlugs.includes(yearSlug)) {
    suggestions.push(yearSlug);
  }
  
  // Add random suffix
  const randomSuffix = Math.random().toString(36).substr(2, 4);
  const randomSlug = `${baseSlug}-${randomSuffix}`;
  if (!takenSlugs.includes(randomSlug)) {
    suggestions.push(randomSlug);
  }
  
  // Add shortened versions if original is too long
  if (baseSlug.length > 16) {
    const shortened = baseSlug.substr(0, 16);
    if (!takenSlugs.includes(shortened)) {
      suggestions.push(shortened);
    }
    
    const shortenedWithNumber = `${shortened}-1`;
    if (!takenSlugs.includes(shortenedWithNumber)) {
      suggestions.push(shortenedWithNumber);
    }
  }
  
  return suggestions.slice(0, 5); // Return max 5 suggestions
}

// Validate slug format
export function isValidSlugFormat(slug: string): boolean {
  try {
    slugSchema.parse(slug);
    return true;
  } catch {
    return false;
  }
}

// Get slug validation error message
export function getSlugValidationError(slug: string): string | null {
  try {
    slugSchema.parse(slug);
    return null;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.errors[0]?.message || 'Invalid slug format';
    }
    return 'Invalid slug format';
  }
}

// Portfolio form schemas
export const portfolioFormSchema = z.object({
  personalInfo: z.object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().optional(),
    location: z.string().optional(),
    website: z.string().url().optional().or(z.literal('')),
    bio: z.string().optional(),
    tagline: z.string().optional(),
  }),
  brandName: z.string().min(1, 'Brand name is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  heroImage: z.string().url('Invalid image URL').optional().or(z.literal('')),
  theme: z.string().default('dark'),
  isPublic: z.boolean().default(true),
  customSlug: z.string().optional(),
});

export const slugFormSchema = z.object({
  preferredName: z.string().min(2, 'Preferred name must be at least 2 characters'),
  customSlug: slugSchema.optional(),
});

export type PortfolioFormData = z.infer<typeof portfolioFormSchema>;
export type SlugFormData = z.infer<typeof slugFormSchema>;
