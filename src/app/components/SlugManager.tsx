'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit3, Trash2, Plus, RefreshCw } from 'lucide-react';

import { Button } from '@/app/components/UI/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/UI/card';
import { SlugEditor } from '@/app/components/SlugEditor';
import { URLPreview } from '@/app/components/URLPreview';

import { usePortfolioSlugs, useRemoveSlug } from '@/hooks/useSlugManagement';

interface SlugManagerProps {
  portfolioId: string;
  portfolioName: string;
  className?: string;
}

export function SlugManager({ 
  portfolioId, 
  portfolioName,
  className 
}: SlugManagerProps) {
  const [isEditing, setIsEditing] = useState(false);

  const { 
    data: slugData, 
    isLoading, 
    error, 
    refetch 
  } = usePortfolioSlugs(portfolioId);

  const removeSlugMutation = useRemoveSlug();

  const handleEditSuccess = (newSlug: string) => {
    setIsEditing(false);
    // The query will automatically refetch due to the mutation invalidation
  };

  const handleRemoveCustomSlug = async () => {
    if (!slugData?.customSlug) return;

    try {
      await removeSlugMutation.mutateAsync(portfolioId);
    } catch (error) {
      // Error handling is done in the mutation hook
      console.error('Error removing custom slug:', error);
    }
  };

  if (isLoading) {
    return (
      <Card className={`${className} bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-purple-500/30 backdrop-blur-sm`}>
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
                className="h-12 bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-lg animate-pulse"
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !slugData) {
    return (
      <Card className={`${className} bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-red-500/30 backdrop-blur-sm`}>
        <CardHeader>
          <CardTitle className="text-red-400">Error Loading Slug Data</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-300 mb-4">
            Failed to load slug information for your portfolio.
          </p>
          <Button 
            onClick={() => refetch()} 
            variant="outline" 
            className="border-red-400 text-red-300 hover:bg-red-500/10"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-purple-500/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-white">
            <span className="flex items-center gap-2">
              <Edit3 className="h-5 w-5 text-purple-400" />
              Portfolio Slug Management
            </span>
            <div className="flex items-center gap-2">
              {!isEditing && (
                <>
                  {slugData.customSlug ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-1 border-purple-400 text-purple-300 hover:bg-purple-500/10"
                    >
                      <Edit3 className="h-3 w-3" />
                      Edit
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-1 border-purple-400 text-purple-300 hover:bg-purple-500/10"
                    >
                      <Plus className="h-3 w-3" />
                      Create Custom Slug
                    </Button>
                  )}
                  
                  {slugData.customSlug && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleRemoveCustomSlug}
                      disabled={removeSlugMutation.isPending}
                      className="flex items-center gap-1 bg-red-600 hover:bg-red-700 border-red-500"
                    >
                      {removeSlugMutation.isPending ? (
                        <RefreshCw className="h-3 w-3 animate-spin" />
                      ) : (
                        <Trash2 className="h-3 w-3" />
                      )}
                      {removeSlugMutation.isPending ? 'Removing...' : 'Remove Custom'}
                    </Button>
                  )}
                </>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Current Slug Status */}
          {!isEditing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <div className="p-4 bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-lg">
                <h3 className="font-medium text-blue-200 mb-2">
                  Current Slug Status
                </h3>
                <div className="space-y-2 text-sm">
                  {slugData.customSlug ? (
                    <>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 bg-green-400 rounded-full"></div>
                        <span className="font-medium text-green-300">Custom Slug Active:</span>
                        <code className="px-2 py-1 bg-gray-800/50 border border-green-500/30 rounded text-green-200">
                          {slugData.customSlug}
                        </code>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                        <span className="text-gray-300">Default Slug (Fallback):</span>
                        <code className="px-2 py-1 bg-gray-800/50 border border-gray-500/30 rounded text-gray-300">
                          {slugData.defaultSlug}
                        </code>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-blue-400 rounded-full"></div>
                      <span className="font-medium text-blue-300">Using Default Slug:</span>
                      <code className="px-2 py-1 bg-gray-800/50 border border-blue-500/30 rounded text-blue-200">
                        {slugData.defaultSlug}
                      </code>
                    </div>
                  )}
                </div>
              </div>

              {/* URL Preview */}
              <URLPreview
                customSlug={slugData.customSlug}
                defaultSlug={slugData.defaultSlug}
              />
            </motion.div>
          )}

          {/* Slug Editor */}
          <AnimatePresence>
            {isEditing && (
              <SlugEditor
                portfolioId={portfolioId}
                currentSlug={slugData.customSlug}
                defaultName={portfolioName}
                onSuccess={handleEditSuccess}
                onCancel={() => setIsEditing(false)}
              />
            )}
          </AnimatePresence>

          {/* Help Text */}
          {!isEditing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-gray-300 space-y-2"
            >
              <h4 className="font-medium text-white">
                About Portfolio Slugs
              </h4>
              <ul className="space-y-1 text-xs text-gray-400">
                <li>• Custom slugs make your portfolio URL more memorable and professional</li>
                <li>• All slugs are globally unique across the platform</li>
                <li>• Your default slug will always work as a fallback</li>
                <li>• You can change your custom slug anytime</li>
                <li>• Use lowercase letters, numbers, and hyphens only</li>
              </ul>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
