/**
 * Types pour le dashboard créateur
 */

export interface CreatorProfile {
  id: string;
  userId: string;
  name: string;
  bio: string;
  avatar: string;
  specialties: string[];
  rating: number; // 0-5
  reviewCount: number;
  followerCount: number;
  totalEarnings: number;
  joinedDate: number;
  verified: boolean;
  bankAccount?: string;
}

export interface CreatorContent {
  id: string;
  creatorId: string;
  title: string;
  description: string;
  category: 'course' | 'template' | 'resource' | 'coaching';
  price: number;
  currency: string;
  imageUrl: string;
  videoUrl?: string;
  duration?: number; // en minutes
  level: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  published: boolean;
  views: number;
  sales: number;
  rating: number;
  reviews: number;
  createdAt: number;
  updatedAt: number;
  lastPublishedAt?: number;
}

export interface CreatorStats {
  creatorId: string;
  totalSales: number;
  totalRevenue: number;
  totalViews: number;
  totalFollowers: number;
  averageRating: number;
  conversionRate: number; // views to sales
  thisMonthRevenue: number;
  thisMonthSales: number;
  topContent: CreatorContent[];
  recentSales: CreatorSale[];
}

export interface CreatorSale {
  id: string;
  contentId: string;
  contentTitle: string;
  buyerId: string;
  amount: number;
  currency: string;
  timestamp: number;
  status: 'completed' | 'pending' | 'refunded';
}

export interface CreatorPayout {
  id: string;
  creatorId: string;
  amount: number;
  currency: string;
  period: string; // "2024-01" format
  status: 'pending' | 'processing' | 'completed' | 'failed';
  bankAccount: string;
  requestedAt: number;
  processedAt?: number;
  transactionId?: string;
}

export interface CreatorReview {
  id: string;
  contentId: string;
  buyerId: string;
  buyerName: string;
  rating: number; // 1-5
  comment: string;
  helpful: number;
  createdAt: number;
}

export interface CreatorAnalytics {
  creatorId: string;
  date: string;
  views: number;
  clicks: number;
  sales: number;
  revenue: number;
  newFollowers: number;
  averageSessionDuration: number; // en secondes
}

export interface CreatorNotification {
  id: string;
  creatorId: string;
  type: 'sale' | 'review' | 'message' | 'milestone' | 'payout';
  title: string;
  message: string;
  relatedId?: string;
  read: boolean;
  createdAt: number;
}

export interface CreatorSettings {
  creatorId: string;
  autoPublish: boolean;
  notificationsEnabled: boolean;
  emailNotifications: boolean;
  payoutFrequency: 'weekly' | 'monthly';
  minimumPayoutAmount: number;
  bankAccountVerified: boolean;
  taxId?: string;
  businessName?: string;
}
