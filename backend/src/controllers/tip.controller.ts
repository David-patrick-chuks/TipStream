import { Request, Response, Router } from 'express';
import { z } from 'zod';
import { AutoTip } from '../models/AutoTip.model';
import { Post } from '../models/Post.model';
import { Tip } from '../models/Tip.model';
import { User } from '../models/User.model';

const sendTipSchema = z.object({
  postId: z.string(),
  amount: z.string().regex(/^\d+(\.\d+)?$/),
  tipper: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
});

const autoTipSchema = z.object({
  postId: z.string(),
  threshold: z.string(),
  amount: z.string().regex(/^\d+(\.\d+)?$/),
  tipper: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
});

export class TipController {
  public router: Router;

  constructor() {
    this.router = Router();
    this.setupRoutes();
  }

  private setupRoutes() {
    this.router.post('/send', this.sendTip.bind(this));
    this.router.post('/auto', this.enableAutoTip.bind(this));
    this.router.post('/execute-auto', this.executeAutoTip.bind(this));
    this.router.get('/post/:postId', this.getPostTips.bind(this));
    this.router.get('/user/:address', this.getUserTips.bind(this));
  }

  // Send a tip to a post
  async sendTip(req: Request, res: Response) {
    try {
      const { postId, amount, tipper } = sendTipSchema.parse(req.body);
      const txHash = req.headers['x-tx-hash'] as string;

      if (!txHash) {
        return res.status(401).json({ error: 'Transaction hash required' });
      }

      // Verify post exists
      const post = await Post.findOne({ postId });

      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }

      // Prevent self-tipping
      if (tipper.toLowerCase() === post.creator.toLowerCase()) {
        return res.status(400).json({ error: 'You cannot tip your own post' });
      }

      // Create tip record in database with transaction hash
      const tip = new Tip({
        postId,
        tipper,
        creator: post.creator,
        amount: amount, // Store as string, no need to convert
        timestamp: Date.now().toString(),
        txHash,
      });

      await tip.save();

      // Update post stats
      await Post.findOneAndUpdate(
        { postId },
        { 
          $inc: { 
            tipCount: 1,
            totalTips: Number(amount) // Ensure it's a number
          } 
        }
      );

      // Update creator earnings
      await User.findOneAndUpdate(
        { address: post.creator },
        { 
          $inc: { 
            tipCount: 1,
            totalEarnings: Number(amount) // Ensure it's a number
          } 
        },
        { upsert: true, new: true }
      );

      res.json({
        id: (tip._id as any).toString(),
        postId: tip.postId,
        tipper: tip.tipper,
        creator: tip.creator,
        amount: tip.amount,
        timestamp: tip.timestamp,
        txHash: tip.txHash,
      });
    } catch (error) {
      console.error('Error sending tip:', error);
      res.status(500).json({ error: 'Failed to send tip' });
    }
  }

  // Enable auto-tipping for a post
  async enableAutoTip(req: Request, res: Response) {
    try {
      const { postId, threshold, amount, tipper } = autoTipSchema.parse(req.body);
      const txHash = req.headers['x-tx-hash'] as string;

      if (!txHash) {
        return res.status(401).json({ error: 'Transaction hash required' });
      }

      // Verify post exists
      const post = await Post.findOne({ postId });

      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }

      // Prevent self auto-tipping
      if (tipper.toLowerCase() === post.creator.toLowerCase()) {
        return res.status(400).json({ error: 'You cannot set up auto-tips for your own post' });
      }

      // Create auto-tip record in database with transaction hash
      const autoTip = new AutoTip({
        postId,
        tipper,
        threshold,
        amount: amount, // Store as string, no need to convert
        active: true,
        timestamp: Date.now().toString(),
        txHash,
      });

      await autoTip.save();

      res.json({
        id: (autoTip._id as any).toString(),
        postId: autoTip.postId,
        tipper: autoTip.tipper,
        threshold: autoTip.threshold,
        amount: autoTip.amount,
        active: autoTip.active,
        timestamp: autoTip.timestamp,
        txHash: autoTip.txHash,
      });
    } catch (error) {
      console.error('Error enabling auto-tip:', error);
      res.status(500).json({ error: 'Failed to enable auto-tip' });
    }
  }

  // Execute auto-tip when threshold is met
  async executeAutoTip(req: Request, res: Response) {
    try {
      const { postId, autoTipIndex } = req.body;
      const txHash = req.headers['x-tx-hash'] as string;

      if (!txHash) {
        return res.status(400).json({ error: 'Transaction hash required' });
      }

      // Update auto-tip status in database
      const autoTip = await AutoTip.findOne({ postId, active: true })
        .skip(Number(autoTipIndex));

      if (autoTip) {
        autoTip.active = false;
        await autoTip.save();

        // Create tip record for the executed auto-tip
        const post = await Post.findOne({ postId });
        if (post) {
          const tip = new Tip({
            postId,
            tipper: autoTip.tipper,
            creator: post.creator,
            amount: autoTip.amount,
            timestamp: Date.now().toString(),
            txHash,
          });

          await tip.save();

          // Update post stats
          await Post.findOneAndUpdate(
            { postId },
            { 
              $inc: { 
                tipCount: 1,
                totalTips: Number(autoTip.amount) // Ensure it's a number
              } 
            }
          );

          // Update creator earnings
          await User.findOneAndUpdate(
            { address: post.creator },
            { 
              $inc: { 
                tipCount: 1,
                totalEarnings: Number(autoTip.amount) // Ensure it's a number
              } 
            },
            { upsert: true, new: true }
          );
        }
      }

      res.json({
        txHash,
        executed: true,
      });
    } catch (error) {
      console.error('Error executing auto-tip:', error);
      res.status(500).json({ error: 'Failed to execute auto-tip' });
    }
  }

  // Get tips for a specific post
  async getPostTips(req: Request, res: Response) {
    try {
      const { postId } = req.params;

      const tips = await Tip.find({ postId })
        .sort({ createdAt: -1 })
        .lean();

      res.json({
        tips: tips.map(tip => ({
          id: tip._id.toString(),
          tipper: tip.tipper,
          amount: tip.amount,
          timestamp: tip.timestamp,
          txHash: tip.txHash,
        })),
      });
    } catch (error) {
      console.error('Error getting post tips:', error);
      res.status(500).json({ error: 'Failed to get post tips' });
    }
  }

  // Get tips sent by a user
  async getUserTips(req: Request, res: Response) {
    try {
      const { address } = req.params;

      const tips = await Tip.find({ tipper: address })
        .sort({ createdAt: -1 })
        .populate('postId', 'postId content creator', Post)
        .lean();

      res.json({
        tips: tips.map(tip => ({
          id: tip._id.toString(),
          postId: tip.postId,
          creator: tip.creator,
          amount: tip.amount,
          timestamp: tip.timestamp,
          txHash: tip.txHash,
          post: tip.postId,
        })),
      });
    } catch (error) {
      console.error('Error getting user tips:', error);
      res.status(500).json({ error: 'Failed to get user tips' });
    }
  }
}
