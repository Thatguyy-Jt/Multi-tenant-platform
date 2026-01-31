import React from 'react';
import Card from '../ui/Card';
import { cn } from '../../lib/utils';
import { PieChart as PieChartIcon } from 'lucide-react';

const STATUS_CONFIG = [
  { key: 'todo', label: 'To Do', color: 'rgb(113 113 122)', colorClass: 'bg-zinc-500' },
  { key: 'in_progress', label: 'In Progress', color: 'rgb(56 189 248)', colorClass: 'bg-sky-400' },
  { key: 'review', label: 'Review', color: 'rgb(250 204 21)', colorClass: 'bg-amber-400' },
  { key: 'done', label: 'Done', color: 'rgb(52 211 153)', colorClass: 'bg-emerald-400' },
];

/**
 * Build SVG path for a pie segment (angle in degrees, 0 = top, clockwise).
 */
function getPieSegment(cx, cy, r, startAngleDeg, endAngleDeg) {
  const start = (startAngleDeg - 90) * (Math.PI / 180);
  const end = (endAngleDeg - 90) * (Math.PI / 180);
  const x1 = cx + r * Math.cos(start);
  const y1 = cy + r * Math.sin(start);
  const x2 = cx + r * Math.cos(end);
  const y2 = cy + r * Math.sin(end);
  const large = endAngleDeg - startAngleDeg > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
}

const ActivityChart = ({ taskBreakdown = {}, className = '' }) => {
  const segments = STATUS_CONFIG.map(({ key, label, color }) => ({
    key,
    label,
    color,
    value: taskBreakdown[key] ?? 0,
  })).filter((s) => s.value > 0);

  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const hasData = total > 0;

  // Pie geometry
  const size = 180;
  const cx = size / 2;
  const cy = size / 2;
  const r = Math.min(cx, cy) - 4;

  let cumulative = 0;
  const paths = segments.map((seg) => {
    const startAngle = (cumulative / total) * 360;
    cumulative += seg.value;
    const endAngle = (cumulative / total) * 360;
    return {
      ...seg,
      path: getPieSegment(cx, cy, r, startAngle, endAngle),
      percent: total > 0 ? Math.round((seg.value / total) * 100) : 0,
    };
  });

  return (
    <Card className={cn('p-6', className)}>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">Activity Overview</h3>
          <p className="text-sm text-zinc-400">Task status report</p>
        </div>
        <div className="flex gap-2">
          <span className="px-3 py-1.5 rounded-md border border-white/10 text-xs text-zinc-400 bg-white/5">
            Last 30 Days
          </span>
        </div>
      </div>

      {!hasData ? (
        <div className="w-full h-48 md:h-64 rounded-xl border border-white/5 bg-white/5 flex items-center justify-center">
          <div className="text-center text-zinc-500">
            <PieChartIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No task data yet</p>
            <p className="text-xs mt-1">Create tasks to see the activity report here</p>
          </div>
        </div>
      ) : (
        <div className="w-full rounded-xl border border-white/5 bg-white/5 overflow-hidden">
          <div className="flex flex-col md:flex-row items-center gap-6 p-6">
            {/* Pie chart */}
            <div className="shrink-0">
              <svg width={size} height={size} className="overflow-visible">
                {paths.map((seg) => (
                  <path
                    key={seg.key}
                    d={seg.path}
                    fill={seg.color}
                    className="opacity-90 hover:opacity-100 transition-opacity cursor-pointer"
                    style={{ opacity: 0.9 }}
                  >
                    <title>{seg.label}: {seg.value} ({seg.percent}%)</title>
                  </path>
                ))}
              </svg>
            </div>
            {/* Legend */}
            <div className="flex-1 w-full md:w-auto space-y-2">
              {STATUS_CONFIG.map((config) => {
                const value = taskBreakdown[config.key] ?? 0;
                const percent = total > 0 ? Math.round((value / total) * 100) : 0;
                return (
                  <div
                    key={config.key}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className={cn('w-3 h-3 rounded-full shrink-0', config.colorClass)}
                      />
                      <span className="text-zinc-300 truncate">{config.label}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-white font-medium">{value}</span>
                      <span className="text-zinc-500 text-xs">({percent}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default ActivityChart;
