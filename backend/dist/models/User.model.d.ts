import mongoose, { Document } from 'mongoose';
export interface IUser extends Document {
    address: string;
    totalEarnings: number;
    postCount: number;
    tipCount: number;
    createdAt: Date;
    updatedAt: Date;
}
export declare const User: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, {}> & IUser & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=User.model.d.ts.map