import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '../../lib/animations';
import api from '../../lib/axios';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorMessage from '../../components/ui/ErrorMessage';
import { BarChart3, TrendingUp } from 'lucide-react';

const STATUS_COLORS = {
  todo: 'rgb(113 113 122)',
  in_progress: 'rgb(56 189 248)',
  review: 'rgb(250 204 21)',
  done: 'rgb(52 211 153)',
};

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.get('/dashboard/analytics');
        if (response.data?.success) setData(response.data.data);
      } catch (err) {
        setError(err.response?.data?.error?.message || err.message || 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading analytics..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl">
        <ErrorMessage message={error} variant="banner" />
      </div>
    );
  }

  const taskStatusOverTime = data?.taskStatusOverTime ?? [];
  const tasksPerProject = data?.tasksPerProject ?? [];
  const activityByDay = data?.activityByDay ?? [];

  const maxActivity = Math.max(...activityByDay.map((d) => d.value), 1);
  const maxTasksPerProject = Math.max(...tasksPerProject.map((p) => p.count), 1);

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="max-w-7xl"
    >
      <motion.div variants={fadeInUp} className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-white mb-2">
          Analytics
        </h1>
        <p className="text-zinc-400">
          Task and activity metrics over the last 30 days.
        </p>
      </motion.div>

      {/* Activity by day (bar chart) */}
      <motion.div variants={fadeInUp} className="mb-6">
        <div className="p-6 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-teal-400" />
            <h3 className="text-lg font-semibold text-white">Tasks created by day</h3>
          </div>
          {activityByDay.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-zinc-500 text-sm">
              No activity in the last 30 days
            </div>
          ) : (
            <div className="flex items-end gap-1 h-48">
              {activityByDay.map((d, i) => (
                <div
                  key={d.date}
                  className="flex-1 flex flex-col items-center gap-1 min-w-0"
                  title={`${d.label}: ${d.value}`}
                >
                  <div
                    className="w-full rounded-t bg-teal-500/80 hover:bg-teal-500 transition-colors min-h-[4px]"
                    style={{ height: `${(d.value / maxActivity) * 100}%` }}
                  />
                  <span className="text-[10px] text-zinc-500 truncate w-full text-center">
                    {d.label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Tasks per project (horizontal bars) */}
      <motion.div variants={fadeInUp} className="mb-6">
        <div className="p-6 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-teal-400" />
            <h3 className="text-lg font-semibold text-white">Tasks per project</h3>
          </div>
          {tasksPerProject.length === 0 ? (
            <div className="h-32 flex items-center justify-center text-zinc-500 text-sm">
              No project data yet
            </div>
          ) : (
            <div className="space-y-3">
              {tasksPerProject.slice(0, 10).map((p) => (
                <div key={p.project + p.count} className="flex items-center gap-3">
                  <span className="text-zinc-300 text-sm w-40 truncate" title={p.project}>
                    {p.project}
                  </span>
                  <div className="flex-1 h-6 rounded bg-white/5 overflow-hidden">
                    <div
                      className="h-full rounded bg-teal-500/80"
                      style={{ width: `${(p.count / maxTasksPerProject) * 100}%` }}
                    />
                  </div>
                  <span className="text-white text-sm font-medium w-8">{p.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Task status over time (stacked by date) */}
      {taskStatusOverTime.length > 0 && (
        <motion.div variants={fadeInUp}>
          <div className="p-6 rounded-xl bg-white/5 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">Task status over time</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-2 pr-4 text-zinc-400 font-medium">Date</th>
                    {Object.keys(STATUS_COLORS).map((s) => (
                      <th key={s} className="text-right py-2 px-2 text-zinc-400 font-medium capitalize">
                        {s.replace('_', ' ')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {taskStatusOverTime.slice(-14).map((row) => (
                    <tr key={row.date} className="border-b border-white/5">
                      <td className="py-2 pr-4 text-zinc-300">
                        {new Date(row.date + 'T00:00:00').toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      {Object.keys(STATUS_COLORS).map((s) => (
                        <td key={s} className="text-right py-2 px-2 text-zinc-300">
                          {row.labels?.[s] ?? 0}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Analytics;
