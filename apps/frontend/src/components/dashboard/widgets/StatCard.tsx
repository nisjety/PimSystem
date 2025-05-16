// src/components/dashboard/widgets/StatCard.tsx
import { ArrowUp, ArrowDown } from 'lucide-react';
import { motion } from 'framer-motion';

type Trend = 'up' | 'down' | 'neutral';

interface StatCardProps {
  value: string;
  label: string;
  sublabel: string;
  trend?: Trend;
  isLoading?: boolean;
  delay?: number;
}

export function StatCard({
  value,
  label,
  sublabel,
  trend = 'neutral',
  isLoading = false,
  delay = 0
}: StatCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: delay * 0.1 }}
      className="bg-gray-800/80 backdrop-blur-md rounded-lg p-6 transform transition-all hover:translate-y-[-2px] hover:shadow-xl"
    >
      {isLoading ? (
        <div className="animate-pulse space-y-3">
          <div className="h-6 bg-gray-700/80 backdrop-blur-sm rounded w-1/3"></div>
          <div className="h-10 bg-gray-700/80 backdrop-blur-sm rounded w-2/3"></div>
          <div className="h-4 bg-gray-700/80 backdrop-blur-sm rounded w-1/2"></div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-start">
            <h2 className="text-5xl font-bold text-white">{value}</h2>
            {trend === 'up' && (
              <div className="p-1">
                <ArrowUp className="h-5 w-5 text-green-500" />
              </div>
            )}
            {trend === 'down' && (
              <div className="p-1">
                <ArrowDown className="h-5 w-5 text-red-500" />
              </div>
            )}
          </div>
          <p className="text-gray-300 mt-2 font-medium">{label}</p>
          <p className="text-sm text-gray-500 mt-1">{sublabel}</p>
        </>
      )}
    </motion.div>
  );
}