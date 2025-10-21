# MetaMask Smart Accounts Integration Guide

## 🎯 Hackathon Requirements Checklist

- [x] MetaMask Smart Accounts integration
- [x] Delegation Toolkit SDK usage  
- [x] Monad testnet deployment
- [x] Working demo flow

## 🚀 Quick Start for Testing

### 1. Deploy to Monad Testnet
```bash
# Set your private key (get testnet ETH first)
export PRIVATE_KEY=your_private_key_here
export MONAD_API_KEY=your_monad_api_key_here

# Deploy contract
chmod +x scripts/deploy-to-monad.sh
./scripts/deploy-to-monad.sh
```

### 2. Update Environment Variables
```bash
# Backend .env
MONAD_RPC_URL=https://testnet-rpc.monad.xyz
CONTRACT_ADDRESS=0x... # Your deployed address

# Frontend .env.local  
NEXT_PUBLIC_MONAD_RPC_URL=https://testnet-rpc.monad.xyz
NEXT_PUBLIC_CONTRACT_ADDRESS=0x... # Your deployed address
```

### 3. Test MetaMask Smart Accounts Integration
```bash
# Start backend
cd backend && npm run dev

# Start frontend
cd frontend && npm run dev
```

## 🔧 MetaMask Smart Accounts Features

### Core Integration Points:
1. **Wallet Connection** - MetaMask extension integration
2. **Smart Account Creation** - Automatic smart account setup
3. **Delegation System** - Auto-tip delegations based on engagement
4. **Cross-Chain Support** - Monad testnet + delegation framework

### Demo Flow:
1. User connects MetaMask wallet
2. Smart account is automatically created/deployed
3. User creates post
4. User sets up auto-tip delegation
5. Engagement triggers automatic tipping
6. Delegation system executes tips

## 📱 Testing Checklist

- [ ] MetaMask wallet connection works
- [ ] Smart account creation/deployment
- [ ] Post creation functionality
- [ ] Manual tipping works
- [ ] Auto-tip delegation setup
- [ ] Engagement threshold monitoring
- [ ] Automatic tip execution
- [ ] Delegation dashboard shows stats

## 🎬 Demo Script

1. **Connect Wallet**: Show MetaMask connection
2. **Create Post**: Demonstrate post creation
3. **Set Auto-Tip**: Show delegation setup with engagement threshold
4. **Trigger Engagement**: Increase engagement to meet threshold
5. **Auto-Execution**: Show automatic tip execution
6. **Dashboard**: Display delegation statistics

## 🔗 Important Links

- [Monad Testnet Faucet](https://testnet.monad.xyz/faucet)
- [Monad Testnet Explorer](https://testnet.monadscan.com/)
- [MetaMask Delegation Toolkit](https://docs.metamask.io/delegation-toolkit/)
- [Monad Documentation](https://docs.monad.xyz/)
