'use client';

import { Loader2, Check, X, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type SlugStatus = 'idle' | 'checking' | 'available' | 'taken' | 'error' | 'invalid';

interface SlugStatusIndicatorProps {
  status: SlugStatus;
  message?: string;
  className?: string;
}

export function SlugStatusIndicator({ 
  status, 
  message, 
  className 
}: SlugStatusIndicatorProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'checking':
        return {
          icon: <Loader2 className="h-4 w-4 animate-spin" />,
          text: 'Checking availability...',
          color: 'text-blue-500',
        };
      case 'available':
        return {
          icon: <Check className="h-4 w-4" />,
          text: message || 'Slug is available',
          color: 'text-green-500',
        };
      case 'taken':
        return {
          icon: <X className="h-4 w-4" />,
          text: message || 'Slug is already taken',
          color: 'text-red-500',
        };
      case 'invalid':
        return {
          icon: <AlertCircle className="h-4 w-4" />,
          text: message || 'Invalid slug format',
          color: 'text-orange-500',
        };
      case 'error':
        return {
          icon: <AlertCircle className="h-4 w-4" />,
          text: message || 'Error checking slug',
          color: 'text-red-500',
        };
      default:
        return null;
    }
  };

  const config = getStatusConfig();

  if (!config || status === 'idle') {
    return null;
  }

  return (
    <div className={cn('flex items-center gap-2 text-sm', config.color, className)}>
      {config.icon}
      <span>{config.text}</span>
    </div>
  );
}
