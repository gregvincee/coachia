/**
 * Types pour les fonctionnalités sociales
 */

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: number;
  isRead: boolean;
  reactions?: Record<string, string[]>; // emoji -> [userIds]
  replyTo?: string; // ID du message auquel on répond
}

export interface ChatConversation {
  id: string;
  type: 'direct' | 'group';
  participants: string[];
  name?: string;
  avatar?: string;
  lastMessage?: ChatMessage;
  lastMessageTime: number;
  unreadCount: number;
  createdAt: number;
  mutedUntil?: number;
}

export interface StudyGroup {
  id: string;
  name: string;
  description: string;
  skillFocus: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  members: GroupMember[];
  maxMembers: number;
  createdBy: string;
  createdAt: number;
  rules?: string;
  schedule?: {
    day: string;
    time: string;
  };
  isPublic: boolean;
}

export interface GroupMember {
  userId: string;
  username: string;
  avatar?: string;
  role: 'admin' | 'moderator' | 'member';
  joinedAt: number;
  level: number;
}

export interface MentorshipRequest {
  id: string;
  menteeId: string;
  mentorId: string;
  skillId: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  createdAt: number;
  respondedAt?: number;
  sessionCount?: number;
  rating?: number;
}

export interface MentorProfile {
  userId: string;
  username: string;
  avatar?: string;
  bio?: string;
  expertise: string[];
  rating: number;
  reviewCount: number;
  hourlyRate?: number;
  availability: {
    day: string;
    startTime: string;
    endTime: string;
  }[];
  menteeCount: number;
  responseTime: number; // en heures
  isVerified: boolean;
}

export interface SocialNotification {
  id: string;
  userId: string;
  type: 'message' | 'friend_request' | 'group_invite' | 'mentor_request' | 'reaction' | 'mention';
  fromUserId: string;
  fromUsername: string;
  content: string;
  relatedId?: string;
  isRead: boolean;
  timestamp: number;
  actionUrl?: string;
}

export interface UserComment {
  id: string;
  userId: string;
  username: string;
  userAvatar?: string;
  content: string;
  targetId: string; // ID de la ressource commentée
  targetType: 'post' | 'session' | 'resource';
  timestamp: number;
  likes: number;
  replies?: UserComment[];
  isEdited: boolean;
}

export interface SocialPost {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  skillTags: string[];
  media?: string[];
  likes: number;
  comments: number;
  shares: number;
  timestamp: number;
  visibility: 'public' | 'friends' | 'private';
  isLiked?: boolean;
}

export interface LiveSession {
  id: string;
  hostId: string;
  hostName: string;
  title: string;
  description: string;
  skillId: string;
  startTime: number;
  duration: number;
  maxParticipants: number;
  currentParticipants: number;
  status: 'scheduled' | 'live' | 'ended';
  recordingUrl?: string;
  joinUrl?: string;
}
