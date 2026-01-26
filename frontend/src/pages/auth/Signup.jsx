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

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  organizationName: z.string().min(2, 'Organization name must be at least 2 characters'),
});

const Signup = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setError('');

    const result = await signup(
      data.email,
      data.password,
      data.organizationName
    );

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }

    setIsSubmitting(false);
  };

  return (
    <AuthLayout
      title="Get started"
      subtitle="Create your organization and start managing your multi-tenant infrastructure."
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
            Create account
          </h2>
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
            label="Email"
            type="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            showPasswordToggle={true}
            {...register('password')}
          />

          <Input
            label="Organization Name"
            type="text"
            placeholder="Acme Inc."
            error={errors.organizationName?.message}
            {...register('organizationName')}
          />

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating account...' : 'Create account'}
          </Button>
        </motion.form>
      </motion.div>
    </AuthLayout>
  );
};

export default Signup;
