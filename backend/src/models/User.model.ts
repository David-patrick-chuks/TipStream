import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  address: string;
  username: string;
  displayName: string;
  bio: string;
  profileImage: string;
  totalEarnings: number;
  postCount: number;
  tipCount: number;
  followerCount: number;
  followingCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  address: {
    type: String,
    required: true,
    unique: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: 3,
    maxlength: 30,
    match: /^[a-zA-Z0-9_]+$/
  },
  displayName: {
    type: String,
    required: true,
    maxlength: 50
  },
  bio: {
    type: String,
    maxlength: 500,
    default: ''
  },
  profileImage: {
    type: String,
    default: ''
  },
  totalEarnings: {
    type: Number,
    default: 0
  },
  postCount: {
    type: Number,
    default: 0
  },
  tipCount: {
    type: Number,
    default: 0
  },
  followerCount: {
    type: Number,
    default: 0
  },
  followingCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for better query performance
UserSchema.index({ username: 1 });
UserSchema.index({ address: 1 });
UserSchema.index({ totalEarnings: -1 });
UserSchema.index({ tipCount: -1 });
UserSchema.index({ postCount: -1 });

export const User = mongoose.model<IUser>('User', UserSchema);
