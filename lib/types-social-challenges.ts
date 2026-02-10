/**
 * Types pour les défis sociaux
 */

export interface SocialChallenge {
  id: string;
  creatorId: string;
  title: string;
  description: string;
  skillId: string;
  skillName: string;
  difficulty: 'easy' | 'medium' | 'hard';
  duration: number; // en jours
  maxParticipants?: number;
  currentParticipants: number;
  prizePool?: number;
  startDate: number;
  endDate: number;
  status: 'upcoming' | 'active' | 'completed';
  videoRequired: boolean;
  rules: string[];
  createdAt: number;
}

export interface ChallengeParticipant {
  id: string;
  challengeId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  joinedAt: number;
  score: number;
  rank?: number;
  videoSubmissionUrl?: string;
  videoSubmittedAt?: number;
  approved: boolean;
  feedback?: string;
}

export interface ChallengeLeaderboard {
  challengeId: string;
  participants: ChallengeParticipant[];
  totalParticipants: number;
  updatedAt: number;
}

export interface ChallengeVideo {
  id: string;
  challengeId: string;
  userId: string;
  userName: string;
  videoUrl: string;
  thumbnailUrl?: string;
  duration: number; // en secondes
  views: number;
  likes: number;
  comments: number;
  uploadedAt: number;
  approved: boolean;
}

export interface ChallengeComment {
  id: string;
  videoId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  comment: string;
  likes: number;
  replies: ChallengeComment[];
  createdAt: number;
}

export interface ChallengePrize {
  id: string;
  challengeId: string;
  rank: number; // 1st, 2nd, 3rd
  prizeAmount: number;
  prizeType: 'cash' | 'badge' | 'xp' | 'premium';
  awardedTo?: string;
  awardedAt?: number;
}

export interface ChallengeNotification {
  id: string;
  userId: string;
  challengeId: string;
  type: 'challenge_started' | 'new_video' | 'new_comment' | 'liked' | 'challenge_ended';
  title: string;
  message: string;
  relatedUserId?: string;
  read: boolean;
  createdAt: number;
}

export interface ChallengeStats {
  challengeId: string;
  totalParticipants: number;
  totalVideos: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  averageScore: number;
  completionRate: number; // %
}

export interface FriendChallenge {
  id: string;
  creatorId: string;
  friendId: string;
  skillId: string;
  skillName: string;
  challenge: string;
  status: 'pending' | 'accepted' | 'completed' | 'declined';
  creatorScore?: number;
  friendScore?: number;
  winner?: string;
  createdAt: number;
  respondedAt?: number;
  completedAt?: number;
}

export interface LiveLeaderboardUpdate {
  challengeId: string;
  participantId: string;
  newScore: number;
  newRank: number;
  timestamp: number;
}
