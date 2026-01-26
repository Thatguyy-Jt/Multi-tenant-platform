import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import ErrorMessage from '../ui/ErrorMessage';

const invitationSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'member']),
});

const InvitationForm = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  isSubmitting = false,
  error = ''
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(invitationSchema),
    defaultValues: {
      email: '',
      role: 'member',
    },
  });

  React.useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  const handleFormSubmit = (data) => {
    onSubmit(data);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Send Invitation"
      size="md"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {error && (
          <ErrorMessage message={error} variant="default" />
        )}

        <Input
          label="Email Address"
          type="email"
          placeholder="colleague@example.com"
          error={errors.email?.message}
          {...register('email')}
        />

        <Select
          label="Role"
          error={errors.role?.message}
          {...register('role')}
        >
          <option value="member">Member</option>
          <option value="admin">Admin</option>
        </Select>

        <div className="p-4 rounded-lg bg-teal-500/10 border border-teal-500/20">
          <p className="text-sm text-zinc-300">
            <strong className="text-white">Member:</strong> Can view and create projects and tasks
          </p>
          <p className="text-sm text-zinc-300 mt-2">
            <strong className="text-white">Admin:</strong> Can manage projects, tasks, and team members
          </p>
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
            {isSubmitting ? 'Sending...' : 'Send Invitation'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default InvitationForm;
