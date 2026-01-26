import React from 'react';
import { cn } from '../../lib/utils';

const Badge = ({ 
  children, 
  variant = 'default', // default, success, warning, error, info, role
  className = '',
  size = 'md' // sm, md, lg
}) => {
  const baseClasses = "inline-flex items-center font-medium rounded-full";
  
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1.5",
  };

  const variantClasses = {
    default: "bg-white/10 text-zinc-300 border border-white/10",
    success: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/50",
    warning: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/50",
    error: "bg-red-500/20 text-red-400 border border-red-500/50",
    info: "bg-teal-500/20 text-teal-400 border border-teal-500/50",
    // Role-specific variants
    owner: "bg-purple-500/20 text-purple-400 border border-purple-500/50",
    admin: "bg-blue-500/20 text-blue-400 border border-blue-500/50",
    member: "bg-zinc-500/20 text-zinc-400 border border-zinc-500/50",
    'super_admin': "bg-rose-500/20 text-rose-400 border border-rose-500/50",
  };

  return (
    <span
      className={cn(
        baseClasses,
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
};

export default Badge;
