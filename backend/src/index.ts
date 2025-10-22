import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import fileUpload from 'express-fileupload';
import helmet from 'helmet';
import morgan from 'morgan';
import { AnalyticsController } from './controllers/analytics.controller';
import { CommentController } from './controllers/comment.controller';
import { PostController } from './controllers/post.controller';
import { TipController } from './controllers/tip.controller';
import { UserController } from './controllers/user.controller';
import { databaseService } from './services/database.service';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-tx-hash']
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(fileUpload({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  abortOnLimit: true,
  responseOnLimit: 'File size limit has been reached',
  uploadTimeout: 60000, // 60 seconds
}));

// Controllers
const postController = new PostController();
const tipController = new TipController();
const userController = new UserController();
const commentController = new CommentController();
const analyticsController = new AnalyticsController();

// Routes
app.use('/api/posts', postController.router);
app.use('/api/tips', tipController.router);
app.use('/api/users', userController.router);
app.use('/api/comments', commentController.router);
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

