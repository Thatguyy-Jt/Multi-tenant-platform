import React from 'react';
import { cn } from '../../lib/utils';

const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const base = "px-6 py-3 rounded-full text-base font-medium transition-all duration-300 border backdrop-blur-sm";
  const variants = {
    primary: "bg-teal-500/10 border-teal-500/50 text-teal-300 hover:bg-teal-500/20 hover:border-teal-400 shadow-[0_0_20px_rgba(20,184,166,0.15)]",
    secondary: "bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10 hover:border-white/20 hover:text-white"
  };
  return (
    <button className={cn(base, variants[variant], className)} {...props}>
      {children}
    </button>
  );
};

export default Button;
