import { Request, Response, Router } from 'express';
import { z } from 'zod';
import { Post } from '../models/Post.model';
import { User } from '../models/User.model';
import CloudinaryService from '../services/cloudinary.service';

const createProfileSchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/),
  displayName: z.string().min(1).max(50),
  bio: z.string().max(500).optional().default(''),
});

const updateProfileSchema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/).optional(),
  displayName: z.string().min(1).max(50).optional(),
  bio: z.string().max(500).optional(),
});

export class UserController {
  public router: Router;

  constructor() {
    this.router = Router();
    this.setupRoutes();
  }

  private setupRoutes() {
    this.router.get('/:address', this.getUser.bind(this));
    this.router.get('/:address/profile', this.getUserProfile.bind(this));
    this.router.get('/:address/posts', this.getUserPosts.bind(this));
    this.router.post('/create-profile', this.createProfile.bind(this));
    this.router.put('/:address/profile', this.updateProfile.bind(this));
    this.router.post('/:address/profile-image', this.updateProfileImage.bind(this));
    this.router.get('/username/:username/check', this.checkUsernameAvailability.bind(this));
  }

  // Get user information
  async getUser(req: Request, res: Response) {
    try {
      const { address } = req.params;

      const user = await User.findOne({ address }).lean();

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        address: user.address,
        username: user.username,
        displayName: user.displayName,
        bio: user.bio,
        profileImage: user.profileImage,
        totalEarnings: user.totalEarnings,
        postCount: user.postCount,
        tipCount: user.tipCount,
        followerCount: user.followerCount,
        followingCount: user.followingCount,
        createdAt: user.createdAt,
      });
    } catch (error) {
      console.error('Error getting user:', error);
      res.status(500).json({ error: 'Failed to get user' });
    }
  }

  // Get user profile with posts
  async getUserProfile(req: Request, res: Response) {
    try {
      const { address } = req.params;
      const { page = '1', limit = '10' } = req.query;

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      const user = await User.findOne({ address }).lean();

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Get user's posts
      const posts = await Post.find({ creator: address })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean();

      const totalPosts = await Post.countDocuments({ creator: address });

      res.json({
        profile: {
          address: user.address,
          username: user.username,
          displayName: user.displayName,
          bio: user.bio,
          profileImage: user.profileImage,
          totalEarnings: user.totalEarnings,
          postCount: user.postCount,
          tipCount: user.tipCount,
          followerCount: user.followerCount,
          followingCount: user.followingCount,
          createdAt: user.createdAt,
        },
        posts: posts.map(post => ({
          id: post.postId,
          content: post.content,
          images: post.images || [],
          timestamp: post.timestamp,
          totalTips: post.totalTips,
          tipCount: post.tipCount,
          engagement: post.engagement,
          commentCount: post.commentCount || 0,
        })),
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: totalPosts,
          pages: Math.ceil(totalPosts / limitNum),
        },
      });
    } catch (error) {
      console.error('Error getting user profile:', error);
      res.status(500).json({ error: 'Failed to get user profile' });
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
          images: post.images || [],
          timestamp: post.timestamp,
          totalTips: post.totalTips,
          tipCount: post.tipCount,
          engagement: post.engagement,
          commentCount: post.commentCount || 0,
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

  // Create user profile
  async createProfile(req: Request, res: Response) {
    try {
      const validation = createProfileSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          error: 'Invalid input', 
          details: validation.error.errors 
        });
      }

      const { address, username, displayName, bio } = validation.data;

      // Check if user already exists
      const existingUser = await User.findOne({ address });
      if (existingUser) {
        return res.status(400).json({ error: 'User profile already exists' });
      }

      // Check if username is available
      const existingUsername = await User.findOne({ username });
      if (existingUsername) {
        return res.status(400).json({ error: 'Username already taken' });
      }

      // Create user profile
      const user = new User({
        address,
        username,
        displayName,
        bio,
        totalEarnings: 0,
        postCount: 0,
        tipCount: 0,
        followerCount: 0,
        followingCount: 0,
      });

      await user.save();

      res.status(201).json({
        success: true,
        profile: {
          address: user.address,
          username: user.username,
          displayName: user.displayName,
          bio: user.bio,
          profileImage: user.profileImage,
          totalEarnings: user.totalEarnings,
          postCount: user.postCount,
          tipCount: user.tipCount,
          followerCount: user.followerCount,
          followingCount: user.followingCount,
          createdAt: user.createdAt,
        }
      });
    } catch (error) {
      console.error('Error creating profile:', error);
      res.status(500).json({ error: 'Failed to create profile' });
    }
  }

  // Update user profile
  async updateProfile(req: Request, res: Response) {
    try {
      const { address } = req.params;
      const validation = updateProfileSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          error: 'Invalid input', 
          details: validation.error.errors 
        });
      }

      const updateData = validation.data;

      // Check if username is available (if being updated)
      if (updateData.username) {
        const existingUsername = await User.findOne({ 
          username: updateData.username,
          address: { $ne: address }
        });
        if (existingUsername) {
          return res.status(400).json({ error: 'Username already taken' });
        }
      }

      // Update user profile
      const user = await User.findOneAndUpdate(
        { address },
        { $set: updateData },
        { new: true, runValidators: true }
      );

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        success: true,
        profile: {
          address: user.address,
          username: user.username,
          displayName: user.displayName,
          bio: user.bio,
          profileImage: user.profileImage,
          totalEarnings: user.totalEarnings,
          postCount: user.postCount,
          tipCount: user.tipCount,
          followerCount: user.followerCount,
          followingCount: user.followingCount,
          updatedAt: user.updatedAt,
        }
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  }

  // Update profile image
  async updateProfileImage(req: Request, res: Response) {
    try {
      const { address } = req.params;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ error: 'No image uploaded' });
      }

      // Upload image to Cloudinary
      const uploadedImage = await CloudinaryService.uploadImage(file, 'tipstream/profiles');

      // Update user profile image
      const user = await User.findOneAndUpdate(
        { address },
        { $set: { profileImage: uploadedImage.secure_url } },
        { new: true }
      );

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        success: true,
        profileImage: uploadedImage.secure_url
      });
    } catch (error) {
      console.error('Error updating profile image:', error);
      res.status(500).json({ error: 'Failed to update profile image' });
    }
  }

  // Check username availability
  async checkUsernameAvailability(req: Request, res: Response) {
    try {
      const { username } = req.params;

      const existingUser = await User.findOne({ username }).lean();

      res.json({
        available: !existingUser,
        username
      });
    } catch (error) {
      console.error('Error checking username:', error);
      res.status(500).json({ error: 'Failed to check username availability' });
    }
  }
}
