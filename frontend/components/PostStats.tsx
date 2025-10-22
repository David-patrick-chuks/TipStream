'use client';

import { Heart, MessageCircle } from 'lucide-react';

interface PostStatsProps {
  post: {
    id: string;
    engagement: number;
    commentCount: number;
  };
  onEngagement: (postId: string) => void;
  onToggleComments: (postId: string) => void;
  showComments: boolean;
}

export default function PostStats({ 
  post, 
  onEngagement, 
  onToggleComments, 
  showComments 
}: PostStatsProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-6">
        <button 
          onClick={() => onEngagement(post.id)}
          className="flex items-center gap-2 text-silver/70 hover:text-white transition-colors"
        >
          <Heart className="w-5 h-5" />
          <span className="font-medium">{post.engagement}</span>
        </button>
        <button 
          onClick={() => onToggleComments(post.id)}
          className="flex items-center gap-2 text-silver/70 hover:text-white transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="font-medium">{post.commentCount || 0}</span>
        </button>
      </div>
    </div>
  );
}
