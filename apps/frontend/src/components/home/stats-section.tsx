// src/components/StatsSection.tsx
'use client';

import { motion } from "framer-motion";

interface StatItem {
  name: string;
  value: string;
}

export function StatsSection() {
  const stats: StatItem[] = [
    { name: "Active Products", value: "10,000+" },
    { name: "Categories", value: "500+" },
    { name: "Ingredients Tracked", value: "2,000+" },
    { name: "Time Saved", value: "35%" },
  ];

  return (
    <section className="py-16 bg-background">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div 
          className="mx-auto max-w-2xl lg:max-w-none"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center">
            <h2 className="h2">
              Trusted by companies worldwide
            </h2>
            <p className="mt-4 body text-muted">
              Our PIM system helps businesses manage their product data at scale
            </p>
          </div>
          <dl className="mt-16 grid grid-cols-1 gap-0.5 overflow-hidden rounded-2xl bg-cream-100 text-center sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <motion.div 
                key={stat.name} 
                className="flex flex-col bg-cream-50 p-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.5 }}
                whileHover={{ scale: 1.03 }}
              >
                <dt className="small text-muted">{stat.name}</dt>
                <dd className="order-first h2 text-brand-gradient">{stat.value}</dd>
              </motion.div>
            ))}
          </dl>
        </motion.div>
      </div>
    </section>
  );
}
