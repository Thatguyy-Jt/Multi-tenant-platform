import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import ErrorMessage from '../ui/ErrorMessage';
import LoadingSpinner from '../ui/LoadingSpinner';
import api from '../../lib/axios';

const taskSchema = z.object({
  title: z.string().min(1, 'Task title is required').max(100, 'Title cannot exceed 100 characters'),
  description: z.string().max(1000, 'Description cannot exceed 1000 characters').optional().or(z.literal('')),
  status: z.enum(['todo', 'in_progress', 'review', 'done']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  projectId: z.string().min(1, 'Project is required'),
  assigneeId: z.string().optional().or(z.literal('')),
  dueDate: z.string().optional().or(z.literal('')),
});

const TaskForm = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  task = null,
  isSubmitting = false,
  error = '',
  currentUserId = null
}) => {
  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(taskSchema),
    defaultValues: task || {
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      projectId: '',
      assigneeId: currentUserId || '',
      dueDate: '',
    },
  });

  // Fetch projects and members when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchProjects();
      fetchMembers();
    }
  }, [isOpen]);

  // Reset form when task changes
  useEffect(() => {
    if (task) {
      reset({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'todo',
        priority: task.priority || 'medium',
        projectId: task.projectId?._id || task.projectId || '',
        assigneeId: task.assigneeId?._id || task.assigneeId || currentUserId || '',
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      });
    } else {
      reset({
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        projectId: '',
        assigneeId: currentUserId || '',
        dueDate: '',
      });
    }
  }, [task, reset, currentUserId, isOpen]);

  const fetchProjects = async () => {
    setLoadingProjects(true);
    try {
      const response = await api.get('/projects');
      if (response.data?.success) {
        setProjects(response.data.data.projects || []);
      }
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    } finally {
      setLoadingProjects(false);
    }
  };

  const fetchMembers = async () => {
    setLoadingMembers(true);
    try {
      const response = await api.get('/organization/members');
      if (response.data?.success) {
        setMembers(response.data.data.members || []);
      }
    } catch (err) {
      console.error('Failed to fetch members:', err);
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleFormSubmit = (data) => {
    // Convert empty string to undefined for optional fields
    const submitData = {
      ...data,
      assigneeId: data.assigneeId || undefined,
      dueDate: data.dueDate || undefined,
    };
    onSubmit(submitData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={task ? 'Edit Task' : 'Create New Task'}
      size="md"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {error && (
          <ErrorMessage message={error} variant="default" />
        )}

        <Input
          label="Task Title"
          type="text"
          placeholder="Enter task title"
          error={errors.title?.message}
          {...register('title')}
        />

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Description
          </label>
          <textarea
            rows={4}
            placeholder="Enter task description (optional)"
            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all duration-300 hover:bg-white/[0.07] hover:border-white/20 resize-none"
            {...register('description')}
          />
          {errors.description && (
            <p className="mt-1.5 text-sm text-red-400">{errors.description.message}</p>
          )}
        </div>

        {loadingProjects ? (
          <div className="py-4">
            <LoadingSpinner size="sm" text="Loading projects..." />
          </div>
        ) : (
          <Select
            label="Project"
            error={errors.projectId?.message}
            {...register('projectId')}
          >
            <option value="">Select a project</option>
            {projects.map((project) => (
              <option key={project._id} value={project._id}>
                {project.name}
              </option>
            ))}
          </Select>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Status"
            error={errors.status?.message}
            {...register('status')}
          >
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="review">Review</option>
            <option value="done">Done</option>
          </Select>

          <Select
            label="Priority"
            error={errors.priority?.message}
            {...register('priority')}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Due Date"
            type="date"
            error={errors.dueDate?.message}
            {...register('dueDate')}
          />

          {loadingMembers ? (
            <div className="py-4">
              <LoadingSpinner size="sm" text="Loading members..." />
            </div>
          ) : (
            <Select
              label="Assignee (Optional)"
              error={errors.assigneeId?.message}
              {...register('assigneeId')}
            >
              <option value="">Unassigned</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.email} {member.role === 'owner' ? '(Owner)' : member.role === 'admin' ? '(Admin)' : ''}
                </option>
              ))}
            </Select>
          )}
        </div>

        <div className="flex gap-3 justify-end pt-4 border-t border-white/10">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default TaskForm;
