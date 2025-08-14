'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, Copy } from 'lucide-react';
import { Button } from '@/app/components/UI/button';
import { cn } from '@/lib/utils';

interface SlugSuggestionsProps {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
  isLoading?: boolean;
  className?: string;
}

export function SlugSuggestions({ 
  suggestions, 
  onSelect, 
  isLoading = false,
  className 
}: SlugSuggestionsProps) {
  const [copiedSuggestion, setCopiedSuggestion] = useState<string | null>(null);

  const handleCopy = (suggestion: string) => {
    navigator.clipboard.writeText(suggestion);
    setCopiedSuggestion(suggestion);
    setTimeout(() => setCopiedSuggestion(null), 2000);
  };

  if (isLoading) {
    return (
      <div className={cn('p-4 border rounded-lg bg-gray-50 dark:bg-gray-900', className)}>
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="h-4 w-4 text-yellow-500" />
          <span className="font-medium text-sm">Generating suggestions...</span>
        </div>
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn('p-4 border rounded-lg bg-gray-50 dark:bg-gray-900', className)}
    >
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb className="h-4 w-4 text-yellow-500" />
        <span className="font-medium text-sm">Available suggestions:</span>
      </div>
      
      <div className="space-y-2">
        <AnimatePresence>
          {suggestions.map((suggestion, index) => (
            <motion.div
              key={suggestion}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border hover:border-blue-300 dark:hover:border-blue-600 transition-colors group"
            >
              <button
                onClick={() => onSelect(suggestion)}
                className="flex-1 text-left text-sm font-mono text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
              >
                {suggestion}
              </button>
              
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(suggestion)}
                  className="h-6 w-6 p-0"
                >
                  <Copy className="h-3 w-3" />
                </Button>
                
                {copiedSuggestion === suggestion && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="text-xs text-green-500 ml-1"
                  >
                    Copied!
                  </motion.span>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
        Click any suggestion to use it, or use the copy button to copy to clipboard.
      </div>
    </motion.div>
  );
}
