'use client';

import { useEffect, useState } from 'react';
import { apiService } from '@/services/api.service';
import { Analytics } from '@/types';
import { TrendingUp, Users, MessageCircle, Zap, DollarSign } from 'lucide-react';

export default function Analytics() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await apiService.getAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error('Error loading analytics:', err);
      setError('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-silver/70">Loading analytics...</p>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-red-500/10 rounded-xl backdrop-blur-sm border border-red-500/20 flex items-center justify-center mx-auto mb-4">
          <TrendingUp className="w-8 h-8 text-red-400" />
        </div>
        <p className="text-red-200 text-lg">{error || 'Analytics not available'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Platform Analytics</h2>
        <p className="text-silver/70">Real-time insights into TipStream activity</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Posts */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 hover:shadow-2xl hover:shadow-white/5">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-xl backdrop-blur-sm border border-blue-500/20 flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-blue-400" />
            </div>
            <span className="text-blue-400 text-sm font-medium">+{analytics.posts.growth}%</span>
          </div>
          <div>
            <p className="text-white font-bold text-2xl">{analytics.posts.total}</p>
            <p className="text-silver/70 text-sm">Total Posts</p>
          </div>
        </div>

        {/* Total Users */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 hover:shadow-2xl hover:shadow-white/5">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500/20 to-green-600/20 rounded-xl backdrop-blur-sm border border-green-500/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-green-400" />
            </div>
            <span className="text-green-400 text-sm font-medium">+{analytics.users.growth}%</span>
          </div>
          <div>
            <p className="text-white font-bold text-2xl">{analytics.users.total}</p>
            <p className="text-silver/70 text-sm">Active Users</p>
          </div>
        </div>

        {/* Total Tips */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 hover:shadow-2xl hover:shadow-white/5">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 rounded-xl backdrop-blur-sm border border-yellow-500/20 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-yellow-400" />
            </div>
            <span className="text-yellow-400 text-sm font-medium">+{analytics.tips.growth}%</span>
          </div>
          <div>
            <p className="text-white font-bold text-2xl">{analytics.tips.total}</p>
            <p className="text-silver/70 text-sm">Tips Sent</p>
          </div>
        </div>

        {/* Total Volume */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 hover:shadow-2xl hover:shadow-white/5">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500/20 to-purple-600/20 rounded-xl backdrop-blur-sm border border-purple-500/20 flex items-center justify-center">
              <Zap className="w-6 h-6 text-purple-400" />
            </div>
            <span className="text-purple-400 text-sm font-medium">+{analytics.volume.growth}%</span>
          </div>
          <div>
            <p className="text-white font-bold text-2xl">{analytics.volume.total.toFixed(4)} ETH</p>
            <p className="text-silver/70 text-sm">Total Volume</p>
          </div>
        </div>
      </div>

      {/* Trending Posts */}
      {analytics.trendingPosts && analytics.trendingPosts.length > 0 && (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Trending Posts
          </h3>
          <div className="space-y-3">
            {analytics.trendingPosts.map((post, index) => (
              <div key={post.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                <div className="flex items-center space-x-3">
                  <span className="text-white font-bold text-lg">#{index + 1}</span>
                  <div>
                    <p className="text-white font-medium">{post.content.slice(0, 50)}...</p>
                    <p className="text-silver/70 text-sm">{post.creator}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold">{post.totalTips.toFixed(4)} ETH</p>
                  <p className="text-silver/70 text-sm">{post.tipCount} tips</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
