import { createDelegation, getDeleGatorEnvironment } from '@metamask/delegation-toolkit';
import { createPublicClient, encodeFunctionData, http, parseEther, PublicClient } from 'viem';
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
  private contractABI: Array<{
    type: string;
    name: string;
    inputs: Array<{ name: string; type: string }>;
    outputs: Array<unknown>;
    stateMutability: string;
  }>;

  constructor() {
    this.contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000';
    // Contract ABI (same as backend)
    this.contractABI = [
      {
        "type": "function",
        "name": "createPost",
        "inputs": [{"name": "content", "type": "string"}],
        "outputs": [],
        "stateMutability": "nonpayable"
      },
      {
        "type": "function",
        "name": "sendTip",
        "inputs": [{"name": "postId", "type": "uint256"}],
        "outputs": [],
        "stateMutability": "payable"
      },
      {
        "type": "function",
        "name": "enableAutoTip",
        "inputs": [
          {"name": "postId", "type": "uint256"},
          {"name": "threshold", "type": "uint256"},
          {"name": "amount", "type": "uint256"}
        ],
        "outputs": [],
        "stateMutability": "payable"
      }
    ];
    
    // Initialize public client for local blockchain (Anvil)
    this.publicClient = createPublicClient({
      chain: {
        id: 31337, // Anvil default chain ID
        name: 'Anvil',
        nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
        rpcUrls: {
          default: { http: [process.env.NEXT_PUBLIC_MONAD_RPC_URL || 'http://127.0.0.1:8545'] },
        },
      },
      transport: http(process.env.NEXT_PUBLIC_MONAD_RPC_URL || 'http://127.0.0.1:8545'),
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
   * Execute a transaction through MetaMask Smart Account
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

      // Send transaction through MetaMask Smart Account
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
   * Execute a contract call through MetaMask Smart Account
   */
  async executeContractCall(
    contractAddress: string,
    functionName: string,
    args: unknown[],
    value?: string
  ): Promise<string> {
    try {
      if (!this.connectedAddress) {
        throw new Error('No account connected');
      }

      // For now, we'll use a simple approach
      // In a real Smart Account implementation, this would be more complex
      const data = '0x'; // This would be the encoded function call data

      return await this.executeTransaction(
        contractAddress,
        value || '0',
        data
      );
    } catch (error) {
      console.error('Error executing contract call:', error);
      throw new Error('Failed to execute contract call');
    }
  }

  /**
   * Get the MetaMask provider specifically
   */
  private getMetaMaskProvider() {
    if (typeof window === 'undefined') {
      throw new Error('Window not available');
    }

    // Check if MetaMask is available
    const ethereum = (window as unknown as { ethereum?: any }).ethereum;
    if (!ethereum) {
      throw new Error('No Ethereum provider found');
    }

    // If there are multiple providers, find MetaMask specifically
    if (ethereum.providers && Array.isArray(ethereum.providers)) {
      const metamaskProvider = ethereum.providers.find((provider: any) => provider.isMetaMask);
      if (metamaskProvider) {
        return metamaskProvider;
      }
    }

    // If it's MetaMask directly
    if (ethereum.isMetaMask) {
      return ethereum;
    }

    throw new Error('MetaMask not found. Please install MetaMask and disable other wallet extensions.');
  }

  /**
   * Sign and send a transaction using MetaMask
   * This is the proper way to interact with MetaMask Smart Accounts
   */
  async signAndSendTransaction(
    to: string,
    data: string,
    value: string = '0'
  ): Promise<string> {
    try {
      // Get the specific MetaMask provider
      const metamaskProvider = this.getMetaMaskProvider();

      // Get current connected account from MetaMask specifically
      const accounts = await metamaskProvider.request({
        method: 'eth_accounts',
      });

      const fromAddress = (accounts as string[])[0];
      if (!fromAddress) {
        throw new Error('No account connected to MetaMask');
      }

      // Request transaction through MetaMask specifically
      console.log('Sending transaction with params:', {
        from: fromAddress,
        to: to,
        value: `0x${BigInt(value).toString(16)}`, // Convert to hex string
        data: data,
      });

      const txHash = await metamaskProvider.request({
        method: 'eth_sendTransaction',
        params: [{
          from: fromAddress,
          to: to,
          value: `0x${BigInt(value).toString(16)}`, // Convert to hex string
          data: data,
        }],
      });

      return txHash as string;
    } catch (error) {
      console.error('Error signing transaction:', error);
      throw new Error('Failed to sign transaction');
    }
  }

  /**
   * Create a post transaction using MetaMask signing
   */
  async createPostTransaction(content: string): Promise<string> {
    try {
      // Get the specific MetaMask provider
      const metamaskProvider = this.getMetaMaskProvider();

      // Get current connected account from MetaMask specifically
      const accounts = await metamaskProvider.request({
        method: 'eth_accounts',
      });

      const address = (accounts as string[])[0];
      if (!address) {
        throw new Error('No account connected to MetaMask');
      }

      // Encode the createPost function call
      const data = encodeFunctionData({
        abi: this.contractABI,
        functionName: 'createPost',
        args: [content],
      });

      return await this.signAndSendTransaction(this.contractAddress, data);
    } catch (error) {
      console.error('Error creating post transaction:', error);
      throw new Error('Failed to create post transaction');
    }
  }

  /**
   * Send a tip transaction using MetaMask signing
   */
  async sendTipTransaction(postId: string, amount: string): Promise<string> {
    try {
      // Get the specific MetaMask provider
      const metamaskProvider = this.getMetaMaskProvider();

      // Get current connected account from MetaMask specifically
      const accounts = await metamaskProvider.request({
        method: 'eth_accounts',
      });

      const address = (accounts as string[])[0];
      if (!address) {
        throw new Error('No account connected to MetaMask');
      }

      // Convert ETH amount to wei
      const valueInWei = parseEther(amount).toString();

      // Encode the sendTip function call
      const data = encodeFunctionData({
        abi: this.contractABI,
        functionName: 'sendTip',
        args: [BigInt(postId)],
      });

      return await this.signAndSendTransaction(this.contractAddress, data, valueInWei);
    } catch (error) {
      console.error('Error sending tip transaction:', error);
      throw new Error('Failed to send tip transaction');
    }
  }

  /**
   * Enable auto-tip transaction using MetaMask signing
   */
  async enableAutoTipTransaction(postId: string, threshold: number, amount: string): Promise<string> {
    try {
      // Get the specific MetaMask provider
      const metamaskProvider = this.getMetaMaskProvider();

      // Get current connected account from MetaMask specifically
      const accounts = await metamaskProvider.request({
        method: 'eth_accounts',
      });

      const address = (accounts as string[])[0];
      if (!address) {
        throw new Error('No account connected to MetaMask');
      }

      // Convert ETH amount to wei
      const valueInWei = parseEther(amount).toString();

      // Encode the enableAutoTip function call
      const data = encodeFunctionData({
        abi: this.contractABI,
        functionName: 'enableAutoTip',
        args: [BigInt(postId), BigInt(threshold), parseEther(amount)],
      });

      return await this.signAndSendTransaction(this.contractAddress, data, valueInWei);
    } catch (error) {
      console.error('Error enabling auto-tip transaction:', error);
      throw new Error('Failed to enable auto-tip transaction');
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