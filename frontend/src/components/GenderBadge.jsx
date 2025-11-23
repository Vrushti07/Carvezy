import React from 'react';
import { Shield, ShieldAlert, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function GenderBadge({ preference, size = 'default' }) {
  const configs = {
    'Female Only': {
      icon: ShieldAlert,
      bg: 'bg-pink-100 border-pink-500',
      text: 'text-pink-700',
      label: 'Female Only'
    },
    'Female Preferred': {
      icon: Shield,
      bg: 'bg-purple-100 border-purple-500',
      text: 'text-purple-700',
      label: 'Female Preferred'
    },
    'Anyone': {
      icon: Users,
      bg: 'bg-gray-100 border-gray-500',
      text: 'text-gray-700',
      label: 'Anyone'
    }
  };

  const config = configs[preference] || configs['Anyone'];
  const Icon = config.icon;
  
  // Define size classes based on the size prop
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';

  return (
    // CORRECTION APPLIED HERE: Using template literals within the JSX {} block
    <Badge 
      variant="outline" 
      className={`${config.bg} ${config.text} border-2 ${sizeClasses} font-semibold flex items-center gap-1`}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
      {config.label}
    </Badge>
  );
}