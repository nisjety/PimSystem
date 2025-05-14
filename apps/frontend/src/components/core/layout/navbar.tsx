'use client';

import { useState, useEffect } from "react";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Search, 
  Menu, 
  X, 
  Package, 
  Grid, 
  Beaker, 
  BarChart, 
  Home, 
  Bell, 
  Plus,
  ChevronRight
} from "lucide-react";
import { ThemeSwitcher } from '@/components/core/ui/theme-switcher';
import { motion, AnimatePresence } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Utility function to replace the missing @/lib/utils
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function Navbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  
  // Check for scroll position to add shadow effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/products", label: "Products", icon: Package },
    { href: "/categories", label: "Categories", icon: Grid },
    { href: "/ingredients", label: "Ingredients", icon: Beaker },
    { href: "/analytics", label: "Analytics", icon: BarChart },
  ];

  const quickActions = [
    { label: "New Product", href: "/products/new", icon: Package },
    { label: "New Category", href: "/categories/new", icon: Grid },
    { label: "New Ingredient", href: "/ingredients/new", icon: Beaker },
  ];

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn(
        "border-b border-gray-200 dark:border-gray-700 bg-background sticky top-0 z-50 transition-all duration-200",
        isScrolled ? "shadow-md" : "shadow-sm"
      )}
    >
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          {/* Logo and Desktop Navigation */}
          <div className="flex">
            <div className="flex flex-shrink-0 items-center">
              <Link href="/" className="text-xl font-bold flex items-center gap-1 group">
                <span className="text-brand-gradient transition-all duration-300">PIM</span>
                <span className="text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-300 transition-colors duration-300">System</span>
              </Link>
            </div>
            <div className="hidden md:ml-8 md:flex md:space-x-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href || pathname?.startsWith(`${link.href}/`);
                
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 relative overflow-hidden group",
                      isActive 
                        ? "text-primary-600 bg-primary-50 dark:text-primary-400 dark:bg-primary-900/30" 
                        : "text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                    )}
                  >
                    {isActive && (
                      <motion.span 
                        layoutId="navbar-indicator"
                        className="absolute bottom-0 left-0 h-0.5 w-full bg-primary-600 dark:bg-primary-400" 
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <Icon className={cn(
                      "mr-1.5 h-4 w-4 transition-transform duration-200",
                      !isActive && "group-hover:scale-110"
                    )} />
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Search, Notifications, Quick Add, and User Profile */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative hidden md:block w-64">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full rounded-md border-0 py-1.5 pl-10 pr-3 text-foreground dark:bg-gray-800 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:ring-offset-1 dark:focus:ring-offset-gray-900 transition-all duration-200 sm:text-sm sm:leading-6"
                placeholder="Search products, categories..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
            </div>

            {/* Quick Add Button */}
            <div className="relative hidden md:block">
              <button 
                className="inline-flex items-center justify-center rounded-md p-2 text-primary-600 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-900/30 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1"
                onClick={() => setShowQuickActions(!showQuickActions)}
                onBlur={() => setTimeout(() => setShowQuickActions(false), 200)}
              >
                <Plus className={cn(
                  "h-5 w-5 transition-transform duration-300",
                  showQuickActions ? "rotate-45" : ""
                )} />
              </button>
              
              {/* Dropdown Menu with Animation */}
              <AnimatePresence>
                {showQuickActions && (
                  <motion.div 
                    initial={{ opacity: 0, y: -5, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -5, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-background py-1 shadow-lg ring-1 ring-gray-200 dark:ring-gray-700 ring-opacity-5 focus:outline-none z-10"
                  >
                    {quickActions.map((action, index) => {
                      const ActionIcon = action.icon;
                      return (
                        <motion.div
                          key={action.href}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2, delay: index * 0.05 }}
                        >
                          <Link
                            href={action.href}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/30 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-150"
                          >
                            <ActionIcon className="mr-2 h-4 w-4" />
                            <span>{action.label}</span>
                            <ChevronRight className="ml-auto h-4 w-4 opacity-50" />
                          </Link>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Notifications */}
            <button className="relative p-1 rounded-full text-gray-500 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-primary-400 transition-all duration-200">
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-gradient-to-r from-error to-error-dark flex items-center justify-center text-xs text-white"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                3
              </motion.span>
              <Bell className="h-5 w-5" />
            </button>
            
            {/* Theme Switcher & User Button */}
            <div className="flex items-center gap-3 pl-3 ml-3 border-l border-gray-200 dark:border-gray-700">
              <ThemeSwitcher />
              <UserButton 
                afterSignOutUrl="/sign-in"
                appearance={{
                  elements: {
                    userButtonAvatarBox: "h-8 w-8 ring-2 ring-primary-100 dark:ring-primary-800 transition-all duration-300 hover:ring-primary-300 dark:hover:ring-primary-600"
                  }
                }} 
              />
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 transition-all duration-200"
                aria-controls="mobile-menu"
                aria-expanded="false"
                onClick={toggleMenu}
              >
                <span className="sr-only">Open main menu</span>
                <AnimatePresence mode="wait">
                  {isMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X className="block h-6 w-6" aria-hidden="true" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu className="block h-6 w-6" aria-hidden="true" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu with animation */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden overflow-hidden"
            id="mobile-menu"
          >
            <div className="space-y-1 px-2 pb-3 pt-2">
              {/* Mobile Search */}
              <div className="relative mb-3">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full rounded-md border-0 py-1.5 pl-10 pr-3 text-foreground bg-background dark:bg-gray-800 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-primary-500 sm:text-sm sm:leading-6 transition-all duration-200"
                  placeholder="Search..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                />
              </div>
              
              {navLinks.map((link, index) => {
                const Icon = link.icon;
                const isActive = pathname === link.href || pathname?.startsWith(`${link.href}/`);
                
                return (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Link
                      href={link.href}
                      className={cn(
                        "flex items-center px-3 py-2 text-base font-medium rounded-md transition-all duration-200",
                        isActive 
                          ? "text-primary-600 bg-primary-50 dark:text-primary-400 dark:bg-primary-900/30" 
                          : "text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                      )}
                    >
                      <Icon className={cn(
                        "mr-3 h-5 w-5",
                        isActive && "text-primary-600 dark:text-primary-400"
                      )} />
                      {link.label}
                      {isActive && (
                        <motion.div
                          className="ml-auto h-5 w-1 rounded-full bg-primary-600 dark:bg-primary-400"
                          layoutId="mobile-indicator"
                          transition={{ type: "spring", bounce: 0.2 }}
                        />
                      )}
                    </Link>
                  </motion.div>
                );
              })}

              {/* Quick Actions in Mobile Menu */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="border-t border-gray-200 dark:border-gray-700 mt-4 pt-4"
              >
                <p className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Quick Actions
                </p>
                {quickActions.map((action, index) => {
                  const ActionIcon = action.icon;
                  return (
                    <motion.div
                      key={action.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.2 + (index * 0.05) }}
                    >
                      <Link
                        href={action.href}
                        className="flex items-center px-3 py-2 text-base font-medium text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-all duration-200"
                      >
                        <div className="flex items-center justify-center h-8 w-8 rounded-md bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 mr-3">
                          <ActionIcon className="h-5 w-5" />
                        </div>
                        {action.label}
                        <ChevronRight className="ml-auto h-4 w-4 opacity-50" />
                      </Link>
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}