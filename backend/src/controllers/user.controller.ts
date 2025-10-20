import { Post } from '../models/Post.model';
import { User } from '../models/User.model';
import { Request, Response, Router } from 'express';

export class UserController {
  public router: Router;

  constructor() {
    this.router = Router();
    this.setupRoutes();
  }

  private setupRoutes() {
    this.router.get('/:address', this.getUser.bind(this));
    this.router.get('/:address/stats', this.getUserStats.bind(this));
    this.router.get('/:address/posts', this.getUserPosts.bind(this));
  }

  // Get user information
  async getUser(req: Request, res: Response) {
    try {
      const { address } = req.params;

      const user = await User.findOne({ address })
        .lean();

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Get recent posts and stats
      const [recentPosts, stats] = await Promise.all([
        Post.find({ creator: address })
          .sort({ createdAt: -1 })
          .limit(10)
          .lean(),
        Post.aggregate([
          { $match: { creator: address } },
          { $group: { _id: null, postCount: { $sum: 1 } } }
        ])
      ]);

      res.json({
        address: user.address,
        totalEarnings: user.totalEarnings,
        postCount: user.postCount,
        tipCount: user.tipCount,
        createdAt: user.createdAt,
        recentPosts: recentPosts.map(post => ({
          id: post.postId,
          content: post.content,
          timestamp: post.timestamp,
          totalTips: post.totalTips,
          tipCount: post.tipCount,
          engagement: post.engagement,
        })),
        stats: {
          posts: stats[0]?.postCount || 0,
          tips: user.tipCount,
          autoTips: 0, // Would need to implement this
        },
      });
    } catch (error) {
      console.error('Error getting user:', error);
      res.status(500).json({ error: 'Failed to get user' });
    }
  }

  // Get user statistics
  async getUserStats(req: Request, res: Response) {
    try {
      const { address } = req.params;

      const stats = await User.findOne({ address })
        .select('totalEarnings postCount tipCount')
        .lean();

      if (!stats) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        totalEarnings: stats.totalEarnings,
        postCount: stats.postCount,
        tipCount: stats.tipCount,
      });
    } catch (error) {
      console.error('Error getting user stats:', error);
      res.status(500).json({ error: 'Failed to get user stats' });
    }
  }

  // Get user's posts
  async getUserPosts(req: Request, res: Response) {
    try {
      const { address } = req.params;
      const { page = '1', limit = '10' } = req.query;

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      const posts = await Post.find({ creator: address })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean();

      const total = await Post.countDocuments({ creator: address });

      res.json({
        posts: posts.map(post => ({
          id: post.postId,
          content: post.content,
          timestamp: post.timestamp,
          totalTips: post.totalTips,
          tipCount: post.tipCount,
          engagement: post.engagement,
        })),
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      });
    } catch (error) {
      console.error('Error getting user posts:', error);
      res.status(500).json({ error: 'Failed to get user posts' });
    }
  }
}
