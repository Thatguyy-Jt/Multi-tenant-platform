import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '../lib/animations';
import { useAuth } from '../context/AuthContext';
import api from '../lib/axios';
import StatsCard from '../components/dashboard/StatsCard';
import ActivityChart from '../components/dashboard/ActivityChart';
import RecentActivity from '../components/dashboard/RecentActivity';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorMessage from '../components/ui/ErrorMessage';
import { Users, FolderKanban, CheckSquare, TrendingUp, Download } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);
  const [myStats, setMyStats] = useState(null);

  const isAdminOrOwner = user?.role === 'owner' || user?.role === 'admin';
  const [exporting, setExporting] = useState(false);

  const handleExportReport = async () => {
    if (!isAdminOrOwner) return;
    setExporting(true);
    try {
      const response = await api.get('/dashboard/export', { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');

    try {
      if (isAdminOrOwner) {
        // Fetch organization stats for Admin/Owner
        const response = await api.get('/dashboard/stats');
        if (response.data?.success) {
          setStats(response.data.data);
        }
      } else {
        // Fetch personal stats for Members
        const response = await api.get('/dashboard/my-stats');
        if (response.data?.success) {
          setMyStats(response.data.data);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
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

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="max-w-7xl"
    >
      {/* Header */}
      <motion.div variants={fadeInUp} className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white mb-2">
            Dashboard Overview
          </h1>
          <p className="text-zinc-400">
            {isAdminOrOwner
              ? "Welcome back! Here's an overview of your organization."
              : "Welcome back! Here's your personal dashboard."}
          </p>
        </div>
        {isAdminOrOwner && (
          <button
            type="button"
            onClick={handleExportReport}
            disabled={exporting}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-500/20 text-teal-400 border border-teal-500/30 hover:bg-teal-500/30 disabled:opacity-50 transition-colors text-sm font-medium"
          >
            <Download className="w-4 h-4" />
            {exporting ? 'Exporting…' : 'Export report'}
          </button>
        )}
      </motion.div>

      {/* Admin/Owner View */}
      {isAdminOrOwner && stats && (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatsCard
              title="Total Users"
              value={stats.counts?.users || 0}
              icon={Users}
              delay={0.1}
            />
            <StatsCard
              title="Projects"
              value={stats.counts?.projects || 0}
              icon={FolderKanban}
              delay={0.2}
            />
            <StatsCard
              title="Tasks"
              value={stats.counts?.tasks || 0}
              icon={CheckSquare}
              delay={0.3}
            />
            <StatsCard
              title="Task Completion"
              value={
                stats.counts?.tasks > 0
                  ? `${Math.round(
                      ((stats.taskBreakdown?.done || 0) / stats.counts.tasks) * 100
                    )}%`
                  : '0%'
              }
              subtitle={`${stats.taskBreakdown?.done || 0} completed`}
              icon={TrendingUp}
              delay={0.4}
            />
          </div>

          {/* Charts and Activity Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <ActivityChart taskBreakdown={stats.taskBreakdown || {}} />
            <RecentActivity activities={stats.recentActivity || []} />
          </div>

          {/* Task Breakdown */}
          {stats.taskBreakdown && Object.keys(stats.taskBreakdown).length > 0 && (
            <motion.div variants={fadeInUp} className="mb-6">
              <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">Task Status Breakdown</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(stats.taskBreakdown).map(([status, count]) => (
                    <div key={status} className="text-center">
                      <div className="text-2xl font-semibold text-white mb-1">
                        {count}
                      </div>
                      <div className="text-xs text-zinc-500 uppercase tracking-wider">
                        {status}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </>
      )}

      {/* Member View */}
      {!isAdminOrOwner && myStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard
            title="My Tasks"
            value={myStats.tasks?.total || 0}
            subtitle="Total assigned tasks"
            icon={CheckSquare}
            delay={0.1}
          />
          <StatsCard
            title="Pending"
            value={myStats.tasks?.pending || 0}
            subtitle="Tasks in progress"
            icon={CheckSquare}
            delay={0.2}
          />
          <StatsCard
            title="Completed"
            value={myStats.tasks?.completed || 0}
            subtitle="Finished tasks"
            icon={TrendingUp}
            delay={0.3}
          />
        </div>
      )}
    </motion.div>
  );
};

export default Dashboard;
