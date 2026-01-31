import React from 'react';
import { motion } from 'framer-motion';
import { fadeInUp } from '../../lib/animations';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { FolderKanban, CheckSquare, Clock } from 'lucide-react';
import { cn } from '../../lib/utils';

const RecentActivity = ({ activities = [], className = '' }) => {
  const getStatusVariant = (status, type) => {
    if (type === 'task') {
      const taskMap = { todo: 'default', in_progress: 'info', review: 'warning', done: 'success' };
      return taskMap[status] || 'default';
    }
    const projectMap = {
      active: 'success',
      completed: 'info',
      pending: 'warning',
      archived: 'default',
    };
    return projectMap[status] || 'default';
  };

  const formatStatusLabel = (status, type) => {
    if (!status) return '';
    if (type === 'task') return status.replace('_', ' ');
    return status;
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
              <div className="p-2 rounded-lg bg-teal-500/10 shrink-0">
                {activity.type === 'task' ? (
                  <CheckSquare className="w-4 h-4 text-teal-400" />
                ) : (
                  <FolderKanban className="w-4 h-4 text-teal-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-xs text-zinc-500 uppercase tracking-wide">
                    {activity.type === 'task' ? 'Task' : 'Project'}
                  </span>
                  <span className="text-zinc-600">·</span>
                  <p className="text-sm font-medium text-white truncate">
                    {activity.name || (activity.type === 'task' ? 'Untitled Task' : 'Untitled Project')}
                  </p>
                  {activity.status && (
                    <Badge variant={getStatusVariant(activity.status, activity.type)} size="sm">
                      {formatStatusLabel(activity.status, activity.type)}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <Clock className="w-3 h-3" />
                  <span>{formatDate(activity.createdAt)}</span>
                  {activity.createdBy?.email && (
                    <>
                      <span>·</span>
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
