import { WidgetContentProps } from '@/types/dashboard';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { X, Maximize2 } from 'lucide-react';

export function WidgetContent({ 
  id, 
  template, 
  data, 
  isEditMode, 
  onRemove, 
  onExpand 
}: WidgetContentProps) {
  const Icon = template.icon;

  // Make the entire widget clickable if it has a link
  const WidgetWrapper = ({ children }: { children: React.ReactNode }) => {
    if (template.link && !isEditMode) {
      return (
        <Link 
          href={template.link} 
          className="block h-full outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2" 
          aria-label={`View details for ${template.title}`}
        >
          {children}
        </Link>
      );
    }
    return <div className="h-full">{children}</div>;
  };

  return (
    <WidgetWrapper>
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className={`${template.color} p-2.5 rounded-lg text-white`}>
              <Icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <h3 className="font-medium text-slate-800 dark:text-white">{template.title}</h3>
          </div>

          <div className="flex items-center gap-1">
            {!isEditMode && (
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onExpand(id);
                }}
                className="p-1.5 rounded-md hover:bg-white/20 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300"
                title="Expand widget"
                aria-label={`Expand ${template.title} widget`}
              >
                <Maximize2 className="h-4 w-4" />
              </button>
            )}

            {isEditMode && (
              <button 
                onClick={() => onRemove(id)}
                className="p-1.5 rounded-md hover:bg-white/20 dark:hover:bg-slate-700 transition-colors text-red-500"
                title="Remove widget"
                aria-label={`Remove ${template.title} widget`}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 p-5 overflow-auto">
          {id === 'productMetrics' && <ProductMetricsWidget data={data.productMetrics} />}
          {id === 'categoryMetrics' && <CategoryMetricsWidget data={data.categoryMetrics} />}
          {id === 'ingredientMetrics' && <IngredientMetricsWidget data={data.ingredientMetrics} />}
          {id === 'activityFeed' && <ActivityFeedWidget data={data.recentActivity} />}
          {id === 'salesChart' && <SalesChartWidget data={data.salesData} />}
          {id === 'distribution' && <DistributionWidget data={data.categoryDistribution} />}
          {id === 'alerts' && <AlertsWidget data={data.alerts} />}
        </div>
      </div>
    </WidgetWrapper>
  );
}
