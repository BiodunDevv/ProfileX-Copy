"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, AlertTriangle } from 'lucide-react';

// Import template components
import TemplateOne from '@/app/components/TemplateOne/TemplateOne';
import TemplateTwo from '@/app/components/TemplateTwo/TemplateTwo';

interface PortfolioData {
  _id: string;
  templateType: string;
  title: string;
  description: string;
  personalInfo: {
    fullName: string;
    email: string;
    phone?: string;
    location?: string;
    website?: string;
    bio?: string;
    tagline?: string;
  };
  brandName: string;
  heroImage: string;
  socialLinks: any[];
  skills: any[];
  experience: any[];
  projects: any[];
  theme: string;
  isPublic: boolean;
  slug?: string;
  customUrl?: string;
  shareableLink?: string;
}

export default function ShareableLinkPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPortfolio = async () => {
      if (!slug) return;

      try {
        setIsLoading(true);
        setError(null);

        // Fetch portfolio by shareable link/custom slug
        const response = await fetch(`/api/portfolio/shareable/${encodeURIComponent(slug)}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Portfolio not found. This link may have expired or been removed.');
            return;
          }
          throw new Error(`Failed to fetch portfolio: ${response.status}`);
        }

        const data = await response.json();
        
        // Check if portfolio is public (shareable links should be public by default)
        if (!data.isPublic) {
          setError('This portfolio is private and cannot be viewed publicly.');
          return;
        }

        setPortfolio(data);
      } catch (err) {
        console.error('Error fetching portfolio:', err);
        setError('Failed to load portfolio. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPortfolio();
  }, [slug]);

  // Loading state with modern spinner
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#17181E] via-[#1F2029] to-[#2A2D3A]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative mb-6">
            <Loader2 className="h-12 w-12 text-purple-500 animate-spin mx-auto" />
            <div className="absolute inset-0 h-12 w-12 rounded-full border-2 border-purple-500/20 mx-auto animate-pulse" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Loading Portfolio</h2>
          <p className="text-gray-400">Please wait while we fetch the content...</p>
        </motion.div>
      </div>
    );
  }

  // Error state with better design
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#17181E] via-[#1F2029] to-[#2A2D3A] p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto"
        >
          <div className="bg-red-500/10 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <AlertTriangle className="h-10 w-10 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">Oops! Something went wrong</h1>
          <p className="text-gray-400 mb-8 leading-relaxed">{error}</p>
          
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="w-full border border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
            >
              Go Home
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Portfolio not found state
  if (!portfolio && !isLoading && !error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#17181E] via-[#1F2029] to-[#2A2D3A]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto p-8"
        >
          <h1 className="text-2xl font-bold text-white mb-4">Portfolio Not Found</h1>
          <p className="text-gray-400 mb-6">The portfolio you're looking for doesn't exist or may have been moved.</p>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Go Home
          </button>
        </motion.div>
      </div>
    );
  }

  // Render the appropriate template based on templateType
  const renderTemplate = () => {
    if (!portfolio) return null;
    
    switch (portfolio.templateType) {
      case 'template1':
        return <TemplateOne portfolioData={portfolio} isPreview={false} />;
      case 'template2':
        return <TemplateTwo portfolioData={portfolio} isPreview={false} />;
      default:
        return <TemplateOne portfolioData={portfolio} isPreview={false} />;
    }
  };

  // Only render template if we have a valid portfolio
  if (!portfolio) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen"
    >
      {renderTemplate()}
    </motion.div>
  );
}
