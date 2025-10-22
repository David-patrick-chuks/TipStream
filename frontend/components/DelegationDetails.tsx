'use client';

import { Shield } from 'lucide-react';

interface DelegationDetailsProps {
  delegations: Array<{
    postId: string;
    tipper: string;
    threshold: number;
    amount: string;
    active: boolean;
  }>;
  postEngagement: number;
}

export default function DelegationDetails({ delegations, postEngagement }: DelegationDetailsProps) {
  if (delegations.length === 0) return null;

  return (
    <div className="mt-4 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
      <h5 className="text-purple-200 font-medium mb-2 flex items-center gap-2">
        <Shield className="w-4 h-4" />
        Active Auto-Tip Delegations
      </h5>
      {delegations.map((delegation, index) => (
        <div key={index} className="text-purple-300 text-sm">
          <span className="font-medium">{delegation.amount} ETH</span> when engagement reaches{' '}
          <span className="font-medium">{delegation.threshold}</span>
          <span className="text-purple-400 ml-2">
            (Current: {postEngagement})
          </span>
        </div>
      ))}
    </div>
  );
}
