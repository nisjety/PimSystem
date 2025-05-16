// src/app/(marketing)/layout.tsx
'use client';

import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { MarketingNavbar } from '@/components/core/layout/marketing-navbar';
import { Footer } from '@/components/core/layout/footer';
import { ThemeProvider } from '@/lib/theme/theme-provider';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <ThemeProvider defaultTheme="light">
      <div className="relative flex flex-col min-h-screen overflow-hidden">
        {/* Background Image */}
        <div 
          className="fixed inset-0 z-0" 
          style={{
            backgroundImage: 'url("/images/flowi-hero.jpg")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.9
          }}
        />

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
