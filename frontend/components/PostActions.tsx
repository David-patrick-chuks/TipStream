'use client';

import { Send, Zap } from 'lucide-react';

interface PostActionsProps {
  post: {
    id: string;
    creator: string;
  };
  account?: string | null;
  loading: string | null;
  onToggleTipping: (postId: string) => void;
  tippingPost: string | null;
}

export default function PostActions({ 
  post, 
  account, 
  loading, 
  onToggleTipping, 
  tippingPost 
}: PostActionsProps) {
  const isOwnPost = account?.toLowerCase() === post.creator.toLowerCase();
  const isTipping = tippingPost === post.id;

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => onToggleTipping(post.id)}
        disabled={loading === post.id || isOwnPost}
        className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white px-6 py-3 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-white/10 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        title={isOwnPost ? "You cannot tip your own post" : "Send a tip"}
      >
        <Send className="w-4 h-4" />
        Tip
      </button>
      <button
        onClick={() => onToggleTipping(post.id)}
        disabled={loading === post.id || isOwnPost}
        className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white px-6 py-3 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-white/10 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        title={isOwnPost ? "You cannot auto-tip your own post" : "Set up auto-tip"}
      >
        <Zap className="w-4 h-4" />
        Auto-Tip
      </button>
    </div>
  );
}
