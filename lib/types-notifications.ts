/**
 * Types pour le système de notifications push
 */

export type NotificationType = 
  | 'daily-reminder'
  | 'streak-warning'
  | 'challenge-available'
  | 'challenge-completed'
  | 'badge-unlocked'
  | 'level-up'
  | 'referral-bonus'
  | 'premium-offer';

export interface PushNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, string>;
  timestamp: number;
  read: boolean;
  actionUrl?: string; // Deep link vers l'écran concerné
}

export interface NotificationPreferences {
  dailyReminder: boolean;
  streakWarning: boolean;
  challengeNotifications: boolean;
  badgeNotifications: boolean;
  levelUpNotifications: boolean;
  referralNotifications: boolean;
  premiumOffers: boolean;
  quietHours: {
    enabled: boolean;
    startTime: string; // "22:00"
    endTime: string; // "08:00"
  };
}

export interface NotificationSchedule {
  type: NotificationType;
  time: string; // "09:00"
  frequency: 'daily' | 'weekly' | 'once';
  enabled: boolean;
}

export interface NotificationToken {
  token: string;
  platform: 'ios' | 'android' | 'web';
  deviceId: string;
  createdAt: number;
  lastUpdated: number;
}
