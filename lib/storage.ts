/**
 * Service de stockage local avec AsyncStorage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  UserProfile,
  SkillProgress,
  Badge,
  ChatMessage,
  AppSettings,
} from './types';
import { BADGES } from './data';

// Clés de stockage
const KEYS = {
  ONBOARDING_COMPLETED: '@onboarding_completed',
  USER_PROFILE: '@user_profile',
  SKILLS_PROGRESS: '@skills_progress',
  BADGES: '@badges',
  CHAT_HISTORY: '@chat_history',
  SETTINGS: '@settings',
};

// ===== Onboarding =====

export async function isOnboardingCompleted(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(KEYS.ONBOARDING_COMPLETED);
    return value === 'true';
  } catch (error) {
    console.error('Error reading onboarding status:', error);
    return false;
  }
}

export async function setOnboardingCompleted(): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.ONBOARDING_COMPLETED, 'true');
  } catch (error) {
    console.error('Error setting onboarding status:', error);
  }
}

// ===== User Profile =====

export async function getUserProfile(): Promise<UserProfile | null> {
  try {
    const value = await AsyncStorage.getItem(KEYS.USER_PROFILE);
    if (!value) return null;
    const profile = JSON.parse(value);
    // Convertir les dates string en Date objects
    profile.createdAt = new Date(profile.createdAt);
    if (profile.lastSessionAt) {
      profile.lastSessionAt = new Date(profile.lastSessionAt);
    }
    return profile;
  } catch (error) {
    console.error('Error reading user profile:', error);
    return null;
  }
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.USER_PROFILE, JSON.stringify(profile));
  } catch (error) {
    console.error('Error saving user profile:', error);
  }
}

export async function createDefaultUserProfile(): Promise<UserProfile> {
  const profile: UserProfile = {
    id: `user_${Date.now()}`,
    name: 'Utilisateur',
    level: 1,
    xp: 0,
    streak: 0,
    createdAt: new Date(),
  };
  await saveUserProfile(profile);
  return profile;
}

// ===== Skills Progress =====

export async function getSkillsProgress(): Promise<Record<string, SkillProgress>> {
  try {
    const value = await AsyncStorage.getItem(KEYS.SKILLS_PROGRESS);
    if (!value) return {};
    const progress = JSON.parse(value);
    // Convertir les dates
    Object.keys(progress).forEach((skillId) => {
      if (progress[skillId].lastSessionAt) {
        progress[skillId].lastSessionAt = new Date(progress[skillId].lastSessionAt);
      }
    });
    return progress;
  } catch (error) {
    console.error('Error reading skills progress:', error);
    return {};
  }
}

export async function saveSkillsProgress(
  progress: Record<string, SkillProgress>
): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.SKILLS_PROGRESS, JSON.stringify(progress));
  } catch (error) {
    console.error('Error saving skills progress:', error);
  }
}

export async function getSkillProgress(skillId: string): Promise<SkillProgress | null> {
  const allProgress = await getSkillsProgress();
  return allProgress[skillId] || null;
}

export async function updateSkillProgress(
  skillId: string,
  updates: Partial<SkillProgress>
): Promise<void> {
  const allProgress = await getSkillsProgress();
  const current = allProgress[skillId] || {
    skillId,
    level: 1,
    xp: 0,
    sessionsCount: 0,
  };
  allProgress[skillId] = { ...current, ...updates };
  await saveSkillsProgress(allProgress);
}

// ===== Badges =====

export async function getBadges(): Promise<Badge[]> {
  try {
    const value = await AsyncStorage.getItem(KEYS.BADGES);
    if (!value) {
      // Initialiser avec les badges par défaut
      await saveBadges(BADGES);
      return BADGES;
    }
    const badges = JSON.parse(value);
    // Convertir les dates
    badges.forEach((badge: Badge) => {
      if (badge.unlockedAt) {
        badge.unlockedAt = new Date(badge.unlockedAt);
      }
    });
    return badges;
  } catch (error) {
    console.error('Error reading badges:', error);
    return BADGES;
  }
}

export async function saveBadges(badges: Badge[]): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.BADGES, JSON.stringify(badges));
  } catch (error) {
    console.error('Error saving badges:', error);
  }
}

export async function unlockBadge(badgeId: string): Promise<void> {
  const badges = await getBadges();
  const badge = badges.find((b) => b.id === badgeId);
  if (badge && !badge.unlocked) {
    badge.unlocked = true;
    badge.unlockedAt = new Date();
    await saveBadges(badges);
  }
}

export async function isBadgeUnlocked(badgeId: string): Promise<boolean> {
  const badges = await getBadges();
  const badge = badges.find((b) => b.id === badgeId);
  return badge?.unlocked || false;
}

// ===== Chat History =====

export async function getChatHistory(skillId: string): Promise<ChatMessage[]> {
  try {
    const value = await AsyncStorage.getItem(`${KEYS.CHAT_HISTORY}_${skillId}`);
    if (!value) return [];
    const messages = JSON.parse(value);
    // Convertir les dates
    messages.forEach((msg: ChatMessage) => {
      msg.timestamp = new Date(msg.timestamp);
    });
    return messages;
  } catch (error) {
    console.error('Error reading chat history:', error);
    return [];
  }
}

export async function saveChatHistory(
  skillId: string,
  messages: ChatMessage[]
): Promise<void> {
  try {
    await AsyncStorage.setItem(
      `${KEYS.CHAT_HISTORY}_${skillId}`,
      JSON.stringify(messages)
    );
  } catch (error) {
    console.error('Error saving chat history:', error);
  }
}

export async function addChatMessage(
  skillId: string,
  message: Omit<ChatMessage, 'id' | 'timestamp'>
): Promise<ChatMessage> {
  const history = await getChatHistory(skillId);
  const newMessage: ChatMessage = {
    ...message,
    id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date(),
  };
  history.push(newMessage);
  await saveChatHistory(skillId, history);
  return newMessage;
}

export async function clearChatHistory(skillId: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(`${KEYS.CHAT_HISTORY}_${skillId}`);
  } catch (error) {
    console.error('Error clearing chat history:', error);
  }
}

// ===== Settings =====

export async function getSettings(): Promise<AppSettings> {
  try {
    const value = await AsyncStorage.getItem(KEYS.SETTINGS);
    if (!value) {
      const defaultSettings: AppSettings = {
        theme: 'auto',
        notifications: true,
        language: 'fr',
      };
      await saveSettings(defaultSettings);
      return defaultSettings;
    }
    return JSON.parse(value);
  } catch (error) {
    console.error('Error reading settings:', error);
    return {
      theme: 'auto',
      notifications: true,
      language: 'fr',
    };
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings:', error);
  }
}

// ===== Utility Functions =====

export async function clearAllData(): Promise<void> {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    console.error('Error clearing all data:', error);
  }
}
