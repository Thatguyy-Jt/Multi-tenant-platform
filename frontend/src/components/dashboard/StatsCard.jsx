import React from 'react';
import { motion } from 'framer-motion';
import { fadeInUp } from '../../lib/animations';
import Card from '../ui/Card';
import { cn } from '../../lib/utils';

const StatsCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon,
  trend,
  className = '',
  delay = 0
}) => {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={fadeInUp}
      transition={{ delay }}
    >
      <Card className={cn("p-6", className)}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            {Icon && (
              <div className="w-2 h-2 rounded-full bg-teal-500"></div>
            )}
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
              {title}
            </p>
          </div>
          {Icon && (
            <div className="p-2 rounded-lg bg-teal-500/10">
              <Icon className="w-4 h-4 text-teal-400" />
            </div>
          )}
        </div>
        
        <div className="space-y-1">
          <div className="text-3xl font-semibold text-white">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </div>
          
          {subtitle && (
            <p className="text-sm text-zinc-400">{subtitle}</p>
          )}
          
          {trend && (
            <div className="flex items-center gap-1 text-xs text-emerald-400 mt-2">
              <span>{trend}</span>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

export default StatsCard;
