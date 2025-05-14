// src/components/core/layout/sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { 
  Home, 
  Package, 
  FileText, 
  Shield, 
  Settings,
  PlusCircle,
  LogOut
} from 'lucide-react';
import { ThemeSwitcher } from '@/components/core/ui/theme-switcher';

export function Sidebar() {
  const pathname = usePathname();
  const { signOut } = useAuth();
  
  // Navigation items based on Image 1
  const navItems = [
    { href: '/dashboard', label: 'Home', icon: Home },
    { href: '/products', label: 'Product', icon: Package },
    { href: '/documents', label: 'Documents', icon: FileText },
    { href: '/security', label: 'Security', icon: Shield },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];
  
  return (
    <aside className="bg-gray-900 text-white w-64 flex flex-col overflow-hidden">
      {/* Logo */}
      <div className="p-4 border-b border-gray-800 flex items-center">
        <div className="flex items-center space-x-2">
          <div className="bg-indigo-600 p-1 rounded">
            <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 6H20M4 12H20M4 18H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="text-xl font-bold text-brand-gradient">Control</h1>
        </div>
      </div>
      
      {/* User profile */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img src="/avatar-placeholder.jpg" alt="User avatar" className="h-8 w-8 rounded-full" />
            <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-green-500 border border-gray-900"></span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Eric Cooper</p>
          </div>
        </div>
      </div>
      
      {/* Navigation links */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
            return (
              <li key={item.href}>
                <Link 
                  href={item.href} 
                  className={`flex items-center px-4 py-3 rounded-md ${
                    isActive 
                      ? 'bg-gray-800 text-white' 
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      {/* Add new task button */}
      <div className="p-4 border-t border-gray-800">
        <button className="flex items-center w-full px-4 py-3 rounded-md bg-gray-800 text-white">
          <PlusCircle className="h-5 w-5 mr-3" />
          <span>Add task</span>
        </button>
      </div>
      
      {/* Logout and theme switcher */}
      <div className="p-4 border-t border-gray-800 flex items-center justify-between">
        <button 
          className="flex items-center text-gray-400 hover:text-white"
          onClick={() => signOut(() => router.push('/sign-in'))}
        >
          <LogOut className="h-5 w-5 mr-2" />
          <span>Log Out</span>
        </button>
        
        <ThemeSwitcher />
      </div>
    </aside>
  );
}