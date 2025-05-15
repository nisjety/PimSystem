'use client';

import { motion } from "framer-motion";
import { Globe, List, Check, Clock, RefreshCw, Zap } from "lucide-react";
import { BenefitItem } from './benefit-item';

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

export function BenefitsSection() {
  return (
    <section className="py-16 bg-brand-gradient text-gray-50">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          className="mx-auto max-w-2xl lg:text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="h2 text-gray-50">
            Why Choose Our PIM System
          </h2>
          <p className="mt-4 body text-gray-100">
            Experience the benefits of a modern, powerful product information management system
          </p>
        </motion.div>

        <motion.div
          className="mx-auto grid max-w-7xl grid-cols-1 gap-8 md:grid-cols-2"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <BenefitItem 
            icon={Globe} 
            title="Centralized Data Management" 
            description="Keep all your product information in one place for consistency across all channels." 
          />
          <BenefitItem 
            icon={List} 
            title="Enhanced Product Quality" 
            description="Ensure complete and accurate product information with validation and quality checks." 
          />
          <BenefitItem 
            icon={Check} 
            title="Improved Data Accuracy" 
            description="Reduce errors and inconsistencies with standardized data entry workflows." 
          />
          <BenefitItem 
            icon={Clock} 
            title="Faster Time to Market" 
            description="Streamline your product launch process with efficient data management." 
          />
          <BenefitItem 
            icon={RefreshCw} 
            title="Seamless Integration" 
            description="Connect with your existing systems and e-commerce platforms effortlessly." 
          />
          <BenefitItem 
            icon={Zap} 
            title="Increased Productivity" 
            description="Automate repetitive tasks and focus on what matters most for your business." 
          />
        </motion.div>
      </div>
    </section>
  );
}
