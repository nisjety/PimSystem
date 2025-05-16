// src/components/dashboard/ui/dashboard-card.tsx
'use client';

import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

type DashboardCardProps = {
  title: string;
  icon?: LucideIcon;
  iconColor?: string;
  actions?: ReactNode;
  className?: string;
  children: ReactNode;
};

export function DashboardCard({ 
  title, 
  icon: Icon, 
  iconColor = 'bg-indigo-600',
  actions,
  className = '',
  children 
}: DashboardCardProps) {
  return (
    <div className={`bg-white/80 backdrop-blur-md dark:bg-slate-800/80 dark:backdrop-blur-md rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden ${className}`}>
      <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-700">
        <div className="flex items-center">
          {Icon && (
            <div className={`${iconColor} bg-opacity-90 backdrop-blur-sm p-2 rounded-lg mr-3 text-white`}>
              <Icon className="h-5 w-5" aria-hidden="true" />
            </div>
          )}
          <h3 className="font-medium text-slate-800 dark:text-white">{title}</h3>
        </div>
        
        {actions && <div className="flex space-x-1">{actions}</div>}
      </div>
      
      <div className="p-4">
        {children}
      </div>
    </div>
  );
}