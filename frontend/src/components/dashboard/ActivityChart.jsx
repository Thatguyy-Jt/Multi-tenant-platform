import React from 'react';
import Card from '../ui/Card';
import { cn } from '../../lib/utils';
import { BarChart3 } from 'lucide-react';

const ActivityChart = ({ data = [], subtitle = 'Organization activity (last 30 days)', className = '' }) => {
  const hasData = data.length > 0 && data.some((d) => (d.value || 0) > 0);
  const bars = (data || []).map((item, i) => ({
    value: item.value ?? 0,
    label: item.label ?? '',
    key: item.date ?? item.label ?? i,
  }));
  const maxValue = bars.length > 0 ? Math.max(...bars.map((b) => b.value), 1) : 1;

  return (
    <Card className={cn('p-6', className)}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white mb-1">Activity Overview</h3>
        <p className="text-sm text-zinc-400">{subtitle}</p>
      </div>

      {!hasData ? (
        <div className="w-full h-48 md:h-64 rounded-xl border border-white/5 bg-white/5 flex items-center justify-center">
          <div className="text-center text-zinc-500">
            <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No activity yet</p>
            <p className="text-xs mt-1">Projects and tasks created in the last 30 days will appear here</p>
          </div>
        </div>
      ) : (
        <div className="w-full">
          <div className="w-full h-48 md:h-64 rounded-xl border border-white/5 bg-white/5 relative overflow-hidden flex items-end gap-px px-2 py-3">
            {bars.map((bar) => (
              <div
                key={bar.key}
                className="flex-1 flex flex-col items-center justify-end min-w-0 min-h-[140px]"
              >
                <div
                  style={{ height: `${(bar.value / maxValue) * 100}%` }}
                  className="w-full max-w-[12px] min-h-[2px] bg-gradient-to-t from-teal-600 to-teal-400 rounded-t hover:from-teal-500 hover:to-teal-300 transition-all duration-200 cursor-pointer group relative"
                  title={`${bar.label}: ${bar.value} ${bar.value === 1 ? 'item' : 'items'}`}
                >
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-0.5 rounded bg-[#0F0F11] border border-white/10 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                    {bar.label}: {bar.value}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 px-1 text-xs text-zinc-500">
            {bars.length > 0 && (
              <>
                <span>{bars[0].label}</span>
                <span>{bars[Math.floor(bars.length / 2)].label}</span>
                <span>{bars[bars.length - 1].label}</span>
              </>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};

export default ActivityChart;
