import { Request, Response, Router } from 'express';
import { z } from 'zod';
import { Post } from '../models/Post.model';
import { User } from '../models/User.model';
import CloudinaryService from '../services/cloudinary.service';

const createPostSchema = z.object({
  content: z.string().min(1).max(2000),
  creator: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
});

const getPostsSchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('10'),
});

export class PostController {
  public router: Router;

  constructor() {
    this.router = Router();
    this.setupRoutes();
  }

  private setupRoutes() {
    this.router.get('/', this.getPosts.bind(this));
    this.router.get('/:postId', this.getPost.bind(this));
    this.router.post('/', this.createPost.bind(this));
    this.router.post('/with-images', this.createPostWithImages.bind(this));
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
        .lean();

      const total = await Post.countDocuments();

      // Get creator stats for all unique creators
      const uniqueCreators = [...new Set(posts.map(post => post.creator))];
      const creatorStats = await User.find({ address: { $in: uniqueCreators } })
        .select('address totalEarnings postCount')
        .lean();

      // Create a map for quick lookup
      const creatorStatsMap = new Map(
        creatorStats.map(creator => [creator.address, creator])
      );

      res.json({
        posts: posts.map(post => ({
          id: post.postId,
          creator: post.creator,
          content: post.content,
          images: post.images || [],
          timestamp: post.timestamp,
          totalTips: post.totalTips,
          tipCount: post.tipCount,
          engagement: post.engagement,
          commentCount: post.commentCount || 0,
          creatorStats: creatorStatsMap.get(post.creator) || {
            address: post.creator,
            totalEarnings: '0',
            postCount: 0
          },
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

      const post = await Post.findOne({ postId }).lean();

      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }

      // Get creator stats
      const creatorStats = await User.findOne({ address: post.creator })
        .select('address totalEarnings postCount')
        .lean();

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
        creatorStats: creatorStats || {
          address: post.creator,
          totalEarnings: '0',
          postCount: 0
        },
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
      const txHash = req.headers['x-tx-hash'] as string;

      // Use the transaction hash from MetaMask signing
      const finalTxHash = txHash || 'demo-tx-hash';

      // Generate unique post ID
      const postId = Date.now().toString();

      // Create post in database
      const post = new Post({
        postId,
        creator,
        content,
        timestamp: Date.now().toString(),
        totalTips: 0,
        tipCount: 0,
        engagement: 0,
        commentCount: 0,
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
        images: post.images || [],
        timestamp: post.timestamp,
        txHash: finalTxHash,
      });
    } catch (error) {
      console.error('Error creating post:', error);
      res.status(500).json({ error: 'Failed to create post' });
    }
  }

  // Create a new post with images
  async createPostWithImages(req: Request, res: Response) {
    try {
      const { content, creator } = createPostSchema.parse(req.body);
      const txHash = req.headers['x-tx-hash'] as string;

      // Check if files were uploaded
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | Express.Multer.File[] | undefined;
      
      if (!files) {
        return res.status(400).json({ error: 'No files uploaded' });
      }

      // Handle single file or multiple files
      const fileArray = Array.isArray(files) ? files : Object.values(files).flat();
      
      if (fileArray.length > 4) {
        return res.status(400).json({ error: 'Maximum 4 images allowed per post' });
      }

      // Validate files - check for empty files
      const validFiles = fileArray.filter(file => {
        if (!file || !file.buffer || file.buffer.length === 0) {
          console.log('Invalid file detected:', file);
          return false;
        }
        return true;
      });

      if (validFiles.length === 0) {
        return res.status(400).json({ error: 'No valid files uploaded' });
      }

      // Upload images to Cloudinary
      const uploadedImages = await CloudinaryService.uploadImages(validFiles, 'tipstream/posts');

      // Use the transaction hash from MetaMask signing
      const finalTxHash = txHash || 'demo-tx-hash';

      // Generate unique post ID
      const postId = Date.now().toString();

      // Create post in database with images
      const post = new Post({
        postId,
        creator,
        content,
        images: uploadedImages.map(img => ({
          publicId: img.public_id,
          url: img.secure_url,
          width: img.width,
          height: img.height,
          format: img.format
        })),
        timestamp: Date.now().toString(),
        totalTips: 0,
        tipCount: 0,
        engagement: 0,
        commentCount: 0,
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
        images: post.images,
        timestamp: post.timestamp,
        txHash: finalTxHash,
      });
    } catch (error) {
      console.error('Error creating post with images:', error);
      res.status(500).json({ error: 'Failed to create post with images' });
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
