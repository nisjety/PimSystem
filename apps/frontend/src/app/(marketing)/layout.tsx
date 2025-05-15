// src/app/(marketing)/layout.tsx
'use client';

import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { MarketingNavbar } from '@/components/core/layout/marketing-navbar';
import { Footer } from '@/components/core/layout/footer';
import { ThemeProvider } from '@/lib/theme/theme-provider';
import { BgPattern } from '@/components/home/bg-pattern';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <ThemeProvider defaultTheme="light">
      <div className="relative flex flex-col min-h-screen bg-background overflow-hidden">
        {/* Silky waves pattern */}
        <div className="absolute inset-0 text-cream-200 opacity-10 dark:opacity-20 pointer-events-none">
          <BgPattern />
        </div>

        {/* Navbar */}
        <MarketingNavbar />

        {/* Main content */}
        <AnimatePresence mode="wait">
          <motion.main
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="relative flex-1"
            id="main-content"
          >
            {children}
          </motion.main>
        </AnimatePresence>

        {/* Footer */}
        <Footer />
      </div>
    </ThemeProvider>
  );
}
