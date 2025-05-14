// src/components/dashboard/widgets/DashboardStats.tsx
import { StatCard } from './StatCard';

interface StatItem {
  value: string;
  label: string;
  sublabel: string;
  trend: 'up' | 'down' | 'neutral';
}

interface DashboardStatsProps {
  stats?: {
    tasksCompleted?: StatItem;
    hoursWorked?: StatItem;
    projectsClosed?: StatItem;
    customStats?: StatItem[];
  };
  isLoading?: boolean;
}

export function DashboardStats({ stats, isLoading = false }: DashboardStatsProps) {
  // Default stats to show when data is not provided
  const defaultStats = {
    tasksCompleted: {
      value: "120",
      label: "Tasks done",
      sublabel: "On this week",
      trend: "up"
    },
    hoursWorked: {
      value: "425",
      label: "Hours worked",
      sublabel: "On this week",
      trend: "up"
    },
    projectsClosed: {
      value: "12",
      label: "Projects closed",
      sublabel: "on this month",
      trend: "down"
    }
  };

  // Use provided stats or fallback to defaults
  const tasksCompleted = stats?.tasksCompleted || defaultStats.tasksCompleted;
  const hoursWorked = stats?.hoursWorked || defaultStats.hoursWorked;
  const projectsClosed = stats?.projectsClosed || defaultStats.projectsClosed;
  
  // Additional custom stats (optional)
  const customStats = stats?.customStats || [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Main stats from Image 1 */}
      <StatCard
        value={tasksCompleted.value}
        label={tasksCompleted.label}
        sublabel={tasksCompleted.sublabel}
        trend={tasksCompleted.trend as 'up' | 'down' | 'neutral'}
        isLoading={isLoading}
        delay={0}
      />
      
      <StatCard
        value={hoursWorked.value}
        label={hoursWorked.label}
        sublabel={hoursWorked.sublabel}
        trend={hoursWorked.trend as 'up' | 'down' | 'neutral'}
        isLoading={isLoading}
        delay={1}
      />
      
      <StatCard
        value={projectsClosed.value}
        label={projectsClosed.label}
        sublabel={projectsClosed.sublabel}
        trend={projectsClosed.trend as 'up' | 'down' | 'neutral'}
        isLoading={isLoading}
        delay={2}
      />
      
      {/* Render any additional custom stats */}
      {customStats.map((stat, index) => (
        <StatCard
          key={`custom-stat-${index}`}
          value={stat.value}
          label={stat.label}
          sublabel={stat.sublabel}
          trend={stat.trend}
          isLoading={isLoading}
          delay={3 + index}
        />
      ))}
    </div>
  );
}