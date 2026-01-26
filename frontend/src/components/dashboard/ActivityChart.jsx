import React from 'react';
import Card from '../ui/Card';
import { cn } from '../../lib/utils';

const ActivityChart = ({ data = [], className = '' }) => {
  // Generate chart bars from data or use default visualization
  const bars = data.length > 0 
    ? data.map((item, i) => ({
        value: item.value || Math.random() * 80 + 20,
        label: item.label || '',
        key: i,
      }))
    : Array.from({ length: 30 }, (_, i) => ({
        value: Math.random() * 80 + 20,
        key: i,
      }));

  const maxValue = Math.max(...bars.map(b => b.value));

  return (
    <Card className={cn("p-6", className)}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white mb-1">Activity Overview</h3>
        <p className="text-sm text-zinc-400">Last 30 days</p>
      </div>
      
      <div className="w-full h-48 md:h-64 rounded-xl border border-white/5 bg-white/5 relative overflow-hidden flex items-end px-1 gap-0.5">
        {bars.map((bar) => (
          <div
            key={bar.key}
            style={{ height: `${(bar.value / maxValue) * 100}%` }}
            className="flex-1 bg-gradient-to-t from-teal-500/20 to-teal-500/50 rounded-t-sm hover:from-teal-400/30 hover:to-teal-400/60 transition-all duration-300 cursor-pointer group relative"
            title={bar.label || `${Math.round(bar.value)}`}
          >
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded bg-[#0F0F11] border border-white/10 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
              {bar.label || Math.round(bar.value)}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default ActivityChart;
