import mongoose, { Document } from 'mongoose';
export interface IAutoTip extends Document {
    postId: string;
    tipper: string;
    threshold: string;
    amount: string;
    active: boolean;
    timestamp: string;
    txHash?: string;
    createdAt: Date;
}
export declare const AutoTip: mongoose.Model<IAutoTip, {}, {}, {}, mongoose.Document<unknown, {}, IAutoTip, {}, {}> & IAutoTip & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=AutoTip.model.d.ts.map