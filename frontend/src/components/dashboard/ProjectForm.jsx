import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import ErrorMessage from '../ui/ErrorMessage';

const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(100, 'Name cannot exceed 100 characters'),
  description: z.string().max(500, 'Description cannot exceed 500 characters').optional().or(z.literal('')),
  status: z.enum(['active', 'completed', 'archived']),
});

const ProjectForm = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  project = null,
  isSubmitting = false,
  error = ''
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: project || {
      name: '',
      description: '',
      status: 'active',
    },
  });

  // Reset form when project changes
  React.useEffect(() => {
    if (project) {
      reset({
        name: project.name || '',
        description: project.description || '',
        status: project.status || 'active',
      });
    } else {
      reset({
        name: '',
        description: '',
        status: 'active',
      });
    }
  }, [project, reset, isOpen]);

  const handleFormSubmit = (data) => {
    onSubmit(data);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={project ? 'Edit Project' : 'Create New Project'}
      size="md"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {error && (
          <ErrorMessage message={error} variant="default" />
        )}

        <Input
          label="Project Name"
          type="text"
          placeholder="Enter project name"
          error={errors.name?.message}
          {...register('name')}
        />

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Description
          </label>
          <textarea
            rows={4}
            placeholder="Enter project description (optional)"
            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all duration-300 hover:bg-white/[0.07] hover:border-white/20 resize-none"
            {...register('description')}
          />
          {errors.description && (
            <p className="mt-1.5 text-sm text-red-400">{errors.description.message}</p>
          )}
        </div>

        <Select
          label="Status"
          error={errors.status?.message}
          {...register('status')}
        >
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="archived">Archived</option>
        </Select>

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
            {isSubmitting ? 'Saving...' : project ? 'Update Project' : 'Create Project'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ProjectForm;
