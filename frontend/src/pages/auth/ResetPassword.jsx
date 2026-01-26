import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
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
import { CheckCircle } from 'lucide-react';

const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { resetPassword } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token');
    }
  }, [token]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data) => {
    if (!token) return;

    setIsSubmitting(true);
    setError('');

    const result = await resetPassword(token, data.password);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } else {
      setError(result.error);
    }

    setIsSubmitting(false);
  };

  return (
    <AuthLayout
      title="Reset password"
      subtitle="Enter your new password below."
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
          <h2 className="text-3xl font-semibold tracking-tight text-white mb-2">
            New password
          </h2>
          <p className="text-zinc-400">
            Remember your password?{' '}
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

        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 rounded-xl bg-teal-500/10 border border-teal-500/50 text-center"
          >
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-teal-500/20 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-teal-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Password reset successful</h3>
            <p className="text-zinc-400 text-sm">
              Redirecting to sign in...
            </p>
          </motion.div>
        ) : (
          <motion.form variants={fadeInUp} onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label="New Password"
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
              {isSubmitting ? 'Resetting...' : 'Reset password'}
            </Button>
          </motion.form>
        )}
      </motion.div>
    </AuthLayout>
  );
};

export default ResetPassword;
