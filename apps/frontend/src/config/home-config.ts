import { DashboardIcon, PackageIcon, TagIcon, BeakerIcon, SearchIcon, UploadIcon } from 'lucide-react';

export const QuickActions = [
  {
    title: 'Add Product',
    icon: PackageIcon,
    href: '/dashboard/products/new',
    description: 'Create a new product with full details',
    color: 'bg-blue-500',
  },
  {
    title: 'Import Data',
    icon: UploadIcon,
    href: '/dashboard/import',
    description: 'Import products from spreadsheet',
    color: 'bg-green-500',
  },
  {
    title: 'Search',
    icon: SearchIcon,
    href: '/dashboard/search',
    description: 'Advanced search across all content',
    color: 'bg-purple-500',
  },
];

export const Features = [
  {
    title: 'Product Management',
    icon: PackageIcon,
    description: 'Centralized product data management with versioning and history',
  },
  {
    title: 'Category Organization',
    icon: DashboardIcon,
    description: 'Hierarchical category management with flexible attributes',
  },
  {
    title: 'Ingredient Library',
    icon: BeakerIcon,
    description: 'Comprehensive ingredient database with INCI names and properties',
  },
  {
    title: 'Smart Tagging',
    icon: TagIcon,
    description: 'AI-powered automatic product categorization and tagging',
  },
];
