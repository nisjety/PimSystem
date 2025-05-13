import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { fetchDashboardMetrics } from "@/services/analytics";
import { formatDistanceToNow } from 'date-fns';
import { QuickActions } from '@/components/dashboard/quick-actions';

export default async function DashboardPage() {
  const { userId } = auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const metrics = await fetchDashboardMetrics();
  
  return (
    <div className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="p-4 bg-white rounded-lg shadow">
          <h3 className="font-semibold">Total Products</h3>
          <p className="text-2xl">{metrics.productMetrics.total}</p>
          <div className="mt-2 text-sm text-gray-500">
            <span className="mr-2">Active: {metrics.productMetrics.active}</span>
            <span>Inactive: {metrics.productMetrics.inactive}</span>
          </div>
        </div>
        <div className="p-4 bg-white rounded-lg shadow">
          <h3 className="font-semibold">Categories</h3>
          <p className="text-2xl">{metrics.categoryMetrics.total}</p>
          <div className="mt-2 text-sm text-gray-500">
            <span>Last updated {formatDistanceToNow(metrics.categoryMetrics.lastUpdated)} ago</span>
          </div>
        </div>
        <div className="p-4 bg-white rounded-lg shadow">
          <h3 className="font-semibold">Ingredients</h3>
          <p className="text-2xl">{metrics.ingredientMetrics.total}</p>
          <div className="mt-2 text-sm text-gray-500">
            <span>Unique: {metrics.ingredientMetrics.unique}</span>
          </div>
        </div>
        <div className="p-4 bg-white rounded-lg shadow">
          <h3 className="font-semibold">Recent Activity</h3>
          <p className="text-2xl">{metrics.recentActivity.count}</p>
          <div className="mt-2 text-sm text-gray-500">
            <span>In the last 24h</span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <QuickActions />
        <div className="p-4 bg-white rounded-lg shadow">
          <h3 className="font-semibold mb-4">Activity Feed</h3>
          <div className="space-y-4">
            {metrics.recentActivity.items.map((item) => (
              <div key={item.id} className="flex items-start space-x-3">
                <div className="flex-1">
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(item.timestamp))} ago
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}