/**
 * Types pour le système de parrainage et communauté
 */

export interface ReferralCode {
  id: string;
  code: string;
  userId: string;
  createdAt: number;
  expiresAt?: number;
  usageCount: number;
  maxUsage?: number;
  bonus: {
    referrerXP: number;
    refereeXP: number;
    badge?: string;
  };
  active: boolean;
}

export interface Referral {
  id: string;
  referrerId: string;
  refereeId: string;
  referralCode: string;
  createdAt: number;
  completedAt?: number;
  status: 'pending' | 'completed' | 'expired';
  bonusAwarded: boolean;
}

export interface FriendChallenge {
  id: string;
  challengerId: string;
  challengeeId: string;
  skillId: string;
  targetValue: number;
  createdAt: number;
  expiresAt: number;
  status: 'pending' | 'accepted' | 'completed' | 'expired';
  challengerProgress: number;
  challengeeProgress: number;
  winner?: string; // ID du gagnant
  reward: {
    xp: number;
    badge?: string;
  };
}

export interface CommunityLeaderboard {
  userId: string;
  username: string;
  avatar?: string;
  totalXP: number;
  level: number;
  skillsCount: number;
  badgesCount: number;
  rank: number;
  isFollowing?: boolean;
}

export interface UserProfile {
  id: string;
  username: string;
  avatar?: string;
  bio?: string;
  joinedAt: number;
  totalXP: number;
  level: number;
  skillsCount: number;
  badgesCount: number;
  referralCode: string;
  referralsCount: number;
  friendsCount: number;
  isPublic: boolean;
}

export interface Friend {
  id: string;
  userId: string;
  friendId: string;
  status: 'pending' | 'accepted' | 'blocked';
  createdAt: number;
  acceptedAt?: number;
}

export interface SocialActivity {
  id: string;
  userId: string;
  type: 'badge_unlocked' | 'level_up' | 'challenge_completed' | 'friend_added';
  targetUserId?: string;
  data: Record<string, any>;
  timestamp: number;
  visibility: 'public' | 'friends' | 'private';
}
