// src/hooks/useDashboardData.ts
import { useState, useEffect } from 'react';

export type Trend = 'up' | 'down' | 'neutral';

export interface StatItem {
  value: string;
  label: string;
  sublabel: string;
  trend: Trend;
}

export interface DashboardData {
  stats: {
    tasksCompleted: StatItem;
    hoursWorked: StatItem;
    projectsClosed: StatItem;
    customStats?: StatItem[];
  };
  team?: {
    members: {
      id: string;
      name: string;
      role: string;
      avatarUrl: string;
      bgColor: string;
    }[];
  };
  activities?: any[];
  events?: any[];
  // Add other dashboard data types here
}

export function useDashboardData() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // In a real app, this would be an API call
        // For now, we'll simulate a network request with setTimeout
        await new Promise(resolve => setTimeout(resolve, 1200));
        
        // Mock data to match Image 1
        const mockData: DashboardData = {
          stats: {
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
          },
          team: {
            members: [
              {
                id: "1",
                name: "Michel Pink",
                role: "CEO",
                avatarUrl: "/avatars/michel.jpg",
                bgColor: "bg-pink-200"
              },
              {
                id: "2",
                name: "Bruce Beige",
                role: "UI designer",
                avatarUrl: "/avatars/bruce.jpg",
                bgColor: "bg-yellow-100"
              },
              {
                id: "3",
                name: "Alice Red",
                role: "HR manager",
                avatarUrl: "/avatars/alice.jpg",
                bgColor: "bg-red-200"
              }
            ]
          }
        };
        
        setData(mockData);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, isLoading, error };
}