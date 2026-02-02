import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '../../lib/animations';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/axios';
import StatsCard from '../../components/dashboard/StatsCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorMessage from '../../components/ui/ErrorMessage';
import Card from '../../components/ui/Card';
import { Users, Building2, Shield, Calendar } from 'lucide-react';

const Admin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isSuperAdmin = user?.role === 'super_admin';

  useEffect(() => {
    if (!isSuperAdmin) {
      navigate('/dashboard', { replace: true });
      return;
    }
    fetchAdminData();
  }, [isSuperAdmin, navigate]);

  const fetchAdminData = async () => {
    if (!isSuperAdmin) return;

    setLoading(true);
    setError('');

    try {
      const [statsRes, tenantsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/tenants'),
      ]);

      if (statsRes.data?.success) setStats(statsRes.data.data);
      if (tenantsRes.data?.success) setTenants(tenantsRes.data.data.tenants || []);
    } catch (err) {
      setError(err.message || 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  if (!isSuperAdmin) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading admin dashboard..." />
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

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="max-w-7xl"
    >
      <motion.div variants={fadeInUp} className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-amber-500/10">
            <Shield className="w-6 h-6 text-amber-400" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-white">
            Admin Dashboard
          </h1>
        </div>
        <p className="text-zinc-400">
          Platform-wide statistics and tenant overview. Super Admin only.
        </p>
      </motion.div>

      {stats && (
        <>
          <motion.div variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <StatsCard
              title="Total Users"
              value={stats.counts?.users ?? 0}
              icon={Users}
              delay={0.1}
            />
            <StatsCard
              title="Organizations"
              value={stats.counts?.organizations ?? 0}
              icon={Building2}
              delay={0.2}
            />
          </motion.div>

          {stats.recentOrganizations && stats.recentOrganizations.length > 0 && (
            <motion.div variants={fadeInUp} className="mb-8">
              <h2 className="text-lg font-semibold text-white mb-4">Recent organizations</h2>
              <Card className="p-6">
                <div className="space-y-3">
                  {stats.recentOrganizations.map((org) => (
                    <div
                      key={org._id}
                      className="flex flex-wrap items-center justify-between gap-4 py-3 border-b border-white/5 last:border-0"
                    >
                      <div>
                        <p className="font-medium text-white">{org.name}</p>
                        <p className="text-xs text-zinc-500 font-mono">{org.tenantId}</p>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="px-2 py-0.5 rounded bg-white/10 text-zinc-300 capitalize">
                          {org.subscriptionPlan ?? 'free'}
                        </span>
                        <span className="text-zinc-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(org.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          <motion.div variants={fadeInUp}>
            <h2 className="text-lg font-semibold text-white mb-4">All tenants</h2>
            <Card className="p-6 overflow-x-auto">
              {tenants.length === 0 ? (
                <p className="text-zinc-500 text-center py-8">No tenants yet.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-zinc-500 border-b border-white/10">
                      <th className="pb-3 font-medium">Name</th>
                      <th className="pb-3 font-medium">Tenant ID</th>
                      <th className="pb-3 font-medium">Plan</th>
                      <th className="pb-3 font-medium">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tenants.map((org) => (
                      <tr key={org._id} className="border-b border-white/5 last:border-0">
                        <td className="py-3 text-white">{org.name}</td>
                        <td className="py-3 text-zinc-400 font-mono text-xs">{org.tenantId}</td>
                        <td className="py-3">
                          <span className="capitalize text-zinc-300">
                            {org.subscriptionPlan ?? 'free'}
                          </span>
                        </td>
                        <td className="py-3 text-zinc-500">{formatDate(org.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Card>
          </motion.div>
        </>
      )}
    </motion.div>
  );
};

export default Admin;
