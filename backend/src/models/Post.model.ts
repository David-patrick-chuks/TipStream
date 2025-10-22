import mongoose, { Document, Schema } from 'mongoose';

export interface IPostImage {
  publicId: string;
  url: string;
  width: number;
  height: number;
  format: string;
}

export interface IPost extends Document {
  postId: string;
  creator: string;
  content: string;
  images: IPostImage[];
  timestamp: string;
  totalTips: number;
  tipCount: number;
  engagement: number;
  commentCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const PostImageSchema = new Schema<IPostImage>({
  publicId: { type: String, required: true },
  url: { type: String, required: true },
  width: { type: Number, required: true },
  height: { type: Number, required: true },
  format: { type: String, required: true }
}, { _id: false });

const PostSchema = new Schema<IPost>({
  postId: {
    type: String,
    required: true,
    unique: true
  },
  creator: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 2000
  },
  images: {
    type: [PostImageSchema],
    default: [],
    validate: {
      validator: function(images: IPostImage[]) {
        return images.length <= 4;
      },
      message: 'Maximum 4 images allowed per post'
    }
  },
  timestamp: {
    type: String,
    required: true
  },
  totalTips: {
    type: Number,
    default: 0
  },
  tipCount: {
    type: Number,
    default: 0
  },
  engagement: {
    type: Number,
    default: 0
  },
  commentCount: {
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
PostSchema.index({ createdAt: -1 });

export const Post = mongoose.model<IPost>('Post', PostSchema);
