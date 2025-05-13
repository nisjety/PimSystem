import { Package, Upload, Search, BarChart2, LucideIcon } from 'lucide-react';
import Link from 'next/link';

interface QuickAction {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  color: string;
}

export function QuickActions() {
  const actions: QuickAction[] = [
    {
      title: 'Add Product',
      description: 'Create a new product with details and variants',
      href: '/dashboard/products/new',
      icon: Package,
      color: 'bg-blue-500'
    },
    {
      title: 'Import Data',
      description: 'Import products from Google Sheets or CSV',
      href: '/dashboard/import',
      icon: Upload,
      color: 'bg-green-500'
    },
    {
      title: 'Search',
      description: 'Search across all products and categories',
      href: '/dashboard/search',
      icon: Search,
      color: 'bg-purple-500'
    }
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.title}
              href={action.href}
              className="group p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex items-start space-x-4"
            >
              <div className={`${action.color} p-3 rounded-lg text-white group-hover:scale-110 transition-transform duration-200`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{action.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{action.description}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
