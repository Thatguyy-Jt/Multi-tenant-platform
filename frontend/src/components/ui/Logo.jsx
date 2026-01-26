import React from 'react';
import { Move } from 'lucide-react';

const Logo = () => {
  return (
    <div className="flex items-center gap-2 group cursor-pointer">
      <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 shadow-lg group-hover:shadow-teal-500/50 transition-all duration-500">
        <Move className="w-5 h-5 text-white" />
      </div>
      <span className="text-xl font-semibold tracking-tighter text-white">Motion</span>
    </div>
  );
};

export default Logo;
