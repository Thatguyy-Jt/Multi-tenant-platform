import React from 'react';
import Card from '../ui/Card';
import { cn } from '../../lib/utils';
import { BarChart3 } from 'lucide-react';

const STATUS_LABELS = {
  todo: 'To Do',
  in_progress: 'In Progress',
  review: 'Review',
  done: 'Done',
};

const ActivityChart = ({ data = [], className = '' }) => {
  const hasData = data.length > 0;
  const bars = hasData
    ? data.map((item, i) => ({
        value: item.value || 0,
        label: item.label || '',
        key: item.label || i,
      }))
    : [];
  const maxValue = hasData ? Math.max(...bars.map(b => b.value), 1) : 1;

  return (
    <Card className={cn("p-6", className)}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white mb-1">Activity Overview</h3>
        <p className="text-sm text-zinc-400">Tasks by status</p>
      </div>

      {!hasData ? (
        <div className="w-full h-48 md:h-64 rounded-xl border border-white/5 bg-white/5 flex items-center justify-center">
          <div className="text-center text-zinc-500">
            <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No task data yet</p>
            <p className="text-xs mt-1">Create projects and tasks to see the breakdown here</p>
          </div>
        </div>
      ) : (
        <div className="w-full h-48 md:h-64 rounded-xl border border-white/5 bg-white/5 relative overflow-hidden flex items-end px-2 gap-2">
          {bars.map((bar) => (
            <div
              key={bar.key}
              className="flex-1 flex flex-col items-center gap-2 min-w-0"
            >
              <div className="w-full flex flex-col items-center justify-end flex-1 min-h-[120px]">
                <div
                  style={{ height: `${(bar.value / maxValue) * 100}%` }}
                  className="w-full max-w-[48px] bg-gradient-to-t from-teal-500/30 to-teal-500/60 rounded-t hover:from-teal-400/40 hover:to-teal-400/70 transition-all duration-300 cursor-pointer group relative min-h-[4px]"
                  title={bar.label}
                >
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded bg-[#0F0F11] border border-white/10 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                    {bar.label}
                  </div>
                </div>
              </div>
              <span className="text-xs text-zinc-500 truncate w-full text-center" title={bar.label}>
                {STATUS_LABELS[bar.label.split(':')[0]?.trim()] || bar.label.split(':')[0]?.replace('_', ' ') || bar.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default ActivityChart;
