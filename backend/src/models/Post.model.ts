import mongoose, { Document, Schema } from 'mongoose';

export interface IPost extends Document {
  postId: string;
  creator: string;
  content: string;
  timestamp: string;
  totalTips: string;
  tipCount: number;
  engagement: number;
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema = new Schema<IPost>({
  postId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  creator: {
    type: String,
    required: true,
    index: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 500
  },
  timestamp: {
    type: String,
    required: true
  },
  totalTips: {
    type: String,
    default: '0'
  },
  tipCount: {
    type: Number,
    default: 0
  },
  engagement: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for better query performance
PostSchema.index({ creator: 1, createdAt: -1 });
PostSchema.index({ totalTips: -1 });
PostSchema.index({ engagement: -1 });

export const Post = mongoose.model<IPost>('Post', PostSchema);
