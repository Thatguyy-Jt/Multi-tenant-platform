import React from 'react';
import { cn } from '../../lib/utils';

const LoadingSpinner = ({ 
  size = 'md', // sm, md, lg
  className = '',
  text = 'Loading...'
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
      <div
        className={cn(
          "border-teal-500 border-t-transparent rounded-full animate-spin",
          sizeClasses[size]
        )}
        role="status"
        aria-label="Loading"
      >
        <span className="sr-only">{text}</span>
      </div>
      {text && (
        <p className="text-sm text-zinc-400">{text}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;
