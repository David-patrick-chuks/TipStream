"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsController = void 0;
const express_1 = require("express");
const Post_model_1 = require("../models/Post.model");
const Tip_model_1 = require("../models/Tip.model");
const User_model_1 = require("../models/User.model");
class AnalyticsController {
    constructor() {
        this.router = (0, express_1.Router)();
        this.setupRoutes();
    }
    setupRoutes() {
        this.router.get('/overview', this.getOverview.bind(this));
        this.router.get('/posts', this.getPostAnalytics.bind(this));
        this.router.get('/tips', this.getTipAnalytics.bind(this));
        this.router.get('/users', this.getUserAnalytics.bind(this));
        this.router.get('/trending', this.getTrendingPosts.bind(this));
    }
    // Get platform overview analytics
    async getOverview(req, res) {
        try {
            const [totalPosts, totalTips, totalUsers, totalEarnings, recentActivity,] = await Promise.all([
                Post_model_1.Post.countDocuments(),
                Tip_model_1.Tip.countDocuments(),
                User_model_1.User.countDocuments(),
                User_model_1.User.aggregate([
                    { $group: { _id: null, total: { $sum: { $toDouble: '$totalEarnings' } } } }
                ]),
                Tip_model_1.Tip.find()
                    .sort({ createdAt: -1 })
                    .limit(5)
                    .populate('postId', 'postId content', Post_model_1.Post)
                    .lean(),
            ]);
            res.json({
                overview: {
                    totalPosts,
                    totalTips,
                    totalUsers,
                    totalEarnings: totalEarnings[0]?.total?.toString() || '0',
                },
                recentActivity: recentActivity.map(tip => ({
                    id: tip._id.toString(),
                    postId: tip.postId,
                    tipper: tip.tipper,
                    amount: tip.amount,
                    timestamp: tip.timestamp,
                    post: tip.postId,
                })),
            });
        }
        catch (error) {
            console.error('Error getting overview analytics:', error);
            res.status(500).json({ error: 'Failed to get overview analytics' });
        }
    }
    // Get post analytics
    async getPostAnalytics(req, res) {
        try {
            const { timeframe = '7d' } = req.query;
            // Calculate date range based on timeframe
            const now = new Date();
            const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 1;
            const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
            const [postsByDay, topPosts, engagementStats,] = await Promise.all([
                Post_model_1.Post.aggregate([
                    { $match: { createdAt: { $gte: startDate } } },
                    { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
                    { $sort: { _id: 1 } }
                ]),
                Post_model_1.Post.find()
                    .sort({ totalTips: -1 })
                    .limit(10)
                    .populate('creator', 'address', User_model_1.User)
                    .lean(),
                Post_model_1.Post.aggregate([
                    { $group: { _id: null, avg: { $avg: '$engagement' }, max: { $max: '$engagement' }, total: { $sum: '$engagement' } } }
                ]),
            ]);
            res.json({
                postsByDay: postsByDay.map(day => ({
                    date: day._id,
                    count: day.count,
                })),
                topPosts: topPosts.map(post => ({
                    id: post.postId,
                    content: post.content.substring(0, 100) + '...',
                    creator: post.creator,
                    totalTips: post.totalTips,
                    tipCount: post.tipCount,
                    engagement: post.engagement,
                })),
                engagementStats: {
                    average: engagementStats[0]?.avg || 0,
                    maximum: engagementStats[0]?.max || 0,
                    total: engagementStats[0]?.total || 0,
                },
            });
        }
        catch (error) {
            console.error('Error getting post analytics:', error);
            res.status(500).json({ error: 'Failed to get post analytics' });
        }
    }
    // Get tip analytics
    async getTipAnalytics(req, res) {
        try {
            const { timeframe = '7d' } = req.query;
            const now = new Date();
            const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 1;
            const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
            const [tipsByDay, topTippers, tipStats,] = await Promise.all([
                Tip_model_1.Tip.aggregate([
                    { $match: { createdAt: { $gte: startDate } } },
                    { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 }, totalAmount: { $sum: { $toDouble: '$amount' } } } },
                    { $sort: { _id: 1 } }
                ]),
                Tip_model_1.Tip.aggregate([
                    { $group: { _id: '$tipper', tipCount: { $sum: 1 }, totalAmount: { $sum: { $toDouble: '$amount' } } } },
                    { $sort: { totalAmount: -1 } },
                    { $limit: 10 }
                ]),
                Tip_model_1.Tip.aggregate([
                    { $group: { _id: null, avg: { $avg: { $toDouble: '$amount' } }, max: { $max: { $toDouble: '$amount' } }, total: { $sum: { $toDouble: '$amount' } }, count: { $sum: 1 } } }
                ]),
            ]);
            res.json({
                tipsByDay: tipsByDay.map(day => ({
                    date: day._id,
                    count: day.count,
                    totalAmount: day.totalAmount.toString(),
                })),
                topTippers: topTippers.map(tipper => ({
                    address: tipper._id,
                    tipCount: tipper.tipCount,
                    totalAmount: tipper.totalAmount.toString(),
                })),
                tipStats: {
                    average: tipStats[0]?.avg?.toString() || '0',
                    maximum: tipStats[0]?.max?.toString() || '0',
                    total: tipStats[0]?.total?.toString() || '0',
                    count: tipStats[0]?.count || 0,
                },
            });
        }
        catch (error) {
            console.error('Error getting tip analytics:', error);
            res.status(500).json({ error: 'Failed to get tip analytics' });
        }
    }
    // Get user analytics
    async getUserAnalytics(req, res) {
        try {
            const [topCreators, activeUsers, userGrowth,] = await Promise.all([
                User_model_1.User.find()
                    .sort({ totalEarnings: -1 })
                    .limit(10)
                    .select('address totalEarnings postCount tipCount')
                    .lean(),
                User_model_1.User.find()
                    .sort({ tipCount: -1 })
                    .limit(10)
                    .select('address tipCount postCount')
                    .lean(),
                User_model_1.User.aggregate([
                    { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
                    { $sort: { _id: 1 } }
                ]),
            ]);
            res.json({
                topCreators: topCreators.map(creator => ({
                    address: creator.address,
                    totalEarnings: creator.totalEarnings,
                    postCount: creator.postCount,
                    tipCount: creator.tipCount,
                })),
                activeUsers: activeUsers.map(user => ({
                    address: user.address,
                    tipCount: user.tipCount,
                    postCount: user.postCount,
                })),
                userGrowth: userGrowth.map(day => ({
                    date: day._id,
                    count: day.count,
                })),
            });
        }
        catch (error) {
            console.error('Error getting user analytics:', error);
            res.status(500).json({ error: 'Failed to get user analytics' });
        }
    }
    // Get trending posts
    async getTrendingPosts(req, res) {
        try {
            const { timeframe = '24h' } = req.query;
            const now = new Date();
            const hours = timeframe === '24h' ? 24 : timeframe === '7d' ? 168 : 1;
            const startDate = new Date(now.getTime() - hours * 60 * 60 * 1000);
            const trendingPosts = await Post_model_1.Post.find({
                createdAt: { $gte: startDate },
            })
                .sort({ engagement: -1, totalTips: -1 })
                .limit(20)
                .populate('creator', 'address totalEarnings', User_model_1.User)
                .lean();
            res.json({
                trendingPosts: trendingPosts.map(post => ({
                    id: post.postId,
                    content: post.content,
                    creator: post.creator,
                    timestamp: post.timestamp,
                    totalTips: post.totalTips,
                    tipCount: post.tipCount,
                    engagement: post.engagement,
                    creatorStats: post.creator,
                })),
            });
        }
        catch (error) {
            console.error('Error getting trending posts:', error);
            res.status(500).json({ error: 'Failed to get trending posts' });
        }
    }
}
exports.AnalyticsController = AnalyticsController;
//# sourceMappingURL=analytics.controller.js.map