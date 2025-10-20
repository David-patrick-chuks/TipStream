import { Request, Response, Router } from 'express';
export declare class AnalyticsController {
    router: Router;
    constructor();
    private setupRoutes;
    getOverview(req: Request, res: Response): Promise<void>;
    getPostAnalytics(req: Request, res: Response): Promise<void>;
    getTipAnalytics(req: Request, res: Response): Promise<void>;
    getUserAnalytics(req: Request, res: Response): Promise<void>;
    getTrendingPosts(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=analytics.controller.d.ts.map