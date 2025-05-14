'use client';

import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';

interface DashboardMetricsProps {
  initialData?: any; // Add proper type here
}

export function DashboardMetrics({ initialData }: DashboardMetricsProps) {
  const { data: metrics, isLoading, error } = useQuery({
    queryKey: ['dashboardMetrics'],
    queryFn: async () => {
      const response = await fetch('/api/analytics/dashboard');
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard metrics');
      }
      return response.json();
    },
    initialData,
  });

  if (isLoading) {
    return <div>Loading metrics...</div>;
  }

  if (error) {
    return <div>Error loading metrics</div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <div className="p-4 bg-white rounded-lg shadow">
        <h3 className="font-semibold">Total Products</h3>
        <p className="text-2xl">{metrics?.productMetrics?.total || '-'}</p>
        <div className="mt-2 text-sm text-gray-500">
          <span className="mr-2">Active: {metrics?.productMetrics?.active || '-'}</span>
          <span>Inactive: {metrics?.productMetrics?.inactive || '-'}</span>
        </div>
      </div>
      <div className="p-4 bg-white rounded-lg shadow">
        <h3 className="font-semibold">Categories</h3>
        <p className="text-2xl">{metrics?.categoryMetrics?.total || '-'}</p>
        {metrics?.categoryMetrics?.lastUpdated && (
          <div className="mt-2 text-sm text-gray-500">
            <span>Last updated {formatDistanceToNow(new Date(metrics.categoryMetrics.lastUpdated))} ago</span>
          </div>
        )}
      </div>
      <div className="p-4 bg-white rounded-lg shadow">
        <h3 className="font-semibold">Ingredients</h3>
        <p className="text-2xl">{metrics?.ingredientMetrics?.total || '-'}</p>
        <div className="mt-2 text-sm text-gray-500">
          <span>Unique: {metrics?.ingredientMetrics?.unique || '-'}</span>
        </div>
      </div>
      <div className="p-4 bg-white rounded-lg shadow">
        <h3 className="font-semibold">Recent Activity</h3>
        <p className="text-2xl">{metrics?.recentActivity?.count || '-'}</p>
        <div className="mt-2 text-sm text-gray-500">
          <span>In the last 24h</span>
        </div>
      </div>
    </div>
  );
}