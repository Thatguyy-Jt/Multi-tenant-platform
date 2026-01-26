import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setError('');

    const result = await login(data.email, data.password);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }

    setIsSubmitting(false);
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to access your organization's secure admin platform."
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
            Sign in
          </h2>
          <p className="text-zinc-400">
            Don't have an account?{' '}
            <Link to="/signup" className="text-teal-400 hover:text-teal-300 transition-colors">
              Sign up
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
            label="Email"
            type="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register('email')}
          />

          <div>
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              showPasswordToggle={true}
              {...register('password')}
            />
            <Link
              to="/forgot-password"
              className="block mt-2 text-sm text-teal-400 hover:text-teal-300 transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </Button>
        </motion.form>
      </motion.div>
    </AuthLayout>
  );
};

export default Login;
