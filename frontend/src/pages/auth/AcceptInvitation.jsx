import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '../../lib/animations';
import { useAuth } from '../../context/AuthContext';
import AuthLayout from '../../layouts/AuthLayout';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Logo from '../../components/ui/Logo';
import { UserPlus } from 'lucide-react';

const acceptInvitationSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

const AcceptInvitation = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  const { acceptInvitation } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing invitation token');
    }
    // Note: We'll fetch invitation details after accepting if needed
    // For now, the form will work with just the token
  }, [token]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(acceptInvitationSchema),
  });

  const onSubmit = async (data) => {
    if (!token) return;

    setIsSubmitting(true);
    setError('');

    const result = await acceptInvitation(token, data.password);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }

    setIsSubmitting(false);
  };

  return (
    <AuthLayout
      title="Accept invitation"
      subtitle="Create your password to accept the invitation."
    >
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="w-full"
      >
        {/* Mobile Logo */}
        <div className="lg:hidden mb-8">
          <Logo />
        </div>

        <motion.div variants={fadeInUp} className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-teal-500/20 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-teal-400" />
            </div>
            <h2 className="text-3xl font-semibold tracking-tight text-white">
              Join organization
            </h2>
          </div>
          <p className="text-zinc-400">
            Already have an account?{' '}
            <Link to="/login" className="text-teal-400 hover:text-teal-300 transition-colors">
              Sign in
            </Link>
          </p>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/50 text-red-400 text-sm"
          >
            {error}
          </motion.div>
        )}


        <motion.form variants={fadeInUp} onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            showPasswordToggle={true}
            {...register('password')}
          />

          <Input
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            error={errors.confirmPassword?.message}
            showPasswordToggle={true}
            {...register('confirmPassword')}
          />

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={isSubmitting || !token}
          >
            {isSubmitting ? 'Accepting...' : 'Accept invitation'}
          </Button>
        </motion.form>
      </motion.div>
    </AuthLayout>
  );
};

export default AcceptInvitation;
