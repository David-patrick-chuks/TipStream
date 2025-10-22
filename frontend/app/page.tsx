'use client';

import CreatePost from '@/components/CreatePost';
import DelegationDashboard from '@/components/DelegationDashboard';
import PostFeed from '@/components/PostFeed';
import ProfileCreationModal from '@/components/ProfileCreationModal';
import ProfilePage from '@/components/ProfilePage';
import WalletConnect from '@/components/WalletConnect';
import { apiService } from '@/services/api.service';
import { metaMaskSmartAccountService } from '@/services/metamask-smart-account.service';
import { Post, UserProfile } from '@/types';
import { MetaMaskProvider, useSDK } from '@metamask/sdk-react';
import { User } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Home() {
  return (
    <MetaMaskProvider
      debug={false}
      sdkOptions={{
        dappMetadata: {
          name: 'TipStream',
          url: typeof window !== 'undefined' ? window.location.href : 'http://localhost:3000',
        },
      }}
    >
      <HomeContent />
    </MetaMaskProvider>
  );
}

function HomeContent() {
  const { connected, account } = useSDK();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDelegationDashboard, setShowDelegationDashboard] = useState(false);
  const [showProfileCreation, setShowProfileCreation] = useState(false);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [currentView, setCurrentView] = useState<'feed' | 'profile'>('feed');
  const [profileAddress, setProfileAddress] = useState<string | null>(null);

  // Sync connection state with MetaMask SDK
  useEffect(() => {
    if (connected && account) {
      setIsConnected(true);
      setUserAddress(account);
      checkUserProfile(account);
    } else {
      setIsConnected(false);
      setUserAddress(null);
      setUserProfile(null);
    }
  }, [connected, account]);

  // Check if user has a profile
  const checkUserProfile = async (address: string) => {
    try {
      const profile = await apiService.getUser(address);
      setUserProfile(profile);
    } catch (err) {
      // User doesn't have a profile yet
      setUserProfile(null);
    }
  };

  // Load posts from API
  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoading(true);
        const response = await apiService.getPosts(1, 20);
        setPosts(response.posts);
      } catch (err) {
        console.error('Error loading posts:', err);
        setError('Failed to load posts. Please ensure the backend is running.');
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, []);

  const handlePostCreated = async (post: Post) => {
    setPosts([post, ...posts]);
  };

  const handleProfileCreated = (profile: UserProfile) => {
    setUserProfile(profile);
    setShowProfileCreation(false);
  };

  const handleViewProfile = (address: string) => {
    setProfileAddress(address);
    setCurrentView('profile');
  };

  const handleBackToFeed = () => {
    setCurrentView('feed');
    setProfileAddress(null);
  };

  const handleWalletConnect = async (connected: boolean, address?: string) => {
    setIsConnected(connected);
    if (connected && address) {
      setUserAddress(address);
      console.log('Connected to MetaMask:', address);
      checkUserProfile(address); // Check profile on connect
    } else {
      setUserAddress(null);
      setUserProfile(null);
      await metaMaskSmartAccountService.disconnect();
    }
  };

  // Show landing page if not connected
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black">
        {/* Header */}
        <header className="bg-black/30 backdrop-blur-xl border-b border-white/10 shadow-2xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-white/20 to-silver/20 rounded-xl backdrop-blur-sm border border-white/20 flex items-center justify-center mr-4">
                  <span className="text-2xl font-bold text-white">W3</span>
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
              
              <div className="flex items-center space-x-4">
                <WalletConnect onConnect={handleWalletConnect} />
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-20">
            <h2 className="text-6xl font-bold text-white mb-6 tracking-tight">
              The Future of
              <span className="block bg-gradient-to-r from-white to-silver/70 bg-clip-text text-transparent">
                TipStream
              </span>
            </h2>
            <p className="text-xl text-silver/70 max-w-3xl mx-auto leading-relaxed mb-12">
              Experience the next generation of social media where creators are rewarded instantly 
              through blockchain technology. Connect your MetaMask wallet to start tipping and earning.
            </p>
            
            <div className="flex items-center justify-center gap-8 mb-16">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span className="text-white font-medium">MetaMask Smart Accounts</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span className="text-white font-medium">Monad Blockchain</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span className="text-white font-medium">Auto-Tip Delegations</span>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 hover:shadow-2xl hover:shadow-white/5">
              <div className="w-16 h-16 bg-gradient-to-r from-white/20 to-silver/20 rounded-xl backdrop-blur-sm border border-white/20 flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Smart Tipping</h3>
              <p className="text-silver/70 leading-relaxed">
                Send tips directly through MetaMask with real-time blockchain transactions and instant notifications.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 hover:shadow-2xl hover:shadow-white/5">
              <div className="w-16 h-16 bg-gradient-to-r from-white/20 to-silver/20 rounded-xl backdrop-blur-sm border border-white/20 flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Auto-Tipping</h3>
              <p className="text-silver/70 leading-relaxed">
                Set up automatic tips that trigger when posts reach engagement thresholds using MetaMask delegations.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 hover:shadow-2xl hover:shadow-white/5">
              <div className="w-16 h-16 bg-gradient-to-r from-white/20 to-silver/20 rounded-xl backdrop-blur-sm border border-white/20 flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Delegation Management</h3>
              <p className="text-silver/70 leading-relaxed">
                Manage your auto-tip delegations with full control over thresholds, amounts, and execution permissions.
              </p>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-12 max-w-2xl mx-auto">
              <h3 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h3>
              <p className="text-silver/70 text-lg mb-8">
                Connect your MetaMask wallet to access the full platform and start tipping creators.
              </p>
              <WalletConnect onConnect={handleWalletConnect} />
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Show main dashboard if connected
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-xl border-b border-white/10 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-white/20 to-silver/20 rounded-xl backdrop-blur-sm border border-white/20 flex items-center justify-center mr-4">
                <span className="text-2xl font-bold text-white">W3</span>
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
            
                     <div className="flex items-center space-x-4">
                       <WalletConnect onConnect={handleWalletConnect} />
                       {isConnected && !userProfile && (
                         <button
                           onClick={() => setShowProfileCreation(true)}
                           className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white px-6 py-3 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-white/10 font-medium flex items-center space-x-2"
                         >
                           <User className="w-4 h-4" />
                           <span>Create Profile</span>
                         </button>
                       )}
                       {isConnected && userProfile && (
                         <>
                           <button
                             onClick={() => handleViewProfile(userAddress!)}
                             className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white px-6 py-3 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-white/10 font-medium flex items-center space-x-2"
                           >
                             <User className="w-4 h-4" />
                             <span>My Profile</span>
                           </button>
                           <button
                             onClick={() => setShowDelegationDashboard(true)}
                             className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white px-6 py-3 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-white/10 font-medium"
                           >
                             Delegation Dashboard
                           </button>
                         </>
                       )}
                     </div>
          </div>
        </div>
      </header>

               {/* Main Content */}
               <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                 {error && (
                   <div className="mb-8 bg-red-500/10 backdrop-blur-sm border border-red-500/20 text-red-200 px-6 py-4 rounded-xl">
                     {error} - Using demo data
                   </div>
                 )}

                 {currentView === 'profile' && profileAddress ? (
                   <ProfilePage userAddress={profileAddress} />
                 ) : (
                   <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                     {/* Create Post */}
                     <div className="lg:col-span-1">
                       <CreatePost onPostCreated={handlePostCreated} userAddress={userAddress} />
                     </div>

                     {/* Post Feed */}
                     <div className="lg:col-span-2">
                       {loading ? (
                         <div className="text-center text-white">
                           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                           <p className="text-silver/70">Loading posts...</p>
                         </div>
                       ) : (
                         <PostFeed posts={posts} onViewProfile={handleViewProfile} />
                       )}
                     </div>
                   </div>
                 )}

        {/* Features */}
        {/* <div className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Platform Features</h2>
            <p className="text-silver/70 text-lg">Advanced Web3 social tipping capabilities</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 hover:shadow-2xl hover:shadow-white/5">
              <div className="w-16 h-16 bg-gradient-to-r from-white/20 to-silver/20 rounded-xl backdrop-blur-sm border border-white/20 flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Smart Tipping</h3>
              <p className="text-silver/70 leading-relaxed">
                Send tips directly through MetaMask with real-time blockchain transactions and instant notifications.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 hover:shadow-2xl hover:shadow-white/5">
              <div className="w-16 h-16 bg-gradient-to-r from-white/20 to-silver/20 rounded-xl backdrop-blur-sm border border-white/20 flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Auto-Tipping</h3>
              <p className="text-silver/70 leading-relaxed">
                Set up automatic tips that trigger when posts reach engagement thresholds using MetaMask delegations.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 hover:shadow-2xl hover:shadow-white/5">
              <div className="w-16 h-16 bg-gradient-to-r from-white/20 to-silver/20 rounded-xl backdrop-blur-sm border border-white/20 flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Delegation Management</h3>
              <p className="text-silver/70 leading-relaxed">
                Manage your auto-tip delegations with full control over thresholds, amounts, and execution permissions.
              </p>
            </div>
          </div>
        </div> */}
      </main>

               {/* Delegation Dashboard Modal */}
               <DelegationDashboard 
                 isOpen={showDelegationDashboard} 
                 onClose={() => setShowDelegationDashboard(false)}
                 userAddress={userAddress}
               />

               {/* Profile Creation Modal */}
               <ProfileCreationModal
                 isOpen={showProfileCreation}
                 onClose={() => setShowProfileCreation(false)}
                 userAddress={userAddress!}
                 onProfileCreated={handleProfileCreated}
               />
    </div>
  );
}