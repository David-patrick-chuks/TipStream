export interface PostImage {
  publicId: string;
  url: string;
  width: number;
  height: number;
  format: string;
}

export interface Post {
  id: string;
  creator: string;
  content: string;
  images: PostImage[];
  timestamp: string;
  totalTips: number;
  tipCount: number;
  engagement: number;
  commentCount: number;
  creatorStats?: {
    address: string;
    totalEarnings: number;
    postCount: number;
  };
  tipStats?: {
    tips: number;
    autoTips: number;
  };
}

export interface Comment {
  id: string;
  postId: string;
  author: string;
  content: string;
  timestamp: string;
  likes: number;
  replies: Comment[];
  parentCommentId?: string;
  authorInfo?: {
    username: string;
    displayName: string;
    profileImage: string;
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
  username: string;
  displayName: string;
  bio: string;
  profileImage: string;
  totalEarnings: number;
  postCount: number;
  tipCount: number;
  followerCount: number;
  followingCount: number;
  createdAt: string;
  recentPosts?: Post[];
  stats?: {
    posts: number;
    tips: number;
    autoTips: number;
  };
}

export interface UserProfile {
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
  createdAt: string;
}

export interface CreateProfileData {
  address: string;
  username: string;
  displayName: string;
  bio?: string;
}

export interface UpdateProfileData {
  username?: string;
  displayName?: string;
  bio?: string;
}
