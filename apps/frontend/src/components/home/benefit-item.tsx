// src/components/landing-page/benefit-item.tsx
'use client';

import { motion } from "framer-motion";

export interface BenefitItemProps {
  icon: React.ElementType;
  title: string;
  description: string;
}

export function BenefitItem({ icon: Icon, title, description }: BenefitItemProps) {
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 12 }
    },
  };

  return (
    <motion.div 
      variants={itemVariants}
      whileHover={{ y: -5 }}
      whileTap={{ y: 0 }}
      className="h-full"
    >
      <div className="flex gap-4 rounded-xl bg-background-elevated dark:bg-white/10 border border-gray-200 dark:border-white/20 p-6 shadow-md transition-all duration-300 hover:shadow-lg hover:border-primary-300 dark:hover:border-primary-500/30 h-full">
        <div className="mt-1 flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-500/20 border border-primary-200 dark:border-primary-500/30">
          <Icon className="h-5 w-5 text-primary-600 dark:text-primary-400" aria-hidden="true" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
          <p className="mt-2 text-gray-600 dark:text-gray-300">{description}</p>
        </div>
      </div>
    </motion.div>
  );
}