'use client';

import CreatePost from '@/components/CreatePost';
import DelegationDashboard from '@/components/DelegationDashboard';
import PostFeed from '@/components/PostFeed';
import WalletConnect from '@/components/WalletConnect';
import { apiService } from '@/services/api.service';
import { metaMaskSmartAccountService } from '@/services/metamask-smart-account.service';
import { delegationService } from '@/services/delegation.service';
import { Post } from '@/types';
import { MetaMaskProvider } from '@metamask/sdk-react';
import { useEffect, useState } from 'react';

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDelegationDashboard, setShowDelegationDashboard] = useState(false);
  const [userAddress, setUserAddress] = useState<string | null>(null);

  // Load posts from API
  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoading(true);
        const response = await apiService.getPosts(1, 20);
        setPosts(response.posts);
      } catch (err) {
        console.error('Error loading posts:', err);
        setError('Failed to load posts');
        // Fallback to mock data if API is not available
        setPosts([
          {
            id: '1',
            creator: '0x1234...5678',
            content: 'Just deployed my first smart contract on Monad! 🚀',
            timestamp: (Date.now() - 3600000).toString(),
            totalTips: '0.05',
            tipCount: 3,
            engagement: 12
          },
          {
            id: '2',
            creator: '0x9876...5432',
            content: 'Building the future of Web3 social media with MetaMask Smart Accounts!',
            timestamp: (Date.now() - 7200000).toString(),
            totalTips: '0.1',
            tipCount: 5,
            engagement: 8
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, []);

  const handlePostCreated = async (post: Post) => {
    setPosts([post, ...posts]);
  };

  const handleWalletConnect = async (connected: boolean) => {
    setIsConnected(connected);
    if (connected) {
      try {
        const accountInfo = await metaMaskSmartAccountService.connect();
        setUserAddress(accountInfo.address);
        console.log('Connected to MetaMask Smart Account:', accountInfo);
      } catch (error) {
        console.error('Error connecting to MetaMask:', error);
        setIsConnected(false);
      }
    } else {
      setUserAddress(null);
      await metaMaskSmartAccountService.disconnect();
    }
  };

  return (
    <MetaMaskProvider
      debug={false}
      sdkOptions={{
        dappMetadata: {
          name: 'Web3 Social Tipping',
          url: window.location.href,
        },
        infuraAPIKey: process.env.NEXT_PUBLIC_INFURA_API_KEY,
      }}
    >
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <header className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              Web3 Social Tipping Platform
            </h1>
            <p className="text-blue-200 text-lg">
              Built on Monad with MetaMask Smart Accounts
            </p>
                <div className="mt-4 flex items-center gap-4">
                  <WalletConnect onConnect={handleWalletConnect} />
                  {isConnected && (
                    <button
                      onClick={() => setShowDelegationDashboard(true)}
                      className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-full transition duration-300 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      Delegation Dashboard
                    </button>
                  )}
                </div>
            {error && (
              <div className="mt-4 bg-red-500/20 border border-red-500 text-red-200 px-4 py-2 rounded-lg">
                {error} - Using demo data
              </div>
            )}
          </header>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Create Post */}
            <div className="lg:col-span-1">
              <CreatePost onPostCreated={handlePostCreated} />
            </div>

            {/* Post Feed */}
            <div className="lg:col-span-2">
              {loading ? (
                <div className="text-center text-white">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                  Loading posts...
                </div>
              ) : (
                <PostFeed posts={posts} />
              )}
            </div>
          </div>

          {/* Features */}
          <div className="mt-16 text-center">
            <h2 className="text-2xl font-bold text-white mb-8">Platform Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <h3 className="text-xl font-semibold text-white mb-2">Smart Tipping</h3>
                <p className="text-blue-200">Send tips directly to content creators with MetaMask Smart Accounts</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <h3 className="text-xl font-semibold text-white mb-2">Auto-Tipping</h3>
                <p className="text-blue-200">Set up automatic tips based on engagement thresholds</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <h3 className="text-xl font-semibold text-white mb-2">Real-time Analytics</h3>
                <p className="text-blue-200">Track earnings and engagement with real-time analytics</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delegation Dashboard Modal */}
      <DelegationDashboard 
        isOpen={showDelegationDashboard} 
        onClose={() => setShowDelegationDashboard(false)}
        userAddress={userAddress}
      />
    </MetaMaskProvider>
  );
}
