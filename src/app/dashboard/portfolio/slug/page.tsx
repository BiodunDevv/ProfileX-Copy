'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RefreshCw, Globe, Link as LinkIcon, Eye, Shield, Zap, Edit3, Plus, Trash2, Copy, Check, X, Sparkles } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import Link from 'next/link';

import { Button } from '@/app/components/UI/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/UI/card';
import { Input } from '@/app/components/UI/input';
import { Label } from '@/app/components/UI/label';
import Navbar from '@/app/components/LandingPage/Navbar';

import { usePortfolioOneStore } from '../../../../../store/portfolioOneStore';
import { useAuthStore } from '../../../../../store/useAuthStore';

interface SlugInfo {
  hasCustomSlug: boolean;
  customSlug: string;
  defaultSlug: string;
  shareableLink: string;
  isCustomLinkEnabled: boolean;
  links: {
    customUrl: string;
    defaultUrl: string;
    apiUrl: string;
  };
}

interface SlugSuggestion {
  baseSlug: string;
  suggestions: string[];
  currentCustomSlug: string;
  totalSuggestions: number;
  note: string;
}

export default function SlugManagementPage() {
  const searchParams = useSearchParams();
  const portfolioType = searchParams.get('type') || 'template1';
  
  const { portfolio, getMyPortfolio, isLoading, error } = usePortfolioOneStore();
  const { isAuthenticated, user, getAllUserPortfolios } = useAuthStore();
  
  // Debug logging
  useEffect(() => {
    console.log('🔍 Store state:', { 
      portfolio: portfolio ? 'exists' : 'null', 
      isLoading, 
      error,
      isAuthenticated,
      user: user?.email 
    });
  }, [portfolio, isLoading, error, isAuthenticated, user]);
  
  const [isInitializing, setIsInitializing] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [fetchError, setFetchError] = useState<string | null>(null);
  
  // Slug management states
  const [slugInfo, setSlugInfo] = useState<SlugInfo | null>(null);
  const [suggestions, setSuggestions] = useState<SlugSuggestion | null>(null);
  const [isLoadingSlugInfo, setIsLoadingSlugInfo] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isUpdatingSlug, setIsUpdatingSlug] = useState(false);
  
  // Form states
  const [newSlug, setNewSlug] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const fetchPortfolioData = async () => {
    if (!isAuthenticated) {
      setFetchError('Authentication required');
      setIsInitializing(false);
      return;
    }

    // Check if we have a valid token from auth store
    const token = useAuthStore.getState().token;
    if (!token) {
      setFetchError('No authentication token found. Please sign in again.');
      setIsInitializing(false);
      return;
    }

    try {
      setFetchError(null);
      console.log('🔄 Fetching portfolio data...');
      console.log('🔐 Auth status:', { isAuthenticated, user: user?.email });
      
      // Use getAllUserPortfolios instead of getMyPortfolio
      const portfoliosResponse = await getAllUserPortfolios();
      console.log('📋 Portfolios fetch result:', portfoliosResponse);
      
      if (!portfoliosResponse?.success || !portfoliosResponse.data?.portfolios) {
        console.log('⚠️ No portfolios found for user');
        setFetchError('No portfolios found - you may need to create a portfolio first');
        setIsInitializing(false);
        return;
      }

      const portfolios = portfoliosResponse.data.portfolios;
      console.log('📋 Found portfolios:', portfolios);

      // Get the first portfolio (or filter by template1 if needed)
      const userPortfolio = portfolios.find(p => p.type === 'template1') || portfolios[0];
      
      if (!userPortfolio) {
        console.log('⚠️ No suitable portfolio found');
        setFetchError('No portfolio found - you may need to create a portfolio first');
        setIsInitializing(false);
        return;
      }

      console.log('✅ Portfolio loaded successfully:', {
        id: userPortfolio.id,
        name: userPortfolio.brandName || userPortfolio.name,
        templateType: userPortfolio.type,
        slug: userPortfolio.slug
      });
      
      // Set the portfolio in the store
      const portfolioData = {
        _id: userPortfolio.id,
        personalInfo: {
          fullName: userPortfolio.brandName || userPortfolio.name || 'Portfolio',
          email: '',
          phone: '',
          location: '',
          website: '',
          bio: '',
          tagline: '',
        },
        brandName: userPortfolio.brandName || userPortfolio.name || 'Portfolio',
        heroImage: '',
        title: userPortfolio.title || userPortfolio.brandName || userPortfolio.name || 'Portfolio',
        description: '',
        sectionAbout: 'About Me',
        sectionSubtitle: 'Get to know me better',
        aboutMeDescription: '',
        socialLinks: [],
        skills: [],
        experience: [],
        projects: [],
        theme: 'dark',
        isPublic: userPortfolio.isPublic || false,
        customUrl: userPortfolio.slug || '',
        slug: userPortfolio.slug || '',
        templateType: userPortfolio.type || 'template1',
      };

      // Update the store with the portfolio data
      usePortfolioOneStore.getState().setPortfolio(portfolioData);
      
      // Load slug info after portfolio is loaded
      await fetchSlugInfo(userPortfolio.id);
      
    } catch (error) {
      console.error('❌ Error fetching portfolio:', error);
      setFetchError(error instanceof Error ? error.message : 'Failed to load portfolio data');
      
      if (retryCount < 2) {
        setRetryCount(prev => prev + 1);
        setTimeout(() => fetchPortfolioData(), 2000);
        return;
      }
    } finally {
      setIsInitializing(false);
    }
  };

  const fetchSlugInfo = async (portfolioId: string) => {
    if (!portfolioId) return;
    
    setIsLoadingSlugInfo(true);
    try {
      const token = useAuthStore.getState().token;
      if (!token) {
        console.error('No authentication token available');
        return;
      }
      
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
      const response = await fetch(`${apiBase}/portfolio1/${portfolioId}/custom-slug-info`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setSlugInfo(result.data);
          console.log('✅ Slug info loaded:', result.data);
        }
      } else {
        console.error('❌ Failed to load slug info');
      }
    } catch (error) {
      console.error('❌ Error loading slug info:', error);
    } finally {
      setIsLoadingSlugInfo(false);
    }
  };

  const fetchSuggestions = async (baseText?: string) => {
    if (!portfolio?._id) return;
    
    setIsLoadingSuggestions(true);
    try {
      const token = useAuthStore.getState().token;
      if (!token) {
        console.error('No authentication token available');
        return;
      }
      
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
      const url = baseText 
        ? `${apiBase}/portfolio1/${portfolio._id}/slug-suggestions?base=${encodeURIComponent(baseText)}`
        : `${apiBase}/portfolio1/${portfolio._id}/slug-suggestions`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          console.log('📋 Suggestions data:', result.data);
          setSuggestions(result.data);
          setShowSuggestions(true);
        }
      }
    } catch (error) {
      console.error('❌ Error loading suggestions:', error);
      toast.error('Failed to load suggestions');
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const updateSlug = async (action: 'create' | 'update' | 'remove', customSlug?: string) => {
    if (!portfolio?._id) return;
    
    setIsUpdatingSlug(true);
    try {
      // Get token from auth store instead of localStorage
      const token = useAuthStore.getState().token;
      if (!token) {
        toast.error('Authentication required. Please sign in again.');
        return;
      }
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
      const response = await fetch(`${apiBase}/portfolio1/${portfolio._id}/manage-slug`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          action,
          ...(customSlug && { customSlug }),
          ...(action === 'create' && { preferredName: newSlug || portfolio.personalInfo?.fullName || portfolio.brandName }),
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          toast.success(result.message || 'Slug updated successfully!');
          await fetchSlugInfo(portfolio._id);
          setIsEditing(false);
          setNewSlug('');
          setShowSuggestions(false);
        } else {
          toast.error(result.message || 'Failed to update slug');
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to update slug');
      }
    } catch (error) {
      console.error('❌ Error updating slug:', error);
      toast.error('Failed to update slug');
    } finally {
      setIsUpdatingSlug(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('URL copied to clipboard!');
  };

  useEffect(() => {
    console.log('🔍 useEffect triggered:', { isAuthenticated, user: user?.email });
    if (isAuthenticated) {
      fetchPortfolioData();
    } else {
      console.log('⚠️ User not authenticated, skipping portfolio fetch');
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#17181E] via-[#1F2029] to-[#2A2D3A]">
        <Navbar />
        <div className="pt-24 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
              <CardContent className="p-8">
                <h1 className="text-2xl font-bold text-white mb-4">
                  Authentication Required
                </h1>
                <p className="text-gray-300 mb-6">
                  Please sign in to manage your portfolio slug settings.
                </p>
                <div className="flex items-center justify-center gap-4">
                  <Link href="/signin">
                    <Button>Sign In</Button>
                  </Link>
                  <Link href="/signup">
                    <Button variant="outline">Sign Up</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (isInitializing || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#17181E] via-[#1F2029] to-[#2A2D3A]">
        <Navbar />
        <div className="pt-24 px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-purple-600/20 rounded-lg">
                      <RefreshCw className="h-6 w-6 text-purple-400 animate-spin" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-white">
                        Loading Portfolio Data
                      </h1>
                      <p className="text-gray-400 text-sm mt-1">
                        {retryCount > 0 ? `Retry attempt ${retryCount}...` : 'Fetching your portfolio information...'}
                      </p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-lg animate-pulse"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-6 bg-gray-700 rounded animate-pulse"></div>
                        <div className="h-4 bg-gray-800 rounded w-2/3 animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#17181E] via-[#1F2029] to-[#2A2D3A]">
        <Navbar />
        <div className="pt-24 px-4">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-8"
            >
              <Card className="border-red-800/50 bg-red-900/20 backdrop-blur-sm">
                <CardContent className="p-8">
                  <div className="flex flex-col items-center space-y-6">
                    <div className="p-4 bg-red-600/20 rounded-full">
                      <Shield className="h-12 w-12 text-red-400" />
                    </div>
                    
                    <div>
                      <h1 className="text-3xl font-bold text-red-200 mb-3">
                        Portfolio Not Found
                      </h1>
                      <p className="text-gray-300 text-lg mb-2">
                        {fetchError || 'Unable to locate your portfolio data'}
                      </p>
                      <p className="text-gray-400 text-sm">
                        This could be due to network issues, authentication problems, or missing portfolio data.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  onClick={() => {
                    setRetryCount(0);
                    setIsInitializing(true);
                    fetchPortfolioData();
                  }}
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
                >
                  <RefreshCw className="h-4 w-4" />
                  Retry Loading
                </Button>
                
                <Link href="/dashboard/create-portfolio">
                  <Button variant="outline" className="w-full border-gray-700 hover:border-blue-500 hover:bg-blue-500/10">
                    <Zap className="h-4 w-4 mr-2" />
                    Create Portfolio
                  </Button>
                </Link>
                
                <Link href="/dashboard">
                  <Button variant="outline" className="w-full border-gray-700 hover:border-green-500 hover:bg-green-500/10">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Dashboard
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#17181E] via-[#1F2029] to-[#2A2D3A]">
      <Navbar />
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
      
      <div className="pt-24 px-4 pb-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-4 mb-6">
              <Link href="/dashboard">
                <Button variant="outline" size="sm" className="flex items-center gap-2 hover:scale-105 transition-transform border-gray-700 text-gray-300 hover:border-purple-500">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
            
            <div className="text-white">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-purple-600/20 rounded-lg">
                  <Globe className="h-6 w-6 text-purple-400" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Portfolio URL Management
                </h1>
              </div>
              <p className="text-gray-400 text-lg">
                Create and manage your professional portfolio URLs
              </p>
            </div>
          </motion.div>

          {/* Portfolio Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg">
                      <Eye className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-white mb-1">
                        {portfolio.personalInfo?.fullName || portfolio.brandName}
                      </h2>
                      <p className="text-gray-400 mb-2">
                        {portfolio.title}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-blue-600/20 text-blue-400 text-xs rounded-full">
                          {portfolio.templateType}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          portfolio.isPublic 
                            ? 'bg-green-600/20 text-green-400' 
                            : 'bg-yellow-600/20 text-yellow-400'
                        }`}>
                          {portfolio.isPublic ? 'Public' : 'Private'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-400 mb-1">
                      Portfolio ID
                    </div>
                    <code className="text-xs font-mono text-gray-300 bg-gray-800 px-2 py-1 rounded">
                      {portfolio._id}
                    </code>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Current URL Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <LinkIcon className="h-5 w-5 text-purple-400" />
                  Current Portfolio URLs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoadingSlugInfo ? (
                  <div className="flex items-center gap-3">
                    <RefreshCw className="h-5 w-5 text-purple-400 animate-spin" />
                    <span className="text-gray-300">Loading URL information...</span>
                  </div>
                ) : slugInfo ? (
                  <>
                    {/* Default URL */}
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                              Default URL
                            </span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Always available
                            </span>
                          </div>
                          <code className="text-sm font-mono break-all text-blue-800 dark:text-blue-200">
                            {slugInfo.links.defaultUrl}
                          </code>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(slugInfo.links.defaultUrl)}
                            className="border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900/20"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(slugInfo.links.defaultUrl, '_blank')}
                            className="border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900/20"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Custom URL */}
                    {slugInfo.hasCustomSlug && (
                      <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-xs rounded-full">
                                Custom URL
                              </span>
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                Your personalized link
                              </span>
                            </div>
                            <code className="text-sm font-mono break-all text-green-800 dark:text-green-200">
                              {slugInfo.links.customUrl}
                            </code>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyToClipboard(slugInfo.links.customUrl)}
                              className="border-green-300 text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-300 dark:hover:bg-green-900/20"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(slugInfo.links.customUrl, '_blank')}
                              className="border-green-300 text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-300 dark:hover:bg-green-900/20"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-gray-400 mb-2">No URL information available</div>
                    <Button
                      onClick={() => portfolio._id && fetchSlugInfo(portfolio._id)}
                      variant="outline"
                      size="sm"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Slug Management Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Edit3 className="h-5 w-5 text-purple-400" />
                  Manage Your URLs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Create/Edit Custom Slug */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">
                      {slugInfo?.hasCustomSlug ? 'Edit Custom URL' : 'Create Custom URL'}
                    </h3>
                    {slugInfo?.hasCustomSlug && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(!isEditing)}
                        className="border-gray-700 text-gray-300 hover:border-purple-500"
                      >
                        {isEditing ? <X className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
                        {isEditing ? 'Cancel' : 'Edit'}
                      </Button>
                    )}
                  </div>

                  {(!slugInfo?.hasCustomSlug || isEditing) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="newSlug" className="text-gray-300">
                            Custom URL Slug
                          </Label>
                          <Input
                            id="newSlug"
                            value={newSlug}
                            onChange={(e) => setNewSlug(e.target.value)}
                            placeholder={slugInfo?.hasCustomSlug ? slugInfo.customSlug : "your-name-portfolio"}
                            className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-purple-500"
                          />
                          <p className="text-xs text-gray-400">
                            Use only letters, numbers, and hyphens. No spaces or special characters.
                          </p>
                        </div>
                        <div className="flex items-end">
                          <Button
                            onClick={() => fetchSuggestions(newSlug || portfolio.personalInfo?.fullName || portfolio.brandName)}
                            disabled={isLoadingSuggestions}
                            variant="outline"
                            className="border-gray-700 text-gray-300 hover:border-purple-500"
                          >
                            {isLoadingSuggestions ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <Sparkles className="h-4 w-4" />
                            )}
                            Get Suggestions
                          </Button>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Button
                          onClick={() => updateSlug(slugInfo?.hasCustomSlug ? 'update' : 'create', newSlug)}
                          disabled={!newSlug.trim() || isUpdatingSlug}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          {isUpdatingSlug ? (
                            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <Plus className="h-4 w-4 mr-2" />
                          )}
                          {slugInfo?.hasCustomSlug ? 'Update URL' : 'Create Custom URL'}
                        </Button>
                        
                        {slugInfo?.hasCustomSlug && (
                          <Button
                            onClick={() => updateSlug('remove')}
                            disabled={isUpdatingSlug}
                            variant="outline"
                            className="border-red-600 text-red-400 hover:bg-red-600/10"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove Custom URL
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* Suggestions */}
                  {showSuggestions && suggestions && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-3"
                    >
                      <h4 className="text-sm font-medium text-gray-300">Suggested URLs:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {suggestions.suggestions.slice(0, 6).map((suggestion: any, index) => {
                          // Handle both string and object suggestions
                          const suggestionText = typeof suggestion === 'string' 
                            ? suggestion 
                            : suggestion.slug || suggestion.name || JSON.stringify(suggestion);
                          
                          return (
                            <Button
                              key={index}
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setNewSlug(suggestionText);
                                setShowSuggestions(false);
                              }}
                              className="justify-start border-gray-700 text-gray-300 hover:border-purple-500 hover:text-purple-300"
                            >
                              <Check className="h-3 w-3 mr-2" />
                              {suggestionText}
                            </Button>
                          );
                        })}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowSuggestions(false)}
                        className="text-gray-400 hover:text-gray-300"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Close suggestions
                      </Button>
                    </motion.div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="p-6 bg-gradient-to-br from-yellow-600/10 to-orange-600/10 border border-yellow-600/20 rounded-xl"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-yellow-600/20 rounded-lg">
                    <RefreshCw className="h-5 w-5 text-yellow-400" />
                  </div>
                  <h4 className="font-semibold text-yellow-200">URL Changes</h4>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed">
                  Old URLs redirect automatically for 30 days, ensuring no broken links during transitions.
                </p>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="p-6 bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-blue-600/20 rounded-xl"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-600/20 rounded-lg">
                    <Globe className="h-5 w-5 text-blue-400" />
                  </div>
                  <h4 className="font-semibold text-blue-200">Global Uniqueness</h4>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed">
                  All custom slugs are globally unique across our platform for maximum exclusivity.
                </p>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="p-6 bg-gradient-to-br from-green-600/10 to-emerald-600/10 border border-green-600/20 rounded-xl"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-green-600/20 rounded-lg">
                    <Zap className="h-5 w-5 text-green-400" />
                  </div>
                  <h4 className="font-semibold text-green-200">SEO Benefits</h4>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed">
                  Custom slugs boost SEO rankings and create memorable, professional URLs.
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
