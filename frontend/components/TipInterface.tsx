'use client';

import { Send, Zap } from 'lucide-react';

interface TipInterfaceProps {
  post: {
    id: string;
  };
  tipAmount: string;
  setTipAmount: (amount: string) => void;
  autoTipThreshold: string;
  setAutoTipThreshold: (threshold: string) => void;
  autoTipAmount: string;
  setAutoTipAmount: (amount: string) => void;
  loading: string | null;
  onTip: (postId: string) => void;
  onAutoTip: (postId: string) => void;
}

export default function TipInterface({
  post,
  tipAmount,
  setTipAmount,
  autoTipThreshold,
  setAutoTipThreshold,
  autoTipAmount,
  setAutoTipAmount,
  loading,
  onTip,
  onAutoTip
}: TipInterfaceProps) {
  return (
    <div className="border-t border-white/20 pt-6 mt-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Manual Tip */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl p-6">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Send className="w-5 h-5" />
            Send Tip
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-silver/70 mb-2">Amount (ETH)</label>
              <input
                type="number"
                step="0.001"
                value={tipAmount}
                onChange={(e) => setTipAmount(e.target.value)}
                placeholder="0.001"
                className="w-full bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-silver/50 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-all duration-300"
              />
            </div>
            <button
              onClick={() => onTip(post.id)}
              disabled={!tipAmount || loading === post.id}
              className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading === post.id ? 'Sending...' : 'Send Tip'}
            </button>
          </div>
        </div>

        {/* Auto Tip */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl p-6">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Auto-Tip Setup
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-silver/70 mb-2">Engagement Threshold</label>
              <input
                type="number"
                value={autoTipThreshold}
                onChange={(e) => setAutoTipThreshold(e.target.value)}
                placeholder="10"
                className="w-full bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-silver/50 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-all duration-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-silver/70 mb-2">Tip Amount (ETH)</label>
              <input
                type="number"
                step="0.001"
                value={autoTipAmount}
                onChange={(e) => setAutoTipAmount(e.target.value)}
                placeholder="0.005"
                className="w-full bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-silver/50 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-all duration-300"
              />
            </div>
            <button
              onClick={() => onAutoTip(post.id)}
              disabled={!autoTipThreshold || !autoTipAmount || loading === post.id}
              className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading === post.id ? 'Setting up...' : 'Enable Auto-Tip'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
