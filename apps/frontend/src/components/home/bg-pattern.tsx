import React from 'react';

export function BgPattern() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-gradient-to-b from-gray-50 to-white">
      {/* Base silky background */}
      <div className="absolute inset-0 bg-opacity-5"></div>
      
      {/* SVG wave patterns */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1200 800"
        preserveAspectRatio="none"
      >
        <defs>
          <filter id="silk-texture" x="-50%" y="-50%" width="200%" height="200%">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="3" />
            <feDisplacementMap in="SourceGraphic" scale="2" />
          </filter>
          <linearGradient id="wave-gradient-1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.05" />
            <stop offset="50%" stopColor="currentColor" stopOpacity="0.08" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.05" />
          </linearGradient>
          <linearGradient id="wave-gradient-2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.03" />
            <stop offset="50%" stopColor="currentColor" stopOpacity="0.07" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.03" />
          </linearGradient>
          <linearGradient id="highlight-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="white" stopOpacity="0.05" />
            <stop offset="50%" stopColor="white" stopOpacity="0.02" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {/* Elegant top wave */}
        <path
          d="M0 250 Q300 320 600 280 T1200 320 L1200 800 L0 800 Z"
          fill="url(#wave-gradient-1)"
          className="text-blue-100"
          style={{ filter: 'url(#silk-texture)' }}
        />
        
        {/* Flowing middle wave */}
        <path
          d="M0 350 Q450 400 700 360 T1200 420 L1200 800 L0 800 Z"
          fill="url(#wave-gradient-2)" 
          className="text-indigo-50"
          style={{ filter: 'url(#silk-texture)' }}
        />
        
        {/* Silky bottom wave */}
        <path
          d="M0 480 Q200 520 600 490 T1200 540 L1200 800 L0 800 Z"
          fill="url(#wave-gradient-1)"
          className="text-purple-50"
          style={{ filter: 'url(#silk-texture)' }}
        />

        {/* Subtle shimmer highlight */}
        <path
          d="M-100 50 Q400 150 800 100 T1300 200 L1300 800 L-100 800 Z"
          fill="url(#highlight-gradient)"
          style={{ mixBlendMode: 'overlay' }}
        />
        
        {/* Minimalistic horizontal lines */}
        <g className="text-gray-200" style={{ opacity: 0.1 }} strokeWidth="0.3">
          {Array.from({ length: 12 }).map((_, i) => (
            <line 
              key={`h-line-${i}`} 
              x1="0" 
              y1={i * 60 + 100} 
              x2="1200" 
              y2={i * 60 + 100} 
              strokeDasharray="1,12" 
              stroke="currentColor"
            />
          ))}
        </g>
        
        {/* Sparse vertical lines for minimal aesthetic */}
        <g className="text-gray-200" style={{ opacity: 0.08 }} strokeWidth="0.2">
          {Array.from({ length: 20 }).map((_, i) => (
            <line 
              key={`v-line-${i}`} 
              x1={i * 60} 
              y1="0" 
              x2={i * 60} 
              y2="800" 
              strokeDasharray="1,20" 
              stroke="currentColor"
            />
          ))}
        </g>
      </svg>
      
      {/* Ultra-fine silk texture overlay */}
      <div 
        className="absolute inset-0 opacity-10 mix-blend-soft-light"
        style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='2' stitchTiles='stitch' seed='5'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.4'/%3E%3C/svg%3E")`
        }}
      ></div>
    </div>
  );
}