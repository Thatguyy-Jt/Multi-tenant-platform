import React from 'react';
import { cn } from '../../lib/utils';

const Card = ({ 
  children, 
  className = '',
  hover = true,
  padding = true,
  ...props 
}) => {
  return (
    <div
      className={cn(
        "rounded-xl bg-white/5 border border-white/10",
        "backdrop-blur-sm shadow-lg",
        hover && "hover:bg-white/[0.07] hover:border-white/20",
        "transition-all duration-300",
        padding && "p-6",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
