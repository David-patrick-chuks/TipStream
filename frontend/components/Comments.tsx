'use client';

import { apiService } from '@/services/api.service';
import { Comment } from '@/types';
import { Heart, Reply, Trash2, User } from 'lucide-react';
import { useEffect, useState } from 'react';

interface CommentsProps {
  postId: string;
  userAddress?: string;
}

export default function Comments({ postId, userAddress }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    loadComments();
  }, [postId]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const response = await apiService.getComments(postId);
      setComments(response.comments);
    } catch (err) {
      console.error('Error loading comments:', err);
      setError('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateComment = async () => {
    if (!newComment.trim() || !userAddress) return;

    try {
      const response = await apiService.createComment(postId, userAddress, newComment);
      setComments([response, ...comments]);
      setNewComment('');
    } catch (err) {
      console.error('Error creating comment:', err);
      setError('Failed to create comment');
    }
  };

  const handleReplyToComment = async (commentId: string) => {
    if (!replyText.trim() || !userAddress) return;

    try {
      const response = await apiService.replyToComment(commentId, userAddress, replyText);
      setComments([response, ...comments]);
      setReplyText('');
      setReplyingTo(null);
    } catch (err) {
      console.error('Error creating reply:', err);
      setError('Failed to create reply');
    }
  };

  const handleLikeComment = async (commentId: string) => {
    try {
      await apiService.likeComment(commentId);
      setComments(comments.map(comment => 
        comment.id === commentId 
          ? { ...comment, likes: comment.likes + 1 }
          : comment
      ));
    } catch (err) {
      console.error('Error liking comment:', err);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!userAddress) return;

    try {
      await apiService.deleteComment(commentId, userAddress);
      setComments(comments.filter(comment => comment.id !== commentId));
    } catch (err) {
      console.error('Error deleting comment:', err);
      setError('Failed to delete comment');
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(parseInt(timestamp));
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-silver/70">Loading comments...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Comment Input */}
      {userAddress && (
        <div className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-white/20 to-silver/20 rounded-lg backdrop-blur-sm border border-white/20 flex items-center justify-center text-white font-bold text-sm">
              {userAddress.slice(2, 4).toUpperCase()}
            </div>
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="w-full bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-silver/50 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-all duration-300 resize-none"
                rows={3}
              />
              <div className="flex items-center justify-between mt-3">
                <span className="text-silver/50 text-sm">{newComment.length}/1000</span>
                <button
                  onClick={handleCreateComment}
                  disabled={!newComment.trim()}
                  className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white px-4 py-2 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-white/10 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Comment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20 flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-silver/50" />
            </div>
            <p className="text-silver/70 text-lg font-medium mb-2">No comments yet</p>
            <p className="text-silver/50">Be the first to comment!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl p-4">
              {/* Comment Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-white/20 to-silver/20 rounded-lg backdrop-blur-sm border border-white/20 flex items-center justify-center text-white font-bold text-sm">
                    {comment.author ? comment.author.slice(2, 4).toUpperCase() : '??'}
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">
                      {comment.authorInfo?.displayName || comment.author}
                    </p>
                    <p className="text-silver/70 text-xs">{formatTime(comment.timestamp)}</p>
                  </div>
                </div>
                {userAddress && comment.author && userAddress === comment.author && (
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Comment Content */}
              <div className="mb-3">
                <p className="text-white text-sm leading-relaxed">{comment.content || 'No content'}</p>
              </div>

              {/* Comment Actions */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => handleLikeComment(comment.id)}
                  className="flex items-center space-x-1 text-silver/70 hover:text-white transition-colors"
                >
                  <Heart className="w-4 h-4" />
                  <span className="text-xs">{comment.likes || 0}</span>
                </button>
                {userAddress && (
                  <button
                    onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                    className="flex items-center space-x-1 text-silver/70 hover:text-white transition-colors"
                  >
                    <Reply className="w-4 h-4" />
                    <span className="text-xs">Reply</span>
                  </button>
                )}
              </div>

              {/* Reply Input */}
              {replyingTo === comment.id && userAddress && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-gradient-to-r from-white/20 to-silver/20 rounded-lg backdrop-blur-sm border border-white/20 flex items-center justify-center text-white font-bold text-xs">
                      {userAddress.slice(2, 4).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write a reply..."
                        className="w-full bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl px-3 py-2 text-white placeholder-silver/50 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-all duration-300 resize-none"
                        rows={2}
                      />
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-silver/50 text-xs">{replyText.length}/1000</span>
                        <div className="space-x-2">
                          <button
                            onClick={() => setReplyingTo(null)}
                            className="text-silver/50 hover:text-white transition-colors text-xs"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleReplyToComment(comment.id)}
                            disabled={!replyText.trim()}
                            className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white px-3 py-1 rounded-lg transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                          >
                            Reply
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="mt-4 space-y-3">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-3 ml-8">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-gradient-to-r from-white/20 to-silver/20 rounded-lg backdrop-blur-sm border border-white/20 flex items-center justify-center text-white font-bold text-xs">
                            {reply.author.slice(2, 4).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-white font-semibold text-xs">
                              {reply.authorInfo?.displayName || reply.author}
                            </p>
                            <p className="text-silver/70 text-xs">{formatTime(reply.timestamp)}</p>
                          </div>
                        </div>
                        {userAddress === reply.author && (
                          <button
                            onClick={() => handleDeleteComment(reply.id)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      <p className="text-white text-xs leading-relaxed">{reply.content}</p>
                      <div className="flex items-center space-x-3 mt-2">
                        <button
                          onClick={() => handleLikeComment(reply.id)}
                          className="flex items-center space-x-1 text-silver/70 hover:text-white transition-colors"
                        >
                          <Heart className="w-3 h-3" />
                          <span className="text-xs">{reply.likes}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {error && (
        <div className="bg-red-500/10 backdrop-blur-sm border border-red-500/20 text-red-200 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}
    </div>
  );
}
