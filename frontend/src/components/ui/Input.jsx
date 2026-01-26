import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '../../lib/utils';

const Input = ({ 
  label, 
  type = 'text', 
  error, 
  className = '', 
  showPasswordToggle = false,
  ...props 
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-zinc-300 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type={inputType}
          className={cn(
            "w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10",
            "text-white placeholder:text-zinc-500",
            "focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50",
            "transition-all duration-300",
            "hover:bg-white/[0.07] hover:border-white/20",
            error && "border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50",
            isPassword && showPasswordToggle && "pr-12",
            className
          )}
          {...props}
        />
        {isPassword && showPasswordToggle && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-300 transition-colors focus:outline-none"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        )}
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-red-400">{error}</p>
      )}
    </div>
  );
};

export default Input;
