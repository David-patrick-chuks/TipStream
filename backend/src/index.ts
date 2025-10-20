import { AnalyticsController } from './controllers/analytics.controller';
import { PostController } from './controllers/post.controller';
import { TipController } from './controllers/tip.controller';
import { UserController } from './controllers/user.controller';
import { BlockchainService } from './services/blockchain.service';
import { databaseService } from './services/database.service';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

// Load environment variables
dotenv.config();

const app = express();
const blockchainService = new BlockchainService();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Controllers
const postController = new PostController(blockchainService);
const tipController = new TipController(blockchainService);
const userController = new UserController();
const analyticsController = new AnalyticsController();

// Routes
app.use('/api/posts', postController.router);
app.use('/api/tips', tipController.router);
app.use('/api/users', userController.router);
app.use('/api/analytics', analyticsController.router);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: databaseService.getConnectionStatus() ? 'Connected' : 'Disconnected'
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 3001;

const startServer = async () => {
  try {
    // Connect to database
    await databaseService.connect();
    
    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await databaseService.disconnect();
  process.exit(0);
});

export { app };
