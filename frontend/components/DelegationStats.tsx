'use client';

import { Shield } from 'lucide-react';

interface DelegationStatsProps {
  delegationStats: {
    totalDelegations: number;
    activeDelegations: number;
    totalAutoTipAmount: string;
  };
  formatEther: (value: number) => string;
}

export default function DelegationStats({ delegationStats, formatEther }: DelegationStatsProps) {
  if (delegationStats.activeDelegations === 0) return null;

  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
      <div className="flex items-center gap-3 text-white">
        <div className="w-8 h-8 bg-gradient-to-r from-white/20 to-silver/20 rounded-lg backdrop-blur-sm border border-white/20 flex items-center justify-center">
          <Shield className="w-4 h-4" />
        </div>
        <div>
          <p className="font-semibold">{delegationStats.activeDelegations} Active Delegations</p>
          <p className="text-silver/70 text-sm">{formatEther(parseFloat(delegationStats.totalAutoTipAmount))} ETH Total</p>
        </div>
      </div>
    </div>
  );
}
