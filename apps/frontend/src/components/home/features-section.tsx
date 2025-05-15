// src/components/welcome-screen/features-section.tsx
'use client';

import { motion } from "framer-motion";
import { Database, Layers, RefreshCw, Zap, Share2, Lock } from "lucide-react";

const features = [
  {
    icon: Database,
    title: "Centralized Data",
    description: "Store all your product information in one secure, accessible location."
  },
  {
    icon: Layers,
    title: "Layered Security",
    description: "Multi-layered security with granular access control and audit trails."
  },
  {
    icon: RefreshCw,
    title: "Seamless Workflows",
    description: "Create custom workflows to streamline your product management process."
  },
  {
    icon: Zap,
    title: "AI-Powered Intelligence",
    description: "Let AI help optimize your product content and categorization."
  },
  {
    icon: Share2,
    title: "Multichannel Publishing",
    description: "Publish to all your channels with optimized format for each platform."
  },
  {
    icon: Lock,
    title: "Robust Access Control",
    description: "Fine-grained permissions to control who can view and edit your content."
  }
];

export function FeaturesSection() {
  return (
    <section className="bg-background py-24">
      <div className="container">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="h1 mb-4">Powerful Features for Your Products</h2>
          <p className="lead text-gray-600 dark:text-gray-400">
            Our PIM system comes packed with everything you need to manage your product information effectively.
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard 
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ 
  icon: Icon, 
  title, 
  description, 
  index 
}: { 
  icon: React.ElementType; 
  title: string; 
  description: string;
  index: number;
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.1 * index }}
      className="card p-6 card-interactive"
    >
      <div className="mb-4 inline-flex items-center justify-center h-12 w-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="h4 mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400">{description}</p>
    </motion.div>
  );
}