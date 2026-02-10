/**
 * Types pour l'IA avancée avec prompts contextuels et recommandations ML
 */

export interface ContextualPrompt {
  id: string;
  skillId: string;
  title: string;
  description: string;
  category: 'beginner' | 'intermediate' | 'advanced';
  difficulty: number; // 1-10
  template: string;
  variables: PromptVariable[];
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

export interface PromptVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array';
  description: string;
  defaultValue?: any;
  required: boolean;
}

export interface AIResponse {
  id: string;
  promptId: string;
  userInput: string;
  aiOutput: string;
  sentiment: SentimentAnalysis;
  quality: QualityScore;
  feedback?: UserFeedback;
  timestamp: number;
  duration: number; // en ms
}

export interface SentimentAnalysis {
  score: number; // -1 (negative) to 1 (positive)
  emotion: 'positive' | 'neutral' | 'negative';
  confidence: number; // 0-1
  keywords: string[];
}

export interface QualityScore {
  relevance: number; // 0-1
  clarity: number; // 0-1
  helpfulness: number; // 0-1
  overall: number; // 0-1
  suggestions: string[];
}

export interface UserFeedback {
  rating: number; // 1-5
  helpful: boolean;
  comment?: string;
  timestamp: number;
}

export interface MLRecommendation {
  id: string;
  userId: string;
  type: 'skill' | 'prompt' | 'challenge' | 'content';
  targetId: string;
  title: string;
  description: string;
  score: number; // 0-1 (confidence)
  reason: string;
  createdAt: number;
  expiresAt: number;
}

export interface UserLearningProfile {
  userId: string;
  skillProficiencies: Record<string, SkillProficiency>;
  learningStyle: LearningStyle;
  preferredDifficulty: number; // 1-10
  averageSentiment: number; // -1 to 1
  engagementLevel: number; // 0-1
  lastUpdated: number;
}

export interface SkillProficiency {
  skillId: string;
  level: number; // 1-10
  xp: number;
  sessionsCompleted: number;
  averageScore: number; // 0-100
  lastPracticed: number;
  trend: 'improving' | 'stable' | 'declining';
}

export interface LearningStyle {
  visual: number; // 0-1
  auditory: number; // 0-1
  readingWriting: number; // 0-1
  kinesthetic: number; // 0-1
  pace: 'slow' | 'normal' | 'fast';
  preferredFormat: 'text' | 'video' | 'interactive' | 'mixed';
}

export interface ContentRecommendation {
  id: string;
  title: string;
  description: string;
  type: 'article' | 'video' | 'exercise' | 'challenge';
  skillId: string;
  difficulty: number;
  duration: number; // en minutes
  relevanceScore: number; // 0-1
  tags: string[];
  url?: string;
}

export interface PerformanceMetrics {
  userId: string;
  skillId: string;
  sessionsCompleted: number;
  averageSessionDuration: number; // en minutes
  averageScore: number; // 0-100
  improvementRate: number; // % par semaine
  consistencyScore: number; // 0-1
  streakDays: number;
  lastSessionDate: number;
}

export interface AIInsight {
  id: string;
  userId: string;
  type: 'strength' | 'weakness' | 'opportunity' | 'trend';
  title: string;
  description: string;
  actionItems: string[];
  priority: 'low' | 'medium' | 'high';
  timestamp: number;
}

export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  skillId: string;
  category: string;
  template: string;
  examples: PromptExample[];
  tags: string[];
}

export interface PromptExample {
  input: string;
  output: string;
  explanation: string;
}

export interface AdaptiveChallenge {
  id: string;
  skillId: string;
  title: string;
  description: string;
  difficulty: number; // 1-10
  estimatedDuration: number; // en minutes
  objectives: string[];
  resources: string[];
  adaptiveElements: AdaptiveElement[];
}

export interface AdaptiveElement {
  type: 'hint' | 'difficulty_adjustment' | 'resource_suggestion' | 'pacing';
  trigger: string; // condition
  action: string; // what to do
}

export interface LearningPath {
  id: string;
  userId: string;
  skillId: string;
  startDate: number;
  estimatedEndDate: number;
  milestones: Milestone[];
  progress: number; // 0-100
  status: 'active' | 'paused' | 'completed';
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  targetDate: number;
  completed: boolean;
  completedDate?: number;
  tasks: Task[];
}

export interface Task {
  id: string;
  title: string;
  description: string;
  type: 'exercise' | 'challenge' | 'project' | 'review';
  completed: boolean;
  completedDate?: number;
  estimatedDuration: number; // en minutes
}

export interface AnalyticsData {
  userId: string;
  period: 'day' | 'week' | 'month';
  sessionsCount: number;
  totalDuration: number; // en minutes
  skillsImproved: number;
  averageScore: number;
  xpGained: number;
  badgesUnlocked: number;
  streakDays: number;
}
