"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const analytics_controller_1 = require("./controllers/analytics.controller");
const post_controller_1 = require("./controllers/post.controller");
const tip_controller_1 = require("./controllers/tip.controller");
const user_controller_1 = require("./controllers/user.controller");
const database_service_1 = require("./services/database.service");
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
exports.app = app;
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-tx-hash']
}));
app.use((0, morgan_1.default)('combined'));
app.use(express_1.default.json());
// Controllers
const postController = new post_controller_1.PostController();
const tipController = new tip_controller_1.TipController();
const userController = new user_controller_1.UserController();
const analyticsController = new analytics_controller_1.AnalyticsController();
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
        database: database_service_1.databaseService.getConnectionStatus() ? 'Connected' : 'Disconnected'
    });
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});
// Start server
const PORT = process.env.PORT || 3001;
const startServer = async () => {
    try {
        // Connect to database
        await database_service_1.databaseService.connect();
        // Start server
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📊 Health check: http://localhost:${PORT}/health`);
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};
startServer();
// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('Shutting down gracefully...');
    await database_service_1.databaseService.disconnect();
    process.exit(0);
});
//# sourceMappingURL=index.js.map