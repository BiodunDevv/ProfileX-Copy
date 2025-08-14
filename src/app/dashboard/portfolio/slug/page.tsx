'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, RefreshCw, Globe, Settings, Link2 } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import Link from 'next/link';
import dynamic from 'next/dynamic';

import { Button } from '@/app/components/UI/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/UI/card';
import Navbar from '@/app/components/LandingPage/Navbar';

import { usePortfolioOneStore } from '../../../../../store/portfolioOneStore';
import { useAuthStore } from '../../../../../store/useAuthStore';

// Error boundary component for React Query errors
class QueryErrorBoundary extends React.Component {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    // Update state so the next render will show the fallback UI
    if (error.message?.includes('QueryClient')) {
      return { hasError: true };
    }
    return null;
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('QueryClient Error:', error, errorInfo);
  }

  render() {
    if ((this.state as any).hasError) {
      return (
        <Card className="border-red-200 dark:border-red-800">
          <CardHeader>
            <CardTitle className="text-red-600 dark:text-red-400">
              Error Loading Slug Manager
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              There was an issue loading the slug management interface. Please refresh the page.
            </p>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Page
            </Button>
          </CardContent>
        </Card>
      );
    }

    return (this.props as any).children;
  }
}

// Dynamically import SlugManager to ensure QueryClient is available
const SlugManager = dynamic(
  () => import('@/app/components/SlugManager').then(mod => ({ default: mod.SlugManager })),
  {
    loading: () => (
      <Card className="border-purple-200 dark:border-purple-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <RefreshCw className="h-5 w-5 animate-spin text-purple-400" />
            Loading Slug Manager...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-12 bg-gradient-to-r from-purple-200 to-blue-200 dark:from-purple-800 dark:to-blue-800 rounded-lg animate-pulse"
              />
            ))}
          </div>
        </CardContent>
      </Card>
    ),
    ssr: false
  }
);

function SlugManagementPageContent() {
  const searchParams = useSearchParams();
  const portfolioType = searchParams.get('type') || 'template1';
  const portfolioId = searchParams.get('id');
  
  const { portfolio, getMyPortfolio, isLoading } = usePortfolioOneStore();
  const { isAuthenticated, user, getAllUserPortfolios } = useAuthStore();
  
  const [isInitializing, setIsInitializing] = useState(true);
  const [currentPortfolio, setCurrentPortfolio] = useState<any>(null);

  useEffect(() => {
    const initializePage = async () => {
      if (!isAuthenticated) {
        toast.error('Please sign in to manage your portfolio slug');
        return;
      }

      try {
        // If we have a portfolio ID, fetch all portfolios and find the specific one
        if (portfolioId) {
          const allPortfolios = await getAllUserPortfolios();
          if (allPortfolios?.success && allPortfolios.data?.portfolios) {
            const targetPortfolio = allPortfolios.data.portfolios.find(
              (p: any) => p.id === portfolioId
            );
            if (targetPortfolio) {
              setCurrentPortfolio(targetPortfolio);
            } else {
              toast.error('Portfolio not found');
            }
          }
        } else {
          // Fallback to original behavior
          await getMyPortfolio();
          setCurrentPortfolio(portfolio);
        }
      } catch (error) {
        console.error('Error fetching portfolio:', error);
        toast.error('Failed to load portfolio data');
      } finally {
        setIsInitializing(false);
      }
    };

    initializePage();
  }, [isAuthenticated, portfolioId, getMyPortfolio, getAllUserPortfolios]);

  // Update currentPortfolio when portfolio changes (for fallback case)
  useEffect(() => {
    if (!portfolioId && portfolio) {
      setCurrentPortfolio(portfolio);
    }
  }, [portfolio, portfolioId]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f0f0f] via-[#1a1a2e] to-[#16213e]">
        <Navbar />
        <div className="pt-24 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-purple-500/30 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="mb-6">
                  <Settings className="h-16 w-16 text-purple-400 mx-auto mb-4" />
                  <h1 className="text-2xl font-bold text-white mb-4">
                    Authentication Required
                  </h1>
                  <p className="text-gray-300 mb-6">
                    Please sign in to manage your portfolio slug settings.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-4">
                  <Link href="/signin">
                    <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button variant="outline" className="border-purple-400 text-purple-300 hover:bg-purple-500/10">
                      Sign Up
                    </Button>
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
      <div className="min-h-screen bg-gradient-to-br from-[#0f0f0f] via-[#1a1a2e] to-[#16213e]">
        <Navbar />
        <div className="pt-24 px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-purple-500/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <RefreshCw className="h-5 w-5 animate-spin text-purple-400" />
                  Loading Portfolio Data...
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="h-16 bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-lg animate-pulse"
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!currentPortfolio) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f0f0f] via-[#1a1a2e] to-[#16213e]">
        <Navbar />
        <div className="pt-24 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-purple-500/30 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="mb-6">
                  <Globe className="h-16 w-16 text-purple-400 mx-auto mb-4" />
                  <h1 className="text-2xl font-bold text-white mb-4">
                    No Portfolio Found
                  </h1>
                  <p className="text-gray-300 mb-6">
                    You need to create a portfolio first before you can manage its slug settings.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-4">
                  <Link href="/templates">
                    <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
                      Create Portfolio
                    </Button>
                  </Link>
                  <Link href="/dashboard">
                    <Button variant="outline" className="border-purple-400 text-purple-300 hover:bg-purple-500/10">
                      Go to Dashboard
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f0f] via-[#1a1a2e] to-[#16213e]">
      <Navbar />
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'linear-gradient(135deg, #1e1e2e 0%, #2d2d44 100%)',
            color: '#fff',
            border: '1px solid #8b5cf6',
          },
        }}
      />
      
      <div className="pt-24 px-4 pb-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-4 mb-6">
              <Link href="/dashboard">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-2 border-purple-400 text-purple-300 hover:bg-purple-500/10"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
            
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <Link2 className="h-8 w-8 text-purple-400 mr-3" />
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  Portfolio Slug Management
                </h1>
              </div>
              <p className="text-gray-300 text-lg max-w-2xl mx-auto">
                Customize your portfolio URL to make it more memorable and professional. 
                Create a unique slug that represents your brand.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-purple-500/30 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                      <Globe className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-white">
                        {currentPortfolio.personalInfo?.fullName || 
                         currentPortfolio.brandName || 
                         currentPortfolio.title ||
                         'Portfolio'}
                      </h2>
                      <p className="text-gray-300">
                        {currentPortfolio.title} • Template: {currentPortfolio.templateType || currentPortfolio.type}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-400">
                      Portfolio ID
                    </div>
                    <code className="text-xs font-mono text-purple-300 bg-purple-900/30 px-2 py-1 rounded">
                      {currentPortfolio._id || currentPortfolio.id}
                    </code>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <QueryErrorBoundary>
              <Suspense 
                fallback={
                  <Card className="border-purple-200 dark:border-purple-800">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-white">
                        <RefreshCw className="h-5 w-5 animate-spin text-purple-400" />
                        Loading Slug Manager...
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                          <div
                            key={i}
                            className="h-12 bg-gradient-to-r from-purple-200 to-blue-200 dark:from-purple-800 dark:to-blue-800 rounded-lg animate-pulse"
                          />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                }
              >
                <SlugManager
                  portfolioId={currentPortfolio._id || currentPortfolio.id}
                  portfolioName={
                    currentPortfolio.personalInfo?.fullName || 
                    currentPortfolio.brandName || 
                    currentPortfolio.title ||
                    'Portfolio'
                  }
                  className="mb-8"
                />
              </Suspense>
            </QueryErrorBoundary>
          </motion.div>

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8"
          >
            <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-purple-500/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Settings className="h-5 w-5 text-purple-400" />
                  Important Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 bg-gradient-to-br from-yellow-900/20 to-yellow-800/20 border border-yellow-500/30 rounded-lg">
                    <h4 className="font-medium text-yellow-300 mb-2 flex items-center gap-2">
                      🔄 URL Changes
                    </h4>
                    <p className="text-yellow-200/80 text-sm">
                      When you change your slug, your old URLs will still work for 30 days before redirecting to the new one.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-br from-blue-900/20 to-blue-800/20 border border-blue-500/30 rounded-lg">
                    <h4 className="font-medium text-blue-300 mb-2 flex items-center gap-2">
                      🌍 Global Uniqueness
                    </h4>
                    <p className="text-blue-200/80 text-sm">
                      All custom slugs are globally unique. If someone else is using a slug, you'll need to choose a different one.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-br from-green-900/20 to-green-800/20 border border-green-500/30 rounded-lg">
                    <h4 className="font-medium text-green-300 mb-2 flex items-center gap-2">
                      ✨ SEO Benefits
                    </h4>
                    <p className="text-green-200/80 text-sm">
                      Custom slugs improve your portfolio's SEO and make it easier for people to remember your URL.
                    </p>
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

export default function SlugManagementPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-[#0f0f0f] via-[#1a1a2e] to-[#16213e] flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-white">Loading slug management...</p>
        </div>
      </div>
    }>
      <SlugManagementPageContent />
    </Suspense>
  );
}
