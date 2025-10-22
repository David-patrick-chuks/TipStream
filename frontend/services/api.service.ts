// API service for TipStream Platform
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

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

export interface Tip {
  id: string;
  postId: string;
  tipper: string;
  creator: string;
  amount: string;
  timestamp: string;
  txHash?: string;
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

export interface Analytics {
  overview: {
    totalPosts: number;
    totalTips: number;
    totalUsers: number;
    totalEarnings: number; // Changed from string to number
  };
  recentActivity: Tip[];
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Ensure Content-Type is set correctly
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Posts API
  async getPosts(page = 1, limit = 10): Promise<{
    posts: Post[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    return this.request(`/posts?page=${page}&limit=${limit}`);
  }

  async getPost(postId: string): Promise<Post & {
    recentTips: Tip[];
    activeAutoTips: AutoTip[];
  }> {
    return this.request(`/posts/${postId}`);
  }

  async createPost(content: string, creator: string, txHash: string): Promise<{
    id: string;
    creator: string;
    content: string;
    images: PostImage[];
    timestamp: string;
    txHash: string;
  }> {
    const requestBody = { content, creator };
    
    return this.request('/posts', {
      method: 'POST',
      headers: {
        'x-tx-hash': txHash,
      },
      body: JSON.stringify(requestBody),
    });
  }

  async createPostWithImages(
    content: string, 
    creator: string, 
    txHash: string, 
    images: File[]
  ): Promise<{
    id: string;
    creator: string;
    content: string;
    images: PostImage[];
    timestamp: string;
    txHash: string;
  }> {
    const formData = new FormData();
    formData.append('content', content);
    formData.append('creator', creator);
    
    images.forEach((image, index) => {
      console.log(`Adding image ${index}:`, {
        name: image.name,
        size: image.size,
        type: image.type
      });
      formData.append(`images`, image);
    });
    
    const response = await fetch(`${API_BASE_URL}/posts/with-images`, {
      method: 'POST',
      headers: {
        'x-tx-hash': txHash,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async increaseEngagement(postId: string): Promise<{
    id: string;
    engagement: number;
  }> {
    return this.request(`/posts/${postId}/engagement`, {
      method: 'PUT',
    });
  }

  // Tips API
  async sendTip(postId: string, amount: string, tipper: string, txHash: string): Promise<Tip> {
    return this.request('/tips/send', {
      method: 'POST',
      headers: {
        'x-tx-hash': txHash,
      },
      body: JSON.stringify({ postId, amount, tipper }),
    });
  }

  async enableAutoTip(
    postId: string,
    threshold: string,
    amount: string,
    tipper: string,
    txHash: string
  ): Promise<AutoTip> {
    return this.request('/tips/auto', {
      method: 'POST',
      headers: {
        'x-tx-hash': txHash,
      },
      body: JSON.stringify({ postId, threshold, amount, tipper }),
    });
  }

  async executeAutoTip(postId: string, autoTipIndex: number, privateKey: string): Promise<{
    txHash: string;
    executed: boolean;
  }> {
    return this.request('/tips/execute-auto', {
      method: 'POST',
      headers: {
        'x-private-key': privateKey,
      },
      body: JSON.stringify({ postId, autoTipIndex }),
    });
  }

  async getPostTips(postId: string): Promise<{ tips: Tip[] }> {
    return this.request(`/tips/post/${postId}`);
  }

  async getUserTips(address: string): Promise<{ tips: Tip[] }> {
    return this.request(`/tips/user/${address}`);
  }

  // Comments API
  async getComments(postId: string, page = 1, limit = 20): Promise<{
    comments: Comment[];
    pagination: {
      page: number;
      limit: number;
      total: number;
    };
  }> {
    return this.request(`/comments/${postId}?page=${page}&limit=${limit}`);
  }

  async createComment(postId: string, author: string, content: string): Promise<{
    id: string;
    postId: string;
    author: string;
    content: string;
    timestamp: string;
    likes: number;
    replies: Comment[];
  }> {
    return this.request(`/comments/${postId}`, {
      method: 'POST',
      body: JSON.stringify({ author, content }),
    });
  }

  async replyToComment(commentId: string, author: string, content: string): Promise<{
    id: string;
    postId: string;
    author: string;
    content: string;
    timestamp: string;
    likes: number;
    parentCommentId: string;
  }> {
    return this.request(`/comments/${commentId}/reply`, {
      method: 'POST',
      body: JSON.stringify({ author, content }),
    });
  }

  async likeComment(commentId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    return this.request(`/comments/${commentId}/like`, {
      method: 'PUT',
    });
  }

  async deleteComment(commentId: string, author: string): Promise<{
    success: boolean;
    message: string;
  }> {
    return this.request(`/comments/${commentId}`, {
      method: 'DELETE',
      body: JSON.stringify({ author }),
    });
  }

  // Users API
  async getUser(address: string): Promise<User> {
    return this.request(`/users/${address}`);
  }

  async getUserProfile(address: string, page = 1, limit = 10): Promise<{
    profile: UserProfile;
    posts: Post[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    return this.request(`/users/${address}/profile?page=${page}&limit=${limit}`);
  }

  async getUserPosts(address: string, page = 1, limit = 10): Promise<{
    posts: Post[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    return this.request(`/users/${address}/posts?page=${page}&limit=${limit}`);
  }

  async createProfile(data: CreateProfileData): Promise<{
    success: boolean;
    profile: UserProfile;
  }> {
    return this.request('/users/create-profile', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProfile(address: string, data: UpdateProfileData): Promise<{
    success: boolean;
    profile: UserProfile;
  }> {
    return this.request(`/users/${address}/profile`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async updateProfileImage(address: string, image: File): Promise<{
    success: boolean;
    profileImage: string;
  }> {
    const formData = new FormData();
    formData.append('image', image);
    
    const response = await fetch(`${API_BASE_URL}/users/${address}/profile-image`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async checkUsernameAvailability(username: string): Promise<{
    available: boolean;
    username: string;
  }> {
    return this.request(`/users/username/${username}/check`);
  }

  // Analytics API
  async getAnalytics(): Promise<Analytics> {
    return this.request('/analytics/overview');
  }

  async getPostAnalytics(timeframe = '7d'): Promise<{
    postsByDay: Array<{ date: string; count: number }>;
    topPosts: Post[];
    engagementStats: {
      average: number;
      maximum: number;
      total: number;
    };
  }> {
    return this.request(`/analytics/posts?timeframe=${timeframe}`);
  }

  async getTipAnalytics(timeframe = '7d'): Promise<{
    tipsByDay: Array<{ date: string; count: number; totalAmount: string }>;
    topTippers: Array<{ address: string; tipCount: number; totalAmount: string }>;
    tipStats: {
      average: string;
      maximum: string;
      total: string;
      count: number;
    };
  }> {
    return this.request(`/analytics/tips?timeframe=${timeframe}`);
  }

  async getTrendingPosts(timeframe = '24h'): Promise<{
    trendingPosts: Post[];
  }> {
    return this.request(`/analytics/trending?timeframe=${timeframe}`);
  }
}

export const apiService = new ApiService();
