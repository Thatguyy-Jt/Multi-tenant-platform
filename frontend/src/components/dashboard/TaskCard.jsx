import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { fadeInUp } from '../../lib/animations';
import { CheckSquare, MoreVertical, Edit2, Trash2, Calendar, User, FolderKanban, AlertCircle, CheckCircle2 } from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { cn } from '../../lib/utils';

const TaskCard = ({ 
  task, 
  onEdit, 
  onDelete, 
  onMarkAsDone,
  canDelete = false,
  canMarkAsDone = false,
  delay = 0 
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getStatusVariant = (status) => {
    const statusMap = {
      todo: 'default',
      in_progress: 'info',
      review: 'warning',
      done: 'success',
    };
    return statusMap[status] || 'default';
  };

  const getPriorityColor = (priority) => {
    const priorityMap = {
      low: 'text-zinc-400',
      medium: 'text-blue-400',
      high: 'text-yellow-400',
      urgent: 'text-red-400',
    };
    return priorityMap[priority] || 'text-zinc-400';
  };

  const getPriorityIcon = (priority) => {
    if (priority === 'urgent' || priority === 'high') {
      return <AlertCircle className="w-3 h-3" />;
    }
    return null;
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((date - now) / (1000 * 60 * 60 * 24));
    
    if (diffInDays < 0) return { text: 'Overdue', isOverdue: true };
    if (diffInDays === 0) return { text: 'Due today', isOverdue: false };
    if (diffInDays === 1) return { text: 'Due tomorrow', isOverdue: false };
    if (diffInDays <= 7) return { text: `Due in ${diffInDays} days`, isOverdue: false };
    return { text: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), isOverdue: false };
  };

  const dueDateInfo = formatDate(task.dueDate);

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={fadeInUp}
      transition={{ delay }}
    >
      <Card className={cn(
        "p-5 hover:border-teal-500/30 transition-all duration-300",
        task.status === 'done' && "opacity-75"
      )}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className={cn(
              "p-2 rounded-lg shrink-0",
              task.status === 'done' ? "bg-emerald-500/10" : "bg-teal-500/10"
            )}>
              <CheckSquare className={cn(
                "w-5 h-5",
                task.status === 'done' ? "text-emerald-400" : "text-teal-400"
              )} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={cn(
                "text-base font-semibold mb-1",
                task.status === 'done' ? "text-zinc-400 line-through" : "text-white"
              )}>
                {task.title}
              </h3>
              {task.description && (
                <p className="text-sm text-zinc-400 line-clamp-2 mb-2">
                  {task.description}
                </p>
              )}
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant={getStatusVariant(task.status)} size="sm">
                  {task.status.replace('_', ' ')}
                </Badge>
                <span className={cn("text-xs flex items-center gap-1", getPriorityColor(task.priority))}>
                  {getPriorityIcon(task.priority)}
                  {task.priority}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Mark as Done button - only for admin/owner when task is not done */}
            {canMarkAsDone && task.status !== 'done' && (
              <button
                onClick={() => onMarkAsDone && onMarkAsDone(task)}
                className="p-1.5 rounded-lg text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-colors"
                aria-label="Mark as done"
                title="Mark as done"
              >
                <CheckCircle2 className="w-4 h-4" />
              </button>
            )}
            
            {canDelete && (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Task options"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 top-8 w-40 rounded-lg bg-[#0F0F11] border border-white/10 shadow-xl overflow-hidden z-10">
                    <button
                      onClick={() => {
                        onEdit(task);
                        setMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        onDelete(task);
                        setMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2 pt-3 border-t border-white/5">
          {task.projectId?.name && (
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <FolderKanban className="w-3 h-3" />
              <span className="truncate">{task.projectId.name}</span>
            </div>
          )}
          {task.assigneeId?.email && (
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <User className="w-3 h-3" />
              <span className="truncate">{task.assigneeId.email}</span>
            </div>
          )}
          {dueDateInfo && (
            <div className={cn(
              "flex items-center gap-2 text-xs",
              // When task is done, don't show overdue styling — show neutral
              task.status === 'done' ? "text-zinc-500" : dueDateInfo.isOverdue ? "text-red-400" : "text-zinc-500"
            )}>
              <Calendar className="w-3 h-3" />
              <span>
                {task.status === 'done' && dueDateInfo.isOverdue
                  ? (task.dueDate ? `Due ${new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : dueDateInfo.text)
                  : dueDateInfo.text}
              </span>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

export default TaskCard;
