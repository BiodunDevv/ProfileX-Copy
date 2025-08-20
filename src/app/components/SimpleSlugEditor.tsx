'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Edit3, Save, X, Copy, ExternalLink } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { Button } from './UI/button';
import { Card, CardContent, CardHeader, CardTitle } from './UI/card';
import { Input } from './UI/input';

interface SimpleSlugEditorProps {
  portfolioId: string;
  currentSlug: string;
  portfolioName: string;
  onSlugUpdate: (newSlug: string) => void;
  className?: string;
}

// Simple slug generation function
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim()
    .substring(0, 50); // Limit length
}

export function SimpleSlugEditor({ 
  portfolioId,
  currentSlug,
  portfolioName,
  onSlugUpdate,
  className 
}: SimpleSlugEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newSlug, setNewSlug] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Generate a proper default slug if none exists
  const defaultSlug = generateSlug(portfolioName);
  const displaySlug = currentSlug && currentSlug !== 'undefined' ? currentSlug : defaultSlug;
  
  // Initialize newSlug when component mounts or when currentSlug changes
  useEffect(() => {
    setNewSlug(displaySlug);
  }, [displaySlug]);

  const handleSave = async () => {
    if (!portfolioId || portfolioId === 'undefined') {
      toast.error('Portfolio ID is required to update slug');
      return;
    }

    if (!newSlug.trim()) {
      toast.error('Slug cannot be empty');
      return;
    }

    // Basic validation
    const cleanSlug = generateSlug(newSlug);
    if (cleanSlug !== newSlug) {
      setNewSlug(cleanSlug);
      toast.error('Slug has been cleaned. Please check and save again.');
      return;
    }

    setIsUpdating(true);
    try {
      // Use the correct backend endpoint to update the portfolio slug
      const response = await fetch(`/api/portfolio1/${portfolioId}/custom-slug`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${JSON.parse(localStorage.getItem('auth-storage') || '{}')?.state?.token}`
        },
        body: JSON.stringify({
          customSlug: cleanSlug,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update slug');
      }

      const data = await response.json();
      console.log('📋 Slug update response:', data);
      
      if (data.success) {
        onSlugUpdate(cleanSlug);
        setIsEditing(false);
        toast.success('🎉 Portfolio slug updated successfully!');
      } else {
        throw new Error(data.message || 'Failed to update slug');
      }
    } catch (error) {
      console.error('Error updating slug:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update slug');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    setNewSlug(displaySlug);
    setIsEditing(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('URL copied to clipboard!');
  };

  // Generate the correct portfolio URL based on template type
  const getPortfolioUrl = (slug: string) => {
    const baseUrl = window.location.origin;
    // Default to portfolio1 for template1 portfolios
    return `${baseUrl}/portfolio1/${slug}`;
  };
  
  const portfolioUrl = getPortfolioUrl(displaySlug);

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Portfolio URL</span>
            {!isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-900/30 border-purple-200 dark:border-purple-700 text-purple-700 dark:text-purple-300"
              >
                <Edit3 className="h-3 w-3" />
                {!currentSlug || currentSlug === 'undefined' ? 'Create Slug' : 'Edit Slug'}
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current URL Display */}
          <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-sm font-medium text-purple-700 dark:text-purple-300">
                    Your Portfolio URL
                  </p>
                  {!currentSlug || currentSlug === 'undefined' ? (
                    <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 text-xs rounded-full">
                      Default Slug
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-xs rounded-full">
                      Custom Slug
                    </span>
                  )}
                </div>
                <code className="text-sm font-mono break-all text-purple-800 dark:text-purple-200">
                  {portfolioUrl}
                </code>
                {!currentSlug || currentSlug === 'undefined' ? (
                  <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                    💡 Create a custom slug to make your URL more memorable!
                  </p>
                ) : (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    ✅ Your custom slug is active
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 ml-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(portfolioUrl)}
                  title="Copy URL"
                  className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(portfolioUrl, '_blank')}
                  title="Open Portfolio"
                  className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Slug Editor */}
          {isEditing && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4 border-t border-purple-200 dark:border-purple-800 pt-4"
            >
              <div>
                <label className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-2 block">
                  {!currentSlug || currentSlug === 'undefined' ? 'Create Custom Slug' : 'Edit Slug'}
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-purple-600 dark:text-purple-400 font-mono">{window.location.origin}/portfolio1/</span>
                  <Input
                    value={newSlug}
                    onChange={(e) => setNewSlug(generateSlug(e.target.value))}
                    placeholder={generateSlug(portfolioName)}
                    className="flex-1 border-purple-200 dark:border-purple-700 focus:border-purple-500 dark:focus:border-purple-400"
                    disabled={isUpdating}
                  />
                </div>
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-purple-600 dark:text-purple-400">
                    💡 Only lowercase letters, numbers, and hyphens are allowed
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Example: "john-doe-portfolio" or "my-awesome-work"
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={handleSave}
                  disabled={isUpdating || !newSlug.trim() || newSlug === displaySlug}
                  className="flex items-center gap-1 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400"
                >
                  <Save className="h-3 w-3" />
                  {isUpdating ? 'Saving...' : (!currentSlug || currentSlug === 'undefined' ? 'Create Slug' : 'Save Changes')}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isUpdating}
                  className="flex items-center gap-1 border-purple-200 dark:border-purple-700 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                >
                  <X className="h-3 w-3" />
                  Cancel
                </Button>
              </div>
            </motion.div>
          )}

          {/* Help Text */}
          {!isEditing && (
            <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
              <p>• Your slug makes your portfolio URL memorable and professional</p>
              <p>• Use lowercase letters, numbers, and hyphens only</p>
              <p>• Once changed, your old URL will no longer work</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
