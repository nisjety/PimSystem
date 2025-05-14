'use client';

import { motion } from "framer-motion";
import { Package, FolderTree, Search, BarChart3, Users, Upload } from "lucide-react";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100, damping: 12 }
  },
};

interface Feature {
  title: string;
  description: string;
  icon: React.ElementType;
}

export function FeaturesSection() {
  const features: Feature[] = [
    {
      title: "Centralized Product Data",
      description: "Store all product information in one place for easy access and management",
      icon: Package,
    },
    {
      title: "Advanced Categorization",
      description: "Create hierarchical categories and apply flexible attributes",
      icon: FolderTree,
    },
    {
      title: "Powerful Search",
      description: "Find any product or attribute quickly with our robust search engine",
      icon: Search,
    },
    {
      title: "Insightful Analytics",
      description: "Gain valuable insights with comprehensive reporting and analytics",
      icon: BarChart3,
    },
    {
      title: "User Management",
      description: "Control access with role-based permissions and user management",
      icon: Users,
    },
    {
      title: "Bulk Import/Export",
      description: "Efficiently manage large catalogs with bulk operations",
      icon: Upload,
    },
  ];

  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div 
          className="mx-auto max-w-2xl text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="h2">
            Key Features
          </h2>
          <p className="mt-4 body text-gray-600">
            Discover what makes our PIM system the perfect solution for your business
          </p>
        </motion.div>

        <motion.div 
          className="mx-auto grid max-w-7xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div 
                key={feature.title}
                variants={itemVariants}
                whileHover={{ 
                  scale: 1.02,
                  transition: { type: "spring", stiffness: 300, damping: 20 }
                }}
                className="rounded-2xl border border-gray-200 bg-gray-50 p-8 shadow-sm"
              >
                <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-full bg-primary-100">
                  <Icon className="h-6 w-6 text-primary-500" aria-hidden="true" />
                </div>
                <h3 className="mb-3 h4 text-gray-900">{feature.title}</h3>
                <p className="small text-gray-600">{feature.description}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
