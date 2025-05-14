// src/app/(dashboard)/layout.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { Sidebar } from '@/components/core/layout/sidebar';
import { LoadingScreen } from '@/components/core/ui/loading-screen';

/**
 * This layout handles:
 * 1. Authentication protection for dashboard routes
 * 2. Sidebar navigation as shown in Image 1
 * 3. Dashboard-specific layout 
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId, isLoaded } = useAuth();
  const router = useRouter();

  // Auth protection - redirect if not authenticated
  useEffect(() => {
    if (isLoaded && !userId) {
      router.push('/sign-in');
    }
  }, [userId, isLoaded, router]);

  // Show loading screen while auth is being checked
  if (!isLoaded || !userId) {
    return <LoadingScreen />;
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar navigation */}
      <Sidebar />
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-6 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}