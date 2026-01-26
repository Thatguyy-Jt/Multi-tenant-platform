import React from 'react';
import { motion } from 'framer-motion';
import { fadeIn, slideInRight } from '../lib/animations';
import Logo from '../components/ui/Logo';

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-black flex">
      {/* Left Side - Visual */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeIn}
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-teal-900/20 via-emerald-900/10 to-black"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-teal-600/20 rounded-full blur-[120px] animate-pulse"></div>
        
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <Logo />
          
          <div className="space-y-6">
            <motion.h1
              variants={slideInRight}
              className="text-4xl font-semibold tracking-tight text-white"
            >
              {title || 'Welcome to Motion'}
            </motion.h1>
            <motion.p
              variants={slideInRight}
              className="text-lg text-zinc-400 leading-relaxed"
            >
              {subtitle || 'Secure, multi-tenant infrastructure for modern organizations.'}
            </motion.p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-zinc-400">
              <div className="w-2 h-2 rounded-full bg-teal-500"></div>
              <span className="text-sm">Tenant Isolation</span>
            </div>
            <div className="flex items-center gap-3 text-zinc-400">
              <div className="w-2 h-2 rounded-full bg-teal-500"></div>
              <span className="text-sm">Role-Based Access Control</span>
            </div>
            <div className="flex items-center gap-3 text-zinc-400">
              <div className="w-2 h-2 rounded-full bg-teal-500"></div>
              <span className="text-sm">Secure Authentication</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
};

export default AuthLayout;
