# TipStream Platform

A decentralized social media platform built on Monad with MetaMask Smart Accounts, featuring automated tipping and real-time analytics.



## 🚀 Features

### Core Features
- **Smart Tipping**: Send tips directly to content creators using MetaMask Smart Accounts
- **Auto-Tipping**: Set up automatic tips based on engagement thresholds
- **Real-time Analytics**: Track earnings and engagement with real-time data
- **Gasless Transactions**: Powered by MetaMask Smart Accounts

### Innovation Highlights
- **Delegation Innovation**: Users can delegate "tipping permissions" for automated engagement-based tipping
- **Farcaster Mini App**: Deployable as a Farcaster Mini App for social integration

## 🛠 Tech Stack

### Smart Contracts
- **Solidity** ^0.8.13
- **Foundry** for development and testing
- **Monad Testnet** for deployment

### Frontend
- **Next.js** 15.5.6 with TypeScript
- **Tailwind CSS** for styling
- **MetaMask SDK** for wallet integration
- **Viem** for blockchain interactions

### Backend
- **Express.js** with TypeScript
- **MongoDB** with Mongoose
- **Viem** for blockchain interactions

## 📁 Project Structure

```
tipstream/
├── contracts/          # Smart contracts (Foundry)
│   ├── src/
│   │   └── SocialTipping.sol # Main contract
│   ├── script/
│   │   └── SocialTipping.sol # Deployment script
│   └── foundry.toml    # Foundry configuration
├── frontend/           # Next.js frontend
│   ├── app/
│   ├── components/
│   └── services/
├── backend/            # Express.js backend
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   └── services/
│   └── package.json
└── docs/               # Documentation
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Foundry
- MetaMask wallet
- Monad testnet ETH

### 1. Smart Contract Setup

```bash
cd contracts
forge build
forge test
```

### 2. Deploy to Monad Testnet

```bash
# Set your private key
export PRIVATE_KEY="your-private-key"

# Deploy contract
forge script script/SocialTipping.sol --rpc-url monad_testnet --broadcast --verify
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## 🔧 Smart Contract Functions

### Core Functions
- `createPost(string content)`: Create a new post
- `sendTip(uint256 postId)`: Send a tip to a post
- `enableAutoTip(uint256 postId, uint256 threshold, uint256 amount)`: Set up auto-tipping
- `executeAutoTip(uint256 postId, uint256 autoTipIndex)`: Execute auto-tip when threshold met

### Events (for external integrations)
- `PostCreated`: New post created
- `TipSent`: Tip sent to creator
- `AutoTipEnabled`: Auto-tip setup
- `AutoTipExecuted`: Auto-tip executed
- `DelegationCreated`: Delegation setup
- `DelegationRevoked`: Delegation revoked

## 📊 Backend API

The platform provides REST APIs for:
- Post management and retrieval
- Tip processing and history
- User statistics and analytics
- Delegation management

## 🎨 Frontend Components

- **WalletConnect**: MetaMask Smart Account connection
- **CreatePost**: Post creation interface
- **PostFeed**: Display posts with tipping functionality
- **TipInterface**: Manual and auto-tip setup

## 🏆 Hackathon Track & Bonuses

- **Track**: Best Consumer Application 
- **Bonuses**:
  - Most Innovative Use of Delegations 
  - Best Farcaster Mini App 

-Built for MetaMask Smart Accounts x Monad Dev Cook-Off Hackathon
