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
      className="flex gap-4 rounded-xl bg-gray-100/10 backdrop-blur-sm p-6 hover:bg-gray-200/20 transition-colors duration-200"
    >
      <div className="mt-1 flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-primary-500/20 backdrop-blur-sm">
        <Icon className="h-5 w-5 text-primary-500" aria-hidden="true" />
      </div>
      <div>
        <h3 className="h4">{title}</h3>
        <p className="mt-2 small text-gray-600">{description}</p>
      </div>
    </motion.div>
  );
}
