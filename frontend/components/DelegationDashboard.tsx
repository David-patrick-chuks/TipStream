'use client';

import { delegationService } from '@/services/delegation.service';
import { useSDK } from '@metamask/sdk-react';
import { Clock, Shield, X, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';

interface DelegationDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DelegationDashboard({ isOpen, onClose }: DelegationDashboardProps) {
  const { account } = useSDK();
  const [delegations, setDelegations] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalDelegations: 0,
    activeDelegations: 0,
    totalAutoTipAmount: '0',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && account) {
      loadDelegations();
    }
  }, [isOpen, account]);

  const loadDelegations = async () => {
    if (!account) return;
    
    setLoading(true);
    try {
      const userDelegations = await delegationService.getUserDelegations(account);
      const delegationStats = await delegationService.getDelegationStats(account);
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-purple-400" />
            <h2 className="text-2xl font-bold text-white">Delegation Dashboard</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close delegation dashboard"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-blue-400" />
              <h3 className="text-blue-200 font-medium">Total Delegations</h3>
            </div>
            <p className="text-2xl font-bold text-white">{stats.totalDelegations}</p>
          </div>
          
          <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-green-400" />
              <h3 className="text-green-200 font-medium">Active Delegations</h3>
            </div>
            <p className="text-2xl font-bold text-white">{stats.activeDelegations}</p>
          </div>
          
          <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-purple-400" />
              <h3 className="text-purple-200 font-medium">Total Auto-Tip Amount</h3>
            </div>
            <p className="text-2xl font-bold text-white">{stats.totalAutoTipAmount} ETH</p>
          </div>
        </div>

        {/* Delegations List */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-white mb-4">Your Delegations</h3>
          
          {loading ? (
            <div className="text-center text-white py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
              Loading delegations...
            </div>
          ) : delegations.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No delegations found</p>
              <p className="text-sm">Create auto-tip delegations to see them here</p>
            </div>
          ) : (
            delegations.map((delegation, index) => (
              <div key={index} className="bg-white/5 border border-white/10 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-blue-500 rounded-full flex items-center justify-center">
                        <Zap className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h4 className="text-white font-medium">Post #{delegation.postId}</h4>
                        <p className="text-gray-400 text-sm">
                          Auto-tip {delegation.amount} ETH when engagement reaches {delegation.threshold}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span>Created: {formatTime(delegation.timestamp || Date.now().toString())}</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        delegation.active 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {delegation.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  
                  {delegation.active && (
                    <button
                      onClick={() => revokeDelegation(`auto-tip-${delegation.postId}-${index}`)}
                      className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-1 rounded-lg text-sm transition-colors"
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
        <div className="mt-8 p-4 bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-purple-400" />
            <h4 className="text-purple-200 font-medium">Innovation Highlight</h4>
          </div>
          <p className="text-purple-300 text-sm">
            This delegation system represents the <strong>Most Innovative Use of Delegations</strong> 
            by allowing users to delegate tipping permissions based on engagement thresholds. 
            When a post reaches the specified engagement level, the system automatically executes 
            the tip without requiring manual intervention.
          </p>
        </div>
      </div>
    </div>
  );
}
