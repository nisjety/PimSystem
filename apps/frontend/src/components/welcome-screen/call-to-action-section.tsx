'use client';

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ExternalLink, ChevronRight, Code, Book, MessageSquare } from "lucide-react";

export function CallToActionSection() {
  const [isHovered, setIsHovered] = useState(false);
  
  // Animation variants for staggered children
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
  };
  
  const codeLines = [
    { width: "w-4/5", delay: 0 },
    { width: "w-full", delay: 0.1 },
    { width: "w-5/6", delay: 0.2 },
    { width: "w-3/4", delay: 0.3 },
    { width: "w-2/3", delay: 0.4 },
    { width: "w-full", delay: 0.5 },
    { width: "w-4/5", delay: 0.6 }
  ];
  
  return (
    <section className="py-16 sm:py-20 md:py-24">
      <div className="container-lg">
        <motion.div
          className="card overflow-hidden bg-elevated rounded-3xl shadow-lg hover:shadow-xl transition-base"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="p-6 sm:p-10 md:p-12 lg:flex lg:items-center lg:gap-x-12">
            <motion.div 
              className="lg:w-1/2"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
            >
              <motion.span 
                className="overline text-primary"
                variants={itemVariants}
              >
                Developer Resources
              </motion.span>
              
              <motion.h2 
                className="h2 text-foreground mt-2"
                variants={itemVariants}
              >
                Get Started with Our Documentation
              </motion.h2>
              
              <motion.p 
                className="body text-muted mt-4"
                variants={itemVariants}
              >
                Learn how to make the most of PimSystem with our comprehensive guides and tutorials. Our documentation covers everything from basic setup to advanced features.
              </motion.p>
              
              <motion.div 
                className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-4"
                variants={itemVariants}
              >
                <Link 
                  href="/docs" 
                  className="btn btn-gradient flex items-center gap-2 group"
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                >
                  <Book className="h-4 w-4" />
                  <span>View Documentation</span>
                  <motion.div
                    animate={{ x: isHovered ? 4 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </motion.div>
                </Link>
                
                <Link 
                  href="/support" 
                  className="btn btn-outline flex items-center gap-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Contact Support</span>
                </Link>
              </motion.div>
            </motion.div>
            
            {/* Code editor mockup */}
            <div className="mt-10 lg:mt-0 lg:w-1/2 relative">
              <motion.div 
                className="rounded-2xl bg-info-light p-5 shadow-md transform perspective-1200"
                initial={{ opacity: 0, rotateY: -10, x: 80 }}
                whileInView={{ opacity: 1, rotateY: 0, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ 
                  translateY: -5,
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                }}
              >
                <div className="rounded-xl bg-background-elevated backdrop-blur-sm p-4 border border-default">
                  {/* Window controls */}
                  <div className="flex mb-4 space-x-2">
                    <div className="h-3 w-3 rounded-full bg-error"></div>
                    <div className="h-3 w-3 rounded-full bg-warning"></div>
                    <div className="h-3 w-3 rounded-full bg-success"></div>
                  </div>
                  
                  {/* File tabs */}
                  <div className="flex border-b border-default mb-4">
                    <div className="flex items-center py-2 px-4 border-b-2 border-primary-500 text-primary text-sm font-medium">
                      <Code className="h-3.5 w-3.5 mr-2" />
                      <span>pim.config.js</span>
                    </div>
                  </div>
                  
                  {/* Code lines with staggered animation */}
                  <div className="space-y-3">
                    {codeLines.map((line, index) => (
                      <motion.div
                        key={index}
                        className={`h-3 bg-gray-200 dark:bg-gray-700 rounded ${line.width}`}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ 
                          duration: 0.4,
                          delay: line.delay + 0.5,
                          ease: "easeOut"
                        }}
                      />
                    ))}
                    
                    {/* Highlighted code block */}
                    <motion.div 
                      className="bg-primary-50 dark:bg-primary-900/30 p-3 rounded-md border-l-2 border-primary my-4"
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 1.2, duration: 0.5 }}
                    >
                      <div className="h-2.5 bg-primary-200 dark:bg-primary-700 rounded mb-2"></div>
                      <div className="h-2.5 bg-primary-200 dark:bg-primary-700 rounded w-4/5"></div>
                    </motion.div>
                    
                    {/* More code lines */}
                    <motion.div 
                      className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 1.4 }}
                    />
                    <motion.div 
                      className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 1.5 }}
                    />
                    
                    {/* Blinking cursor effect */}
                    <div className="relative h-4">
                      <motion.div
                        className="absolute left-0 h-4 w-0.5 bg-primary-500"
                        animate={{ opacity: [1, 0, 1] }}
                        transition={{ repeat: Infinity, duration: 1.2 }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}