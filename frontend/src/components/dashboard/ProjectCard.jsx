import React from 'react';
import { motion } from 'framer-motion';
import { fadeInUp } from '../../lib/animations';
import { FolderKanban, MoreVertical, Edit2, Trash2, Calendar } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { cn } from '../../lib/utils';

const ProjectCard = ({ 
  project, 
  onEdit, 
  onDelete, 
  canEdit = false,
  canDelete = false,
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
      active: 'success',
      completed: 'info',
      archived: 'default',
    };
    return statusMap[status] || 'default';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={fadeInUp}
      transition={{ delay }}
    >
      <Card className="p-6 hover:border-teal-500/30 transition-all duration-300">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="p-2 rounded-lg bg-teal-500/10 flex-shrink-0">
              <FolderKanban className="w-5 h-5 text-teal-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-white mb-1 truncate">
                {project.name}
              </h3>
              {project.description && (
                <p className="text-sm text-zinc-400 line-clamp-2 mb-2">
                  {project.description}
                </p>
              )}
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant={getStatusVariant(project.status)} size="sm">
                  {project.status}
                </Badge>
                {project.createdBy?.email && (
                  <span className="text-xs text-zinc-500">
                    by {project.createdBy.email}
                  </span>
                )}
              </div>
            </div>
          </div>

          {(canEdit || canDelete) && (
            <div className="relative flex-shrink-0" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Project options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-8 w-40 rounded-lg bg-[#0F0F11] border border-white/10 shadow-xl overflow-hidden z-10">
                  {canEdit && (
                    <button
                      onClick={() => {
                        onEdit(project);
                        setMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={() => {
                        onDelete(project);
                        setMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 text-xs text-zinc-500 pt-4 border-t border-white/5">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3 h-3" />
            <span>Created {formatDate(project.createdAt)}</span>
          </div>
          {project.updatedAt !== project.createdAt && (
            <div className="flex items-center gap-1.5">
              <span>Updated {formatDate(project.updatedAt)}</span>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

export default ProjectCard;
