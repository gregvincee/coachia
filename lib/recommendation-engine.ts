/**
 * Moteur de recommandation avancé basé sur l'IA
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserProfile {
  userId: string;
  skills: string[];
  interests: string[];
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading-writing';
  level: 'beginner' | 'intermediate' | 'advanced';
  preferences: UserPreferences;
  activityHistory: UserActivity[];
}

export interface UserPreferences {
  preferredContentType: 'video' | 'text' | 'interactive' | 'mixed';
  preferredDifficulty: 'easy' | 'medium' | 'hard';
  preferredDuration: number; // en minutes
  preferredLanguage: string;
  notificationFrequency: 'daily' | 'weekly' | 'monthly';
}

export interface UserActivity {
  id: string;
  userId: string;
  type: 'view' | 'complete' | 'like' | 'share' | 'comment' | 'purchase';
  contentId: string;
  contentType: 'course' | 'challenge' | 'coaching' | 'resource';
  timestamp: number;
  duration?: number; // en secondes
  rating?: number;
}

export interface Recommendation {
  id: string;
  userId: string;
  contentId: string;
  contentTitle: string;
  contentType: 'course' | 'challenge' | 'coaching' | 'resource';
  score: number; // 0-100
  reason: string;
  category: 'skill_development' | 'trending' | 'personalized' | 'collaborative' | 'challenge';
  createdAt: number;
}

export interface ContentMetrics {
  contentId: string;
  views: number;
  completions: number;
  averageRating: number;
  engagementRate: number;
  shareCount: number;
  commentCount: number;
  trending: boolean;
}

export interface UserSimilarity {
  userId1: string;
  userId2: string;
  similarity: number; // 0-100
  commonSkills: string[];
  commonInterests: string[];
}

export interface CollaborativeRecommendation {
  userId: string;
  similarUserId: string;
  contentId: string;
  contentTitle: string;
  reason: string;
  score: number;
}

export interface LearningPath {
  id: string;
  userId: string;
  skillId: string;
  skillName: string;
  stages: LearningStage[];
  progress: number; // 0-100
  estimatedDuration: number; // en jours
  startedAt: number;
  completedAt?: number;
  status: 'active' | 'paused' | 'completed';
}

export interface LearningStage {
  id: string;
  name: string;
  description: string;
  content: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: number; // en minutes
  completed: boolean;
  completedAt?: number;
}

export interface AIInsight {
  id: string;
  userId: string;
  type: 'strength' | 'weakness' | 'opportunity' | 'trend' | 'milestone';
  title: string;
  description: string;
  actionable: boolean;
  suggestedAction?: string;
  confidence: number; // 0-100
  createdAt: number;
}

class RecommendationEngine {
  /**
   * Crée un profil utilisateur
   */
  async createUserProfile(
    userId: string,
    skills: string[],
    interests: string[],
    learningStyle: UserProfile['learningStyle']
  ): Promise<UserProfile> {
    const profile: UserProfile = {
      userId,
      skills,
      interests,
      learningStyle,
      level: 'beginner',
      preferences: {
        preferredContentType: 'mixed',
        preferredDifficulty: 'medium',
        preferredDuration: 30,
        preferredLanguage: 'fr',
        notificationFrequency: 'daily',
      },
      activityHistory: [],
    };

    await AsyncStorage.setItem(`userProfile-${userId}`, JSON.stringify(profile));
    return profile;
  }

  /**
   * Récupère le profil utilisateur
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const stored = await AsyncStorage.getItem(`userProfile-${userId}`);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error);
      return null;
    }
  }

  /**
   * Enregistre une activité utilisateur
   */
  async recordActivity(
    userId: string,
    type: UserActivity['type'],
    contentId: string,
    contentType: UserActivity['contentType'],
    duration?: number,
    rating?: number
  ): Promise<UserActivity> {
    const activity: UserActivity = {
      id: `activity-${Date.now()}`,
      userId,
      type,
      contentId,
      contentType,
      timestamp: Date.now(),
      duration,
      rating,
    };

    const profile = await this.getUserProfile(userId);
    if (profile) {
      profile.activityHistory.push(activity);
      await AsyncStorage.setItem(`userProfile-${userId}`, JSON.stringify(profile));
    }

    return activity;
  }

  /**
   * Génère des recommandations personnalisées
   */
  async generateRecommendations(userId: string, limit: number = 10): Promise<Recommendation[]> {
    try {
      const profile = await this.getUserProfile(userId);
      if (!profile) return [];

      const recommendations: Recommendation[] = [];

      // 1. Recommandations basées sur les compétences
      for (const skill of profile.skills) {
        const skillRecs = await this.getSkillBasedRecommendations(userId, skill);
        recommendations.push(...skillRecs);
      }

      // 2. Recommandations collaboratives
      const collaborativeRecs = await this.getCollaborativeRecommendations(userId);
      recommendations.push(...collaborativeRecs);

      // 3. Recommandations tendances
      const trendingRecs = await this.getTrendingRecommendations(userId);
      recommendations.push(...trendingRecs);

      // 4. Recommandations de défis
      const challengeRecs = await this.getChallengeRecommendations(userId);
      recommendations.push(...challengeRecs);

      // Trier par score et limiter
      return recommendations
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
    } catch (error) {
      console.error('Erreur lors de la génération des recommandations:', error);
      return [];
    }
  }

  /**
   * Recommandations basées sur les compétences
   */
  private async getSkillBasedRecommendations(userId: string, skill: string): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];

    // Simuler les recommandations basées sur les compétences
    const skillContent = [
      { id: 'course-1', title: `Maîtriser ${skill}`, type: 'course' as const },
      { id: 'challenge-1', title: `Défi ${skill}`, type: 'challenge' as const },
      { id: 'resource-1', title: `Ressource ${skill}`, type: 'resource' as const },
    ];

    for (const content of skillContent) {
      recommendations.push({
        id: `rec-${Date.now()}-${Math.random()}`,
        userId,
        contentId: content.id,
        contentTitle: content.title,
        contentType: content.type,
        score: 75 + Math.random() * 25,
        reason: `Basé sur votre intérêt pour ${skill}`,
        category: 'skill_development',
        createdAt: Date.now(),
      });
    }

    return recommendations;
  }

  /**
   * Recommandations collaboratives
   */
  private async getCollaborativeRecommendations(userId: string): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];

    // Simuler les recommandations collaboratives
    const similarUsers = await this.findSimilarUsers(userId, 5);

    for (const similar of similarUsers) {
      // Récupérer le contenu aimé par les utilisateurs similaires
      const similarProfile = await this.getUserProfile(similar.userId2);
      if (similarProfile) {
        for (const interest of similarProfile.interests) {
          recommendations.push({
            id: `rec-${Date.now()}-${Math.random()}`,
            userId,
            contentId: `collab-${interest}`,
            contentTitle: `Contenu populaire: ${interest}`,
            contentType: 'course',
            score: 60 + similar.similarity / 2,
            reason: `Aimé par des utilisateurs comme vous`,
            category: 'collaborative',
            createdAt: Date.now(),
          });
        }
      }
    }

    return recommendations;
  }

  /**
   * Recommandations tendances
   */
  private async getTrendingRecommendations(userId: string): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];

    // Simuler les recommandations tendances
    const trendingTopics = ['IA', 'Leadership', 'Communication', 'Productivité'];

    for (const topic of trendingTopics) {
      recommendations.push({
        id: `rec-${Date.now()}-${Math.random()}`,
        userId,
        contentId: `trending-${topic}`,
        contentTitle: `${topic} - Tendance du moment`,
        contentType: 'course',
        score: 70,
        reason: `Très populaire en ce moment`,
        category: 'trending',
        createdAt: Date.now(),
      });
    }

    return recommendations;
  }

  /**
   * Recommandations de défis
   */
  private async getChallengeRecommendations(userId: string): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];

    // Simuler les recommandations de défis
    const challenges = [
      { id: 'challenge-speaking', title: 'Défi: Prise de parole' },
      { id: 'challenge-writing', title: 'Défi: Écriture créative' },
      { id: 'challenge-leadership', title: 'Défi: Leadership' },
    ];

    for (const challenge of challenges) {
      recommendations.push({
        id: `rec-${Date.now()}-${Math.random()}`,
        userId,
        contentId: challenge.id,
        contentTitle: challenge.title,
        contentType: 'challenge',
        score: 65,
        reason: `Défi adapté à votre niveau`,
        category: 'challenge',
        createdAt: Date.now(),
      });
    }

    return recommendations;
  }

  /**
   * Trouve les utilisateurs similaires
   */
  async findSimilarUsers(userId: string, limit: number = 5): Promise<UserSimilarity[]> {
    try {
      const userProfile = await this.getUserProfile(userId);
      if (!userProfile) return [];

      const similarities: UserSimilarity[] = [];

      // Récupérer tous les profils utilisateurs
      const keys = await AsyncStorage.getAllKeys();
      const profileKeys = keys.filter(k => k.startsWith('userProfile-'));

      for (const key of profileKeys) {
        const stored = await AsyncStorage.getItem(key);
        if (stored) {
          const otherProfile = JSON.parse(stored);
          if (otherProfile.userId !== userId) {
            const similarity = this.calculateSimilarity(userProfile, otherProfile);
            similarities.push({
              userId1: userId,
              userId2: otherProfile.userId,
              similarity,
              commonSkills: userProfile.skills.filter(s => otherProfile.skills.includes(s)),
              commonInterests: userProfile.interests.filter(i => otherProfile.interests.includes(i)),
            });
          }
        }
      }

      return similarities
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);
    } catch (error) {
      console.error('Erreur lors de la recherche d\'utilisateurs similaires:', error);
      return [];
    }
  }

  /**
   * Calcule la similarité entre deux profils
   */
  private calculateSimilarity(profile1: UserProfile, profile2: UserProfile): number {
    let score = 0;

    // Compétences communes
    const commonSkills = profile1.skills.filter(s => profile2.skills.includes(s)).length;
    score += commonSkills * 10;

    // Intérêts communs
    const commonInterests = profile1.interests.filter(i => profile2.interests.includes(i)).length;
    score += commonInterests * 8;

    // Style d'apprentissage similaire
    if (profile1.learningStyle === profile2.learningStyle) {
      score += 15;
    }

    // Niveau similaire
    if (profile1.level === profile2.level) {
      score += 10;
    }

    return Math.min(score, 100);
  }

  /**
   * Crée un parcours d'apprentissage personnalisé
   */
  async createLearningPath(
    userId: string,
    skillId: string,
    skillName: string,
    difficulty: 'beginner' | 'intermediate' | 'advanced'
  ): Promise<LearningPath> {
    const stages: LearningStage[] = [
      {
        id: 'stage-1',
        name: 'Fondamentaux',
        description: `Apprendre les bases de ${skillName}`,
        content: ['intro', 'concepts', 'pratique'],
        difficulty: 'beginner',
        estimatedDuration: 120,
        completed: false,
      },
      {
        id: 'stage-2',
        name: 'Intermédiaire',
        description: `Approfondir vos connaissances en ${skillName}`,
        content: ['advanced-concepts', 'projects', 'feedback'],
        difficulty: 'intermediate',
        estimatedDuration: 180,
        completed: false,
      },
      {
        id: 'stage-3',
        name: 'Avancé',
        description: `Maîtriser ${skillName}`,
        content: ['expert-tips', 'challenges', 'mentoring'],
        difficulty: 'advanced',
        estimatedDuration: 240,
        completed: false,
      },
    ];

    const path: LearningPath = {
      id: `path-${Date.now()}`,
      userId,
      skillId,
      skillName,
      stages: stages.filter(s => s.difficulty === difficulty || s.difficulty === 'beginner'),
      progress: 0,
      estimatedDuration: 30,
      startedAt: Date.now(),
      status: 'active',
    };

    await AsyncStorage.setItem(`learningPath-${path.id}`, JSON.stringify(path));
    return path;
  }

  /**
   * Génère des insights IA
   */
  async generateAIInsights(userId: string): Promise<AIInsight[]> {
    try {
      const profile = await this.getUserProfile(userId);
      if (!profile) return [];

      const insights: AIInsight[] = [];

      // Analyser les forces
      if (profile.activityHistory.length > 10) {
        const completionRate = profile.activityHistory.filter(a => a.type === 'complete').length / profile.activityHistory.length;
        if (completionRate > 0.7) {
          insights.push({
            id: `insight-${Date.now()}`,
            userId,
            type: 'strength',
            title: 'Excellent taux de complétion',
            description: `Vous complétez ${(completionRate * 100).toFixed(0)}% de vos activités`,
            actionable: false,
            confidence: 95,
            createdAt: Date.now(),
          });
        }
      }

      // Identifier les opportunités
      const underexploredSkills = profile.skills.filter(
        s => !profile.activityHistory.some(a => a.contentId.includes(s))
      );
      if (underexploredSkills.length > 0) {
        insights.push({
          id: `insight-${Date.now()}`,
          userId,
          type: 'opportunity',
          title: 'Opportunités d\'apprentissage',
          description: `Explorez davantage: ${underexploredSkills.join(', ')}`,
          actionable: true,
          suggestedAction: `Commencer un défi sur ${underexploredSkills[0]}`,
          confidence: 85,
          createdAt: Date.now(),
        });
      }

      return insights;
    } catch (error) {
      console.error('Erreur lors de la génération des insights:', error);
      return [];
    }
  }
}

// Instance globale
const recommendationEngine = new RecommendationEngine();

export default recommendationEngine;

/**
 * Crée un profil utilisateur
 */
export async function createUserProfile(
  userId: string,
  skills: string[],
  interests: string[],
  learningStyle: UserProfile['learningStyle']
): Promise<UserProfile> {
  return recommendationEngine.createUserProfile(userId, skills, interests, learningStyle);
}

/**
 * Récupère le profil utilisateur
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  return recommendationEngine.getUserProfile(userId);
}

/**
 * Enregistre une activité utilisateur
 */
export async function recordActivity(
  userId: string,
  type: UserActivity['type'],
  contentId: string,
  contentType: UserActivity['contentType'],
  duration?: number,
  rating?: number
): Promise<UserActivity> {
  return recommendationEngine.recordActivity(userId, type, contentId, contentType, duration, rating);
}

/**
 * Génère des recommandations personnalisées
 */
export async function generateRecommendations(userId: string, limit?: number): Promise<Recommendation[]> {
  return recommendationEngine.generateRecommendations(userId, limit);
}

/**
 * Trouve les utilisateurs similaires
 */
export async function findSimilarUsers(userId: string, limit?: number): Promise<UserSimilarity[]> {
  return recommendationEngine.findSimilarUsers(userId, limit);
}

/**
 * Crée un parcours d'apprentissage personnalisé
 */
export async function createLearningPath(
  userId: string,
  skillId: string,
  skillName: string,
  difficulty: 'beginner' | 'intermediate' | 'advanced'
): Promise<LearningPath> {
  return recommendationEngine.createLearningPath(userId, skillId, skillName, difficulty);
}

/**
 * Génère des insights IA
 */
export async function generateAIInsights(userId: string): Promise<AIInsight[]> {
  return recommendationEngine.generateAIInsights(userId);
}
