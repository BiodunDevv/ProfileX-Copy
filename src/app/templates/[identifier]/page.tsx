"use client";

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function TemplateDetailPage() {
  const router = useRouter();
  const params = useParams();
  const identifier = (params as any).identifier || (params as any).slug;

  useEffect(() => {
    if (identifier) {
      // Redirect to the template details page
      router.replace(`/templates/${identifier}`);
    }
  }, [identifier, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#17181E] via-[#1F2029] to-[#2A2D3A] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
        <p className="text-white text-lg">Redirecting to template...</p>
      </div>
    </div>
  );
}
