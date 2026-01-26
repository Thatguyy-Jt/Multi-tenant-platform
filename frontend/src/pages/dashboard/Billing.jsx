import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '../../lib/animations';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/axios';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorMessage from '../../components/ui/ErrorMessage';
import Modal from '../../components/ui/Modal';
import { CreditCard, Check, ExternalLink, TrendingUp, Users, FolderKanban, HardDrive } from 'lucide-react';
import { cn } from '../../lib/utils';

const Billing = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [plans, setPlans] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [upgradeConfirm, setUpgradeConfirm] = useState(null);

  const isOwner = user?.role === 'owner';
  const isAdminOrOwner = user?.role === 'owner' || user?.role === 'admin';

  useEffect(() => {
    if (isAdminOrOwner) {
      fetchSubscription();
    }
  }, [isAdminOrOwner]);

  const fetchSubscription = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get('/billing/current');
      if (response.data?.success) {
        setSubscription(response.data.data.subscription);
        setPlans(response.data.data.plans);
      }
    } catch (err) {
      setError(err.message || 'Failed to load subscription');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (plan) => {
    if (!isOwner) {
      setError('Only organization owners can manage subscriptions');
      return;
    }

    setUpgradeConfirm(plan);
  };

  const confirmUpgrade = async () => {
    if (!upgradeConfirm) return;

    setIsSubmitting(true);
    setError('');

    try {
      const response = await api.post('/billing/subscribe', {
        plan: upgradeConfirm,
      });

      if (response.data?.success && response.data.data.url) {
        // Redirect to Stripe checkout
        window.location.href = response.data.data.url;
      }
    } catch (err) {
      setError(err.message || 'Failed to create checkout session');
      setIsSubmitting(false);
    }
  };

  const handleBillingPortal = async () => {
    setIsSubmitting(true);
    setError('');

    try {
      const response = await api.get('/billing/portal');
      if (response.data?.success && response.data.data.url) {
        window.location.href = response.data.data.url;
      }
    } catch (err) {
      setError(err.message || 'Failed to access billing portal');
      setIsSubmitting(false);
    }
  };

  const formatStorage = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} GB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} TB`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!isAdminOrOwner) {
    return (
      <div className="max-w-7xl">
        <ErrorMessage 
          message="You don't have permission to view billing information. Only Admin and Owner roles can access this page." 
          variant="banner" 
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading billing information..." />
      </div>
    );
  }

  const currentPlan = subscription?.plan || 'free';
  const planData = plans?.[currentPlan] || { name: 'Free', limits: {} };

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="max-w-7xl"
    >
      {/* Header */}
      <motion.div variants={fadeInUp} className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-white mb-2">
          Billing & Subscription
        </h1>
        <p className="text-zinc-400">
          Manage your organization's subscription and billing
        </p>
      </motion.div>

      {error && (
        <motion.div variants={fadeInUp} className="mb-6">
          <ErrorMessage message={error} variant="banner" />
        </motion.div>
      )}

      {/* Current Subscription */}
      {subscription && (
        <motion.div variants={fadeInUp} className="mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-teal-500/10">
                  <CreditCard className="w-6 h-6 text-teal-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Current Plan</h2>
                  <p className="text-sm text-zinc-400">Your active subscription</p>
                </div>
              </div>
              <Badge variant="info" size="lg">
                {subscription.plan}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-zinc-500" />
                  <p className="text-xs text-zinc-500 uppercase">Max Users</p>
                </div>
                <p className="text-2xl font-semibold text-white">
                  {planData.limits?.maxUsers || 'Unlimited'}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <FolderKanban className="w-4 h-4 text-zinc-500" />
                  <p className="text-xs text-zinc-500 uppercase">Max Projects</p>
                </div>
                <p className="text-2xl font-semibold text-white">
                  {planData.limits?.maxProjects || 'Unlimited'}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <HardDrive className="w-4 h-4 text-zinc-500" />
                  <p className="text-xs text-zinc-500 uppercase">Storage</p>
                </div>
                <p className="text-2xl font-semibold text-white">
                  {formatStorage(planData.limits?.maxStorage || 0)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/10">
              <div>
                <p className="text-sm text-zinc-500 mb-1">Status</p>
                <Badge 
                  variant={subscription.status === 'active' ? 'success' : 'warning'} 
                  size="sm"
                >
                  {subscription.status}
                </Badge>
              </div>
              {subscription.currentPeriodEnd && (
                <div>
                  <p className="text-sm text-zinc-500 mb-1">Next Billing Date</p>
                  <p className="text-sm font-medium text-white">
                    {formatDate(subscription.currentPeriodEnd)}
                  </p>
                </div>
              )}
            </div>

            {isOwner && subscription.stripeCustomerId && (
              <div className="pt-6 border-t border-white/10">
                <Button
                  variant="secondary"
                  onClick={handleBillingPortal}
                  disabled={isSubmitting}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  {isSubmitting ? 'Opening...' : 'Manage Billing Portal'}
                </Button>
              </div>
            )}
          </Card>
        </motion.div>
      )}

      {/* Available Plans */}
      <motion.div variants={fadeInUp}>
        <h2 className="text-2xl font-semibold text-white mb-6">Available Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans && Object.entries(plans).map(([planKey, plan]) => {
            const isCurrentPlan = currentPlan === planKey;
            const isFree = planKey === 'free';

            return (
              <Card
                key={planKey}
                className={cn(
                  "p-6 relative",
                  isCurrentPlan && "ring-2 ring-teal-500/50"
                )}
              >
                {isCurrentPlan && (
                  <div className="absolute top-4 right-4">
                    <Badge variant="success" size="sm">Current</Badge>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-2xl font-semibold text-white mb-2">
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-white">
                      {isFree ? '$0' : '$29'}
                    </span>
                    {!isFree && (
                      <span className="text-zinc-500">/month</span>
                    )}
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-zinc-300">
                      Up to {plan.limits?.maxUsers || 'Unlimited'} users
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-zinc-300">
                      {plan.limits?.maxProjects || 'Unlimited'} projects
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-zinc-300">
                      {formatStorage(plan.limits?.maxStorage || 0)} storage
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-zinc-300">
                      Priority support
                    </span>
                  </li>
                </ul>

                {isOwner && (
                  <Button
                    variant={isCurrentPlan ? 'secondary' : 'primary'}
                    className="w-full"
                    onClick={() => !isCurrentPlan && !isFree && handleUpgrade(planKey)}
                    disabled={isCurrentPlan || isFree}
                  >
                    {isCurrentPlan
                      ? 'Current Plan'
                      : isFree
                      ? 'Free Plan'
                      : 'Upgrade to Pro'}
                  </Button>
                )}
              </Card>
            );
          })}
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-zinc-500">
            Pricing shown for demonstration purposes. Actual pricing may vary.
          </p>
        </div>
      </motion.div>

      {/* Upgrade Confirmation Modal */}
      <Modal
        isOpen={!!upgradeConfirm}
        onClose={() => setUpgradeConfirm(null)}
        title="Upgrade Subscription"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-zinc-300">
            You're about to upgrade to the <strong className="text-white">{plans?.[upgradeConfirm]?.name}</strong> plan.
            You'll be redirected to Stripe Checkout to complete your payment.
          </p>
          <div className="flex gap-3 justify-end pt-4 border-t border-white/10">
            <Button
              variant="secondary"
              onClick={() => setUpgradeConfirm(null)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={confirmUpgrade}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : 'Continue to Checkout'}
            </Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};

export default Billing;
