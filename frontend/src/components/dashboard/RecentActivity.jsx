import React from 'react';
import { motion } from 'framer-motion';
import { fadeInUp } from '../../lib/animations';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { FolderKanban, Clock } from 'lucide-react';
import { cn } from '../../lib/utils';

const RecentActivity = ({ activities = [], className = '' }) => {
  const getStatusVariant = (status) => {
    const statusMap = {
      active: 'success',
      completed: 'info',
      pending: 'warning',
      archived: 'default',
    };
    return statusMap[status] || 'default';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  return (
    <Card className={cn("p-6", className)}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white mb-1">Recent Activity</h3>
        <p className="text-sm text-zinc-400">Latest projects and updates</p>
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-8">
          <FolderKanban className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <p className="text-sm text-zinc-500">No recent activity</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((activity, index) => (
            <motion.div
              key={activity.id || index}
              initial="initial"
              animate="animate"
              variants={fadeInUp}
              transition={{ delay: index * 0.1 }}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors"
            >
              <div className="p-2 rounded-lg bg-teal-500/10 flex-shrink-0">
                <FolderKanban className="w-4 h-4 text-teal-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium text-white truncate">
                    {activity.name || 'Untitled Project'}
                  </p>
                  {activity.status && (
                    <Badge variant={getStatusVariant(activity.status)} size="sm">
                      {activity.status}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <Clock className="w-3 h-3" />
                  <span>{formatDate(activity.createdAt)}</span>
                  {activity.createdBy?.email && (
                    <>
                      <span>•</span>
                      <span>by {activity.createdBy.email}</span>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default RecentActivity;
