'use client';

import { apiService } from '@/services/api.service';
import { delegationService } from '@/services/delegation.service';
import { Post } from '@/types';
import { Heart, MessageCircle, Send, Zap, Shield } from 'lucide-react';
import { useSDK } from '@metamask/sdk-react';
import { useState, useEffect } from 'react';

interface PostFeedProps {
  posts: Post[];
}

export default function PostFeed({ posts }: PostFeedProps) {
  const { account } = useSDK();
  const [tippingPost, setTippingPost] = useState<string | null>(null);
  const [tipAmount, setTipAmount] = useState('');
  const [autoTipThreshold, setAutoTipThreshold] = useState('');
  const [autoTipAmount, setAutoTipAmount] = useState('');
  const [loading, setLoading] = useState<string | null>(null);
  const [delegations, setDelegations] = useState<any[]>([]);
  const [delegationStats, setDelegationStats] = useState({
    totalDelegations: 0,
    activeDelegations: 0,
    totalAutoTipAmount: '0',
  });

  // Load user delegations on component mount
  useEffect(() => {
    if (account) {
      loadDelegations();
    }
  }, [account]);

  const loadDelegations = async () => {
    if (!account) return;
    
    try {
      const userDelegations = await delegationService.getUserDelegations(account);
      const stats = await delegationService.getDelegationStats(account);
      setDelegations(userDelegations);
      setDelegationStats(stats);
    } catch (error) {
      console.error('Error loading delegations:', error);
    }
  };

  const handleTip = async (postId: string) => {
    if (!tipAmount) return;
    
    setLoading(postId);
    try {
      // In a real implementation, you would get the private key from MetaMask
      // For demo purposes, we'll simulate the API call
      console.log(`Tipping ${tipAmount} ETH to post ${postId}`);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setTippingPost(null);
      setTipAmount('');
    } catch (error) {
      console.error('Error sending tip:', error);
    } finally {
      setLoading(null);
    }
  };

  const handleAutoTip = async (postId: string) => {
    if (!autoTipThreshold || !autoTipAmount || !account) return;
    
    setLoading(postId);
    try {
      // Create delegation for auto-tipping
      const result = await delegationService.createAutoTipDelegation(
        postId,
        parseInt(autoTipThreshold),
        autoTipAmount,
        account
      );

      console.log('Auto-tip delegation created:', result);
      
      // Reload delegations to show the new one
      await loadDelegations();
      
      setTippingPost(null);
      setAutoTipThreshold('');
      setAutoTipAmount('');
      
      // Show success message
      alert(`Auto-tip delegation created! Will tip ${autoTipAmount} ETH when engagement reaches ${autoTipThreshold}`);
    } catch (error) {
      console.error('Error setting up auto-tip delegation:', error);
      alert('Failed to create auto-tip delegation. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const handleEngagement = async (postId: string) => {
    try {
      await apiService.increaseEngagement(postId);
      // In a real app, you'd update the local state or refetch
    } catch (error) {
      console.error('Error increasing engagement:', error);
    }
  };

  const formatTime = (timestamp: string) => {
    const now = Date.now();
    const diff = now - parseInt(timestamp);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    return `${hours}h ago`;
  };

  const formatEther = (value: string) => {
    return parseFloat(value).toFixed(4);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-white">Recent Posts</h2>
        
        {/* Delegation Stats */}
        {account && delegationStats.activeDelegations > 0 && (
          <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 text-purple-200 text-sm">
              <Shield className="w-4 h-4" />
              <span>{delegationStats.activeDelegations} Active Delegations</span>
              <span className="text-purple-300">({delegationStats.totalAutoTipAmount} ETH)</span>
            </div>
          </div>
        )}
      </div>
      
      {posts.map((post) => {
        // Check if this post has active delegations
        const postDelegations = delegations.filter(d => d.postId === post.id && d.active);
        const hasActiveDelegation = postDelegations.length > 0;
        
        return (
        <div key={post.id} className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
          {/* Post Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                {post.creator.slice(2, 4).toUpperCase()}
              </div>
              <div>
                <p className="text-white font-medium">{post.creator}</p>
                <p className="text-blue-200 text-sm">{formatTime(post.timestamp)}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-green-400 font-semibold">{formatEther(post.totalTips)} ETH</p>
              <p className="text-blue-200 text-sm">{post.tipCount} tips</p>
              {hasActiveDelegation && (
                <div className="flex items-center gap-1 text-purple-300 text-xs mt-1">
                  <Shield className="w-3 h-3" />
                  <span>Auto-tip Active</span>
                </div>
              )}
            </div>
          </div>

          {/* Post Content */}
          <p className="text-white mb-4">{post.content}</p>

          {/* Post Stats */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => handleEngagement(post.id)}
                className="flex items-center gap-2 text-blue-200 hover:text-white transition-colors"
              >
                <Heart className="w-4 h-4" />
                {post.engagement}
              </button>
              <button className="flex items-center gap-2 text-blue-200 hover:text-white transition-colors">
                <MessageCircle className="w-4 h-4" />
                {post.tipCount}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setTippingPost(tippingPost === post.id ? null : post.id)}
                disabled={loading === post.id}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 text-white px-3 py-1 rounded-lg text-sm transition-colors"
              >
                <Send className="w-4 h-4 inline mr-1" />
                Tip
              </button>
              <button
                onClick={() => setTippingPost(tippingPost === post.id ? null : post.id)}
                disabled={loading === post.id}
                className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-500 text-white px-3 py-1 rounded-lg text-sm transition-colors"
              >
                <Zap className="w-4 h-4 inline mr-1" />
                Auto-Tip
              </button>
            </div>
          </div>

          {/* Tip Interface */}
          {tippingPost === post.id && (
            <div className="border-t border-white/20 pt-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Manual Tip */}
                <div>
                  <h4 className="text-white font-medium mb-2">Send Tip</h4>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={tipAmount}
                      onChange={(e) => setTipAmount(e.target.value)}
                      placeholder="0.01"
                      step="0.001"
                      className="flex-1 p-2 rounded-lg bg-white/20 text-white placeholder-blue-200 border border-white/30 focus:border-blue-400 focus:outline-none"
                    />
                    <span className="text-blue-200 self-center">ETH</span>
                    <button
                      onClick={() => handleTip(post.id)}
                      disabled={loading === post.id}
                      className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      {loading === post.id ? 'Sending...' : 'Send'}
                    </button>
                  </div>
                </div>

                {/* Auto Tip */}
                <div>
                  <h4 className="text-white font-medium mb-2">Auto-Tip Setup</h4>
                  <div className="space-y-2">
                    <input
                      type="number"
                      value={autoTipThreshold}
                      onChange={(e) => setAutoTipThreshold(e.target.value)}
                      placeholder="Engagement threshold"
                      className="w-full p-2 rounded-lg bg-white/20 text-white placeholder-blue-200 border border-white/30 focus:border-blue-400 focus:outline-none"
                    />
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={autoTipAmount}
                        onChange={(e) => setAutoTipAmount(e.target.value)}
                        placeholder="0.01"
                        step="0.001"
                        className="flex-1 p-2 rounded-lg bg-white/20 text-white placeholder-blue-200 border border-white/30 focus:border-blue-400 focus:outline-none"
                      />
                      <span className="text-blue-200 self-center">ETH</span>
                      <button
                        onClick={() => handleAutoTip(post.id)}
                        disabled={loading === post.id}
                        className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-500 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        {loading === post.id ? 'Setting...' : 'Setup'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Delegation Details */}
          {hasActiveDelegation && (
            <div className="mt-4 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
              <h5 className="text-purple-200 font-medium mb-2 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Active Auto-Tip Delegations
              </h5>
              {postDelegations.map((delegation, index) => (
                <div key={index} className="text-purple-300 text-sm">
                  <span className="font-medium">{delegation.amount} ETH</span> when engagement reaches{' '}
                  <span className="font-medium">{delegation.threshold}</span>
                  <span className="text-purple-400 ml-2">
                    (Current: {post.engagement})
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        );
      })}
    </div>
  );
}
