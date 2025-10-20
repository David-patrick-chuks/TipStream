'use client';

import { useState } from 'react';
import { Post } from '@/types';

interface CreatePostProps {
  onPostCreated: (post: Post) => void;
}

export default function CreatePost({ onPostCreated }: CreatePostProps) {
  const [content, setContent] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsCreating(true);
    
    // Simulate contract interaction
    setTimeout(() => {
      const newPost: Post = {
        id: Date.now(),
        creator: '0x' + Math.random().toString(16).substr(2, 8),
        content,
        timestamp: Date.now(),
        totalTips: 0,
        tipCount: 0,
        engagement: 0
      };
      
      onPostCreated(newPost);
      setContent('');
      setIsCreating(false);
    }, 1000);
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
      <h2 className="text-xl font-semibold text-white mb-4">Create Post</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-blue-200 border border-white/30 focus:border-blue-400 focus:outline-none resize-none"
          rows={4}
          disabled={isCreating}
        />
        <button
          type="submit"
          disabled={!content.trim() || isCreating}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 text-white py-2 px-4 rounded-lg transition-colors"
        >
          {isCreating ? 'Creating...' : 'Create Post'}
        </button>
      </form>
    </div>
  );
}
