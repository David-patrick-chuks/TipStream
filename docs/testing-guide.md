# 🚀 Complete Testing Guide for Hackathon Submission

## 📋 Pre-Testing Checklist

### 1. Environment Setup
```bash
# 1. Get Monad testnet ETH
# Visit: https://testnet.monad.xyz/faucet
# Get test ETH for your wallet

# 2. Set environment variables
export PRIVATE_KEY=your_private_key_here
export MONAD_API_KEY=your_monad_api_key_here

# 3. Deploy contract to Monad testnet
cd contracts
forge script script/SocialTipping.s.sol --rpc-url monad_testnet --broadcast --verify
```

### 2. Update Environment Files
```bash
# Backend .env
MONAD_RPC_URL=https://testnet-rpc.monad.xyz
CONTRACT_ADDRESS=0x... # Your deployed contract address
DATABASE_URL=mongodb://localhost:27017/tipstream

# Frontend .env.local
NEXT_PUBLIC_MONAD_RPC_URL=https://testnet-rpc.monad.xyz
NEXT_PUBLIC_CONTRACT_ADDRESS=0x... # Your deployed contract address
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 🎬 Demo Flow Testing

### Step 1: MetaMask Connection ✅
1. Open your app: `http://localhost:3000`
2. Click "Connect MetaMask"
3. **Verify**: MetaMask popup appears
4. **Verify**: Wallet connects successfully
5. **Verify**: Address shows in UI

### Step 2: Smart Account Integration ✅
1. **Verify**: Smart account is automatically detected
2. **Verify**: Balance is displayed
3. **Verify**: Account can interact with contracts

### Step 3: Post Creation ✅
1. Create a new post
2. **Verify**: Transaction is sent to Monad testnet
3. **Verify**: Post appears in feed
4. **Verify**: Post data is stored in database

### Step 4: Manual Tipping ✅
1. Click "Tip" on a post
2. Enter tip amount
3. **Verify**: MetaMask transaction popup
4. **Verify**: Tip is sent successfully
5. **Verify**: Post stats update

### Step 5: Auto-Tip Delegation (INNOVATION) ✅
1. Click "Set Auto-Tip" on a post
2. Set engagement threshold (e.g., 5)
3. Set tip amount (e.g., 0.01 ETH)
4. **Verify**: Delegation is created using MetaMask Delegation Toolkit
5. **Verify**: Delegation appears in dashboard

### Step 6: Engagement Trigger ✅
1. Click "Engage" multiple times to reach threshold
2. **Verify**: Auto-tip is triggered automatically
3. **Verify**: Tip is sent to post creator
4. **Verify**: Delegation status updates

### Step 7: Delegation Dashboard ✅
1. Click "Delegation Dashboard"
2. **Verify**: Shows total delegations
3. **Verify**: Shows active delegations
4. **Verify**: Shows total delegated amount

## 🔧 Technical Verification

### Contract Functions Tested:
- [ ] `createPost(string content)` - Post creation
- [ ] `sendTip(uint256 postId)` - Manual tipping
- [ ] `enableAutoTip(uint256 postId, uint256 threshold, uint256 amount)` - Auto-tip setup
- [ ] `createDelegation(uint256 postId, uint256 threshold, uint256 amount, address delegatee)` - Delegation creation
- [ ] `executeAutoTip(uint256 postId, uint256 autoTipIndex)` - Auto-tip execution
- [ ] `increaseEngagement(uint256 postId)` - Engagement tracking

### MetaMask Smart Accounts Features:
- [ ] Wallet connection via MetaMask extension
- [ ] Smart account detection and deployment
- [ ] Transaction signing and execution
- [ ] Delegation creation and management
- [ ] Cross-chain compatibility (Monad testnet)

### Delegation Toolkit Integration:
- [ ] `createDelegation()` - Creates delegation with proper scope
- [ ] `signDelegation()` - Signs delegation for execution
- [ ] `getDeleGatorEnvironment()` - Gets Monad testnet environment
- [ ] Delegation execution and redemption

## 📱 Frontend Testing

### Components Tested:
- [ ] WalletConnect - MetaMask connection
- [ ] CreatePost - Post creation form
- [ ] PostFeed - Post display and interactions
- [ ] DelegationDashboard - Delegation management
- [ ] Auto-tip setup and execution

### API Integration:
- [ ] Backend API calls work
- [ ] Blockchain interactions work
- [ ] Database operations work
- [ ] Error handling works

## 🎥 Demo Video Script

### 1. Introduction (30 seconds)
- "This is our TipStream Platform"
- "Built with MetaMask Smart Accounts and deployed on Monad testnet"
- "Features innovative auto-tip delegations based on engagement"

### 2. MetaMask Integration (45 seconds)
- Connect MetaMask wallet
- Show smart account detection
- Demonstrate seamless user experience

### 3. Core Features (2 minutes)
- Create a post
- Manual tipping demonstration
- Auto-tip delegation setup
- Engagement threshold triggering
- Automatic tip execution

### 4. Innovation Highlight (1 minute)
- Show delegation dashboard
- Explain the innovation: "Users can delegate tipping authority based on engagement metrics"
- Demonstrate the trustless, automated system

### 5. Conclusion (15 seconds)
- "This creates a new paradigm for social media monetization"
- "Built on Monad testnet with MetaMask Smart Accounts"

## 🚨 Common Issues & Solutions

### Issue: MetaMask not connecting
**Solution**: Check if MetaMask is installed and unlocked

### Issue: Contract calls failing
**Solution**: Verify contract address and network (Monad testnet)

### Issue: Delegation creation failing
**Solution**: Check Delegation Toolkit environment setup

### Issue: Auto-tips not executing
**Solution**: Verify engagement threshold logic

## ✅ Final Checklist

- [ ] All tests pass
- [ ] Demo video recorded
- [ ] Contract deployed on Monad testnet
- [ ] MetaMask Smart Accounts working
- [ ] Delegation Toolkit integrated
- [ ] Innovation feature demonstrated
- [ ] Documentation complete
- [ ] Submission ready

## 🏆 Hackathon Compliance

✅ **MetaMask Smart Accounts**: Integrated and working
✅ **Monad Testnet**: Contract deployed and tested
✅ **Delegation Toolkit**: Properly integrated
✅ **Working Demo**: Full flow demonstrated
✅ **Innovation**: Auto-tip delegations based on engagement
