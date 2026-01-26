import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { fadeInUp } from '../../lib/animations';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/axios';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorMessage from '../../components/ui/ErrorMessage';
import { Building2, Copy, Check } from 'lucide-react';
import { cn } from '../../lib/utils';

const Organization = () => {
  const { user } = useAuth();
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '' });
  const [copied, setCopied] = useState(false);

  const isAdminOrOwner = user?.role === 'owner' || user?.role === 'admin';

  useEffect(() => {
    fetchOrganization();
  }, []);

  const fetchOrganization = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get('/organization');
      if (response.data?.success) {
        const org = response.data.data.organization;
        setOrganization(org);
        setFormData({ name: org.name || '' });
      }
    } catch (err) {
      setError(err.message || 'Failed to load organization');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({ name: organization?.name || '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await api.put('/organization', formData);
      if (response.data?.success) {
        setOrganization(response.data.data.organization);
        setIsEditing(false);
      }
    } catch (err) {
      setError(err.message || 'Failed to update organization');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading organization..." />
      </div>
    );
  }

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={fadeInUp}
      className="max-w-4xl"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-white mb-2">
          Organization Settings
        </h1>
        <p className="text-zinc-400">
          Manage your organization's details and settings
        </p>
      </div>

      {error && (
        <div className="mb-6">
          <ErrorMessage message={error} variant="banner" />
        </div>
      )}

      {organization && (
        <div className="space-y-6">
          {/* Organization Details Card */}
          <Card>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-lg bg-teal-500/10">
                <Building2 className="w-6 h-6 text-teal-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Organization Details</h2>
                <p className="text-sm text-zinc-400">View and edit your organization information</p>
              </div>
            </div>

            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                  label="Organization Name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter organization name"
                  required
                />

                <div className="flex gap-3 justify-end pt-4 border-t border-white/10">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleCancel}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-zinc-500 mb-2">
                    Organization Name
                  </label>
                  <p className="text-lg font-medium text-white">{organization.name}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-500 mb-2">
                    Tenant ID
                  </label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-zinc-300 font-mono">
                      {organization.tenantId}
                    </code>
                    <button
                      onClick={() => copyToClipboard(organization.tenantId)}
                      className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                      aria-label="Copy tenant ID"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-teal-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-zinc-500">
                    Unique identifier for your organization
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-500 mb-2">
                    Subscription Plan
                  </label>
                  <Badge variant="info" size="md">
                    {organization.subscriptionPlan || 'Free'}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                  <div>
                    <label className="block text-sm font-medium text-zinc-500 mb-1">
                      Created
                    </label>
                    <p className="text-sm text-zinc-300">{formatDate(organization.createdAt)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-500 mb-1">
                      Last Updated
                    </label>
                    <p className="text-sm text-zinc-300">{formatDate(organization.updatedAt)}</p>
                  </div>
                </div>

                {isAdminOrOwner && (
                  <div className="pt-4 border-t border-white/10">
                    <Button variant="primary" onClick={handleEdit}>
                      Edit Organization
                    </Button>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      )}
    </motion.div>
  );
};

export default Organization;
