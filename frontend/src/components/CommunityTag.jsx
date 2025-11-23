import React from 'react';
import { Building2, GraduationCap, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function CommunityTag({ community, size = 'default' }) {
  const getIcon = () => {
    // Return the correct Lucide icon based on keywords in the community string
    if (community?.toLowerCase().includes('college') || community?.toLowerCase().includes('university')) {
      return GraduationCap;
    }
    if (community?.toLowerCase().includes('workplace') || community?.toLowerCase().includes('office')) {
      return Building2;
    }
    // Default icon if no keywords match (e.g., city name, neighborhood)
    return MapPin;
  };

  const Icon = getIcon();
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';

  return (
    // CORRECTION APPLIED HERE: The `className` string must be wrapped in ${} 
    // inside the curly braces {} of the JSX attribute.
    <Badge 
      variant="secondary" 
      className={`bg-yellow-100 text-black border border-yellow-400 ${sizeClasses} font-medium flex items-center gap-1`}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
      {community}
    </Badge>
  );
}