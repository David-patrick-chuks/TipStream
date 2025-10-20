"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockchainService = void 0;
const viem_1 = require("viem");
const accounts_1 = require("viem/accounts");
const chains_1 = require("viem/chains");
class BlockchainService {
    constructor() {
        // Initialize Viem clients for Monad testnet
        this.publicClient = (0, viem_1.createPublicClient)({
            chain: chains_1.monadTestnet,
            transport: (0, viem_1.http)(process.env.MONAD_RPC_URL || 'https://testnet-rpc.monad.xyz'),
        });
        // Contract ABI (simplified for our SocialTipping contract)
        this.contractABI = [
            {
                "type": "function",
                "name": "createPost",
                "inputs": [{ "name": "content", "type": "string" }],
                "outputs": [],
                "stateMutability": "nonpayable"
            },
            {
                "type": "function",
                "name": "sendTip",
                "inputs": [{ "name": "postId", "type": "uint256" }],
                "outputs": [],
                "stateMutability": "payable"
            },
            {
                "type": "function",
                "name": "enableAutoTip",
                "inputs": [
                    { "name": "postId", "type": "uint256" },
                    { "name": "threshold", "type": "uint256" },
                    { "name": "amount", "type": "uint256" }
                ],
                "outputs": [],
                "stateMutability": "payable"
            },
            {
                "type": "function",
                "name": "executeAutoTip",
                "inputs": [
                    { "name": "postId", "type": "uint256" },
                    { "name": "autoTipIndex", "type": "uint256" }
                ],
                "outputs": [],
                "stateMutability": "nonpayable"
            },
            {
                "type": "function",
                "name": "getPost",
                "inputs": [{ "name": "postId", "type": "uint256" }],
                "outputs": [
                    { "name": "id", "type": "uint256" },
                    { "name": "creator", "type": "address" },
                    { "name": "content", "type": "string" },
                    { "name": "timestamp", "type": "uint256" },
                    { "name": "totalTips", "type": "uint256" },
                    { "name": "tipCount", "type": "uint256" },
                    { "name": "engagement", "type": "uint256" }
                ],
                "stateMutability": "view"
            },
            {
                "type": "event",
                "name": "PostCreated",
                "inputs": [
                    { "name": "postId", "type": "uint256", "indexed": true },
                    { "name": "creator", "type": "address", "indexed": true },
                    { "name": "content", "type": "string", "indexed": false },
                    { "name": "timestamp", "type": "uint256", "indexed": false }
                ]
            },
            {
                "type": "event",
                "name": "TipSent",
                "inputs": [
                    { "name": "postId", "type": "uint256", "indexed": true },
                    { "name": "tipper", "type": "address", "indexed": true },
                    { "name": "creator", "type": "address", "indexed": true },
                    { "name": "amount", "type": "uint256", "indexed": false }
                ]
            },
            {
                "type": "event",
                "name": "AutoTipEnabled",
                "inputs": [
                    { "name": "postId", "type": "uint256", "indexed": true },
                    { "name": "tipper", "type": "address", "indexed": true },
                    { "name": "threshold", "type": "uint256", "indexed": false },
                    { "name": "amount", "type": "uint256", "indexed": false }
                ]
            },
            {
                "type": "event",
                "name": "AutoTipExecuted",
                "inputs": [
                    { "name": "postId", "type": "uint256", "indexed": true },
                    { "name": "tipper", "type": "address", "indexed": true },
                    { "name": "creator", "type": "address", "indexed": true },
                    { "name": "amount", "type": "uint256", "indexed": false }
                ]
            }
        ];
        this.contractAddress = process.env.CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000';
    }
    // Create a new post
    async createPost(content, privateKey) {
        try {
            const account = (0, accounts_1.privateKeyToAccount)(privateKey);
            const walletClient = (0, viem_1.createWalletClient)({
                account,
                chain: chains_1.monadTestnet,
                transport: (0, viem_1.http)(process.env.MONAD_RPC_URL || 'https://testnet-rpc.monad.xyz'),
            });
            const hash = await walletClient.writeContract({
                address: this.contractAddress,
                abi: this.contractABI,
                functionName: 'createPost',
                args: [content],
            });
            return hash;
        }
        catch (error) {
            console.error('Error creating post:', error);
            throw new Error('Failed to create post on blockchain');
        }
    }
    // Send a tip to a post
    async sendTip(postId, amount, privateKey) {
        try {
            const account = (0, accounts_1.privateKeyToAccount)(privateKey);
            const walletClient = (0, viem_1.createWalletClient)({
                account,
                chain: chains_1.monadTestnet,
                transport: (0, viem_1.http)(process.env.MONAD_RPC_URL || 'https://testnet-rpc.monad.xyz'),
            });
            const hash = await walletClient.writeContract({
                address: this.contractAddress,
                abi: this.contractABI,
                functionName: 'sendTip',
                args: [postId],
                value: (0, viem_1.parseEther)(amount),
            });
            return hash;
        }
        catch (error) {
            console.error('Error sending tip:', error);
            throw new Error('Failed to send tip on blockchain');
        }
    }
    // Enable auto-tipping
    async enableAutoTip(postId, threshold, amount, privateKey) {
        try {
            const account = (0, accounts_1.privateKeyToAccount)(privateKey);
            const walletClient = (0, viem_1.createWalletClient)({
                account,
                chain: chains_1.monadTestnet,
                transport: (0, viem_1.http)(process.env.MONAD_RPC_URL || 'https://testnet-rpc.monad.xyz'),
            });
            const hash = await walletClient.writeContract({
                address: this.contractAddress,
                abi: this.contractABI,
                functionName: 'enableAutoTip',
                args: [postId, threshold, (0, viem_1.parseEther)(amount)],
                value: (0, viem_1.parseEther)(amount),
            });
            return hash;
        }
        catch (error) {
            console.error('Error enabling auto-tip:', error);
            throw new Error('Failed to enable auto-tip on blockchain');
        }
    }
    // Execute auto-tip
    async executeAutoTip(postId, autoTipIndex, privateKey) {
        try {
            const account = (0, accounts_1.privateKeyToAccount)(privateKey);
            const walletClient = (0, viem_1.createWalletClient)({
                account,
                chain: chains_1.monadTestnet,
                transport: (0, viem_1.http)(process.env.MONAD_RPC_URL || 'https://testnet-rpc.monad.xyz'),
            });
            const hash = await walletClient.writeContract({
                address: this.contractAddress,
                abi: this.contractABI,
                functionName: 'executeAutoTip',
                args: [postId, autoTipIndex],
            });
            return hash;
        }
        catch (error) {
            console.error('Error executing auto-tip:', error);
            throw new Error('Failed to execute auto-tip on blockchain');
        }
    }
    // Get post data from blockchain
    async getPost(postId) {
        try {
            const result = await this.publicClient.readContract({
                address: this.contractAddress,
                abi: this.contractABI,
                functionName: 'getPost',
                args: [postId],
            });
            return {
                id: result[0],
                creator: result[1],
                content: result[2],
                timestamp: result[3],
                totalTips: result[4],
                tipCount: result[5],
                engagement: result[6],
            };
        }
        catch (error) {
            console.error('Error getting post:', error);
            throw new Error('Failed to get post from blockchain');
        }
    }
    // Get contract events
    async getEvents(eventName, fromBlock, toBlock) {
        try {
            const events = await this.publicClient.getLogs({
                address: this.contractAddress,
                event: this.contractABI.find(abi => abi.name === eventName),
                fromBlock,
                toBlock,
            });
            return events;
        }
        catch (error) {
            console.error('Error getting events:', error);
            throw new Error('Failed to get events from blockchain');
        }
    }
    // Format ether values
    formatEther(value) {
        return (0, viem_1.formatEther)(value);
    }
    // Parse ether values
    parseEther(value) {
        return (0, viem_1.parseEther)(value);
    }
}
exports.BlockchainService = BlockchainService;
//# sourceMappingURL=blockchain.service.js.map