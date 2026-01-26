import React from 'react';
import { AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeIn } from '../../lib/animations';
import { cn } from '../../lib/utils';

const ErrorMessage = ({ 
  message, 
  className = '',
  variant = 'default' // default, inline, banner
}) => {
  if (!message) return null;

  const variants = {
    default: "p-4 rounded-lg bg-red-500/10 border border-red-500/50 text-red-400",
    inline: "text-sm text-red-400",
    banner: "p-4 rounded-lg bg-red-500/10 border-l-4 border-red-500 text-red-400",
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={fadeIn}
      className={cn(variants[variant], className)}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <p className="text-sm leading-relaxed">{message}</p>
      </div>
    </motion.div>
  );
};

export default ErrorMessage;
