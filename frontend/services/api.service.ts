// API service for Web3 Social Tipping Platform
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

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

export interface Analytics {
  overview: {
    totalPosts: number;
    totalTips: number;
    totalUsers: number;
    totalEarnings: string;
  };
  recentActivity: Tip[];
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
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

  async createPost(content: string, creator: string, privateKey: string): Promise<{
    id: string;
    creator: string;
    content: string;
    timestamp: string;
    txHash: string;
  }> {
    return this.request('/posts', {
      method: 'POST',
      headers: {
        'x-private-key': privateKey,
      },
      body: JSON.stringify({ content, creator }),
    });
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
  async sendTip(postId: string, amount: string, tipper: string, privateKey: string): Promise<Tip> {
    return this.request('/tips/send', {
      method: 'POST',
      headers: {
        'x-private-key': privateKey,
      },
      body: JSON.stringify({ postId, amount, tipper }),
    });
  }

  async enableAutoTip(
    postId: string,
    threshold: string,
    amount: string,
    tipper: string,
    privateKey: string
  ): Promise<AutoTip> {
    return this.request('/tips/auto', {
      method: 'POST',
      headers: {
        'x-private-key': privateKey,
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

  // Users API
  async getUser(address: string): Promise<User> {
    return this.request(`/users/${address}`);
  }

  async getUserStats(address: string): Promise<{
    totalEarnings: string;
    postCount: number;
    tipCount: number;
  }> {
    return this.request(`/users/${address}/stats`);
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
