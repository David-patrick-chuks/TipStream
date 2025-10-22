'use client';

import { Shield } from 'lucide-react';

interface PostHeaderProps {
  post: {
    id: string;
    creator: string;
    totalTips: number;
    tipCount: number;
    timestamp: string;
  };
  account?: string | null;
  hasActiveDelegation: boolean;
  formatTime: (timestamp: string) => string;
  formatEther: (value: number) => string;
}

export default function PostHeader({ 
  post, 
  account, 
  hasActiveDelegation, 
  formatTime, 
  formatEther 
}: PostHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gradient-to-r from-white/20 to-silver/20 rounded-xl backdrop-blur-sm border border-white/20 flex items-center justify-center text-white font-bold text-lg">
          {post.creator.slice(2, 4).toUpperCase()}
        </div>
        <div>
          <p className="text-white font-semibold text-lg">
            {post.creator}
            {account?.toLowerCase() === post.creator.toLowerCase() && (
              <span className="ml-3 text-silver/70 text-sm font-normal">(You)</span>
            )}
          </p>
          <p className="text-silver/70 text-sm">{formatTime(post.timestamp)}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-white font-bold text-xl">{formatEther(Number(post.totalTips))} ETH</p>
        <p className="text-silver/70 text-sm">{post.tipCount} tips</p>
        {hasActiveDelegation && (
          <div className="flex items-center gap-1 mt-1">
            <Shield className="w-3 h-3 text-green-400" />
            <span className="text-green-400 text-xs font-medium">Auto-tip Active</span>
          </div>
        )}
      </div>
    </div>
  );
}
