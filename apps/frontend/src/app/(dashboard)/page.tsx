'use client';

import { useAuthRedirect } from '@/hooks/useAuthRedirect';
import { PageHeader } from '@/components/dashboard/ui/page-header';
import { DashboardStats } from '@/components/dashboard/widgets/DashboardStats';
import { ActivityFeedWidget } from '@/components/dashboard/widgets/ActivityFeedWidget';
import { useDashboardData } from '@/hooks/useDashboardData';
import { LoadingScreen } from '@/components/core/ui/loading-screen';

export default function DashboardPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuthRedirect();
  const { data, isLoading: dataLoading } = useDashboardData();
  
  if (authLoading || !isAuthenticated) {
    return <LoadingScreen />;
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Dashboard" 
        description="Welcome back! Here's your overview"
      />
      
      {/* Dashboard widgets go here, using the data from useDashboardData */}
      {dataLoading ? (
        <div className="animate-pulse">Loading dashboard data...</div>
      ) : (
        <>
          <DashboardStats data={data?.stats} />
          <ActivityFeedWidget activities={data?.activities} />
          {/* Add more widgets here */}
        </>
      )}
    </div>
  );
}