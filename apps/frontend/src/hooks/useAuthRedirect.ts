import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';

export function useAuthRedirect(redirectPath = '/sign-in') {
  const { userId, isLoaded } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (isLoaded && !userId) {
      router.push(redirectPath);
    }
  }, [userId, isLoaded, router, redirectPath]);

  return { isAuthenticated: !!userId, isLoading: !isLoaded };
}