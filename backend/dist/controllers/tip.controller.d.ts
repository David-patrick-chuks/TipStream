import { Request, Response, Router } from 'express';
export declare class TipController {
    router: Router;
    constructor();
    private setupRoutes;
    sendTip(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    enableAutoTip(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    executeAutoTip(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getPostTips(req: Request, res: Response): Promise<void>;
    getUserTips(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=tip.controller.d.ts.map