
'use client';

import { Award, Star, Shield, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/card';
interface Reputation {
  id: string;
  wallet_address: string;
  role: 'tenant' | 'landlord' | 'broker';
  count: number;
  metadata: any;
  created_at: string;
}

interface ReputationBadgeProps {
  reputation: Reputation;
  size?: 'sm' | 'md' | 'lg';
}

export default function ReputationBadge({ reputation, size = 'md' }: ReputationBadgeProps) {
  const icons = {
    tenant: <Star className="w-5 h-5" />,
    landlord: <Shield className="w-5 h-5" />,
    broker: <Award className="w-5 h-5" />
  };

  const colors = {
    tenant: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    landlord: 'text-green-400 bg-green-500/10 border-green-500/30',
    broker: 'text-[#d4af37] bg-[#d4af37]/10 border-[#d4af37]/30'
  };

  const labels = {
    tenant: 'Verified Rental',
    landlord: 'Verified Listing',
    broker: 'Verified Deal'
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-2',
    lg: 'text-base px-4 py-3'
  };

  const date = new Date(reputation.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <Card className={`bg-[#1a1a1a] border-[#2d2d2d] ${sizeClasses[size]} flex items-center gap-4`}>
      <div className={`p-3 rounded-lg ${colors[reputation.role]} flex items-center justify-center`}>
        {icons[reputation.role]}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-bold text-white capitalize">
            {labels[reputation.role]}
          </span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${colors[reputation.role]}`}>
            x{reputation.count}
          </span>
        </div>
        <div className="flex items-center gap-2 text-gray-400">
          <Calendar className="w-3 h-3" />
          <span className="text-xs">Earned {date}</span>
        </div>
      </div>
      
      {reputation.metadata?.transaction && (
        <span className="text-xs text-gray-500 hidden md:block">
          {reputation.metadata.transaction}
        </span>
      )}
    </Card>
  );
}