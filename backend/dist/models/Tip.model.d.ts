import mongoose, { Document } from 'mongoose';
export interface ITip extends Document {
    postId: string;
    tipper: string;
    creator: string;
    amount: string;
    timestamp: string;
    txHash?: string;
    createdAt: Date;
}
export declare const Tip: mongoose.Model<ITip, {}, {}, {}, mongoose.Document<unknown, {}, ITip, {}, {}> & ITip & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Tip.model.d.ts.map