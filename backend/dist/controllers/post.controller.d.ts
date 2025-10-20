import { BlockchainService } from '../services/blockchain.service';
import { Request, Response, Router } from 'express';
export declare class PostController {
    private blockchainService;
    router: Router;
    constructor(blockchainService: BlockchainService);
    private setupRoutes;
    getPosts(req: Request, res: Response): Promise<void>;
    getPost(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    createPost(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    increaseEngagement(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=post.controller.d.ts.map