import { Request, Response, Router } from 'express';
import { Comment, IComment } from '../models/Comment.model';
import { Post } from '../models/Post.model';
import { User } from '../models/User.model';
import { z } from 'zod';

export class CommentController {
  public router: Router;

  constructor() {
    this.router = Router();
    this.setupRoutes();
  }

  private setupRoutes() {
    this.router.post('/:postId', this.createComment.bind(this));
    this.router.get('/:postId', this.getComments.bind(this));
    this.router.post('/:commentId/reply', this.replyToComment.bind(this));
    this.router.put('/:commentId/like', this.likeComment.bind(this));
    this.router.delete('/:commentId', this.deleteComment.bind(this));
  }

  private async createComment(req: Request, res: Response) {
    try {
      const { postId } = req.params;
      const { author, content } = req.body;

      // Validate input
      const schema = z.object({
        author: z.string().min(1),
        content: z.string().min(1).max(1000)
      });

      const validation = schema.safeParse({ author, content });
      if (!validation.success) {
        return res.status(400).json({ 
          error: 'Invalid input', 
          details: validation.error.errors 
        });
      }

      // Check if post exists
      const post = await Post.findOne({ postId });
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }

      // Generate unique comment ID
      const commentId = `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Create comment
      const comment = new Comment({
        commentId,
        postId,
        author,
        content: validation.data.content,
        timestamp: Date.now().toString()
      });

      await comment.save();

      // Update post comment count
      await Post.updateOne(
        { postId },
        { $inc: { commentCount: 1 } }
      );

      res.status(201).json({
        success: true,
        comment: {
          id: comment.commentId,
          postId: comment.postId,
          author: comment.author,
          content: comment.content,
          timestamp: comment.timestamp,
          likes: comment.likes,
          replies: comment.replies
        }
      });
    } catch (error) {
      console.error('Error creating comment:', error);
      res.status(500).json({ error: 'Failed to create comment' });
    }
  }

  private async getComments(req: Request, res: Response) {
    try {
      const { postId } = req.params;
      const { page = 1, limit = 20 } = req.query;

      const skip = (Number(page) - 1) * Number(limit);

      // Get comments for the post
      const comments = await Comment.find({ postId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean();

      // Get user info for each comment author
      const commentsWithUserInfo = await Promise.all(
        comments.map(async (comment) => {
          const user = await User.findOne({ address: comment.author }).lean();
          return {
            id: comment.commentId,
            postId: comment.postId,
            author: comment.author,
            content: comment.content,
            timestamp: comment.timestamp,
            likes: comment.likes,
            replies: comment.replies,
            authorInfo: user ? {
              username: user.username,
              displayName: user.displayName,
              profileImage: user.profileImage
            } : null
          };
        })
      );

      res.json({
        success: true,
        comments: commentsWithUserInfo,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: await Comment.countDocuments({ postId })
        }
      });
    } catch (error) {
      console.error('Error getting comments:', error);
      res.status(500).json({ error: 'Failed to get comments' });
    }
  }

  private async replyToComment(req: Request, res: Response) {
    try {
      const { commentId } = req.params;
      const { author, content } = req.body;

      // Validate input
      const schema = z.object({
        author: z.string().min(1),
        content: z.string().min(1).max(1000)
      });

      const validation = schema.safeParse({ author, content });
      if (!validation.success) {
        return res.status(400).json({ 
          error: 'Invalid input', 
          details: validation.error.errors 
        });
      }

      // Check if parent comment exists
      const parentComment = await Comment.findOne({ commentId });
      if (!parentComment) {
        return res.status(404).json({ error: 'Parent comment not found' });
      }

      // Generate unique reply ID
      const replyId = `reply_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Create reply
      const reply = new Comment({
        commentId: replyId,
        postId: parentComment.postId,
        author,
        content: validation.data.content,
        timestamp: Date.now().toString(),
        parentCommentId: commentId
      });

      await reply.save();

      // Add reply to parent comment
      await Comment.updateOne(
        { commentId },
        { $push: { replies: reply._id } }
      );

      res.status(201).json({
        success: true,
        reply: {
          id: reply.commentId,
          postId: reply.postId,
          author: reply.author,
          content: reply.content,
          timestamp: reply.timestamp,
          likes: reply.likes,
          parentCommentId: reply.parentCommentId
        }
      });
    } catch (error) {
      console.error('Error creating reply:', error);
      res.status(500).json({ error: 'Failed to create reply' });
    }
  }

  private async likeComment(req: Request, res: Response) {
    try {
      const { commentId } = req.params;

      // Check if comment exists
      const comment = await Comment.findOne({ commentId });
      if (!comment) {
        return res.status(404).json({ error: 'Comment not found' });
      }

      // Increment likes
      await Comment.updateOne(
        { commentId },
        { $inc: { likes: 1 } }
      );

      res.json({
        success: true,
        message: 'Comment liked successfully'
      });
    } catch (error) {
      console.error('Error liking comment:', error);
      res.status(500).json({ error: 'Failed to like comment' });
    }
  }

  private async deleteComment(req: Request, res: Response) {
    try {
      const { commentId } = req.params;
      const { author } = req.body;

      // Check if comment exists and user is the author
      const comment = await Comment.findOne({ commentId });
      if (!comment) {
        return res.status(404).json({ error: 'Comment not found' });
      }

      if (comment.author !== author) {
        return res.status(403).json({ error: 'Not authorized to delete this comment' });
      }

      // Delete comment
      await Comment.deleteOne({ commentId });

      // Update post comment count
      await Post.updateOne(
        { postId: comment.postId },
        { $inc: { commentCount: -1 } }
      );

      res.json({
        success: true,
        message: 'Comment deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting comment:', error);
      res.status(500).json({ error: 'Failed to delete comment' });
    }
  }
}
