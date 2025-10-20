import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  address: string;
  totalEarnings: string;
  postCount: number;
  tipCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  address: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  totalEarnings: {
    type: String,
    default: '0'
  },
  postCount: {
    type: Number,
    default: 0
  },
  tipCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for better query performance
UserSchema.index({ totalEarnings: -1 });
UserSchema.index({ tipCount: -1 });
UserSchema.index({ postCount: -1 });

export const User = mongoose.model<IUser>('User', UserSchema);
