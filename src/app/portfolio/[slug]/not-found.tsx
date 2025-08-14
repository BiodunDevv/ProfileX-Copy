import Link from 'next/link';
import { Button } from '@/app/components/UI/button';

export default function PortfolioNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="text-center space-y-6 p-8">
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-white">404</h1>
          <h2 className="text-2xl font-semibold text-gray-300">Portfolio Not Found</h2>
          <p className="text-gray-400 max-w-md mx-auto">
            The portfolio you're looking for doesn't exist or may have been moved.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/">
            <Button variant="default" size="lg">
              Go Home
            </Button>
          </Link>
          <Link href="/templates">
            <Button variant="outline" size="lg">
              Browse Templates
            </Button>
          </Link>
        </div>
        
        <div className="text-sm text-gray-500">
          <p>If you believe this is an error, please contact support.</p>
        </div>
      </div>
    </div>
  );
}
