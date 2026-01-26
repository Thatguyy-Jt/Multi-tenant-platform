import React from 'react';
import { motion } from 'framer-motion';
import { fadeInUp } from '../../lib/animations';
import { User, Calendar } from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { cn } from '../../lib/utils';

const MemberCard = ({ 
  member, 
  delay = 0 
}) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={fadeInUp}
      transition={{ delay }}
    >
      <Card className="p-5 hover:border-teal-500/30 transition-all duration-300">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white text-lg font-semibold flex-shrink-0">
            {member.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-base font-semibold text-white truncate">
                {member.email}
              </h3>
              <Badge variant={member.role} size="sm">
                {member.role}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-xs text-zinc-500">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3 h-3" />
                <span>Joined {formatDate(member.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default MemberCard;
