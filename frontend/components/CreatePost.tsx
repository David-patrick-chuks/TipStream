'use client';

import { apiService } from '@/services/api.service';
import { metaMaskSmartAccountService } from '@/services/metamask-smart-account.service';
import { Post } from '@/types';
import { Upload, X } from 'lucide-react';
import { useRef, useState } from 'react';

interface CreatePostProps {
  onPostCreated: (post: Post) => void;
  userAddress?: string | null;
}

export default function CreatePost({ onPostCreated, userAddress }: CreatePostProps) {
  const [content, setContent] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const newImages = [...images, ...files].slice(0, 4); // Max 4 images
    
    setImages(newImages);
    
    // Create previews
    const newPreviews = newImages.map(file => URL.createObjectURL(file));
    setImagePreviews(newPreviews);
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !userAddress) return;

    setIsCreating(true);
    setError(null);
    
    try {
      // Create post transaction using MetaMask signing
      const txHash = await metaMaskSmartAccountService.createPostTransaction(content);
      
      let result;
      if (images.length > 0) {
        // Debug: Log image details
        console.log('Uploading images:', images.map(img => ({
          name: img.name,
          size: img.size,
          type: img.type
        })));
        
        // Create post with images
        result = await apiService.createPostWithImages(content, userAddress, txHash, images);
      } else {
        // Create text-only post
        result = await apiService.createPost(content, userAddress, txHash);
      }
      
      const newPost: Post = {
        id: result.id,
        creator: result.creator,
        content: result.content,
        images: result.images || [],
        timestamp: result.timestamp,
        totalTips: 0,
        tipCount: 0,
        engagement: 0,
        commentCount: 0
      };
      
      onPostCreated(newPost);
      setContent('');
      setImages([]);
      setImagePreviews([]);
    } catch (err) {
      console.error('Error creating post:', err);
      setError(err instanceof Error ? err.message : 'Failed to create post');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300">
      <div className="flex items-center mb-6">
        <div className="w-12 h-12 bg-gradient-to-r from-white/20 to-silver/20 rounded-xl backdrop-blur-sm border border-white/20 flex items-center justify-center mr-4">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Create Post</h2>
          <p className="text-silver/70 text-sm">Share your thoughts with the community</p>
        </div>
      </div>

      {!userAddress ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-silver/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <p className="text-silver/70 text-lg font-medium">Please connect your wallet to create posts</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-white mb-3">
              What's on your mind?
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts, ideas, or experiences..."
              className="w-full h-32 bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-silver/50 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-all duration-300 resize-none"
              disabled={isCreating}
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-white mb-3">
              Images (max 4)
            </label>
            
            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 gap-4 mb-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-500 text-white p-1 rounded-full transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={images.length >= 4 || isCreating}
              className="w-full bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/20 text-white px-4 py-3 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-white/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Upload className="w-5 h-5" />
              {images.length >= 4 ? 'Maximum 4 images' : 'Add Images'}
            </button>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          {error && (
            <div className="bg-red-500/10 backdrop-blur-sm border border-red-500/20 text-red-200 px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!content.trim() || isCreating}
            className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-white/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isCreating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Creating Post...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create Post
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
