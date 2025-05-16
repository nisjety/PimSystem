// src/components/core/ui/theme-switcher.tsx
'use client';

import { useTheme } from '@/lib/theme/theme-provider';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function ThemeSwitcher() {
  const { theme, setTheme, isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  
  const toggleMenu = () => setIsOpen(!isOpen);
  
  // Icon based on current mode (light/dark)
  const ThemeIcon = isDark ? Moon : Sun;
  
  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="p-1.5 rounded-md text-gray-900 dark:text-gray-100 hover:bg-white hover:shadow-md dark:hover:bg-primary-700/30 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-all duration-200"
        onClick={toggleMenu}
        aria-label="Toggle theme"
        aria-expanded={isOpen}
        aria-controls="theme-menu"
        style={{ color: isDark ? '#ffffff' : '#000000' }}
      >
        <ThemeIcon className="h-5 w-5" />
      </motion.button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            id="theme-menu"
            className="absolute right-0 mt-2 w-36 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-100 dark:border-gray-700"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="theme-menu-button"
          >
            <ThemeOption 
              icon={Sun} 
              label="Light" 
              isActive={theme === 'light'}
              onClick={() => { setTheme('light'); setIsOpen(false); }}
            />
            <ThemeOption 
              icon={Moon} 
              label="Dark" 
              isActive={theme === 'dark'}
              onClick={() => { setTheme('dark'); setIsOpen(false); }}
            />
            <ThemeOption 
              icon={Monitor} 
              label="System" 
              isActive={theme === 'system'}
              onClick={() => { setTheme('system'); setIsOpen(false); }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Reusable theme option component
interface ThemeOptionProps {
  icon: React.ElementType;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

function ThemeOption({ icon: Icon, label, isActive, onClick }: ThemeOptionProps) {
  return (
    <motion.button
      whileHover={{ x: 2 }}
      className={`flex items-center w-full px-4 py-2 text-sm ${
        isActive 
          ? 'text-brand-gradient font-semibold' 
          : 'text-gray-900 dark:text-gray-200'
      } hover:bg-white hover:shadow-sm dark:hover:bg-gray-700 focus:outline-none focus:bg-white dark:focus:bg-gray-700 transition-all duration-150`}
      onClick={onClick}
      role="menuitem"
      style={isActive ? undefined : { color: '#000000' }}
    >
      <Icon className="h-4 w-4 mr-2" aria-hidden="true" />
      {label}
    </motion.button>
  );
}