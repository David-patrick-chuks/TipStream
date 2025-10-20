import mongoose, { Document, Schema } from 'mongoose';

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

const AutoTipSchema = new Schema<IAutoTip>({
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
  threshold: {
    type: String,
    required: true
  },
  amount: {
    type: String,
    required: true
  },
  active: {
    type: Boolean,
    default: true,
    index: true
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
AutoTipSchema.index({ postId: 1, active: 1 });
AutoTipSchema.index({ tipper: 1, createdAt: -1 });

export const AutoTip = mongoose.model<IAutoTip>('AutoTip', AutoTipSchema);
