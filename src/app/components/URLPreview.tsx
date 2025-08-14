'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, ExternalLink, Share, Check } from 'lucide-react';
import { Button } from '@/app/components/UI/button';
import { cn } from '@/lib/utils';

interface URLPreviewProps {
  customSlug?: string;
  defaultSlug: string;
  baseUrl?: string;
  className?: string;
}

export function URLPreview({ 
  customSlug, 
  defaultSlug, 
  baseUrl = 'https://yoursite.com/portfolio',
  className 
}: URLPreviewProps) {
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const customUrl = customSlug ? `${baseUrl}/${customSlug}` : null;
  const defaultUrl = `${baseUrl}/${defaultSlug}`;
  const activeUrl = customUrl || defaultUrl;

  const handleCopy = async (url: string, type: 'custom' | 'default') => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(type);
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  };

  const handleShare = async (url: string, title: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url,
        });
      } catch (error) {
        console.error('Failed to share:', error);
        // Fallback to copy
        handleCopy(url, customUrl ? 'custom' : 'default');
      }
    } else {
      // Fallback to copy
      handleCopy(url, customUrl ? 'custom' : 'default');
    }
  };

  const handleVisit = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={cn('space-y-4', className)}>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        Portfolio URLs
      </h3>
      
      {/* Active URL */}
      <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-2 w-2 bg-green-500 rounded-full"></div>
          <span className="text-sm font-medium text-green-700 dark:text-green-300">
            Active URL {customSlug ? '(Custom)' : '(Default)'}
          </span>
        </div>
        
        <div className="flex items-center gap-2 mb-3">
          <code className="flex-1 p-2 bg-white dark:bg-gray-800 border rounded text-sm font-mono text-gray-900 dark:text-gray-100 break-all">
            {activeUrl}
          </code>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleCopy(activeUrl, customUrl ? 'custom' : 'default')}
            className="flex items-center gap-1"
          >
            {copiedUrl === (customUrl ? 'custom' : 'default') ? (
              <Check className="h-3 w-3" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
            <span className="text-xs">
              {copiedUrl === (customUrl ? 'custom' : 'default') ? 'Copied!' : 'Copy'}
            </span>
          </Button>
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleShare(activeUrl, 'Check out my portfolio')}
            className="flex items-center gap-1"
          >
            <Share className="h-3 w-3" />
            <span className="text-xs">Share</span>
          </Button>
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleVisit(activeUrl)}
            className="flex items-center gap-1"
          >
            <ExternalLink className="h-3 w-3" />
            <span className="text-xs">Visit</span>
          </Button>
        </div>
      </div>
      
      {/* Alternative URLs */}
      {customSlug && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Alternative URLs
          </h4>
          
          {/* Default URL when custom exists */}
          <div className="p-3 bg-gray-50 dark:bg-gray-800 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Default URL
              </span>
            </div>
            
            <div className="flex items-center gap-2 mb-2">
              <code className="flex-1 p-2 bg-white dark:bg-gray-900 border rounded text-sm font-mono text-gray-700 dark:text-gray-300 break-all">
                {defaultUrl}
              </code>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(defaultUrl, 'default')}
                className="flex items-center gap-1"
              >
                {copiedUrl === 'default' ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
                <span className="text-xs">
                  {copiedUrl === 'default' ? 'Copied!' : 'Copy'}
                </span>
              </Button>
              
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleVisit(defaultUrl)}
                className="flex items-center gap-1"
              >
                <ExternalLink className="h-3 w-3" />
                <span className="text-xs">Visit</span>
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <div className="text-xs text-gray-500 dark:text-gray-400">
        {customSlug 
          ? 'Your custom URL is active. The default URL will still work as a fallback.'
          : 'You can create a custom URL to make it more memorable and professional.'
        }
      </div>
    </div>
  );
}
