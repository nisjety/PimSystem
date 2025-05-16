// src/components/core/layout/footer.tsx
'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ChevronUp, 
  Mail, 
  Book, 
  HelpCircle, 
  Info, 
  Github, 
  Twitter, 
  Linkedin, 
  Heart
} from "lucide-react";
import { motion, useAnimation } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Utility function to replace the missing @/lib/utils
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function Footer() {
  const [isVisible, setIsVisible] = useState(false);
  const controls = useAnimation();

  // Show/hide scroll-to-top button based on scroll position
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 500) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  // Animate in elements when they become visible
  useEffect(() => {
    controls.start({
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    });
  }, [controls]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  const footerLinks = [
    {
      title: "Product",
      links: [
        { label: "Features", href: "#" },
        { label: "Roadmap", href: "#" },
        { label: "Pricing", href: "#" },
        { label: "Changelog", href: "#" },
      ]
    },
    {
      title: "Resources",
      links: [
        { label: "Documentation", href: "#", icon: Book },
        { label: "Tutorials", href: "#" },
        { label: "API Reference", href: "#" },
        { label: "Status", href: "#" },
      ]
    },
    {
      title: "Company",
      links: [
        { label: "About", href: "#", icon: Info },
        { label: "Blog", href: "#" },
        { label: "Careers", href: "#" },
        { label: "Contact", href: "#", icon: Mail },
      ]
    },
    {
      title: "Support",
      links: [
        { label: "Help Center", href: "#", icon: HelpCircle },
        { label: "Community", href: "#" },
        { label: "Support Plans", href: "#" },
        { label: "System Status", href: "#" },
      ]
    },
  ];

  return (
    <footer className="border-t border-gray-200 dark:border-gray-700 relative">
      {/* Scroll to top button */}
      <AnimatedButton 
        isVisible={isVisible} 
        onClick={scrollToTop} 
        className="fixed bottom-4 right-4 p-2 bg-brand-gradient text-white rounded-full shadow-lg z-50 hover:scale-105 transition-all duration-300 cursor-pointer"
      >
        <ChevronUp className="h-5 w-5" />
      </AnimatedButton>

      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        {/* Footer main content */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12"
          initial={{ y: 20, opacity: 0 }}
          animate={controls}
        >
          {footerLinks.map((section, idx) => (
            <div key={section.title} className="space-y-4">
              <motion.h3 
                className="text-sm font-semibold text-gray-800 dark:text-gray-200 tracking-wider uppercase"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.4 }}
              >
                {section.title}
              </motion.h3>
              <ul className="space-y-3">
                {section.links.map((link, linkIdx) => {
                  const Icon = link.icon;
                  return (
                    <motion.li 
                      key={link.label}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (idx * 0.1) + (linkIdx * 0.05), duration: 0.4 }}
                    >
                      <Link 
                        href={link.href}
                        className="group flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
                      >
                        {Icon && (
                          <Icon className="mr-2 h-4 w-4 text-gray-400 dark:text-gray-500 group-hover:text-primary-500 dark:group-hover:text-primary-400 transition-colors duration-200" />
                        )}
                        <span className="relative overflow-hidden">
                          {link.label}
                          <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-primary-600 dark:bg-primary-400 transition-all duration-300 group-hover:w-full"></span>
                        </span>
                      </Link>
                    </motion.li>
                  );
                })}
              </ul>
            </div>
          ))}
        </motion.div>

        {/* Divider */}
        <motion.div 
          className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent mx-auto max-w-3xl mb-8"
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        />

        {/* Bottom section with logo and socials */}
        <motion.div 
          className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.4 }}
        >
          <div className="flex items-center">
            <span className="text-lg font-bold text-brand-gradient mr-1">PIM</span>
            <span className="text-lg font-bold text-gray-600 dark:text-gray-400">System</span>
          </div>

          {/* Social links */}
            <div className="flex space-x-6">
              <SocialLink 
                href="https://github.com/nisjety/PimSystem" 
                Icon={Github} 
                label="GitHub" 
              />
              <SocialLink 
                href="https://twitter.com/" 
                Icon={Twitter} 
                label="Twitter" 
              />
              <SocialLink 
                href="https://linkedin.com" 
                Icon={Linkedin} 
                label="LinkedIn" 
              />
            </div>
        </motion.div>

        {/* Copyright */}
        <motion.p 
          className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.4 }}
        >
          &copy; {new Date().getFullYear()} PimSystem. All rights reserved.
          <span className="inline-flex">
            Made with <Heart className="h-3 w-3 text-primary-500 mx-1" /> by our team
          </span>
        </motion.p>
      </div>
    </footer>
  );
}

// TypeScript interfaces for our helper components
interface AnimatedButtonProps {
  isVisible: boolean;
  onClick: () => void;
  className: string;
  children: React.ReactNode;
}

// Helper component for animated button
function AnimatedButton({ isVisible, onClick, className, children }: AnimatedButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      className={className}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ 
        scale: isVisible ? 1 : 0, 
        opacity: isVisible ? 1 : 0,
      }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
    >
      {children}
    </motion.button>
  );
}

interface SocialLinkProps {
  href: string;
  Icon: React.ElementType;
  label: string;
}

// Helper component for social links
function SocialLink({ href, Icon, label }: SocialLinkProps) {
  return (
    <motion.a
      href={href}
      aria-label={label}
      className="text-gray-400 dark:text-gray-500 hover:text-primary-500 dark:hover:text-primary-400 transition-colors duration-200"
      whileHover={{ scale: 1.1, rotate: 5 }}
      whileTap={{ scale: 0.9 }}
    >
      <span className="sr-only">{label}</span>
      <Icon className="h-5 w-5" />
    </motion.a>
  );
}