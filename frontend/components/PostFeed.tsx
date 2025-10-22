'use client';

import { apiService } from '@/services/api.service';
import { delegationService } from '@/services/delegation.service';
import { metaMaskSmartAccountService } from '@/services/metamask-smart-account.service';
import { Post } from '@/types';
import { useSDK } from '@metamask/sdk-react';
import { useEffect, useState } from 'react';
import DelegationStats from './DelegationStats';
import PostCard from './PostCard';

interface PostFeedProps {
  posts: Post[];
  onViewProfile?: (address: string) => void;
}

export default function PostFeed({ posts, onViewProfile }: PostFeedProps) {
  const { account } = useSDK();
  const [tippingPost, setTippingPost] = useState<string | null>(null);
  const [tipAmount, setTipAmount] = useState('');
  const [autoTipThreshold, setAutoTipThreshold] = useState('');
  const [autoTipAmount, setAutoTipAmount] = useState('');
  const [loading, setLoading] = useState<string | null>(null);
  const [showComments, setShowComments] = useState<string | null>(null);
  const [delegations, setDelegations] = useState<Array<{ postId: string; tipper: string; threshold: number; amount: string; active: boolean }>>([]);
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
    if (!tipAmount || !account) return;
    
    setLoading(postId);
    try {
      // Send tip transaction using MetaMask signing
      const txHash = await metaMaskSmartAccountService.sendTipTransaction(postId, tipAmount);
      
      // Send tip to backend with transaction hash
      const result = await apiService.sendTip(postId, tipAmount, account, txHash);
      console.log('Tip sent successfully:', result);
      
      setTippingPost(null);
      setTipAmount('');
      
      // Show success message
      alert(`Tip of ${tipAmount} ETH sent successfully! Transaction: ${txHash}`);
    } catch (error) {
      console.error('Error sending tip:', error);
      alert(error instanceof Error ? error.message : 'Failed to send tip');
    } finally {
      setLoading(null);
    }
  };

  const handleAutoTip = async (postId: string) => {
    if (!autoTipThreshold || !autoTipAmount || !account) return;
    
    setLoading(postId);
    try {
      // Enable auto-tip transaction using MetaMask signing
      const txHash = await metaMaskSmartAccountService.enableAutoTipTransaction(
        postId,
        parseInt(autoTipThreshold),
        autoTipAmount
      );
      
      // Enable auto-tip in backend with transaction hash
      const autoTipResult = await apiService.enableAutoTip(
        postId,
        autoTipThreshold,
        autoTipAmount,
        account,
        txHash
      );
      
      console.log('Auto-tip created:', autoTipResult);
      
      // Then create delegation for auto-tipping
      const delegationResult = await delegationService.createAutoTipDelegation(
        postId,
        parseInt(autoTipThreshold),
        autoTipAmount,
        account,
        account // Using same address as delegatee for now
      );

      console.log('Auto-tip delegation created:', delegationResult);
      
      // Reload delegations to show the new one
      await loadDelegations();
      
      setTippingPost(null);
      setAutoTipThreshold('');
      setAutoTipAmount('');
      
      // Show success message
      alert(`Auto-tip delegation created! Will tip ${autoTipAmount} ETH when engagement reaches ${autoTipThreshold}. Transaction: ${txHash}`);
    } catch (error) {
      console.error('Error setting up auto-tip delegation:', error);
      alert(error instanceof Error ? error.message : 'Failed to create auto-tip delegation');
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

  const formatEther = (value: number) => {
    return value.toFixed(4);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Recent Posts</h2>
          <p className="text-silver/70">Discover and support amazing content</p>
        </div>
        
        {/* Delegation Stats */}
        <DelegationStats 
          delegationStats={delegationStats}
          formatEther={formatEther}
        />
      </div>
      
      {posts.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-silver/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          </div>
          <p className="text-silver/70 text-xl font-medium mb-2">No posts yet</p>
          <p className="text-silver/50">Be the first to create one and start the conversation!</p>
        </div>
      ) : (
        posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            account={account}
            delegations={delegations}
            tippingPost={tippingPost}
            showComments={showComments}
            loading={loading}
            tipAmount={tipAmount}
            setTipAmount={setTipAmount}
            autoTipThreshold={autoTipThreshold}
            setAutoTipThreshold={setAutoTipThreshold}
            autoTipAmount={autoTipAmount}
            setAutoTipAmount={setAutoTipAmount}
            onToggleTipping={setTippingPost}
            onToggleComments={setShowComments}
            onEngagement={handleEngagement}
            onTip={handleTip}
            onAutoTip={handleAutoTip}
            formatTime={formatTime}
            formatEther={formatEther}
          />
        ))
      )}
    </div>
  );
}
