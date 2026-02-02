import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '../../lib/animations';
import api from '../../lib/axios';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorMessage from '../../components/ui/ErrorMessage';
import { FileText } from 'lucide-react';

const ACTION_LABELS = {
  login_success: 'Login',
  login_failure: 'Login failed',
  logout: 'Logout',
  signup: 'Sign up',
  password_reset_request: 'Password reset requested',
  password_reset_success: 'Password reset',
  invitation_sent: 'Invitation sent',
  invitation_accepted: 'Invitation accepted',
  invitation_rejected: 'Invitation rejected',
  invitation_cancelled: 'Invitation cancelled',
  project_create: 'Project created',
  project_update: 'Project updated',
  project_delete: 'Project deleted',
  task_create: 'Task created',
  task_update: 'Task updated',
  task_delete: 'Task deleted',
  billing_checkout_started: 'Checkout started',
  billing_portal_accessed: 'Billing portal',
};

const AuditLog = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.get('/audit-logs', { params: { limit: 50 } });
        if (response.data?.success) setData(response.data.data);
      } catch (err) {
        setError(err.response?.data?.error?.message || err.message || 'Failed to load audit log');
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading audit log..." />
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

  const logs = data?.logs ?? [];
  const pagination = data?.pagination ?? {};

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="max-w-7xl"
    >
      <motion.div variants={fadeInUp} className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-white mb-2">
          Audit Log
        </h1>
        <p className="text-zinc-400">
          Key actions and events for your organization. Owners and Admins can view this log.
        </p>
      </motion.div>

      <motion.div variants={fadeInUp} className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
        {logs.length === 0 ? (
          <div className="p-12 text-center text-zinc-500">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No audit events yet</p>
            <p className="text-xs mt-1">Actions such as login, project create, and task updates will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="px-4 py-3 font-medium text-zinc-400">Date</th>
                  <th className="px-4 py-3 font-medium text-zinc-400">User</th>
                  <th className="px-4 py-3 font-medium text-zinc-400">Action</th>
                  <th className="px-4 py-3 font-medium text-zinc-400">Resource</th>
                  <th className="px-4 py-3 font-medium text-zinc-400">Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="px-4 py-3 text-zinc-300 whitespace-nowrap">
                      {log.createdAt ? new Date(log.createdAt).toLocaleString() : '—'}
                    </td>
                    <td className="px-4 py-3 text-zinc-300">{log.userEmail ?? '—'}</td>
                    <td className="px-4 py-3 text-white">
                      {ACTION_LABELS[log.action] ?? log.action}
                    </td>
                    <td className="px-4 py-3 text-zinc-400 capitalize">{log.resource}</td>
                    <td className="px-4 py-3 text-zinc-500 max-w-xs truncate">
                      {log.details && typeof log.details === 'object'
                        ? JSON.stringify(log.details)
                        : log.details ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {pagination.pages > 1 && (
          <div className="px-4 py-3 border-t border-white/10 text-zinc-500 text-sm">
            Page {pagination.page} of {pagination.pages} ({pagination.total} total)
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default AuditLog;
