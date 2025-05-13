export interface DashboardMetrics {
  productMetrics: {
    total: number;
    active: number;
    outgoing: number;
    inactive: number;
  };
  categoryMetrics: {
    total: number;
    withProducts: number;
  };
  ingredientMetrics: {
    total: number;
    mostUsed: Array<{
      name: string;
      count: number;
    }>;
  };
  recentActivity: Array<{
    id: string;
    type: 'create' | 'update' | 'delete';
    entityType: 'product' | 'category' | 'ingredient';
    entityId: string;
    entityName: string;
    userId: string;
    userName: string;
    timestamp: string;
  }>;
  period: {
    startDate: string;
    endDate: string;
  };
}
