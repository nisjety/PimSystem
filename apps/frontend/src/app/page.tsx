'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { LoadingScreen } from '@/components/core/ui/loading-screen';

export default function HomePage() {
  const { userId, isLoaded } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (isLoaded) {
      if (userId) {
        router.push('/welcomeScreen');
      } else {
        router.push('/sign-in');
      }
    }
  }, [userId, isLoaded, router]);

  return <LoadingScreen />;
}