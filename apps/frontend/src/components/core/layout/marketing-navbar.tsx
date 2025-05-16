// src/components/core/layout/marketing-navbar.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { ThemeSwitcher } from '@/components/core/ui/theme-switcher';

// Adding custom style for pure black text
const pureBlackStyle = { color: '#000000' };

export function MarketingNavbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect for transparent to solid background
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/features', label: 'Features' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'shadow-md py-2 bg-white backdrop-blur-md dark:bg-white/90 dark:backdrop-blur-md' 
          : 'py-4'
      }`}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-xl font-bold text-brand-gradient">PIM</span>
            <span className={`text-xl font-bold ml-1 transition-colors duration-300 ${
              scrolled || pathname !== '/'
                ? 'text-gray-900 dark:text-gray-300'
                : pathname === '/'
                  ? 'text-gray-800 dark:text-white'
                  : 'text-gray-900 dark:text-gray-300'
            }`}>
              System
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  style={scrolled || pathname !== '/' ? pureBlackStyle : undefined}
                  className={`px-4 py-2 rounded-md text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'text-gray-900 bg-white shadow-sm dark:text-primary-400 dark:bg-primary-900/30'
                      : scrolled || pathname !== '/'
                        ? 'text-gray-900 dark:text-gray-300 hover:text-gray-1000 dark:hover:text-primary-400 hover:bg-white hover:shadow-md hover:-translate-y-0.5 dark:hover:bg-white/20'
                        : pathname === '/'
                          ? 'text-gray-800 dark:text-white hover:text-gray-1000 dark:hover:text-primary-400 hover:bg-white hover:shadow-md hover:-translate-y-0.5 dark:hover:bg-white/20' 
                          : 'text-gray-900 dark:text-gray-300 hover:text-gray-1000 dark:hover:text-primary-400 hover:bg-white hover:shadow-md hover:-translate-y-0.5 dark:hover:bg-white/20'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right Side - CTA + Theme Switcher */}
          <div className="flex items-center space-x-4">
            <ThemeSwitcher />
            
            <Link
              href="/sign-in"
              className={`hidden md:inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                scrolled || pathname !== '/'
                  ? 'bg-brand-gradient text-white hover:shadow-lg hover:-translate-y-0.5'
                  : pathname === '/'
                    ? 'bg-white dark:glass text-gray-800 dark:text-white hover:bg-white hover:shadow-lg hover:-translate-y-0.5 dark:hover:bg-white/20'
                    : 'bg-brand-gradient text-white hover:shadow-lg hover:-translate-y-0.5'
              } transition-all duration-200`}
            >
              Sign In
            </Link>
            
            <Link
              href="/sign-up"
              className={`hidden md:inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                scrolled || pathname !== '/'
                  ? 'bg-transparent border border-primary-500 text-primary-600 dark:text-primary-400'
                  : pathname === '/'
                    ? 'bg-transparent border border-gray-900 text-gray-1000 dark:border-white dark:text-white'
                    : 'bg-transparent border border-primary-500 text-primary-600 dark:text-primary-400'
              } hover:bg-white hover:shadow-lg hover:-translate-y-0.5 dark:hover:bg-white/10 transition-all duration-200`}
            >
              Get Started
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {isMenuOpen ? (
                <X className={`h-6 w-6 ${scrolled || pathname !== '/' ? 'text-gray-950 dark:text-white' : pathname === '/' ? 'text-gray-1000 dark:text-white' : 'text-gray-1000 dark:text-white'}`} />
              ) : (
                <Menu className={`h-6 w-6 ${scrolled || pathname !== '/' ? 'text-gray-950 dark:text-white' : pathname === '/' ? 'text-gray-1000 dark:text-white' : 'text-gray-1000 dark:text-white'}`} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ 
          height: isMenuOpen ? 'auto' : 0,
          opacity: isMenuOpen ? 1 : 0
        }}
        transition={{ duration: 0.3 }}
        className="md:hidden overflow-hidden border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-white/90"
      >
        <div className="container mx-auto px-4 py-3 space-y-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                style={pureBlackStyle}
                className={`block px-4 py-2 rounded-md text-base font-semibold transition-all duration-200 ${
                  isActive
                    ? 'text-gray-900 bg-white shadow-sm dark:text-primary-400 dark:bg-primary-900/30'
                    : 'text-gray-900 dark:text-gray-300 hover:text-gray-900 dark:hover:text-primary-400 hover:bg-white hover:shadow-md hover:-translate-x-0.5 hover:translate-y-0 dark:hover:bg-white/20'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            );
          })}
          <div className="pt-2 pb-1 border-t border-gray-200 dark:border-gray-700 mt-2">
            <Link
              href="/sign-in"
              className="block w-full text-center px-4 py-2 text-base font-medium rounded-md bg-brand-gradient text-white hover:shadow-lg transition-all duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="block w-full text-center px-4 py-2 text-base font-medium rounded-md bg-transparent border border-primary-500 text-primary-600 dark:text-primary-400 mt-2 hover:bg-white hover:shadow-lg transition-all duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              Get Started
            </Link>
          </div>
        </div>
      </motion.div>
    </motion.nav>
  );
}