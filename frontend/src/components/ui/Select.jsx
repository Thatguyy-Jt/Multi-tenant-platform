import React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

const Select = ({ 
  label, 
  error, 
  className = '',
  children,
  ...props 
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-zinc-300 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          className={cn(
            "w-full px-4 py-3 pr-10 rounded-lg bg-white/5 border border-white/10",
            "text-white",
            "focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50",
            "transition-all duration-300",
            "hover:bg-white/[0.07] hover:border-white/20",
            "appearance-none cursor-pointer",
            "[&>option]:bg-[#0F0F11] [&>option]:text-white",
            error && "border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50",
            className
          )}
          style={{
            colorScheme: 'dark'
          }}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 pointer-events-none" />
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-red-400">{error}</p>
      )}
    </div>
  );
};

export default Select;
