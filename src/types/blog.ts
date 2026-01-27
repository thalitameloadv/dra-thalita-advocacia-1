export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  authorAvatar?: string;
  authorBio?: string;
  publishedAt: string;
  updatedAt: string;
  status: 'draft' | 'published' | 'archived';
  featuredImage?: string;
  category: string;
  tags: string[];
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  readingTime: number;
  views: number;
  likes: number;
  commentsCount?: number;
  featured?: boolean;
  relatedPosts?: string[];
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  icon?: string;
  postCount?: number;
}

export interface BlogSettings {
  postsPerPage: number;
  enableComments: boolean;
  enableLikes: boolean;
  enableSharing: boolean;
  enableNewsletter: boolean;
  defaultAuthor: string;
  defaultCategory: string;
  seoSettings: {
    defaultTitle: string;
    defaultDescription: string;
    keywords: string[];
    ogImage: string;
    twitterHandle?: string;
  };
  newsletterSettings: {
    enabled: boolean;
    welcomeMessage: string;
    confirmationRequired: boolean;
  };
}

export interface BlogAnalytics {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalViews: number;
  totalLikes: number;
  totalSubscribers: number;
  topPosts: Array<{
    id: string;
    title: string;
    views: number;
    likes: number;
  }>;
  recentActivity: Array<{
    id: string;
    action: string;
    timestamp: string;
    details: string;
  }>;
  viewsByMonth: Array<{
    month: string;
    views: number;
  }>;
  subscriberGrowth: Array<{
    month: string;
    count: number;
  }>;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  name?: string;
  subscribedAt: string;
  status: 'active' | 'unsubscribed' | 'pending';
  confirmedAt?: string;
  tags?: string[];
  source?: string;
}

export interface Newsletter {
  id: string;
  subject: string;
  previewText?: string;
  content: string;
  htmlContent: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
  scheduledFor?: string;
  sentAt?: string;
  recipients: number;
  opens: number;
  clicks: number;
  unsubscribes: number;
  createdAt: string;
  updatedAt: string;
}

export interface NewsletterCampaign {
  id: string;
  subject: string;
  previewText: string;
  content: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
  sentAt?: string;
  scheduledAt?: string;
  recipientCount: number;
  openedCount: number;
  clickedCount: number;
  unsubscribedCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  previewText: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignAnalytics {
  totalSent: number;
  totalOpened: number;
  totalClicked: number;
  totalUnsubscribed: number;
  openRate: number;
  clickRate: number;
  unsubscribeRate: number;
  campaigns: NewsletterCampaign[];
}

export interface BlogComment {
  id: string;
  postId: string;
  author: string;
  email: string;
  content: string;
  status: 'pending' | 'approved' | 'spam';
  createdAt: string;
  parentId?: string;
  replies?: BlogComment[];
}

export interface BlogAuthor {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  role: 'admin' | 'editor' | 'author';
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
  postsCount: number;
}
