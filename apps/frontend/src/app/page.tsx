// src/app/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { motion } from 'framer-motion';

export default function RootRedirector() {
  const { userId, isLoaded } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (isLoaded) {
      if (userId) {
        // Authenticated users go to dashboard
        router.push('/dashboard');
      } else {
        // Unauthenticated users go to landing page
        router.push('/'); // This points to the (marketing)/page.tsx
      }
    }
  }, [userId, isLoaded, router]);

  // Enhanced loading screen with branding
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background">
      <div className="flex flex-col items-center">
        {/* Animated logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-6"
        >
          <div className="text-4xl font-bold flex items-center">
            <span className="text-brand-gradient">PIM</span>
            <span className="text-gray-600 dark:text-gray-400 ml-1">System</span>
          </div>
        </motion.div>
        
        {/* Loading spinner */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="relative"
        >
          <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-700 border-t-primary-500 rounded-full animate-spin"></div>
        </motion.div>
      </div>
    </div>
  );
}