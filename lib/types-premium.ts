/**
 * Types pour le système de monétisation premium
 */

export type SubscriptionPlan = 'free' | 'pro' | 'elite';
export type BillingCycle = 'monthly' | 'yearly';
export type SubscriptionStatus = 'active' | 'canceled' | 'expired' | 'paused';

export interface PremiumPlan {
  id: string;
  name: string;
  description: string;
  price: {
    monthly: number;
    yearly: number;
  };
  features: string[];
  limits: {
    dailyPrompts: number;
    monthlyCoachingSessions: number;
    storageGB: number;
    prioritySupport: boolean;
    customCoaching: boolean;
    advancedAnalytics: boolean;
    adFree: boolean;
  };
  badge?: string;
  color: string;
}

export interface UserSubscription {
  id: string;
  userId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  billingCycle: BillingCycle;
  startDate: number;
  renewalDate: number;
  canceledAt?: number;
  paymentMethod?: {
    type: 'card' | 'apple_pay' | 'google_pay';
    lastFour?: string;
  };
  autoRenew: boolean;
}

export interface PremiumFeature {
  id: string;
  name: string;
  description: string;
  icon: string;
  requiredPlan: SubscriptionPlan;
  enabled: boolean;
}

export interface CoachingPackage {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // en jours
  sessions: number;
  skillFocus?: string;
  customization: boolean;
  bonus?: {
    xp: number;
    badge?: string;
  };
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'subscription' | 'package' | 'refund';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  timestamp: number;
  description: string;
  receiptId?: string;
}

export interface PremiumStats {
  totalSubscribers: number;
  activeSubscribers: number;
  monthlyRecurringRevenue: number;
  churnRate: number;
  averageLifetimeValue: number;
  conversionRate: number;
}

export interface PremiumOffer {
  id: string;
  type: 'trial' | 'discount' | 'bundle' | 'seasonal';
  title: string;
  description: string;
  discount: number; // en pourcentage
  validFrom: number;
  validUntil: number;
  applicablePlans: SubscriptionPlan[];
  code?: string;
  maxUsage?: number;
  usageCount: number;
}
