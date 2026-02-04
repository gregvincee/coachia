/**
 * Types pour les analytics avancées et données
 */

export interface AnalyticsEvent {
  id: string;
  userId: string;
  eventType: string;
  eventName: string;
  properties: Record<string, any>;
  timestamp: number;
  sessionId: string;
}

export interface UserAnalytics {
  userId: string;
  totalSessions: number;
  totalXP: number;
  averageSessionDuration: number; // en minutes
  lastSessionDate: number;
  skillsAttempted: number;
  skillsCompleted: number;
  badgesUnlocked: number;
  streakCurrent: number;
  streakLongest: number;
  engagementScore: number; // 0-100
  retentionDays: number;
}

export interface SkillAnalytics {
  skillId: string;
  userId: string;
  sessionsCount: number;
  totalXP: number;
  level: number;
  averageScore: number;
  lastPracticeDate: number;
  practiceFrequency: 'daily' | 'weekly' | 'monthly' | 'rare';
  improvementRate: number; // pourcentage
  timeSpent: number; // en minutes
}

export interface ProgressReport {
  id: string;
  userId: string;
  period: 'daily' | 'weekly' | 'monthly';
  startDate: number;
  endDate: number;
  summary: {
    sessionsCompleted: number;
    xpGained: number;
    badgesUnlocked: number;
    skillsImproved: string[];
    streakMaintained: boolean;
  };
  insights: string[];
  recommendations: string[];
  trends: {
    mostPracticedSkill: string;
    bestTimeToLearn: string;
    improvementAreas: string[];
  };
}

export interface AIRecommendation {
  id: string;
  userId: string;
  type: 'skill_suggestion' | 'challenge_recommendation' | 'learning_path' | 'improvement_tip';
  title: string;
  description: string;
  reason: string;
  targetSkill?: string;
  priority: 'low' | 'medium' | 'high';
  timestamp: number;
  dismissed: boolean;
}

export interface LearningPath {
  id: string;
  userId: string;
  name: string;
  description: string;
  skills: string[];
  duration: number; // en jours
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  progress: number; // 0-100
  createdAt: number;
  completedAt?: number;
  milestones: Milestone[];
}

export interface Milestone {
  id: string;
  name: string;
  description: string;
  skillId: string;
  targetValue: number;
  completed: boolean;
  completedAt?: number;
  reward: {
    xp: number;
    badge?: string;
  };
}

export interface UserInsight {
  id: string;
  userId: string;
  type: 'strength' | 'weakness' | 'opportunity' | 'trend';
  title: string;
  description: string;
  data: Record<string, any>;
  actionable: boolean;
  suggestedAction?: string;
  timestamp: number;
}

export interface ExportData {
  userId: string;
  exportDate: number;
  format: 'pdf' | 'csv' | 'json';
  includeData: {
    analytics: boolean;
    progressReports: boolean;
    skillDetails: boolean;
    badges: boolean;
    sessionHistory: boolean;
  };
  fileUrl?: string;
  status: 'pending' | 'processing' | 'ready' | 'failed';
}

export interface DashboardMetrics {
  totalUsers: number;
  activeUsers: number;
  newUsersThisWeek: number;
  averageSessionsPerUser: number;
  totalXPDistributed: number;
  totalBadgesAwarded: number;
  engagementRate: number;
  retentionRate: number;
  churnRate: number;
  averageSessionDuration: number;
  mostPopularSkill: string;
  topBadges: string[];
}
