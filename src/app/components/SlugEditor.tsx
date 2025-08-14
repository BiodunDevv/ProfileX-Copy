'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDebounce } from 'use-debounce';
import { motion } from 'framer-motion';
import { Save, X, Loader2 } from 'lucide-react';

import { Button } from '@/app/components/UI/button';
import { Input } from '@/app/components/UI/input';
import { Label } from '@/app/components/UI/label';
import { SlugStatusIndicator, SlugStatus } from '@/app/components/SlugStatusIndicator';
import { SlugSuggestions } from '@/app/components/SlugSuggestions';

import { 
  slugFormSchema, 
  SlugFormData, 
  generateSlug, 
  getSlugValidationError 
} from '@/lib/slug-utils';
import { 
  useSlugAvailability,
  useSlugSuggestions,
  useUpdateSlug
} from '@/hooks/useSlugManagement';

interface SlugEditorProps {
  portfolioId: string;
  currentSlug?: string;
  defaultName: string;
  onSuccess?: (newSlug: string) => void;
  onCancel?: () => void;
  className?: string;
}

export function SlugEditor({ 
  portfolioId,
  currentSlug,
  defaultName,
  onSuccess,
  onCancel,
  className
}: SlugEditorProps) {
  const [slugStatus, setSlugStatus] = useState<SlugStatus>('idle');
  const [slugStatusMessage, setSlugStatusMessage] = useState<string>('');

  const updateSlugMutation = useUpdateSlug();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
    reset
  } = useForm<SlugFormData>({
    resolver: zodResolver(slugFormSchema),
    defaultValues: {
      preferredName: defaultName,
      customSlug: currentSlug || '',
    },
    mode: 'onChange',
  });

  const watchedPreferredName = watch('preferredName');
  const watchedCustomSlug = watch('customSlug');
  
  // Debounce the slug for API calls
  const [debouncedSlug] = useDebounce(watchedCustomSlug, 300);

  // React Query hooks
  const { 
    data: slugCheckData, 
    isLoading: isCheckingSlug, 
    error: slugCheckError 
  } = useSlugAvailability(
    debouncedSlug ?? '', 
    !!debouncedSlug && debouncedSlug !== currentSlug
  );

  const { 
    data: suggestions = [], 
    isLoading: isLoadingSuggestions 
  } = useSlugSuggestions(
    debouncedSlug ?? '',
    !!(slugCheckData && !slugCheckData.available && debouncedSlug)
  );

  // Auto-generate slug from preferred name
  useEffect(() => {
    if (watchedPreferredName) {
      const generatedSlug = generateSlug(watchedPreferredName);
      if (!watchedCustomSlug || watchedCustomSlug === generateSlug(defaultName || '')) {
        setValue('customSlug', generatedSlug, { shouldValidate: true });
      }
    }
  }, [watchedPreferredName, watchedCustomSlug, defaultName, setValue]);

  // Update slug status based on API response
  useEffect(() => {
    if (!debouncedSlug) {
      setSlugStatus('idle');
      setSlugStatusMessage('');
      return;
    }

    // Check format first
    const validationError = getSlugValidationError(debouncedSlug);
    if (validationError) {
      setSlugStatus('invalid');
      setSlugStatusMessage(validationError);
      return;
    }

    // If it's the current slug, it's available
    if (debouncedSlug === currentSlug) {
      setSlugStatus('available');
      setSlugStatusMessage('This is your current slug');
      return;
    }

    // Check API response
    if (isCheckingSlug) {
      setSlugStatus('checking');
      setSlugStatusMessage('Checking availability...');
    } else if (slugCheckError) {
      setSlugStatus('error');
      setSlugStatusMessage('Error checking slug availability');
    } else if (slugCheckData) {
      if (slugCheckData.available) {
        setSlugStatus('available');
        setSlugStatusMessage('Slug is available');
      } else {
        setSlugStatus('taken');
        setSlugStatusMessage(slugCheckData.message || 'Slug is already taken');
      }
    }
  }, [debouncedSlug, currentSlug, isCheckingSlug, slugCheckData, slugCheckError]);

  const onSubmit = async (data: SlugFormData) => {
    if (!data.customSlug) return;

    try {
      await updateSlugMutation.mutateAsync({
        portfolioId,
        slug: data.customSlug
      });
      
      onSuccess?.(data.customSlug);
    } catch (error) {
      // Error handling is done in the mutation hook
      console.error('Error updating slug:', error);
    }
  };

  const handleSuggestionSelect = (suggestion: string) => {
    setValue('customSlug', suggestion, { shouldValidate: true });
  };

  const handleReset = () => {
    reset({
      preferredName: defaultName,
      customSlug: currentSlug || '',
    });
    setSlugStatus('idle');
  };

  const canSubmit = isValid && 
    slugStatus === 'available' && 
    watchedCustomSlug !== currentSlug &&
    !updateSlugMutation.isPending;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={className}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Preferred Name Input */}
        <div className="space-y-2">
          <Label htmlFor="preferredName" className="text-sm font-medium">
            Preferred Name
          </Label>
          <Input
            id="preferredName"
            {...register('preferredName')}
            placeholder="Your full name or brand name"
            className="w-full"
          />
          {errors.preferredName && (
            <p className="text-sm text-red-500">{errors.preferredName.message}</p>
          )}
          <p className="text-xs text-gray-500">
            This will be used to auto-generate your slug
          </p>
        </div>

        {/* Custom Slug Input */}
        <div className="space-y-2">
          <Label htmlFor="customSlug" className="text-sm font-medium">
            Custom Slug
          </Label>
          <div className="relative">
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                yoursite.com/portfolio/
              </span>
              <Input
                id="customSlug"
                {...register('customSlug')}
                placeholder="your-custom-slug"
                className="rounded-l-none"
              />
            </div>
          </div>
          
          {errors.customSlug && (
            <p className="text-sm text-red-500">{errors.customSlug.message}</p>
          )}
          
          <SlugStatusIndicator 
            status={slugStatus} 
            message={slugStatusMessage}
          />
          
          <p className="text-xs text-gray-500">
            Use lowercase letters, numbers, and hyphens only. Must be 3-32 characters.
          </p>
        </div>

        {/* Suggestions */}
        {(suggestions.length > 0 || isLoadingSuggestions) && (
          <SlugSuggestions
            suggestions={suggestions}
            onSelect={handleSuggestionSelect}
            isLoading={isLoadingSuggestions}
          />
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-4 border-t">
          <Button
            type="submit"
            disabled={!canSubmit}
            className="flex items-center gap-2"
          >
            {updateSlugMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {updateSlugMutation.isPending ? 'Saving...' : 'Save Slug'}
          </Button>
          
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={updateSlugMutation.isPending}
          >
            Reset
          </Button>
          
          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              disabled={updateSlugMutation.isPending}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
          )}
        </div>
      </form>
    </motion.div>
  );
}
