'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import {
  checkSlugAvailability,
  getSlugSuggestions,
  updatePortfolioSlug,
  removeCustomSlug,
  getCurrentSlugs,
  SlugCheckResponse,
  SlugUpdateResponse
} from '@/lib/slug-api';

// Query keys
const slugKeys = {
  all: ['slugs'] as const,
  portfolioSlugs: (portfolioId: string) => [...slugKeys.all, 'portfolio', portfolioId] as const,
  slugCheck: (slug: string) => [...slugKeys.all, 'check', slug] as const,
  suggestions: (baseName: string) => [...slugKeys.all, 'suggestions', baseName] as const,
};

// Hook for checking slug availability
export function useSlugAvailability(slug: string, enabled: boolean = true) {
  return useQuery({
    queryKey: slugKeys.slugCheck(slug),
    queryFn: () => checkSlugAvailability(slug),
    enabled: enabled && !!slug && slug.length >= 3,
    staleTime: 30 * 1000, // 30 seconds
    retry: 1,
  });
}

// Hook for getting slug suggestions
export function useSlugSuggestions(baseName: string, enabled: boolean = true) {
  return useQuery({
    queryKey: slugKeys.suggestions(baseName),
    queryFn: () => getSlugSuggestions(baseName),
    enabled: enabled && !!baseName,
    staleTime: 60 * 1000, // 1 minute
    retry: 1,
  });
}

// Hook for getting current portfolio slugs
export function usePortfolioSlugs(portfolioId: string) {
  return useQuery({
    queryKey: slugKeys.portfolioSlugs(portfolioId),
    queryFn: () => getCurrentSlugs(portfolioId),
    enabled: !!portfolioId,
    staleTime: 30 * 1000, // 30 seconds
  });
}

// Hook for updating portfolio slug
export function useUpdateSlug() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ portfolioId, slug }: { portfolioId: string; slug: string }) =>
      updatePortfolioSlug(portfolioId, slug),
    onSuccess: (data, variables) => {
      if (data.success) {
        // Invalidate and refetch portfolio slugs
        queryClient.invalidateQueries({
          queryKey: slugKeys.portfolioSlugs(variables.portfolioId),
        });
        
        // Invalidate slug check queries
        queryClient.invalidateQueries({
          queryKey: slugKeys.slugCheck(variables.slug),
        });
        
        toast.success('Slug updated successfully!');
      } else {
        toast.error(data.message || 'Failed to update slug');
      }
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update slug');
    },
  });
}

// Hook for removing custom slug
export function useRemoveSlug() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (portfolioId: string) => removeCustomSlug(portfolioId),
    onSuccess: (data, portfolioId) => {
      if (data.success) {
        // Invalidate and refetch portfolio slugs
        queryClient.invalidateQueries({
          queryKey: slugKeys.portfolioSlugs(portfolioId),
        });
        
        toast.success('Custom slug removed successfully!');
      } else {
        toast.error(data.message || 'Failed to remove custom slug');
      }
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to remove custom slug');
    },
  });
}

// Hook for prefetching slug data
export function usePrefetchSlugData() {
  const queryClient = useQueryClient();

  const prefetchSlugCheck = (slug: string) => {
    queryClient.prefetchQuery({
      queryKey: slugKeys.slugCheck(slug),
      queryFn: () => checkSlugAvailability(slug),
      staleTime: 30 * 1000,
    });
  };

  const prefetchSuggestions = (baseName: string) => {
    queryClient.prefetchQuery({
      queryKey: slugKeys.suggestions(baseName),
      queryFn: () => getSlugSuggestions(baseName),
      staleTime: 60 * 1000,
    });
  };

  return {
    prefetchSlugCheck,
    prefetchSuggestions,
  };
}

export { slugKeys };
