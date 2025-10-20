import { Post } from '../models/Post.model';
import { User } from '../models/User.model';
import { BlockchainService } from '../services/blockchain.service';
import { Request, Response, Router } from 'express';
import { z } from 'zod';

const createPostSchema = z.object({
  content: z.string().min(1).max(500),
  creator: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
});

const getPostsSchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('10'),
});

export class PostController {
  public router: Router;

  constructor(private blockchainService: BlockchainService) {
    this.router = Router();
    this.setupRoutes();
  }

  private setupRoutes() {
    this.router.get('/', this.getPosts.bind(this));
    this.router.get('/:postId', this.getPost.bind(this));
    this.router.post('/', this.createPost.bind(this));
    this.router.put('/:postId/engagement', this.increaseEngagement.bind(this));
  }

  // Get all posts with pagination
  async getPosts(req: Request, res: Response) {
    try {
      const { page, limit } = getPostsSchema.parse(req.query);
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      const posts = await Post.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('creator', 'address totalEarnings postCount', User)
        .lean();

      const total = await Post.countDocuments();

      res.json({
        posts: posts.map(post => ({
          id: post.postId,
          creator: post.creator,
          content: post.content,
          timestamp: post.timestamp,
          totalTips: post.totalTips,
          tipCount: post.tipCount,
          engagement: post.engagement,
          creatorStats: post.creator,
        })),
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      });
    } catch (error) {
      console.error('Error getting posts:', error);
      res.status(500).json({ error: 'Failed to get posts' });
    }
  }

  // Get a specific post
  async getPost(req: Request, res: Response) {
    try {
      const { postId } = req.params;

      const post = await Post.findOne({ postId })
        .populate('creator', 'address totalEarnings postCount', User)
        .lean();

      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }

      // Get recent tips and active auto-tips
      const [recentTips, activeAutoTips] = await Promise.all([
        Post.aggregate([
          { $match: { postId } },
          { $lookup: { from: 'tips', localField: 'postId', foreignField: 'postId', as: 'tips' } },
          { $unwind: '$tips' },
          { $sort: { 'tips.createdAt': -1 } },
          { $limit: 10 },
          { $project: { 'tips._id': 1, 'tips.tipper': 1, 'tips.amount': 1, 'tips.timestamp': 1 } }
        ]),
        Post.aggregate([
          { $match: { postId } },
          { $lookup: { from: 'autotips', localField: 'postId', foreignField: 'postId', as: 'autoTips' } },
          { $unwind: '$autoTips' },
          { $match: { 'autoTips.active': true } },
          { $project: { 'autoTips._id': 1, 'autoTips.tipper': 1, 'autoTips.threshold': 1, 'autoTips.amount': 1 } }
        ])
      ]);

      res.json({
        id: post.postId,
        creator: post.creator,
        content: post.content,
        timestamp: post.timestamp,
        totalTips: post.totalTips,
        tipCount: post.tipCount,
        engagement: post.engagement,
        creatorStats: post.creator,
        recentTips: recentTips.map(item => item.tips),
        activeAutoTips: activeAutoTips.map(item => item.autoTips),
      });
    } catch (error) {
      console.error('Error getting post:', error);
      res.status(500).json({ error: 'Failed to get post' });
    }
  }

  // Create a new post
  async createPost(req: Request, res: Response) {
    try {
      const { content, creator } = createPostSchema.parse(req.body);
      const privateKey = req.headers['x-private-key'] as string;

      if (!privateKey) {
        return res.status(401).json({ error: 'Private key required' });
      }

      // Create post on blockchain
      const txHash = await this.blockchainService.createPost(content, privateKey);

      // Generate unique post ID
      const postId = Date.now().toString();

      // Create post in database
      const post = new Post({
        postId,
        creator,
        content,
        timestamp: Date.now().toString(),
        totalTips: '0',
        tipCount: 0,
        engagement: 0,
      });

      await post.save();

      // Update user stats
      await User.findOneAndUpdate(
        { address: creator },
        { $inc: { postCount: 1 } },
        { upsert: true, new: true }
      );

      res.json({
        id: post.postId,
        creator: post.creator,
        content: post.content,
        timestamp: post.timestamp,
        txHash,
      });
    } catch (error) {
      console.error('Error creating post:', error);
      res.status(500).json({ error: 'Failed to create post' });
    }
  }

  // Increase engagement for a post
  async increaseEngagement(req: Request, res: Response) {
    try {
      const { postId } = req.params;

      const post = await Post.findOneAndUpdate(
        { postId },
        { $inc: { engagement: 1 } },
        { new: true }
      );

      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }

      res.json({
        id: post.postId,
        engagement: post.engagement,
      });
    } catch (error) {
      console.error('Error increasing engagement:', error);
      res.status(500).json({ error: 'Failed to increase engagement' });
    }
  }
}
