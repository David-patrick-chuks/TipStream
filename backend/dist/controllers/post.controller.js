"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostController = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const Post_model_1 = require("../models/Post.model");
const User_model_1 = require("../models/User.model");
const createPostSchema = zod_1.z.object({
    content: zod_1.z.string().min(1).max(500),
    creator: zod_1.z.string().regex(/^0x[a-fA-F0-9]{40}$/),
});
const getPostsSchema = zod_1.z.object({
    page: zod_1.z.string().optional().default('1'),
    limit: zod_1.z.string().optional().default('10'),
});
class PostController {
    constructor() {
        this.router = (0, express_1.Router)();
        this.setupRoutes();
    }
    setupRoutes() {
        this.router.get('/', this.getPosts.bind(this));
        this.router.get('/:postId', this.getPost.bind(this));
        this.router.post('/', this.createPost.bind(this));
        this.router.put('/:postId/engagement', this.increaseEngagement.bind(this));
    }
    // Get all posts with pagination
    async getPosts(req, res) {
        try {
            const { page, limit } = getPostsSchema.parse(req.query);
            const pageNum = parseInt(page);
            const limitNum = parseInt(limit);
            const skip = (pageNum - 1) * limitNum;
            const posts = await Post_model_1.Post.find()
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum)
                .lean();
            const total = await Post_model_1.Post.countDocuments();
            // Get creator stats for all unique creators
            const uniqueCreators = [...new Set(posts.map(post => post.creator))];
            const creatorStats = await User_model_1.User.find({ address: { $in: uniqueCreators } })
                .select('address totalEarnings postCount')
                .lean();
            // Create a map for quick lookup
            const creatorStatsMap = new Map(creatorStats.map(creator => [creator.address, creator]));
            res.json({
                posts: posts.map(post => ({
                    id: post.postId,
                    creator: post.creator,
                    content: post.content,
                    timestamp: post.timestamp,
                    totalTips: post.totalTips,
                    tipCount: post.tipCount,
                    engagement: post.engagement,
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
        }
        catch (error) {
            console.error('Error getting posts:', error);
            res.status(500).json({ error: 'Failed to get posts' });
        }
    }
    // Get a specific post
    async getPost(req, res) {
        try {
            const { postId } = req.params;
            const post = await Post_model_1.Post.findOne({ postId }).lean();
            if (!post) {
                return res.status(404).json({ error: 'Post not found' });
            }
            // Get creator stats
            const creatorStats = await User_model_1.User.findOne({ address: post.creator })
                .select('address totalEarnings postCount')
                .lean();
            // Get recent tips and active auto-tips
            const [recentTips, activeAutoTips] = await Promise.all([
                Post_model_1.Post.aggregate([
                    { $match: { postId } },
                    { $lookup: { from: 'tips', localField: 'postId', foreignField: 'postId', as: 'tips' } },
                    { $unwind: '$tips' },
                    { $sort: { 'tips.createdAt': -1 } },
                    { $limit: 10 },
                    { $project: { 'tips._id': 1, 'tips.tipper': 1, 'tips.amount': 1, 'tips.timestamp': 1 } }
                ]),
                Post_model_1.Post.aggregate([
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
        }
        catch (error) {
            console.error('Error getting post:', error);
            res.status(500).json({ error: 'Failed to get post' });
        }
    }
    // Create a new post
    async createPost(req, res) {
        try {
            const { content, creator } = createPostSchema.parse(req.body);
            const txHash = req.headers['x-tx-hash'];
            // Use the transaction hash from MetaMask signing
            const finalTxHash = txHash || 'demo-tx-hash';
            // Generate unique post ID
            const postId = Date.now().toString();
            // Create post in database
            const post = new Post_model_1.Post({
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
            await User_model_1.User.findOneAndUpdate({ address: creator }, { $inc: { postCount: 1 } }, { upsert: true, new: true });
            res.json({
                id: post.postId,
                creator: post.creator,
                content: post.content,
                timestamp: post.timestamp,
                txHash: finalTxHash,
            });
        }
        catch (error) {
            console.error('Error creating post:', error);
            res.status(500).json({ error: 'Failed to create post' });
        }
    }
    // Increase engagement for a post
    async increaseEngagement(req, res) {
        try {
            const { postId } = req.params;
            const post = await Post_model_1.Post.findOneAndUpdate({ postId }, { $inc: { engagement: 1 } }, { new: true });
            if (!post) {
                return res.status(404).json({ error: 'Post not found' });
            }
            res.json({
                id: post.postId,
                engagement: post.engagement,
            });
        }
        catch (error) {
            console.error('Error increasing engagement:', error);
            res.status(500).json({ error: 'Failed to increase engagement' });
        }
    }
}
exports.PostController = PostController;
//# sourceMappingURL=post.controller.js.map