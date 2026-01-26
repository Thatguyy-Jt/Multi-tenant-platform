import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
import { Mail } from 'lucide-react';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const ForgotPassword = () => {
  const { forgotPassword } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setError('');
    setSuccess(false);

    const result = await forgotPassword(data.email);

    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.error);
    }

    setIsSubmitting(false);
  };

  return (
    <AuthLayout
      title="Reset password"
      subtitle="Enter your email address and we'll send you a link to reset your password."
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
            Forgot password?
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
              <Mail className="w-6 h-6 text-teal-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Check your email</h3>
            <p className="text-zinc-400 text-sm mb-6">
              We've sent a password reset link to your email address. Please check your inbox and follow the instructions.
            </p>
            <Link to="/login">
              <Button variant="secondary" className="w-full">
                Back to sign in
              </Button>
            </Link>
          </motion.div>
        ) : (
          <motion.form variants={fadeInUp} onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending...' : 'Send reset link'}
            </Button>
          </motion.form>
        )}
      </motion.div>
    </AuthLayout>
  );
};

export default ForgotPassword;
