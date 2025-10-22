import mongoose, { Document } from 'mongoose';
export interface IPost extends Document {
    postId: string;
    creator: string;
    content: string;
    timestamp: string;
    totalTips: number;
    tipCount: number;
    engagement: number;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Post: mongoose.Model<IPost, {}, {}, {}, mongoose.Document<unknown, {}, IPost, {}, {}> & IPost & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Post.model.d.ts.map