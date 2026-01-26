import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '../../lib/animations';
import { Plus, Mail, X, Clock, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/axios';
import MemberCard from '../../components/dashboard/MemberCard';
import InvitationForm from '../../components/dashboard/InvitationForm';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorMessage from '../../components/ui/ErrorMessage';
import Badge from '../../components/ui/Badge';
import Card from '../../components/ui/Card';
import { cn } from '../../lib/utils';

const Team = () => {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cancelConfirm, setCancelConfirm] = useState(null);

  const isAdminOrOwner = user?.role === 'owner' || user?.role === 'admin';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');

    try {
      const [membersRes, invitationsRes] = await Promise.all([
        api.get('/organization/members'),
        isAdminOrOwner ? api.get('/invitations') : Promise.resolve({ data: { success: true, data: { invitations: [] } } }),
      ]);

      if (membersRes.data?.success) {
        setMembers(membersRes.data.data.members || []);
      }

      if (invitationsRes.data?.success) {
        setInvitations(invitationsRes.data.data.invitations || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load team data');
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvitation = async (data) => {
    setIsSubmitting(true);
    setError('');

    try {
      await api.post('/invitations', data);
      setIsFormOpen(false);
      fetchData(); // Refresh data
    } catch (err) {
      setError(err.message || 'Failed to send invitation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelInvitation = (invitation) => {
    setCancelConfirm(invitation);
  };

  const confirmCancel = async () => {
    if (!cancelConfirm) return;

    setIsSubmitting(true);
    setError('');

    try {
      await api.delete(`/invitations/${cancelConfirm.id}`);
      setCancelConfirm(null);
      fetchData(); // Refresh data
    } catch (err) {
      setError(err.message || 'Failed to cancel invitation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const isExpired = (expiresAt) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const pendingInvitations = invitations.filter(inv => inv.status === 'pending' && !isExpired(inv.expiresAt));
  const expiredInvitations = invitations.filter(inv => inv.status === 'pending' && isExpired(inv.expiresAt));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading team..." />
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
      <motion.div variants={fadeInUp} className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-white mb-2">
              Team Management
            </h1>
            <p className="text-zinc-400">
              Manage your organization's team members and invitations
            </p>
          </div>
          {isAdminOrOwner && (
            <Button variant="primary" onClick={() => setIsFormOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Invite Member
            </Button>
          )}
        </div>
      </motion.div>

      {error && !isFormOpen && (
        <motion.div variants={fadeInUp} className="mb-6">
          <ErrorMessage message={error} variant="banner" />
        </motion.div>
      )}

      {/* Stats */}
      <motion.div variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <div className="p-4">
            <p className="text-sm text-zinc-500 mb-1">Total Members</p>
            <p className="text-2xl font-semibold text-white">{members.length}</p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <p className="text-sm text-zinc-500 mb-1">Pending Invitations</p>
            <p className="text-2xl font-semibold text-white">{pendingInvitations.length}</p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <p className="text-sm text-zinc-500 mb-1">Your Role</p>
            <Badge variant={user?.role} size="md" className="mt-1">
              {user?.role}
            </Badge>
          </div>
        </Card>
      </motion.div>

      {/* Pending Invitations */}
      {isAdminOrOwner && pendingInvitations.length > 0 && (
        <motion.div variants={fadeInUp} className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Pending Invitations</h2>
          <div className="space-y-3">
            {pendingInvitations.map((invitation) => (
              <Card key={invitation.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="p-2 rounded-lg bg-teal-500/10">
                      <Mail className="w-5 h-5 text-teal-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{invitation.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={invitation.role} size="sm">
                          {invitation.role}
                        </Badge>
                        <span className="text-xs text-zinc-500">
                          Expires {formatDate(invitation.expiresAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    onClick={() => handleCancelInvitation(invitation)}
                    className="!py-2 !px-3 text-sm"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Cancel
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </motion.div>
      )}

      {/* Team Members */}
      <motion.div variants={fadeInUp}>
        <h2 className="text-xl font-semibold text-white mb-4">
          Team Members ({members.length})
        </h2>
        {members.length === 0 ? (
          <Card className="p-12 text-center">
            <UserPlus className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
            <p className="text-zinc-400 mb-4">No team members yet</p>
            {isAdminOrOwner && (
              <Button variant="primary" onClick={() => setIsFormOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Invite First Member
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {members.map((member, index) => (
              <MemberCard key={member.id} member={member} delay={index * 0.05} />
            ))}
          </div>
        )}
      </motion.div>

      {/* Invitation Form Modal */}
      <InvitationForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setError('');
        }}
        onSubmit={handleSendInvitation}
        isSubmitting={isSubmitting}
        error={error}
      />

      {/* Cancel Invitation Confirmation Modal */}
      <Modal
        isOpen={!!cancelConfirm}
        onClose={() => setCancelConfirm(null)}
        title="Cancel Invitation"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-zinc-300">
            Are you sure you want to cancel the invitation to <strong className="text-white">{cancelConfirm?.email}</strong>?
          </p>
          <div className="flex gap-3 justify-end pt-4 border-t border-white/10">
            <Button
              variant="secondary"
              onClick={() => setCancelConfirm(null)}
              disabled={isSubmitting}
            >
              Keep Invitation
            </Button>
            <Button
              variant="primary"
              onClick={confirmCancel}
              disabled={isSubmitting}
              className="bg-red-500/10 border-red-500/50 text-red-400 hover:bg-red-500/20 hover:border-red-400"
            >
              {isSubmitting ? 'Cancelling...' : 'Cancel Invitation'}
            </Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};

export default Team;
