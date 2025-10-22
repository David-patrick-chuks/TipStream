import mongoose, { Document, Schema } from 'mongoose';

export interface IComment extends Document {
  commentId: string;
  postId: string;
  author: string;
  content: string;
  timestamp: string;
  likes: number;
  replies: IComment[];
  parentCommentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>({
  commentId: {
    type: String,
    required: true,
    unique: true
  },
  postId: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 1000
  },
  timestamp: {
    type: String,
    required: true
  },
  likes: {
    type: Number,
    default: 0
  },
  replies: [{
    type: Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  parentCommentId: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Indexes for better query performance
CommentSchema.index({ postId: 1, createdAt: -1 });
CommentSchema.index({ author: 1, createdAt: -1 });
CommentSchema.index({ parentCommentId: 1 });

export const Comment = mongoose.model<IComment>('Comment', CommentSchema);
