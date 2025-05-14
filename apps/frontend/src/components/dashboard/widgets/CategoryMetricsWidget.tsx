import { CategoryMetrics } from '@/types/dashboard';
import { formatNumber } from '@/lib/utils';

interface CategoryMetricsWidgetProps {
  data: CategoryMetrics;
  expanded?: boolean;
}

export function CategoryMetricsWidget({ data, expanded = false }: CategoryMetricsWidgetProps) {
  const withProductsPercentage = Math.round((data.withProducts / data.total) * 100);
  
  return (
    <div className={expanded ? 'grid grid-cols-2 gap-6' : ''}>
      <div className="flex flex-col h-full justify-between">
        <div className="mb-4">
          <h3 className="text-3xl font-bold text-slate-800 dark:text-white">{formatNumber(data.total)}</h3>
          <p className="text-slate-500 dark:text-slate-400">Total Categories</p>
        </div>

        <div>
          <div className="flex items-baseline mb-1">
            <span className="text-xl font-semibold text-slate-700 dark:text-slate-200">{formatNumber(data.withProducts)}</span>
            <span className="ml-1 text-xs text-emerald-600 dark:text-emerald-400">{withProductsPercentage}%</span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">With Products</p>
        </div>
      </div>

      {expanded && (
        <div className="flex flex-col h-full">
          <div>
            {data.growth !== undefined && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">Growth</h4>
                <div className="flex items-center">
                  <span className={`text-2xl font-bold ${data.growth >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                    {data.growth > 0 ? '+' : ''}{data.growth}%
                  </span>
                  <span className="ml-2 text-sm text-slate-500 dark:text-slate-400">vs last month</span>
                </div>
              </div>
            )}

            {data.topCategory && (
              <div>
                <h4 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">Top Category</h4>
                <p className="text-slate-700 dark:text-slate-300">{data.topCategory}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
