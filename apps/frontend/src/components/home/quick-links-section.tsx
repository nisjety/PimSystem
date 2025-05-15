// src/components/landing-page/QuickLinksSection.tsx
'use client';

import { motion } from "framer-motion";
import Link from "next/link";
import { LayoutDashboard, Package, FolderTree, Beaker, ArrowRight } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100, damping: 12 },
  },
};

interface QuickLink {
  title: string;
  description: string;
  href: string;
  icon: React.ElementType;
  color: string;
}

export function QuickLinksSection() {
  const quickLinks: QuickLink[] = [
    {
      title: "Dashboard",
      description: "View your overview and metrics",
      href: "/dashboard",
      icon: LayoutDashboard,
      color: "bg-info",
    },
    {
      title: "Products",
      description: "Manage your product catalog",
      href: "/products",
      icon: Package,
      color: "bg-primary",
    },
    {
      title: "Categories",
      description: "Organize your products",
      href: "/categories",
      icon: FolderTree,
      color: "bg-primary-dark",
    },
    {
      title: "Ingredients",
      description: "Track product ingredients",
      href: "/ingredients",
      icon: Beaker,
      color: "bg-success",
    },
  ];

  return (
    <section className="py-16 bg-background dark:bg-with-900 relative overflow-hidden">
      {/* ensure content sits above the global pattern */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        <motion.div
          className="mx-auto max-w-2xl text-center mb-12"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
          }}
        >
          <h2 className="h2">Quick Access</h2>
          <p className="mt-4 body text-muted">
            Navigate to the most important sections of your PIM system
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <motion.div
                key={link.title}
                variants={itemVariants}
                whileHover={{
                  y: -5,
                  transition: { type: "spring", stiffness: 400, damping: 10 },
                }}
              >
                <Link
                  href={link.href}
                  className="group relative flex flex-col rounded-2xl border border-default bg-cream-50 p-6 shadow-sm transition-all hover:shadow-md h-full"
                >
                  <div
                    className={`${link.color} text-white p-3 rounded-xl w-12 h-12 flex items-center justify-center mb-4`}
                  >
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <h3 className="h4 mb-2 text-foreground transition-colors duration-200 group-hover:text-primary">
                    {link.title}
                  </h3>
                  <p className="small text-muted transition-colors duration-200 group-hover:text-foreground">
                    {link.description}
                  </p>
                  <div className="mt-4 flex items-center text-foreground text-sm font-medium transition-colors duration-200 group-hover:text-primary">
                    <span className="transition-all duration-200 group-hover:mr-2">
                      Go to {link.title}
                    </span>
                    <ArrowRight
                      className="h-4 w-4 opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
