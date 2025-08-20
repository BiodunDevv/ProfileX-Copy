"use client";

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function Page() {
  const router = useRouter();
  const params = useParams();
  const identifier = (params as any).identifier || (params as any).slug;

  useEffect(() => {
    if (identifier) router.replace(`/portfolio/${identifier}`);
  }, [identifier, router]);

  return null;
}
