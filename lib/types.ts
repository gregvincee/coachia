/**
 * Types pour l'application CoachIA
 */

// User Profile
export interface UserProfile {
  id: string;
  name: string;
  avatar?: string;
  level: number;
  xp: number;
  streak: number;
  createdAt: Date;
  lastSessionAt?: Date;
}

// Skill (Compétence)
export interface Skill {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: string;
  color: string;
}

// Skill Progress
export interface SkillProgress {
  skillId: string;
  level: number;
  xp: number;
  sessionsCount: number;
  lastSessionAt?: Date;
}

// Badge
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: string;
  unlocked: boolean;
  unlockedAt?: Date;
  category: 'bronze' | 'silver' | 'gold' | 'platinum';
}

// Chat Message
export interface ChatMessage {
  id: string;
  skillId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

// Settings
export interface AppSettings {
  theme: 'light' | 'dark' | 'auto';
  notifications: boolean;
  language: string;
}

// Stats
export interface UserStats {
  totalSessions: number;
  totalMessages: number;
  currentStreak: number;
  longestStreak: number;
  badgesUnlocked: number;
  totalBadges: number;
}

// API Response types
export interface ChatResponse {
  message: string;
  suggestions?: string[];
}

export interface ChatRequest {
  skillId: string;
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
}
