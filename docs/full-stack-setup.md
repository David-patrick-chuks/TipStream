# 🚀 Full Stack Setup Guide - Web3 Social Tipping Platform

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- MetaMask wallet
- Monad testnet ETH
- Git

## 🏗️ Project Structure

```
web3-social-tipping/
├── contracts/          # Smart contracts (Foundry)
├── frontend/           # Next.js frontend
├── backend/            # Express.js backend
├── envio/              # Envio indexer
└── docs/               # Documentation
```

## 🔧 Setup Instructions

### 1. Smart Contract Setup

```bash
cd contracts

# Install dependencies
npm install

# Compile contracts
forge build

# Run tests
forge test

# Deploy to Monad testnet
forge script script/Counter.s.sol --rpc-url monad_testnet --broadcast --verify
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your configuration

# Setup database
npx prisma generate
npx prisma db push

# Start development server
npm run dev
```

**Environment Variables (.env):**
```env
PORT=3001
NODE_ENV=development
DATABASE_URL="file:./dev.db"
MONAD_RPC_URL=https://testnet-rpc.monad.xyz
CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Setup environment
echo "NEXT_PUBLIC_API_URL=http://localhost:3001/api" > .env.local

# Start development server
npm run dev
```

### 4. Envio Indexer Setup

```bash
cd envio

# Install dependencies
npm install

# Build indexer
envio build

# Deploy indexer
envio deploy
```

## 🎯 API Endpoints

### Posts
- `GET /api/posts` - Get all posts (with pagination)
- `GET /api/posts/:postId` - Get specific post
- `POST /api/posts` - Create new post
- `PUT /api/posts/:postId/engagement` - Increase engagement

### Tips
- `POST /api/tips/send` - Send tip to post
- `POST /api/tips/auto` - Enable auto-tipping
- `POST /api/tips/execute-auto` - Execute auto-tip
- `GET /api/tips/post/:postId` - Get tips for post
- `GET /api/tips/user/:address` - Get user's tips

### Users
- `GET /api/users/:address` - Get user info
- `GET /api/users/:address/stats` - Get user statistics
- `GET /api/users/:address/posts` - Get user's posts

### Analytics
- `GET /api/analytics/overview` - Platform overview
- `GET /api/analytics/posts` - Post analytics
- `GET /api/analytics/tips` - Tip analytics
- `GET /api/analytics/users` - User analytics
- `GET /api/analytics/trending` - Trending posts

## 🔗 Frontend API Integration

The frontend now uses the real API service instead of mock data:

```typescript
// Example usage
import { apiService } from '@/services/api.service';

// Get posts
const posts = await apiService.getPosts(1, 10);

// Create post
const newPost = await apiService.createPost(content, creator, privateKey);

// Send tip
const tip = await apiService.sendTip(postId, amount, tipper, privateKey);
```

## 🗄️ Database Schema

### Posts Table
- `id` - Primary key
- `postId` - Blockchain post ID
- `creator` - Creator wallet address
- `content` - Post content
- `timestamp` - Blockchain timestamp
- `totalTips` - Total tips received
- `tipCount` - Number of tips
- `engagement` - Engagement score

### Tips Table
- `id` - Primary key
- `postId` - Related post ID
- `tipper` - Tipper wallet address
- `creator` - Creator wallet address
- `amount` - Tip amount
- `timestamp` - Blockchain timestamp
- `txHash` - Transaction hash

### AutoTips Table
- `id` - Primary key
- `postId` - Related post ID
- `tipper` - Tipper wallet address
- `threshold` - Engagement threshold
- `amount` - Auto-tip amount
- `active` - Whether auto-tip is active
- `timestamp` - Blockchain timestamp
- `txHash` - Transaction hash

### Users Table
- `address` - Wallet address (primary key)
- `totalEarnings` - Total earnings
- `postCount` - Number of posts
- `tipCount` - Number of tips received

## 🔄 Data Flow

1. **User creates post** → Frontend → Backend API → Smart Contract → Database
2. **User sends tip** → Frontend → Backend API → Smart Contract → Database
3. **Auto-tip setup** → Frontend → Backend API → Smart Contract → Database
4. **Engagement increase** → Frontend → Backend API → Database
5. **Analytics queries** → Frontend → Backend API → Database

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
cd frontend
npm test
```

### Smart Contract Testing
```bash
cd contracts
forge test
```

## 🚀 Deployment

### Backend Deployment
1. Build the application: `npm run build`
2. Deploy to your preferred platform (Railway, Render, etc.)
3. Set environment variables
4. Run database migrations

### Frontend Deployment
1. Build the application: `npm run build`
2. Deploy to Vercel, Netlify, or similar
3. Set environment variables

### Smart Contract Deployment
1. Deploy to Monad testnet: `forge script --rpc-url monad_testnet --broadcast`
2. Verify contract: `forge verify-contract`
3. Update contract address in backend

## 🔧 Development Workflow

1. **Start Backend**: `cd backend && npm run dev`
2. **Start Frontend**: `cd frontend && npm run dev`
3. **Deploy Contract**: Update contract address in backend
4. **Test Integration**: Use the frontend to test all features
5. **Monitor Logs**: Check backend logs for API calls

## 🐛 Troubleshooting

### Common Issues

1. **API Connection Failed**
   - Check if backend is running on port 3001
   - Verify CORS settings
   - Check environment variables

2. **Database Errors**
   - Run `npx prisma db push` to sync schema
   - Check database file permissions

3. **Blockchain Errors**
   - Verify Monad testnet RPC URL
   - Check contract address
   - Ensure sufficient testnet ETH

4. **Frontend Errors**
   - Check API service configuration
   - Verify environment variables
   - Check browser console for errors

## 📊 Monitoring

### Backend Health Check
```bash
curl http://localhost:3001/health
```

### Database Status
```bash
cd backend
npx prisma studio
```

### API Testing
Use Postman or curl to test API endpoints:

```bash
# Get posts
curl http://localhost:3001/api/posts

# Health check
curl http://localhost:3001/health
```

## 🎯 Next Steps

1. **Deploy Smart Contract** to Monad testnet
2. **Update Contract Address** in backend configuration
3. **Test All Features** end-to-end
4. **Record Demo Video** showcasing the platform
5. **Submit to Hackathon** with all materials

---

**Ready to go!** 🚀 The platform now has a complete backend API that replaces all mock data with real blockchain interactions and database storage.
