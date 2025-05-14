import React from 'react';
import Link from 'next/link';
import { quickActionsData } from '@/config/home-config';

export function QuickActions() {
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="font-semibold mb-4">Quick Actions</h3>
      <div className="grid grid-cols-1 gap-3">
        {quickActionsData.map((action) => {
          const Icon = action.icon;
          return (
            <Link 
              key={action.title} 
              href={action.href}
              className="flex items-center p-3 rounded-md transition-colors hover:bg-gray-50"
            >
              <div className={`p-2 rounded-full ${action.color} text-white mr-3`}>
                <Icon size={18} />
              </div>
              <div>
                <h4 className="font-medium">{action.title}</h4>
                <p className="text-sm text-gray-500">{action.description}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default QuickActions;