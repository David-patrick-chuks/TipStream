import mongoose, { Document, Schema } from 'mongoose';

export interface ITip extends Document {
  postId: string;
  tipper: string;
  creator: string;
  amount: string;
  timestamp: string;
  txHash?: string;
  createdAt: Date;
}

const TipSchema = new Schema<ITip>({
  postId: {
    type: String,
    required: true,
    index: true
  },
  tipper: {
    type: String,
    required: true,
    index: true
  },
  creator: {
    type: String,
    required: true,
    index: true
  },
  amount: {
    type: String,
    required: true
  },
  timestamp: {
    type: String,
    required: true
  },
  txHash: {
    type: String,
    index: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
TipSchema.index({ postId: 1, createdAt: -1 });
TipSchema.index({ tipper: 1, createdAt: -1 });
TipSchema.index({ creator: 1, createdAt: -1 });

export const Tip = mongoose.model<ITip>('Tip', TipSchema);
