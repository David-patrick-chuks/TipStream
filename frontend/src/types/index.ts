export interface Post {
  id: string;
  creator: string;
  content: string;
  timestamp: string;
  totalTips: string;
  tipCount: number;
  engagement: number;
  creatorStats?: {
    address: string;
    totalEarnings: string;
    postCount: number;
  };
  tipStats?: {
    tips: number;
    autoTips: number;
  };
}

export interface AutoTip {
  id: string;
  postId: string;
  tipper: string;
  threshold: string;
  amount: string;
  active: boolean;
  timestamp: string;
  txHash?: string;
}

export interface Tip {
  id: string;
  postId: string;
  tipper: string;
  creator: string;
  amount: string;
  timestamp: string;
  txHash?: string;
}

export interface User {
  address: string;
  totalEarnings: string;
  postCount: number;
  tipCount: number;
  createdAt: string;
  recentPosts: Post[];
  stats: {
    posts: number;
    tips: number;
    autoTips: number;
  };
}
