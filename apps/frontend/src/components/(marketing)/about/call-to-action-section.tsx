// src/components/landing-page/CallToActionSection.tsx
'use client';

import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function CallToActionSection() {
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Removed background pattern */}

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-white/80 backdrop-blur-md dark:bg-white/10 border border-default dark:border-border-dark rounded-3xl shadow-lg overflow-hidden"
        >
          <div className="grid lg:grid-cols-2 gap-12 items-center relative">
            {/* Removed floating circles */}

            {/* Text & buttons */}
            <div className="p-12 relative z-10">
              <h2 className="text-4xl font-bold mb-4 text-foreground">
                Ready to Transform Your&nbsp;
                <span className="relative">
                  <span className="relative z-20">Product Management</span>
                  <div className="absolute h-4 bg-primary-400 dark:bg-primary-500 w-full top-1/2 -translate-y-1/2 z-10" />
                </span>
                ?
              </h2>
              <p className="text-muted mb-8">
                Take control of your product data with our comprehensive PIM solution. Start your journey to better product management today.
              </p>
              <div className="flex flex-wrap gap-4">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="/signup"
                    className="inline-flex items-center justify-center px-6 py-3 bg-primary hover:bg-primary-dark rounded-full text-white font-medium shadow-lg hover:shadow-glow transition-all duration-300"
                  >
                    Get Started Free
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center px-6 py-3 border border-default dark:border-border-dark rounded-full text-muted dark:text-foreground font-medium transition-all duration-300"
                  >
                    Contact Sales
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </motion.div>
              </div>
            </div>

            {/* Mockup panel */}
            <div className="relative h-full bg-cream-100 dark:bg-cream-800/50 min-h-[300px] lg:min-h-[400px]">
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 space-y-3">
                <div className="h-3 bg-cream-200 dark:bg-cream-700 rounded w-4/5" />
                <div className="h-3 bg-cream-200 dark:bg-cream-700 rounded w-full" />
                <div className="h-3 bg-cream-200 dark:bg-cream-700 rounded w-5/6" />
                <div className="h-3 bg-cream-200 dark:bg-cream-700 rounded w-3/4" />

                <div className="py-3" />

                <div className="h-16 bg-primary-light dark:bg-primary/20 rounded-lg flex items-center px-4 border border-primary-200 dark:border-primary/30">
                  <div className="h-8 w-8 rounded-full bg-primary-200 dark:bg-primary/30" />
                  <div className="ml-3 flex-1 space-y-2">
                    <div className="h-3 bg-primary-200 dark:bg-primary/30 rounded w-4/5" />
                    <div className="h-2 bg-primary-200 dark:bg-primary/30 rounded w-2/3" />
                  </div>
                </div>

                <div className="py-2" />

                <div className="grid grid-cols-3 gap-3">
                  <div className="h-20 bg-info-light dark:bg-info/20 rounded-lg border border-info-200 dark:border-info/30" />
                  <div className="h-20 bg-success-light dark:bg-success/20 rounded-lg border border-success-200 dark:border-success/30" />
                  <div className="h-20 bg-primary-light dark:bg-primary/20 rounded-lg border border-primary-200 dark:border-primary/30" />
                </div>

                <div className="flex justify-end mt-4">
                  <div className="h-8 w-24 bg-primary rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
