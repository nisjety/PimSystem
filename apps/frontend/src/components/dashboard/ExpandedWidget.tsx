import { ExpandedWidgetProps } from '@/types/dashboard';
import { motion } from 'framer-motion';
import { Minimize2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ExpandedWidget({ widgetId, template, data, onClose }: ExpandedWidgetProps) {
  const Icon = template.icon;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden min-h-[600px] flex flex-col"
    >
      <div className={cn(
        "flex justify-between items-center p-5 border-b border-slate-200 dark:border-slate-700",
        template.color ? `${template.color.replace('bg-', 'bg-').replace('600', '50')} dark:bg-opacity-10` : 'bg-slate-50 dark:bg-slate-800'
      )}>
        <div className="flex items-center">
          <div className={`${template.color} p-2.5 rounded-lg mr-3 text-white`}>
            <Icon className="h-5 w-5" aria-hidden="true" />
          </div>
          <h2 className="text-xl font-semibold text-slate-800 dark:text-white">{template.title}</h2>
        </div>

        <button 
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-white/20 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300"
          aria-label="Close expanded view"
        >
          <Minimize2 className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 p-6 overflow-auto">
        {widgetId === 'productMetrics' && <ProductMetricsWidget data={data.productMetrics} expanded />}
        {widgetId === 'categoryMetrics' && <CategoryMetricsWidget data={data.categoryMetrics} expanded />}
        {widgetId === 'ingredientMetrics' && <IngredientMetricsWidget data={data.ingredientMetrics} expanded />}
        {widgetId === 'activityFeed' && <ActivityFeedWidget data={data.recentActivity} expanded />}
        {widgetId === 'salesChart' && <SalesChartWidget data={data.salesData} expanded />}
        {widgetId === 'distribution' && <DistributionWidget data={data.categoryDistribution} expanded />}
        {widgetId === 'alerts' && <AlertsWidget data={data.alerts} expanded />}
      </div>
    </motion.div>
  );
}
