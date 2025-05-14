// Simulated API service - in a real app, this would call your backend
export async function fetchDashboardData() {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    stats: {
      products: { value: '1,247', change: '+12.5%' },
      categories: { value: '43', change: '+5.8%' },
      ingredients: { value: '768', change: '+7.2%' },
      activeUsers: { value: '24', change: '+2' },
    },
    activities: [
      {
        id: '1',
        type: 'create',
        entityType: 'product',
        entityName: 'Hydrating Face Cream',
        userName: 'Sarah Johnson',
        timestamp: new Date().toISOString()
      },
      // Add more activity items
    ],
    // Add more dashboard data
  };
}