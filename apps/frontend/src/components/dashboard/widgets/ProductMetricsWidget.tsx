import { ProductMetrics } from '@/types/dashboard';
import { formatNumber } from '@/lib/utils';

interface ProductMetricsWidgetProps {
  data: ProductMetrics;
  expanded?: boolean;
}

export function ProductMetricsWidget({ data, expanded = false }: ProductMetricsWidgetProps) {
  return (
    <div className={expanded ? 'grid grid-cols-2 gap-6' : ''}>
      <div className="flex flex-col h-full justify-between">
        <div className="mb-4">
          <h3 className="text-3xl font-bold text-slate-800 dark:text-white">{formatNumber(data.total)}</h3>
          <p className="text-slate-500 dark:text-slate-400">Total Products</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-baseline">
              <span className="text-xl font-semibold text-slate-700 dark:text-slate-200">{formatNumber(data.active)}</span>
              <span className="ml-1 text-xs text-emerald-600 dark:text-emerald-400">{Math.round(data.active/data.total*100)}%</span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Active</p>
          </div>

          <div>
            <div className="flex items-baseline">
              <span className="text-xl font-semibold text-slate-700 dark:text-slate-200">{formatNumber(data.inactive)}</span>
              <span className="ml-1 text-xs text-amber-600 dark:text-amber-400">{Math.round(data.inactive/data.total*100)}%</span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Inactive</p>
          </div>
        </div>
      </div>
      
      {expanded && (
        <div className="flex flex-col h-full justify-between">
          <div>
            <h4 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">Status Breakdown</h4>
            <div className="space-y-3">
              {data.outgoing && (
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Outgoing</span>
                    <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                      {formatNumber(data.outgoing)}
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-500 rounded-full"
                      style={{ width: `${Math.round(data.outgoing/data.total*100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {data.newLastWeek && (
            <div className="mt-6">
              <div className="flex items-baseline">
                <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">+{formatNumber(data.newLastWeek)}</span>
                <span className="ml-2 text-sm text-slate-500 dark:text-slate-400">New this week</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
