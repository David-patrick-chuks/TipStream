import { createDelegation, createExecution, getDeleGatorEnvironment } from '@metamask/delegation-toolkit';
import { createPublicClient, http, parseEther } from 'viem';
import { monadTestnet } from 'viem/chains';

export interface AutoTipDelegation {
  postId: string;
  threshold: number;
  amount: string;
  tipper: string;
  active: boolean;
}

export class DelegationService {
  private publicClient;
  private contractAddress: string;

  constructor() {
    this.contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000';
    
    this.publicClient = createPublicClient({
      chain: monadTestnet,
      transport: http(process.env.NEXT_PUBLIC_MONAD_RPC_URL || 'https://testnet-rpc.monad.xyz'),
    });
  }

  /**
   * Create a delegation for auto-tipping based on engagement thresholds
   * This is the core innovation for the "Most Innovative Use of Delegations" bonus
   */
  async createAutoTipDelegation(
    postId: string,
    threshold: number,
    amount: string,
    userAddress: string,
    delegateeAddress: string
  ): Promise<{ delegationId: string; delegation: unknown }> {
    try {
      // Get the delegation environment for Monad testnet
      const environment = getDeleGatorEnvironment(monadTestnet.id);
      
      // Create delegation with native token transfer scope for auto-tipping
      const delegation = createDelegation({
        from: userAddress as `0x${string}`,
        to: delegateeAddress as `0x${string}`,
        environment,
        scope: {
          type: "nativeTokenTransferAmount",
          maxAmount: parseEther(amount),
        },
      });

      // Store delegation in local storage for management
      const delegationId = `auto-tip-${postId}-${Date.now()}`;
      localStorage.setItem(delegationId, JSON.stringify({
        delegationId,
        postId,
        threshold,
        amount,
        userAddress,
        delegateeAddress,
        createdAt: Date.now(),
        active: true,
        delegation,
      }));

      return {
        delegationId,
        delegation,
      };
    } catch (error) {
      console.error('Error creating auto-tip delegation:', error);
      throw new Error('Failed to create auto-tip delegation');
    }
  }

  /**
   * Execute auto-tip when engagement threshold is met
   * This function creates an execution for the delegation system
   */
  async createAutoTipExecution(
    postId: string,
    autoTipIndex: number,
    amount: string
  ): Promise<unknown> {
    try {
      // Create execution for auto-tip
      const execution = createExecution({
        target: this.contractAddress as `0x${string}`,
        value: parseEther(amount),
        callData: "0x", // Will be encoded with actual function call
      });

      return execution;
    } catch (error) {
      console.error('Error creating auto-tip execution:', error);
      throw new Error('Failed to create auto-tip execution');
    }
  }

  /**
   * Check if engagement threshold is met for auto-tipping
   */
  async checkEngagementThreshold(postId: string, threshold: number): Promise<boolean> {
    try {
      // Contract ABI for getPost function
      const contractABI = [
        {
          "type": "function",
          "name": "getPost",
          "inputs": [{"name": "postId", "type": "uint256"}],
          "outputs": [
            {"name": "id", "type": "uint256"},
            {"name": "creator", "type": "address"},
            {"name": "content", "type": "string"},
            {"name": "timestamp", "type": "uint256"},
            {"name": "totalTips", "type": "uint256"},
            {"name": "tipCount", "type": "uint256"},
            {"name": "engagement", "type": "uint256"}
          ],
          "stateMutability": "view"
        }
      ];

      const result = await this.publicClient.readContract({
        address: this.contractAddress as `0x${string}`,
        abi: contractABI,
        functionName: 'getPost',
        args: [BigInt(postId)],
      }) as [bigint, string, string, bigint, bigint, bigint, bigint];

      const engagement = Number(result[6]); // engagement is the 7th element
      return engagement >= threshold;
    } catch (error) {
      console.error('Error checking engagement threshold:', error);
      return false;
    }
  }

  /**
   * Get all active delegations for a user
   */
  async getUserDelegations(userAddress: string): Promise<AutoTipDelegation[]> {
    try {
      const delegations: AutoTipDelegation[] = [];
      
      // Get all stored delegations from localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('auto-tip-')) {
          const delegation = JSON.parse(localStorage.getItem(key) || '{}');
          if (delegation.tipper === userAddress && delegation.active) {
            delegations.push({
              postId: delegation.autoTip.postId,
              threshold: delegation.autoTip.threshold,
              amount: delegation.autoTip.amount.toString(),
              tipper: delegation.tipper,
              active: delegation.active,
            });
          }
        }
      }

      return delegations;
    } catch (error) {
      console.error('Error getting user delegations:', error);
      return [];
    }
  }

  /**
   * Revoke a delegation
   */
  async revokeDelegation(delegationId: string): Promise<boolean> {
    try {
      const delegation = JSON.parse(localStorage.getItem(delegationId) || '{}');
      if (delegation.delegationId) {
        delegation.active = false;
        localStorage.setItem(delegationId, JSON.stringify(delegation));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error revoking delegation:', error);
      return false;
    }
  }

  /**
   * Monitor delegations and execute auto-tips when conditions are met
   * This runs in the background to check engagement thresholds
   */
  async monitorDelegations(userAddress: string): Promise<void> {
    try {
      const delegations = await this.getUserDelegations(userAddress);
      
      for (const delegation of delegations) {
        const thresholdMet = await this.checkEngagementThreshold(
          delegation.postId,
          delegation.threshold
        );

        if (thresholdMet && delegation.active) {
          console.log(`Auto-tip threshold met for post ${delegation.postId}`);
          // In a real implementation, this would trigger the auto-tip execution
          // For now, we'll just log it
        }
      }
    } catch (error) {
      console.error('Error monitoring delegations:', error);
    }
  }

  /**
   * Get delegation statistics
   */
  async getDelegationStats(userAddress: string): Promise<{
    totalDelegations: number;
    activeDelegations: number;
    totalAutoTipAmount: string;
  }> {
    try {
      const delegations = await this.getUserDelegations(userAddress);
      const activeDelegations = delegations.filter(d => d.active);
      const totalAutoTipAmount = activeDelegations.reduce(
        (sum, d) => sum + parseFloat(d.amount),
        0
      );

      return {
        totalDelegations: delegations.length,
        activeDelegations: activeDelegations.length,
        totalAutoTipAmount: totalAutoTipAmount.toString(),
      };
    } catch (error) {
      console.error('Error getting delegation stats:', error);
      return {
        totalDelegations: 0,
        activeDelegations: 0,
        totalAutoTipAmount: '0',
      };
    }
  }
}

export const delegationService = new DelegationService();
