/**
 * Service pour les fonctionnalités sociales
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ChatMessage, ChatConversation, StudyGroup, MentorProfile, SocialPost } from './types-social';

/**
 * Crée une nouvelle conversation
 */
export function createConversation(
  type: 'direct' | 'group',
  participants: string[],
  name?: string
): ChatConversation {
  return {
    id: `conv-${Date.now()}`,
    type,
    participants,
    name,
    lastMessageTime: Date.now(),
    unreadCount: 0,
    createdAt: Date.now(),
  };
}

/**
 * Crée un nouveau message
 */
export function createChatMessage(
  senderId: string,
  senderName: string,
  content: string,
  senderAvatar?: string
): ChatMessage {
  return {
    id: `msg-${Date.now()}`,
    senderId,
    senderName,
    senderAvatar,
    content,
    timestamp: Date.now(),
    isRead: false,
    reactions: {},
  };
}

/**
 * Ajoute une réaction à un message
 */
export function addReactionToMessage(
  message: ChatMessage,
  emoji: string,
  userId: string
): ChatMessage {
  const reactions = message.reactions || {};
  if (!reactions[emoji]) {
    reactions[emoji] = [];
  }
  if (!reactions[emoji].includes(userId)) {
    reactions[emoji].push(userId);
  }
  return { ...message, reactions };
}

/**
 * Crée un groupe d'étude
 */
export function createStudyGroup(
  name: string,
  skillFocus: string,
  createdBy: string,
  level: 'beginner' | 'intermediate' | 'advanced' = 'intermediate'
): StudyGroup {
  return {
    id: `group-${Date.now()}`,
    name,
    description: '',
    skillFocus,
    level,
    members: [
      {
        userId: createdBy,
        username: 'You',
        role: 'admin',
        joinedAt: Date.now(),
        level: 1,
      },
    ],
    maxMembers: 50,
    createdBy,
    createdAt: Date.now(),
    isPublic: true,
  };
}

/**
 * Ajoute un membre au groupe
 */
export function addMemberToGroup(
  group: StudyGroup,
  userId: string,
  username: string,
  level: number = 1
): StudyGroup {
  if (group.members.length >= group.maxMembers) {
    throw new Error('Groupe plein');
  }

  const newMember = {
    userId,
    username,
    role: 'member' as const,
    joinedAt: Date.now(),
    level,
  };

  return {
    ...group,
    members: [...group.members, newMember],
  };
}

/**
 * Crée un profil de mentor
 */
export function createMentorProfile(
  userId: string,
  username: string,
  expertise: string[]
): MentorProfile {
  return {
    userId,
    username,
    expertise,
    rating: 5,
    reviewCount: 0,
    menteeCount: 0,
    responseTime: 2,
    isVerified: false,
    availability: [
      { day: 'Monday', startTime: '09:00', endTime: '17:00' },
      { day: 'Wednesday', startTime: '09:00', endTime: '17:00' },
      { day: 'Friday', startTime: '09:00', endTime: '17:00' },
    ],
  };
}

/**
 * Crée un post social
 */
export function createSocialPost(
  authorId: string,
  authorName: string,
  content: string,
  skillTags: string[] = [],
  visibility: 'public' | 'friends' | 'private' = 'public'
): SocialPost {
  return {
    id: `post-${Date.now()}`,
    authorId,
    authorName,
    content,
    skillTags,
    likes: 0,
    comments: 0,
    shares: 0,
    timestamp: Date.now(),
    visibility,
  };
}

/**
 * Aime un post
 */
export function likePost(post: SocialPost): SocialPost {
  return {
    ...post,
    likes: post.likes + 1,
    isLiked: true,
  };
}

/**
 * Retire un like d'un post
 */
export function unlikePost(post: SocialPost): SocialPost {
  return {
    ...post,
    likes: Math.max(0, post.likes - 1),
    isLiked: false,
  };
}

/**
 * Sauvegarde une conversation
 */
export async function saveConversation(conversation: ChatConversation): Promise<void> {
  try {
    const conversations = await getConversations();
    const index = conversations.findIndex(c => c.id === conversation.id);
    if (index >= 0) {
      conversations[index] = conversation;
    } else {
      conversations.push(conversation);
    }
    await AsyncStorage.setItem('conversations', JSON.stringify(conversations));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de la conversation:', error);
  }
}

/**
 * Récupère les conversations
 */
export async function getConversations(): Promise<ChatConversation[]> {
  try {
    const stored = await AsyncStorage.getItem('conversations');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Erreur lors de la récupération des conversations:', error);
    return [];
  }
}

/**
 * Sauvegarde un message
 */
export async function saveMessage(conversationId: string, message: ChatMessage): Promise<void> {
  try {
    const key = `messages-${conversationId}`;
    const messages = await getMessages(conversationId);
    messages.push(message);
    await AsyncStorage.setItem(key, JSON.stringify(messages.slice(-1000))); // Garder les 1000 derniers
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du message:', error);
  }
}

/**
 * Récupère les messages d'une conversation
 */
export async function getMessages(conversationId: string): Promise<ChatMessage[]> {
  try {
    const key = `messages-${conversationId}`;
    const stored = await AsyncStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Erreur lors de la récupération des messages:', error);
    return [];
  }
}

/**
 * Sauvegarde les groupes d'étude
 */
export async function saveStudyGroup(group: StudyGroup): Promise<void> {
  try {
    const groups = await getStudyGroups();
    const index = groups.findIndex(g => g.id === group.id);
    if (index >= 0) {
      groups[index] = group;
    } else {
      groups.push(group);
    }
    await AsyncStorage.setItem('studyGroups', JSON.stringify(groups));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du groupe:', error);
  }
}

/**
 * Récupère les groupes d'étude
 */
export async function getStudyGroups(): Promise<StudyGroup[]> {
  try {
    const stored = await AsyncStorage.getItem('studyGroups');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Erreur lors de la récupération des groupes:', error);
    return [];
  }
}

/**
 * Calcule le score de compatibilité de mentor
 */
export function calculateMentorCompatibility(
  mentor: MentorProfile,
  studentSkills: string[]
): number {
  const matchingSkills = mentor.expertise.filter(skill => studentSkills.includes(skill)).length;
  const skillMatch = (matchingSkills / Math.max(1, mentor.expertise.length)) * 50;
  const ratingScore = (mentor.rating / 5) * 30;
  const availabilityScore = mentor.availability.length > 0 ? 20 : 0;

  return Math.round(skillMatch + ratingScore + availabilityScore);
}

/**
 * Filtre les mentors par critères
 */
export function filterMentors(
  mentors: MentorProfile[],
  expertise: string[],
  minRating: number = 4,
  maxResponseTime: number = 24
): MentorProfile[] {
  return mentors.filter(
    mentor =>
      mentor.expertise.some(skill => expertise.includes(skill)) &&
      mentor.rating >= minRating &&
      mentor.responseTime <= maxResponseTime &&
      mentor.isVerified
  );
}
