'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDebounce } from 'use-debounce';
import { motion } from 'framer-motion';
import { Save, Eye, Loader2, User, Mail, Phone, MapPin, Globe, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { Button } from '@/app/components/UI/button';
import { Input } from '@/app/components/UI/input';
import { Label } from '@/app/components/UI/label';
import { Textarea } from '@/app/components/UI/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/UI/card';
import { SlugStatusIndicator, SlugStatus } from '@/app/components/SlugStatusIndicator';

import { 
  portfolioFormSchema, 
  PortfolioFormData, 
  generateSlug, 
  getSlugValidationError 
} from '@/lib/slug-utils';
import { checkSlugAvailability } from '@/lib/slug-api';
import { usePortfolioOneStore } from '../../../../store/portfolioOneStore';

export default function CreatePortfolioPage() {
  const router = useRouter();
  const { createPortfolio, isLoading } = usePortfolioOneStore();
  
  const [slugStatus, setSlugStatus] = useState<SlugStatus>('idle');
  const [slugStatusMessage, setSlugStatusMessage] = useState<string>('');
  const [generatedSlug, setGeneratedSlug] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid, isSubmitting },
  } = useForm<PortfolioFormData>({
    resolver: zodResolver(portfolioFormSchema),
    defaultValues: {
      personalInfo: {
        fullName: '',
        email: '',
        phone: '',
        location: '',
        website: '',
        bio: '',
        tagline: '',
      },
      brandName: '',
      title: '',
      description: '',
      heroImage: '',
      theme: 'dark',
      isPublic: true,
    },
    mode: 'onChange',
  });

  const watchedFullName = watch('personalInfo.fullName');
  const watchedBrandName = watch('brandName');
  
  // Debounce the generated slug for API calls
  const [debouncedSlug] = useDebounce(generatedSlug, 300);

  // Auto-generate slug from full name
  useEffect(() => {
    if (watchedFullName) {
      const slug = generateSlug(watchedFullName);
      setGeneratedSlug(slug);
      setPreviewUrl(`https://yoursite.com/portfolio/${slug}`);
      
      // Auto-fill brand name if empty
      if (!watchedBrandName) {
        setValue('brandName', watchedFullName.split(' ')[0] || watchedFullName);
      }
    } else {
      setGeneratedSlug('');
      setPreviewUrl('');
    }
  }, [watchedFullName, watchedBrandName, setValue]);

  // Check slug availability
  useEffect(() => {
    const checkSlug = async () => {
      if (!debouncedSlug) {
        setSlugStatus('idle');
        return;
      }

      // Check format first
      const validationError = getSlugValidationError(debouncedSlug);
      if (validationError) {
        setSlugStatus('invalid');
        setSlugStatusMessage(validationError);
        return;
      }

      setSlugStatus('checking');
      setSlugStatusMessage('');

      try {
        const result = await checkSlugAvailability(debouncedSlug);
        
        if (result.available) {
          setSlugStatus('available');
          setSlugStatusMessage('Great! This slug is available');
        } else {
          setSlugStatus('taken');
          setSlugStatusMessage('This slug is already taken. Try a different name.');
        }
      } catch (error) {
        setSlugStatus('error');
        setSlugStatusMessage('Error checking slug availability');
      }
    };

    checkSlug();
  }, [debouncedSlug]);

  const onSubmit = async (data: PortfolioFormData) => {
    if (slugStatus !== 'available') {
      toast.error('Please choose an available slug before creating your portfolio');
      return;
    }

    try {
      const portfolioData = {
        templateType: 'template1',
        brandName: data.brandName,
        heroImage: data.heroImage || '',
        title: data.title,
        description: data.description,
        sectionAbout: 'About Me',
        sectionSubtitle: 'Get to know me better',
        aboutMeDescription: data.personalInfo.bio || data.description,
        personalInfo: data.personalInfo,
        socialLinks: [],
        skills: [],
        experience: [],
        projects: [],
        theme: data.theme,
        isPublic: data.isPublic,
        customUrl: generatedSlug,
      };

      const result = await createPortfolio(portfolioData);
      
      if (result) {
        toast.success(
          `Portfolio created successfully! Your URL: ${previewUrl}`,
          { duration: 5000 }
        );
        
        // Redirect to the portfolio page or dashboard
        router.push(`/portfolio/${generatedSlug}`);
      } else {
        toast.error('Failed to create portfolio. Please try again.');
      }
    } catch (error) {
      console.error('Error creating portfolio:', error);
      toast.error('Failed to create portfolio. Please try again.');
    }
  };

  const canSubmit = isValid && 
    slugStatus === 'available' && 
    generatedSlug && 
    !isSubmitting && 
    !isLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#17181E] via-[#1F2029] to-[#2A2D3A] py-8">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">Create Your Portfolio</h1>
          <p className="text-gray-400">
            Fill in your information to create a beautiful, professional portfolio
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Portfolio Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Personal Information
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName" className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          Full Name *
                        </Label>
                        <Input
                          id="fullName"
                          {...register('personalInfo.fullName')}
                          placeholder="John Doe"
                        />
                        {errors.personalInfo?.fullName && (
                          <p className="text-sm text-red-500">
                            {errors.personalInfo.fullName.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          Email *
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          {...register('personalInfo.email')}
                          placeholder="john@example.com"
                        />
                        {errors.personalInfo?.email && (
                          <p className="text-sm text-red-500">
                            {errors.personalInfo.email.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone" className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          Phone
                        </Label>
                        <Input
                          id="phone"
                          {...register('personalInfo.phone')}
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="location" className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          Location
                        </Label>
                        <Input
                          id="location"
                          {...register('personalInfo.location')}
                          placeholder="San Francisco, CA"
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="website" className="flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          Website
                        </Label>
                        <Input
                          id="website"
                          type="url"
                          {...register('personalInfo.website')}
                          placeholder="https://yourwebsite.com"
                        />
                        {errors.personalInfo?.website && (
                          <p className="text-sm text-red-500">
                            {errors.personalInfo.website.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="tagline">Professional Tagline</Label>
                        <Input
                          id="tagline"
                          {...register('personalInfo.tagline')}
                          placeholder="Full Stack Developer & UI/UX Designer"
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="bio" className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          Bio
                        </Label>
                        <Textarea
                          id="bio"
                          {...register('personalInfo.bio')}
                          placeholder="Tell us about yourself..."
                          rows={4}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Portfolio Details */}
                  <div className="space-y-4 pt-6 border-t">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Portfolio Details
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="brandName">Brand Name *</Label>
                        <Input
                          id="brandName"
                          {...register('brandName')}
                          placeholder="Your brand or company name"
                        />
                        {errors.brandName && (
                          <p className="text-sm text-red-500">{errors.brandName.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="title">Portfolio Title *</Label>
                        <Input
                          id="title"
                          {...register('title')}
                          placeholder="Frontend Developer"
                        />
                        {errors.title && (
                          <p className="text-sm text-red-500">{errors.title.message}</p>
                        )}
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="description">Description *</Label>
                        <Textarea
                          id="description"
                          {...register('description')}
                          placeholder="Brief description of your portfolio..."
                          rows={3}
                        />
                        {errors.description && (
                          <p className="text-sm text-red-500">{errors.description.message}</p>
                        )}
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="heroImage">Hero Image URL</Label>
                        <Input
                          id="heroImage"
                          type="url"
                          {...register('heroImage')}
                          placeholder="https://example.com/your-photo.jpg"
                        />
                        {errors.heroImage && (
                          <p className="text-sm text-red-500">{errors.heroImage.message}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-6 border-t">
                    <Button
                      type="submit"
                      disabled={!canSubmit}
                      className="w-full flex items-center justify-center gap-2"
                      size="lg"
                    >
                      {isSubmitting || isLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Save className="h-5 w-5" />
                      )}
                      {isSubmitting || isLoading ? 'Creating Portfolio...' : 'Create Portfolio'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Slug Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Portfolio URL Preview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {generatedSlug ? (
                    <>
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded border">
                        <div className="text-xs text-gray-500 mb-1">Your portfolio will be available at:</div>
                        <code className="text-sm font-mono text-blue-600 dark:text-blue-400 break-all">
                          {previewUrl}
                        </code>
                      </div>
                      
                      <SlugStatusIndicator 
                        status={slugStatus} 
                        message={slugStatusMessage}
                      />
                      
                      {slugStatus === 'available' && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(previewUrl, '_blank')}
                          className="w-full flex items-center gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          Preview URL
                        </Button>
                      )}
                    </>
                  ) : (
                    <div className="text-sm text-gray-500 text-center py-4">
                      Enter your full name to generate a URL preview
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Tips */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Tips for Success</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li>• Use your real name for a professional URL</li>
                    <li>• Add a professional photo for better engagement</li>
                    <li>• Write a compelling bio that showcases your skills</li>
                    <li>• Your URL slug is generated automatically</li>
                    <li>• You can customize it later in settings</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
