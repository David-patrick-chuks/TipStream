import { Request, Response, Router } from 'express';
export declare class UserController {
    router: Router;
    constructor();
    private setupRoutes;
    getUser(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getUserStats(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getUserPosts(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=user.controller.d.ts.map