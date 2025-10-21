import { createDelegation, getDeleGatorEnvironment } from '@metamask/delegation-toolkit';
import { createPublicClient, http, parseEther, PublicClient } from 'viem';
import { monadTestnet } from 'viem/chains';

export interface SmartAccountInfo {
  address: string;
  isDeployed: boolean;
  balance: string;
}

export class MetaMaskSmartAccountService {
  private publicClient: PublicClient;
  private contractAddress: string;
  private connectedAddress: string | null = null;

  constructor() {
    this.contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000';
    
    // Initialize public client for Monad testnet
    this.publicClient = createPublicClient({
      chain: monadTestnet,
      transport: http(process.env.NEXT_PUBLIC_MONAD_RPC_URL || 'https://testnet-rpc.monad.xyz'),
    });
  }

  /**
   * Connect to MetaMask and get account info
   */
  async connect(): Promise<SmartAccountInfo> {
    try {
      // Check if MetaMask is available
      if (typeof window === 'undefined' || !(window as unknown as { ethereum?: unknown }).ethereum) {
        throw new Error('MetaMask not found');
      }

      // Request account access
      const accounts = await (window as unknown as { ethereum: { request: (params: unknown) => Promise<unknown> } }).ethereum.request({
        method: 'eth_requestAccounts',
      });

      const address = (accounts as string[])[0];
      if (!address) {
        throw new Error('No account found');
      }

      this.connectedAddress = address;
      
      // Check if smart account is deployed (for now, treat as regular account)
      const isDeployed = false; // MetaMask Smart Accounts are automatically deployed
      
      // Get balance
      const balance = await this.publicClient.getBalance({
        address: address as `0x${string}`,
      });

      return {
        address,
        isDeployed,
        balance: balance.toString(),
      };
    } catch (error) {
      console.error('Error connecting to MetaMask:', error);
      throw new Error('Failed to connect to MetaMask');
    }
  }

  /**
   * Create a delegation for auto-tipping
   */
  async createAutoTipDelegation(
    postId: string,
    threshold: number,
    amount: string,
    delegateeAddress: string
  ): Promise<{ delegationId: string; delegation: unknown }> {
    try {
      if (!this.connectedAddress) {
        throw new Error('No account connected');
      }

      // Get delegation environment for Monad testnet
      const environment = getDeleGatorEnvironment(monadTestnet.id);
      
      // Create delegation with native token transfer scope
      const delegation = createDelegation({
        from: this.connectedAddress as `0x${string}`,
        to: delegateeAddress as `0x${string}`,
        environment,
        scope: {
          type: "nativeTokenTransferAmount",
          maxAmount: parseEther(amount),
        },
      });

      // Store delegation locally
      const delegationId = `auto-tip-${postId}-${Date.now()}`;
      localStorage.setItem(delegationId, JSON.stringify({
        delegationId,
        postId,
        threshold,
        amount,
        userAddress: this.connectedAddress,
        delegateeAddress,
        createdAt: Date.now(),
        active: true,
        delegation: delegation,
      }));

      return {
        delegationId,
        delegation: delegation,
      };
    } catch (error) {
      console.error('Error creating auto-tip delegation:', error);
      throw new Error('Failed to create auto-tip delegation');
    }
  }

  /**
   * Execute a transaction
   */
  async executeTransaction(
    to: string,
    value: string,
    data: string
  ): Promise<string> {
    try {
      if (!this.connectedAddress) {
        throw new Error('No account connected');
      }

      // Send transaction through MetaMask
      const hash = await (window as unknown as { ethereum: { request: (params: unknown) => Promise<unknown> } }).ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: this.connectedAddress,
          to: to,
          value: `0x${parseEther(value).toString(16)}`,
          data: data,
        }],
      });

      return hash as string;
    } catch (error) {
      console.error('Error executing transaction:', error);
      throw new Error('Failed to execute transaction');
    }
  }

  /**
   * Disconnect from MetaMask
   */
  async disconnect(): Promise<void> {
    try {
      this.connectedAddress = null;
    } catch (error) {
      console.error('Error disconnecting from MetaMask:', error);
    }
  }

  /**
   * Get user's delegations
   */
  async getUserDelegations(userAddress: string): Promise<unknown[]> {
    try {
      const delegations: unknown[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('auto-tip-')) {
          const delegation = JSON.parse(localStorage.getItem(key) || '{}');
          if (delegation.userAddress === userAddress && delegation.active) {
            delegations.push(delegation);
          }
        }
      }

      return delegations;
    } catch (error) {
      console.error('Error getting user delegations:', error);
      return [];
    }
  }
}

export const metaMaskSmartAccountService = new MetaMaskSmartAccountService();