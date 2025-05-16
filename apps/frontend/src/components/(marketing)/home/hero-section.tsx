'use client';

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { 
  ChevronRight, 
  Play, 
  ArrowRight, 
  Database, 
  Layers, 
  Settings,
  ShoppingBag,
  Image as ImageIcon,
  Tag,
  GitBranch,
  Share2,
  BarChart2,
} from "lucide-react";


export function HeroSection() {
  const [signalActive, setSignalActive] = useState(true);
  
  return (
    <section className="relative overflow-hidden min-h-screen">
      {/* 3D Network Background - NEW */}
      <div className="absolute inset-0 z-0 opacity-25 dark:opacity-15 pointer-events-none">
        <Image 
          src="/images/3d-network-bg.png" 
          alt="Network background" 
          fill 
          className="object-cover blur-sm"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/60 to-transparent dark:from-black/40"></div>
      </div>
      
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/10 z-0"></div>
      
      {/* Main content container */}
      <div className="container-lg relative z-1 pt-30 md:pt-14 lg:pt-14 pb-10 md:pb-10 min-h-[93vh] flex flex-col justify-center mx-auto px-4 md:px-6">
        {/* Asymmetric glass background with clipped shape */}
        <div className="absolute top-0 md:top-0 lg:top-24 right-0 left-0 bottom-2 
                      bg-white/60 dark:bg-white/5 backdrop-blur-md border border-white/40 dark:border-white/10 
                      rounded-t-[20px] md:rounded-t-[20px] rounded-bl-[20px] md:rounded-bl-[20px] rounded-br-[15px] md:rounded-br-[20px] shadow-lg overflow-hidden z-10">
          <div className="absolute inset-0 bg-gradient-to-tr from-white/50 to-primary-500/5"></div>
        </div>
      

        {/* Floating PIM Microcards - NEW */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="absolute top-32 left-10 md:left-24 z-40 bg-white/80 dark:bg-white/10 backdrop-blur-md rounded-lg shadow-md border border-white/50 dark:border-white/10 px-3 py-2"
        >
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
            </div>
            <span className="text-xs font-medium text-green-700 dark:text-green-400">Connects to 20+ platforms</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="absolute top-20 right-16 md:right-32 z-40 bg-white/80 dark:bg-white/10 backdrop-blur-md rounded-lg shadow-md border border-white/50 dark:border-white/10 px-3 py-2"
        >
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Database size={12} className="text-blue-500" />
            </div>
            <span className="text-xs font-medium text-blue-700 dark:text-blue-400">Manage 10K+ SKUs with ease</span>
          </div>
        </motion.div>

        {/* Main content grid - Adjusted for 2/3 and 1/3 proportions */}
        <div className="relative z-50 grid px-30 grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 top-5 items-center mt-14 md:mt-20 lg:mt-28">
          {/* Left Column – Text (8/12 columns = 2/3 of space) */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="lg:col-span-8 text-foreground px-2 dark:text-foreground space-y-10 md:space-y-5"
          >
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-500/20 backdrop-blur-sm text-primary-700 dark:text-primary-400 text-xs md:text-sm font-medium">
              <div className="w-2 h-2 rounded-full bg-primary-500 mr-2"></div>
              #1 Product Information Management Solution
            </span>

            <h1 className="font-display text-5xl px-0 md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight">
              <div className="flex flex-col">
                <span className="text-2xl md:text-3xl mb-1 md:mb-2">THE</span>
                <div className="relative">
                  <span className="relative z-10">PERFECT</span>
                  <div className="absolute h-3 md:h-4 bg-primary-400/80 w-full top-1/2 -translate-y-1/2 z-0" />
                </div>
                <span className="text-brand-gradient">PIM SYSTEM</span>
              </div>
            </h1>

            {/* NEW: Micro-copy caption */}
            <p className="text-sm uppercase tracking-wide font-medium text-primary-600 dark:text-primary-400 mt-1">
              One source of truth for all your product data
            </p>

            {/* Improved paragraph contrast - NEW */}
            <div className="relative max-w-2xl">
              <div className="absolute inset-0 bg-white/60 dark:bg-white/5 backdrop-blur-sm rounded-lg -z-10"></div>
              <p className="text-lg md:text-xl text-muted p-3 md:p-4">
                We craft the ultimate product information management solution to streamline your workflow and enhance your product data.
              </p>
            </div>

            {/* Improved CTA button hierarchy - ENHANCED */}
            <div className="flex flex-wrap gap-4 px-2 pt-2 md:pt-4">
              <motion.div 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.98 }}
                className="relative"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-500 to-primary-600 rounded-md blur-sm opacity-70"></div>
                <Link
                  href="/dashboard"
                  className="relative btn bg-primary hover:bg-primary-dark text-white font-medium inline-flex items-center gap-2 transition-all duration-300 px-5 md:px-6 py-2.5 md:py-3 rounded-md shadow-md hover:shadow-lg"
                >
                  GET STARTED
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/learn-more"
                  className="btn border border-default dark:border-border-dark bg-white/80 dark:bg-white/5 backdrop-blur-md shadow-sm hover:shadow-md text-muted dark:text-foreground transition-all duration-300 px-5 md:px-6 py-2.5 md:py-3 rounded-md"
                >
                  LEARN MORE
                </Link>
              </motion.div>
            </div>
            
            {/* NEW: Data flow strip */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex items-center gap-2 mt-4 overflow-x-auto pb-2"
            >
              <div className="flex items-center gap-1 py-1 px-2 bg-white/70 dark:bg-white/5 backdrop-blur-sm rounded-md">
                <Database size={14} className="text-primary-600 dark:text-primary-400" />
                <span className="text-xs text-muted whitespace-nowrap">Data</span>
              </div>
              <ChevronRight size={14} className="text-muted opacity-70" />
              <div className="flex items-center gap-1 py-1 px-2 bg-white/70 dark:bg-white/5 backdrop-blur-sm rounded-md">
                <GitBranch size={14} className="text-primary-600 dark:text-primary-400" />
                <span className="text-xs text-muted whitespace-nowrap">Workflow</span>
              </div>
              <ChevronRight size={14} className="text-muted opacity-70" />
              <div className="flex items-center gap-1 py-1 px-2 bg-white/70 dark:bg-white/5 backdrop-blur-sm rounded-md">
                <Tag size={14} className="text-primary-600 dark:text-primary-400" />
                <span className="text-xs text-muted whitespace-nowrap">Catalog</span>
              </div>
              <ChevronRight size={14} className="text-muted opacity-70" />
              <div className="flex items-center gap-1 py-1 px-2 bg-white/70 dark:bg-white/5 backdrop-blur-sm rounded-md">
                <Share2 size={14} className="text-primary-600 dark:text-primary-400" />
                <span className="text-xs text-muted whitespace-nowrap">Channels</span>
              </div>
              <ChevronRight size={14} className="text-muted opacity-70" />
              <div className="flex items-center gap-1 py-1 px-2 bg-white/70 dark:bg-white/5 backdrop-blur-sm rounded-md">
                <ShoppingBag size={14} className="text-primary-600 dark:text-primary-400" />
                <span className="text-xs text-muted whitespace-nowrap">Commerce</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column – Feature Card (4/12 columns = 1/3 of space) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="lg:col-span-4 relative z-50 flex justify-center lg:justify-start mt-10 lg:mt-0"
          >
            {/* Ultra-elegant feature card with restrained drag */}
            <motion.div
              drag
              dragConstraints={{ top: -50, left: -50, right: 50, bottom: 50 }}
              dragTransition={{ bounceStiffness: 300, bounceDamping: 10 }}
              dragElastic={0.3}
              whileDrag={{ scale: 1.02, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
              className="relative w-64 sm:w-72 lg:w-full max-w-xs mx-auto lg:mx-0 cursor-grab active:cursor-grabbing group"
            >
              {/* Main card with refined glass effect */}
              <div className="bg-white/80 dark:bg-white/5 backdrop-blur-sm rounded-lg shadow-sm overflow-hidden border border-white/40 dark:border-white/5">
                {/* Refined image area with elegant proportions */}
                <div className="relative">
                  <div className="overflow-hidden rounded-t-2xl">
                    {/* Image with dots pattern */}
                    <div className="aspect-[4/4] relative">
                      <Image 
                        src="/images/stair-hero.jpg"
                        alt="PIM Data Management"
                        fill
                        className="object-cover scale-[1.02]"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                        priority
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent mix-blend-soft-light"></div>
                    </div>
                  </div>

                 {/* Product Database */}
                  <motion.div
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    className="absolute top-2 left-2 bg-white/80 dark:bg-white/10 backdrop-blur-sm rounded-md shadow-sm cursor-pointer"
                  >
                    <div className="h-10 w-10 flex items-center justify-center">
                      <Database size={18} className="text-[var(--primary-600)] dark:text-[var(--primary-500)]" />
                    </div>
                    <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap">
                      <span className="text-[10px] font-medium text-[var(--gray-700)] dark:text-[var(--gray-300)]">Database</span>
                    </div>
                  </motion.div>

                  {/* Products/Catalog */}
                  <motion.div
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    className="absolute top-2 right-2 bg-white/80 dark:bg-white/10 backdrop-blur-sm rounded-md shadow-sm cursor-pointer"
                  >
                    <div className="h-10 w-10 flex items-center justify-center">
                      <ShoppingBag size={18} className="text-[var(--primary-600)] dark:text-[var(--primary-500)]" />
                    </div>
                    <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap">
                      <span className="text-[10px] font-medium text-[var(--gray-700)] dark:text-[var(--gray-300)]">Catalog</span>
                    </div>
                  </motion.div>

                  {/* Digital Assets */}
                  <motion.div
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    className="absolute top-1/4 left-2 bg-white/80 dark:bg-white/10 backdrop-blur-sm rounded-md shadow-sm cursor-pointer"
                  >
                    <div className="h-10 w-10 flex items-center justify-center">
                      <ImageIcon size={18} className="text-[var(--primary-600)] dark:text-[var(--primary-500)]" />
                    </div>
                    <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap">
                      <span className="text-[10px] font-medium text-[var(--gray-700)] dark:text-[var(--gray-300)]">Assets</span>
                    </div>
                  </motion.div>

                  {/* Categories/Taxonomy */}
                  <motion.div
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    className="absolute top-1/4 right-2 bg-white/80 dark:bg-white/10 backdrop-blur-sm rounded-md shadow-sm cursor-pointer"
                  >
                    <div className="h-10 w-10 flex items-center justify-center">
                      <Tag size={18} className="text-[var(--primary-600)] dark:text-[var(--primary-500)]" />
                    </div>
                    <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap">
                      <span className="text-[10px] font-medium text-[var(--gray-700)] dark:text-[var(--gray-300)]">Categories</span>
                    </div>
                  </motion.div>

                  {/* Workflows/Tasks */}
                  <motion.div
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    className="absolute top-2/3 left-2 bg-white/80 dark:bg-white/10 backdrop-blur-sm rounded-md shadow-sm cursor-pointer"
                  >
                    <div className="h-10 w-10 flex items-center justify-center">
                      <GitBranch size={18} className="text-[var(--primary-600)] dark:text-[var(--primary-500)]" />
                    </div>
                    <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap">
                      <span className="text-[10px] font-medium text-[var(--gray-700)] dark:text-[var(--gray-300)]">Workflow</span>
                    </div>
                  </motion.div>

                  {/* Channels/Distribution */}
                  <motion.div
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    className="absolute top-2/3 right-2 bg-white/80 dark:bg-white/10 backdrop-blur-sm rounded-md shadow-sm cursor-pointer"
                  >
                    <div className="h-10 w-10 flex items-center justify-center">
                      <Share2 size={18} className="text-[var(--primary-600)] dark:text-[var(--primary-500)]" />
                    </div>
                    <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap">
                      <span className="text-[10px] font-medium text-[var(--gray-700)] dark:text-[var(--gray-300)]">Channels</span>
                    </div>
                  </motion.div>

                  {/* Analytics */}
                  <motion.div
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-white/80 dark:bg-white/10 backdrop-blur-sm rounded-md shadow-sm cursor-pointer"
                  >
                    <div className="h-10 w-10 flex items-center justify-center">
                      <BarChart2 size={18} className="text-[var(--primary-600)] dark:text-[var(--primary-500)]" />
                    </div>
                    <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap">
                      <span className="text-[10px] font-medium text-[var(--gray-700)] dark:text-[var(--gray-300)]">Analytics</span>
                    </div>
                  </motion.div>
                </div>
                
                {/* Ultra-minimalist bottom section */}
                <div className="relative p-3 bg-white/80 dark:bg-white/5 backdrop-blur-sm border-t border-white/20">
                  <div className="flex justify-between items-center gap-2">
                    {/* Elegant micro-button */}
                    <motion.div
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-6 h-6 rounded-full bg-primary-400 flex items-center justify-center cursor-pointer shadow-sm"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17 7L7 17M17 7H8M17 7V16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </motion.div>
                    
                    {/* Ultra-minimal text */}
                    <div className="text-right">
                      <h3 className="text-[10px] font-medium text-primary-600 dark:text-primary-300 tracking-tight">
                         Data Management
                      </h3>
                      <p className="text-[8px] text-gray-500 dark:text-gray-400/80">
                         Centralized product information
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Enhanced drop zone indicator with subtle pulse animation - Minimalistic */}
                <div className="absolute inset-0 pointer-events-none rounded-2xl transition-opacity duration-300 group-hover:opacity-100 opacity-0 overflow-hidden">
                  <div className="absolute inset-0 border border-[#692757]/40 rounded-2xl"></div>
                  <motion.div 
                    initial={{ scale: 0.97, opacity: 0.2 }}
                    animate={{ 
                      scale: [0.97, 1.01, 0.97],
                      opacity: [0.2, 0.4, 0.2]
                    }}
                    transition={{ 
                      repeat: Infinity,
                      duration: 2.5,
                      ease: "easeInOut"
                    }}
                    className="absolute inset-2 border border-[#692757]/70 rounded-2xl"
                  ></motion.div>
                </div>
              </div>
              
              {/* Minimal visual cue for draggability */}
              <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-white/30 dark:bg-white/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </motion.div>
          </motion.div>
        </div>

        {/* Stats Row - Enhanced with better visual styling */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mt-8 md:mt-10 lg:mt-12 pt-6 md:pt-8 border-t border-gray-200/10 relative z-30"
        >
          {/* Stat Card 1 - Enhanced */}
          <div className="bg-white/90 dark:bg-white/10 backdrop-blur-md border border-white/50 dark:border-white/10 rounded-xl p-4 md:p-5 shadow-md hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center">
              <div className="mr-3 md:mr-4">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary-100 dark:bg-primary/20 flex items-center justify-center">
                  <span className="text-primary-600 dark:text-primary-400 text-lg md:text-xl font-bold">10K</span>
                </div>
              </div>
              <div>
                <div className="text-xl md:text-2xl font-bold text-foreground dark:text-foreground">Products</div>
                <div className="text-xs md:text-sm text-muted">Managed Daily</div>
              </div>
            </div>
          </div>

          {/* Stat Card 2 - Enhanced */}
          <div className="bg-white/90 dark:bg-white/10 backdrop-blur-md border border-white/50 dark:border-white/10 rounded-xl p-4 md:p-5 shadow-md hover:shadow-lg transition-shadow duration-300">
            <div>
              <div className="text-xl md:text-2xl font-medium text-foreground dark:text-foreground">WE COMBINE</div>
              <div className="text-xl md:text-2xl font-medium relative mb-2">
                <span className="relative z-20">DATA & DESIGN</span>
                <div className="absolute h-2 md:h-3 bg-primary-400/80 w-full top-1/2 -translate-y-1/2 z-10" />
              </div>
              <Link href="/learn-more" className="inline-flex items-center mt-1 text-xs md:text-sm text-muted hover:text-primary-600 transition-all">
                LEARN MORE
                <ArrowRight size={12} className="ml-1" />
              </Link>
            </div>
          </div>

          {/* Stat Card 3 - Enhanced */}
          <div className="bg-white/90 dark:bg-white/10 backdrop-blur-md border border-white/50 dark:border-white/10 rounded-xl p-4 md:p-5 shadow-md hover:shadow-lg transition-shadow duration-300">
            <div>
              <div className="text-lg md:text-xl font-medium text-foreground dark:text-foreground mb-2">Enterprise Ready!</div>
              <p className="text-xs md:text-sm text-muted">
                Trusted by leading brands worldwide.
              </p>
              <div className="mt-2 md:mt-3 flex -space-x-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-white dark:border-gray-900" />
                ))}
                <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-primary-300 dark:bg-primary-600 border-2 border-white dark:border-gray-900 flex items-center justify-center text-[10px] md:text-xs font-medium text-white">+8</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}