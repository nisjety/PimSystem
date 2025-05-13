import { DashboardMetrics } from '@/types/analytics';

export async function fetchDashboardMetrics(): Promise<DashboardMetrics> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics/dashboard`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch dashboard metrics');
  }

  return response.json();
}
