'use client';

import { Post } from '@/types';
import Comments from './Comments';
import DelegationDetails from './DelegationDetails';
import PostActions from './PostActions';
import PostHeader from './PostHeader';
import PostImages from './PostImages';
import PostStats from './PostStats';
import TipInterface from './TipInterface';

interface PostCardProps {
  post: Post;
  account?: string | null;
  delegations: Array<{ postId: string; tipper: string; threshold: number; amount: string; active: boolean }>;
  tippingPost: string | null;
  showComments: string | null;
  loading: string | null;
  tipAmount: string;
  setTipAmount: (amount: string) => void;
  autoTipThreshold: string;
  setAutoTipThreshold: (threshold: string) => void;
  autoTipAmount: string;
  setAutoTipAmount: (amount: string) => void;
  onToggleTipping: (postId: string) => void;
  onToggleComments: (postId: string) => void;
  onEngagement: (postId: string) => void;
  onTip: (postId: string) => void;
  onAutoTip: (postId: string) => void;
  formatTime: (timestamp: string) => string;
  formatEther: (value: number) => string;
}

export default function PostCard({
  post,
  account,
  delegations,
  tippingPost,
  showComments,
  loading,
  tipAmount,
  setTipAmount,
  autoTipThreshold,
  setAutoTipThreshold,
  autoTipAmount,
  setAutoTipAmount,
  onToggleTipping,
  onToggleComments,
  onEngagement,
  onTip,
  onAutoTip,
  formatTime,
  formatEther
}: PostCardProps) {
  // Check if this post has active delegations
  const postDelegations = delegations.filter(d => d.postId === post.id && d.active);
  const hasActiveDelegation = postDelegations.length > 0;

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 hover:shadow-2xl hover:shadow-white/5">
      {/* Post Header */}
      <PostHeader
        post={post}
        account={account}
        hasActiveDelegation={hasActiveDelegation}
        formatTime={formatTime}
        formatEther={formatEther}
      />

      {/* Post Content */}
      <div className="mb-6">
        <p className="text-white text-lg leading-relaxed">{post.content}</p>
      </div>

      {/* Post Images */}
      <PostImages images={post.images || []} />

      {/* Post Stats */}
      <PostStats
        post={post}
        onEngagement={onEngagement}
        onToggleComments={onToggleComments}
        showComments={showComments === post.id}
      />

      {/* Post Actions */}
      <div className="flex items-center justify-end mb-6">
        <PostActions
          post={post}
          account={account}
          loading={loading}
          onToggleTipping={onToggleTipping}
          tippingPost={tippingPost}
        />
      </div>

      {/* Comments Section */}
      {showComments === post.id && (
        <div className="border-t border-white/20 pt-6 mt-6">
          <Comments postId={post.id} userAddress={account} />
        </div>
      )}

      {/* Tip Interface */}
      {tippingPost === post.id && (
        <TipInterface
          post={post}
          tipAmount={tipAmount}
          setTipAmount={setTipAmount}
          autoTipThreshold={autoTipThreshold}
          setAutoTipThreshold={setAutoTipThreshold}
          autoTipAmount={autoTipAmount}
          setAutoTipAmount={setAutoTipAmount}
          loading={loading}
          onTip={onTip}
          onAutoTip={onAutoTip}
        />
      )}

      {/* Delegation Details */}
      <DelegationDetails
        delegations={postDelegations}
        postEngagement={post.engagement}
      />
    </div>
  );
}
