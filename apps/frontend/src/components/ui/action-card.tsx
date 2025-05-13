'use client';

import { LucideIcon } from 'lucide-react';
import Link from 'next/link';

interface ActionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  color: string;
}

export function ActionCard({ title, description, icon: Icon, href, color }: ActionCardProps) {
  return (
    <Link 
      href={href}
      className="relative group p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex items-start space-x-4"
    >
      <div className={`${color} p-3 rounded-lg text-white group-hover:scale-110 transition-transform duration-200`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      </div>
    </Link>
  );
}
