"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, AlertTriangle } from 'lucide-react';

// Import template components
import TemplateOne from '@/app/components/TemplateOne/TemplateOne';

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
}

export default function Portfolio1ViewerPage() {
  const params = useParams();
  const identifier = params.identifier as string;
  
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPortfolio = async () => {
      if (!identifier) return;

      try {
        setIsLoading(true);
        setError(null);

        // Fetch the portfolio using the identifier (could be ID or slug)
        const response = await fetch(`/api/portfolio1/${encodeURIComponent(identifier)}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Portfolio not found. Please check the URL and try again.');
            return;
          }
          throw new Error(`Failed to fetch portfolio: ${response.status}`);
        }

        const response_data = await response.json();
        
        // Extract portfolio data from the nested response structure
        const data = response_data.data?.portfolio || response_data;
        
        // Ensure this is a Template 1 portfolio
        if (data.templateType !== 'template1') {
          setError('This portfolio is not a Template 1 portfolio. Please check the URL.');
          return;
        }
        
        // Check if portfolio is public
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
  }, [identifier]);

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
          <p className="text-gray-400">Please wait while we fetch your content...</p>
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
          <p className="text-gray-400 mb-6">The Template 1 portfolio you're looking for doesn't exist or may have been moved.</p>
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

  // Render Template One portfolio
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen"
    >
      <TemplateOne portfolioData={portfolio} isPreview={false} />
    </motion.div>
  );
}
