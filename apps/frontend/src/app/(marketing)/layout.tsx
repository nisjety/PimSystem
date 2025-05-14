// src/app/(marketing)/layout.tsx
'use client';

import { Navbar } from '@/components/core/layout/navbar';
import { Footer } from '@/components/core/layout/footer';
import { ThemeProvider } from '@/lib/theme/theme-provider';

/**
 * This layout provides:
 * 1. Top navigation bar
 * 2. Traditional page layout for marketing/welcome pages
 */
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <div className="flex flex-col min-h-screen bg-background">
        {/* Top navigation bar */}
        <Navbar />
        
        {/* Main content */}
        <main className="flex-1">
          {children}
        </main>
        
        {/* Footer */}
        <Footer />
      </div>
    </ThemeProvider>
  );
}