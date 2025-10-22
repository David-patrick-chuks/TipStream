'use client';

import { delegationService } from '@/services/delegation.service';
import { useSDK } from '@metamask/sdk-react';
import { Clock, Shield, X, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';

interface DelegationDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  userAddress?: string | null;
}

export default function DelegationDashboard({ isOpen, onClose, userAddress }: DelegationDashboardProps) {
  const { account } = useSDK();
  const address = userAddress || account;
  const [delegations, setDelegations] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalDelegations: 0,
    activeDelegations: 0,
    totalAutoTipAmount: '0',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && address) {
      loadDelegations();
    }
  }, [isOpen, address]);

  const loadDelegations = async () => {
    if (!address) return;
    
    setLoading(true);
    try {
      const userDelegations = await delegationService.getUserDelegations(address);
      const delegationStats = await delegationService.getDelegationStats(address);
      setDelegations(userDelegations);
      setStats(delegationStats);
    } catch (error) {
      console.error('Error loading delegations:', error);
    } finally {
      setLoading(false);
    }
  };

  const revokeDelegation = async (delegationId: string) => {
    try {
      const success = await delegationService.revokeDelegation(delegationId);
      if (success) {
        await loadDelegations(); // Reload to update the list
        alert('Delegation revoked successfully!');
      } else {
        alert('Failed to revoke delegation');
      }
    } catch (error) {
      console.error('Error revoking delegation:', error);
      alert('Error revoking delegation');
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(parseInt(timestamp));
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 w-full max-w-4xl max-h-[80vh] overflow-y-auto shadow-2xl shadow-white/5">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-white/20 to-silver/20 rounded-xl backdrop-blur-sm border border-white/20 flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white">Delegation Dashboard</h2>
              <p className="text-silver/70 text-sm">Manage your auto-tip delegations</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white p-3 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-white/10"
            aria-label="Close delegation dashboard"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-r from-white/20 to-silver/20 rounded-lg backdrop-blur-sm border border-white/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-white font-semibold">Total Delegations</h3>
            </div>
            <p className="text-3xl font-bold text-white">{stats.totalDelegations}</p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-r from-white/20 to-silver/20 rounded-lg backdrop-blur-sm border border-white/20 flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-white font-semibold">Active Delegations</h3>
            </div>
            <p className="text-3xl font-bold text-white">{stats.activeDelegations}</p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-r from-white/20 to-silver/20 rounded-lg backdrop-blur-sm border border-white/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-white font-semibold">Total Auto-Tip Amount</h3>
            </div>
            <p className="text-3xl font-bold text-white">{stats.totalAutoTipAmount} ETH</p>
          </div>
        </div>

        {/* Delegations List */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <h3 className="text-2xl font-bold text-white">Your Delegations</h3>
            <div className="w-8 h-8 bg-gradient-to-r from-white/20 to-silver/20 rounded-lg backdrop-blur-sm border border-white/20 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
          </div>
          
          {loading ? (
            <div className="text-center text-white py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-silver/70">Loading delegations...</p>
            </div>
          ) : delegations.length === 0 ? (
            <div className="text-center text-silver/70 py-16">
              <div className="w-20 h-20 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20 flex items-center justify-center mx-auto mb-6">
                <Shield className="w-10 h-10 text-silver/50" />
              </div>
              <p className="text-xl font-medium mb-2">No delegations found</p>
              <p className="text-silver/50">Create auto-tip delegations to see them here</p>
            </div>
          ) : (
            delegations.map((delegation, index) => (
              <div key={index} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-white/20 to-silver/20 rounded-xl backdrop-blur-sm border border-white/20 flex items-center justify-center">
                        <Zap className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-white font-semibold text-lg">Post #{delegation.postId}</h4>
                        <p className="text-silver/70">
                          Auto-tip <span className="text-white font-medium">{delegation.amount} ETH</span> when engagement reaches <span className="text-white font-medium">{delegation.threshold}</span>
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6 text-sm text-silver/70">
                      <span>Created: {formatTime(delegation.timestamp || Date.now().toString())}</span>
                      <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
                        delegation.active 
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}>
                        {delegation.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  
                  {delegation.active && (
                    <button
                      onClick={() => revokeDelegation(`auto-tip-${delegation.postId}-${index}`)}
                      className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white px-6 py-3 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-white/10 font-medium"
                    >
                      Revoke
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Innovation Highlight */}
        <div className="mt-12 p-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-white/20 to-silver/20 rounded-xl backdrop-blur-sm border border-white/20 flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="text-white font-bold text-xl">Innovation Highlight</h4>
              <p className="text-silver/70 text-sm">Most Innovative Use of Delegations</p>
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <p className="text-silver/70 leading-relaxed">
              This delegation system represents the <span className="text-white font-semibold">Most Innovative Use of Delegations</span> 
              by allowing users to delegate tipping permissions based on engagement thresholds. 
              When a post reaches the specified engagement level, the system automatically executes 
              the tip without requiring manual intervention, creating a seamless Web3 social experience.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
