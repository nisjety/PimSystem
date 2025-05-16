'use client';

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

/**
 * NetworkLines Component Props
 */
interface NetworkLinesProps {
  active?: boolean;
  className?: string;
  opacity?: number;
  isLoading?: boolean;
  onLoad?: () => void;
}


/**
 * NetworkLines Component
 * A reusable component that renders an animated network visualization
 * 
 * @param {Object} props
 * @param {boolean} props.active - Whether the animation is active
 * @param {string} props.className - Additional CSS classes
 * @param {number} props.opacity - Opacity of the network (0-100)
 * @param {boolean} props.isLoading - If true, adds a loading spinner
 * @param {Function} props.onLoad - Callback when loading completes
 */
const NetworkLines: React.FC<NetworkLinesProps> = ({ 
  active = true, 
  className = "", 
  opacity = 30,
  isLoading = false,
  onLoad = () => {}
}) => {
  const [loaded, setLoaded] = useState<boolean>(false);

  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setLoaded(true);
        onLoad();
      }, 2500);
      
      return () => clearTimeout(timer);
    }
  }, [isLoading, onLoad]);

  // Define the network paths - using straighter lines more like the reference images
  const networkPaths: NetworkPath[] = [
    { id: 1, path: "M100,200 L400,200 L700,300 L1100,300", color: "var(--primary-600)" },
    { id: 2, path: "M150,300 L300,300 L600,450 L900,450 L1200,450", color: "var(--primary-500)" },
    { id: 3, path: "M200,580 L400,580 L700,500 L950,500 L1300,500", color: "var(--primary-700)" },
    { id: 4, path: "M400,200 L400,300", color: "var(--primary-500)" },
    { id: 5, path: "M700,300 L700,500", color: "var(--primary-600)" },
    { id: 6, path: "M900,450 L900,200", color: "var(--primary-600)" },
    { id: 7, path: "M600,450 L600,580", color: "var(--primary-500)" },
    // Diagonal connections to create grid
    { id: 8, path: "M400,300 L600,450", color: "var(--primary-500)" },
    { id: 9, path: "M700,300 L900,450", color: "var(--primary-600)" },
    { id: 10, path: "M400,580 L600,450", color: "var(--primary-700)" },
  ];

  // Define the network nodes
  const networkNodes: NetworkNode[] = [
    { id: 1, x: 100, y: 200, size: 5, color: "var(--primary-600)" },
    { id: 2, x: 400, y: 200, size: 5, color: "var(--primary-600)" },
    { id: 3, x: 700, y: 300, size: 5, color: "var(--primary-600)" },
    { id: 4, x: 1100, y: 300, size: 5, color: "var(--primary-600)" },
    { id: 5, x: 150, y: 300, size: 5, color: "var(--primary-500)" },
    { id: 6, x: 300, y: 300, size: 5, color: "var(--primary-500)" },
    { id: 7, x: 600, y: 450, size: 5, color: "var(--primary-500)" },
    { id: 8, x: 900, y: 450, size: 5, color: "var(--primary-500)" },
    { id: 9, x: 1200, y: 450, size: 5, color: "var(--primary-500)" },
    { id: 10, x: 200, y: 580, size: 5, color: "var(--primary-700)" },
    { id: 11, x: 400, y: 580, size: 5, color: "var(--primary-700)" },
    { id: 12, x: 700, y: 500, size: 5, color: "var(--primary-700)" },
    { id: 13, x: 950, y: 500, size: 5, color: "var(--primary-700)" },
    { id: 14, x: 1300, y: 500, size: 5, color: "var(--primary-700)" },
  ];

  return (
    <div className={`absolute inset-0 z-20 opacity-${opacity} md:opacity-${opacity} ${className}`}>
      <svg width="100%" height="100%" viewBox="0 0 1440 900" fill="none" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        <g className={`opacity-${opacity/100}`}>
          {/* Draw the network paths */}
          {networkPaths.map((pathData) => (
            <g key={pathData.id}>
              <path d={pathData.path} stroke={pathData.color} strokeWidth="1.5" />
              
              {/* Signal animation along the path */}
              {active && (
                <motion.circle
                  r="4"
                  fill="white"
                  filter="drop-shadow(0 0 4px rgba(255, 255, 255, 0.8))"
                  initial={{ offset: 0 }}
                  animate={{ 
                    offset: [0, 1],
                  }}
                  transition={{ 
                    duration: 3 + (pathData.id % 3), 
                    repeat: Infinity,
                    ease: "linear"
                  }}
                >
                  <animateMotion
                    path={pathData.path}
                    dur={`${3 + (pathData.id % 3)}s`}
                    repeatCount="indefinite"
                  />
                </motion.circle>
              )}
            </g>
          ))}
          
          {/* Draw the network nodes */}
          {networkNodes.map((nodeData) => (
            <g key={nodeData.id}>
              <circle 
                cx={nodeData.x} 
                cy={nodeData.y} 
                r={nodeData.size} 
                fill={nodeData.color} 
              />
              
              {/* Pulse animation when active */}
              {active && (
                <motion.circle
                  cx={nodeData.x}
                  cy={nodeData.y}
                  r={nodeData.size}
                  stroke="white"
                  strokeWidth="1"
                  fill="transparent"
                  initial={{ scale: 1, opacity: 0.8 }}
                  animate={{ 
                    scale: [1, 1.8, 1],
                    opacity: [0.8, 0, 0.8]
                  }}
                  transition={{ 
                    duration: 2 + (nodeData.id % 4), 
                    repeat: Infinity,
                    repeatDelay: 0.5 + (nodeData.id % 3)
                  }}
                />
              )}
            </g>
          ))}
        </g>
      </svg>

      {/* Loading indicator overlay */}
      {isLoading && !loaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white/90 dark:bg-gray-900/90 p-6 rounded-lg shadow-lg flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <h3 className="text-xl font-medium">Loading</h3>
            <p className="text-sm text-muted">Please wait...</p>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Toggle button props for the network animation
 */
interface NetworkToggleProps {
  active: boolean;
  onToggle: () => void;
}

/**
 * Toggle button for the network animation
 */
export const NetworkToggle: React.FC<NetworkToggleProps> = ({ active, onToggle }) => {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground">Network</span>
      <button 
        onClick={onToggle}
        className={`w-12 h-6 rounded-full flex items-center transition-colors duration-300 p-1 ${active ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-700'}`}
      >
        <motion.div 
          className="w-4 h-4 bg-white rounded-full shadow-md"
          animate={{ x: active ? 24 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </button>
    </div>
  );
};

/**
 * Network path definition
 */
interface NetworkPath {
  id: number;
  path: string;
  color: string;
}

/**
 * Network node definition
 */
interface NetworkNode {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
}

/**
 * Hook for using NetworkLines as a loading screen
 */
export const useNetworkLoading = (): { loading: boolean; setLoading: React.Dispatch<React.SetStateAction<boolean>> } => {
  const [loading, setLoading] = useState<boolean>(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2500);
    
    return () => clearTimeout(timer);
  }, []);
  
  return { loading, setLoading };
};

/**
 * Loading screen props
 */
interface LoadingScreenProps {
  message?: string;
  subMessage?: string;
}

/**
 * Ready-to-use loading screen component
 */
export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = "Loading", 
  subMessage = "Please wait..." 
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
      <NetworkLines active={true} />
      <div className="relative z-10 text-center">
        <div className="w-16 h-16 mb-4 mx-auto border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        <h3 className="text-xl font-medium">{message}</h3>
        <p className="text-sm text-muted">{subMessage}</p>
      </div>
    </div>
  );
};

export default NetworkLines;