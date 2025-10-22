'use client';

import { apiService } from '@/services/api.service';
import { Post, UserProfile } from '@/types';
import { Camera, Edit3, Heart, MessageCircle, Send, User, Zap } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface ProfilePageProps {
  userAddress?: string;
}

export default function ProfilePage({ userAddress }: ProfilePageProps) {
  const params = useParams();
  const address = userAddress || (params?.address as string);
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: '',
    displayName: '',
    bio: ''
  });

  useEffect(() => {
    if (address) {
      loadProfile();
    }
  }, [address]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await apiService.getUserProfile(address);
      setProfile(response.profile);
      setPosts(response.posts);
      setEditForm({
        username: response.profile.username,
        displayName: response.profile.displayName,
        bio: response.profile.bio
      });
    } catch (err) {
      console.error('Error loading profile:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = async () => {
    try {
      const response = await apiService.updateProfile(address, editForm);
      setProfile(response.profile);
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile');
    }
  };

  const handleProfileImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const response = await apiService.updateProfileImage(address, file);
      setProfile(prev => prev ? { ...prev, profileImage: response.profileImage } : null);
    } catch (err) {
      console.error('Error updating profile image:', err);
      setError('Failed to update profile image');
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(parseInt(timestamp));
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const formatEther = (value: number | string) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(numValue) ? '0.0000' : numValue.toFixed(4);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-silver/70">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-16 h-16 bg-red-500/10 rounded-xl backdrop-blur-sm border border-red-500/20 flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-red-400" />
          </div>
          <p className="text-red-200 text-lg">{error || 'Profile not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-xl border-b border-white/10 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-white/20 to-silver/20 rounded-xl backdrop-blur-sm border border-white/20 flex items-center justify-center mr-4">
                <span className="text-2xl font-bold text-white">TS</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">
                  TipStream
                </h1>
                <p className="text-silver/70 text-sm font-medium">
                  Built on Monad • MetaMask Smart Accounts
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-6">
              {/* Profile Image */}
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-r from-white/20 to-silver/20 rounded-2xl backdrop-blur-sm border border-white/20 flex items-center justify-center overflow-hidden">
                  {profile.profileImage ? (
                    <img 
                      src={profile.profileImage} 
                      alt={profile.displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-white" />
                  )}
                </div>
                <label className="absolute -bottom-2 -right-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white p-2 rounded-xl cursor-pointer transition-all duration-300">
                  <Camera className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfileImageUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-4">
                  <h2 className="text-3xl font-bold text-white">{profile.displayName}</h2>
                  <span className="text-silver/70 text-lg">@{profile.username || 'unknown'}</span>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white px-4 py-2 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-white/10"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
                
                {profile.bio && (
                  <p className="text-silver/70 text-lg mb-4">{profile.bio}</p>
                )}

                {/* Stats */}
                <div className="flex items-center space-x-8">
                  <div className="text-center">
                    <p className="text-white font-bold text-xl">{profile.postCount}</p>
                    <p className="text-silver/70 text-sm">Posts</p>
                  </div>
                  <div className="text-center">
                    <p className="text-white font-bold text-xl">{profile.tipCount}</p>
                    <p className="text-silver/70 text-sm">Tips</p>
                  </div>
                  <div className="text-center">
                    <p className="text-white font-bold text-xl">{formatEther(profile.totalEarnings)} ETH</p>
                    <p className="text-silver/70 text-sm">Earned</p>
                  </div>
                  <div className="text-center">
                    <p className="text-white font-bold text-xl">{profile.followerCount}</p>
                    <p className="text-silver/70 text-sm">Followers</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Form */}
          {isEditing && (
            <div className="mt-8 pt-8 border-t border-white/20">
              <h3 className="text-xl font-semibold text-white mb-4">Edit Profile</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Username</label>
                  <input
                    type="text"
                    value={editForm.username}
                    onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                    className="w-full bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-silver/50 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Display Name</label>
                  <input
                    type="text"
                    value={editForm.displayName}
                    onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
                    className="w-full bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-silver/50 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-all duration-300"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-white mb-2">Bio</label>
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    rows={3}
                    className="w-full bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-silver/50 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-all duration-300 resize-none"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-4 mt-6">
                <button
                  onClick={handleEditProfile}
                  className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white px-6 py-3 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-white/10 font-medium"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 text-white px-6 py-3 rounded-xl transition-all duration-300 font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Posts */}
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-white mb-6">Posts</h3>
          
          {posts.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20 flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="w-10 h-10 text-silver/50" />
              </div>
              <p className="text-silver/70 text-xl font-medium mb-2">No posts yet</p>
              <p className="text-silver/50">This user hasn't created any posts</p>
            </div>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 hover:shadow-2xl hover:shadow-white/5">
                {/* Post Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-white/20 to-silver/20 rounded-xl backdrop-blur-sm border border-white/20 flex items-center justify-center text-white font-bold">
                      {profile.username ? profile.username.slice(0, 2).toUpperCase() : '??'}
                    </div>
                    <div>
                      <p className="text-white font-semibold">{profile.displayName}</p>
                      <p className="text-silver/70 text-sm">{formatTime(post.timestamp)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold text-lg">{formatEther(post.totalTips)} ETH</p>
                    <p className="text-silver/70 text-sm">{post.tipCount} tips</p>
                  </div>
                </div>

                {/* Post Content */}
                <div className="mb-4">
                  <p className="text-white text-lg leading-relaxed">{post.content}</p>
                </div>

                {/* Post Images */}
                {post.images && post.images.length > 0 && (
                  <div className="mb-4">
                    <div className={`grid gap-2 ${post.images.length === 1 ? 'grid-cols-1' : post.images.length === 2 ? 'grid-cols-2' : 'grid-cols-2'}`}>
                      {post.images.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={image.url}
                            alt={`Post image ${index + 1}`}
                            className="w-full h-48 object-cover rounded-xl"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Post Stats */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <button className="flex items-center space-x-2 text-silver/70 hover:text-white transition-colors">
                      <Heart className="w-5 h-5" />
                      <span className="font-medium">{post.engagement}</span>
                    </button>
                    <button className="flex items-center space-x-2 text-silver/70 hover:text-white transition-colors">
                      <MessageCircle className="w-5 h-5" />
                      <span className="font-medium">{post.commentCount}</span>
                    </button>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white px-4 py-2 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-white/10 font-medium flex items-center space-x-2">
                      <Send className="w-4 h-4" />
                      <span>Tip</span>
                    </button>
                    <button className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white px-4 py-2 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-white/10 font-medium flex items-center space-x-2">
                      <Zap className="w-4 h-4" />
                      <span>Auto-Tip</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
