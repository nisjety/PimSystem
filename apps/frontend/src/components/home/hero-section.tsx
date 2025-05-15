// src/components/landing-page/hero-section.tsx
'use client';

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Play } from "lucide-react";
import { BgPattern } from "./bg-pattern";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden min-h-screen">
      {/* 1) solid cream base */}
      <div className="absolute inset-0 bg-background" />

      {/* 2) pattern on top of it */}
      <div className="absolute inset-0 text-background opacity dark:opacity-10 pointer-events-none">
        <BgPattern />
      </div>

      <div className="container-lg relative z-10 pt-32 pb-24 min-h-[90vh] flex flex-col justify-center mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column – Text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-foreground dark:text-foreground space-y-8"
          >
            <span className="inline-block px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-500/20 backdrop-blur-sm text-primary-700 dark:text-primary-400 text-sm font-medium">
              #1 Product Information Management Solution
            </span>

            <h1 className="font-display text-7xl font-bold leading-[1.1] tracking-tight">
              <div className="flex flex-col">
                <span className="text-3xl mb-2">THE</span>
                <div className="relative">
                  <span className="relative z-20">PERFECT</span>
                  <div className="absolute h-4 bg-primary-400 w-full top-1/2 -translate-y-1/2 z-10" />
                </div>
                <span className="text-brand-gradient">PIM SYSTEM</span>
              </div>
            </h1>

            <p className="text-xl text-muted max-w-lg">
              We craft the ultimate product information management solution to streamline your workflow and enhance your product data.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/dashboard"
                  className="btn bg-primary hover:bg-primary-dark text-white font-medium inline-flex items-center gap-2 transition-all duration-300"
                >
                  GET STARTED
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/learn-more"
                  className="btn border border-default dark:border-border-dark text-muted dark:text-foreground backdrop-blur-sm transition-all duration-300"
                >
                  LEARN MORE
                </Link>
              </motion.div>
            </div>
          </motion.div>

          {/* Right Column – Feature Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="relative"
          >
            <div className="bg-elevated dark:bg-white/10 border border-default dark:border-border-dark rounded-2xl p-6 shadow-lg overflow-hidden relative z-10">
              <div className="flex gap-2 mb-6">
                <span className="py-1 px-2 text-xs font-medium rounded-full bg-primary-100 text-primary-700 dark:bg-primary-500/20 dark:text-primary-400">
                  Products
                </span>
                <span className="py-1 px-2 text-xs font-medium rounded-full bg-success-light text-success-dark">
                  Categories
                </span>
                <span className="py-1 px-2 text-xs font-medium rounded-full bg-info-light text-info-dark">
                  Attributes
                </span>
              </div>

              <h2 className="text-xl font-medium text-foreground dark:text-foreground mb-2">
                Centralized Data Management
              </h2>
              <p className="text-muted mb-6">
                Keep all your product information in one place.
              </p>

              <div className="relative rounded-xl overflow-hidden">
                <div className="aspect-video bg-cream-100 dark:bg-cream-800/50 rounded-xl flex items-center justify-center">
                  <svg className="w-20 h-20 text-muted dark:text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <motion.div
                  className="absolute bottom-4 right-4 bg-white/80 dark:bg-white/10 backdrop-blur-md text-foreground dark:text-foreground text-sm font-medium px-4 py-2 rounded-full flex items-center gap-2 border border-default dark:border-border-dark"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Play size={16} />
                  <span>DASHBOARD TOUR</span>
                </motion.div>
              </div>
            </div>

            {/* Floating blobs */}
            <motion.div
              className="absolute -top-10 -right-10 w-40 h-40 bg-primary-light dark:bg-primary/30 backdrop-blur-xl rounded-full -z-10"
              animate={{ scale: [1, 1.05, 1], rotate: [0, 5, 0] }}
              transition={{ duration: 8, repeat: Infinity }}
            />
            <motion.div
              className="absolute -bottom-8 -left-8 w-28 h-28 bg-primary-lighter dark:bg-primary/20 backdrop-blur-xl rounded-full -z-10"
              animate={{ scale: [1, 1.1, 1], rotate: [0, -5, 0] }}
              transition={{ duration: 6, repeat: Infinity, delay: 1 }}
            />
          </motion.div>
        </div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {/* Stat Card 1 */}
          <div className="bg-elevated dark:bg-white/10 border border-default dark:border-border-dark rounded-xl p-6 shadow-md">
            <div className="flex items-center">
              <div className="mr-4">
                <div className="w-10 h-10 rounded-full bg-primary-200 dark:bg-primary/20 flex items-center justify-center">
                  <span className="text-primary dark:text-primary text-lg font-bold">10K</span>
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">Products</div>
                <div className="text-sm text-muted">Managed Daily</div>
              </div>
            </div>
          </div>

          {/* Stat Card 2 */}
          <div className="bg-elevated dark:bg-white/10 border border-default dark:border-border-dark rounded-xl p-6 shadow-md">
            <div>
              <div className="text-2xl font-medium text-foreground">WE COMBINE</div>
              <div className="text-2xl font-medium relative">
                <span className="relative z-20">DATA & DESIGN</span>
                <div className="absolute h-3 bg-primary-400 w-full top-1/2 -translate-y-1/2 z-10" />
              </div>
              <Link href="/learn-more" className="inline-block mt-2 text-sm text-muted border-b border-muted">
                LEARN MORE
              </Link>
            </div>
          </div>

          {/* Stat Card 3 */}
          <div className="bg-elevated dark:bg-white/10 border border-default dark:border-border-dark rounded-xl p-6 shadow-md">
            <div>
              <div className="text-xl font-medium text-foreground mb-2">Enterprise Ready!</div>
              <p className="text-sm text-muted">
                Trusted by leading brands worldwide.
              </p>
              <div className="mt-4 grid grid-cols-4 gap-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-cream-200 dark:bg-cream-700/50" />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
