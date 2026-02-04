/**
 * Types pour le système de défis hebdomadaires
 */

export type ChallengeDifficulty = 'easy' | 'medium' | 'hard';
export type ChallengeStatus = 'active' | 'completed' | 'expired' | 'failed';
export type ChallengeCategory = 'daily' | 'weekly' | 'special';

export interface Challenge {
  id: string;
  title: string;
  description: string;
  skillId: string;
  difficulty: ChallengeDifficulty;
  category: ChallengeCategory;
  objective: string;
  targetValue: number; // Nombre de messages, sessions, etc.
  reward: {
    xp: number;
    bonus: number; // Bonus XP supplémentaire
    badge?: string; // ID du badge bonus
  };
  startDate: number; // Timestamp
  endDate: number; // Timestamp
  icon: string;
  color: string;
}

export interface UserChallenge {
  id: string;
  challengeId: string;
  userId: string;
  status: ChallengeStatus;
  progress: number;
  startedAt: number;
  completedAt?: number;
  claimed: boolean; // Récompense réclamée
}

export interface ChallengeLeaderboard {
  userId: string;
  username: string;
  challengesCompleted: number;
  totalXP: number;
  rank: number;
  avatar?: string;
}

export interface WeeklyChallengeSummary {
  week: number;
  year: number;
  challenges: Challenge[];
  userProgress: UserChallenge[];
  leaderboard: ChallengeLeaderboard[];
  totalParticipants: number;
}

export interface ChallengeNotification {
  id: string;
  type: 'challenge_available' | 'challenge_completed' | 'challenge_expiring' | 'leaderboard_update';
  challengeId?: string;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
}
