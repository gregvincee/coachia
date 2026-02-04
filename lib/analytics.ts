/**
 * Service d'analytics et de données avancées
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  AnalyticsEvent,
  UserAnalytics,
  SkillAnalytics,
  ProgressReport,
  AIRecommendation,
  LearningPath,
  UserInsight,
} from './types-analytics';

/**
 * Enregistre un événement d'analytics
 */
export async function trackEvent(
  userId: string,
  eventName: string,
  properties?: Record<string, any>
): Promise<void> {
  try {
    const event: AnalyticsEvent = {
      id: `event-${Date.now()}`,
      userId,
      eventType: 'user_action',
      eventName,
      properties: properties || {},
      timestamp: Date.now(),
      sessionId: await getSessionId(),
    };

    // Sauvegarder localement
    const events = await getStoredEvents();
    events.push(event);
    await AsyncStorage.setItem('analyticsEvents', JSON.stringify(events.slice(-1000))); // Garder les 1000 derniers
  } catch (error) {
    console.error('Erreur lors du tracking:', error);
  }
}

/**
 * Récupère l'ID de session
 */
async function getSessionId(): Promise<string> {
  let sessionId = await AsyncStorage.getItem('sessionId');
  if (!sessionId) {
    sessionId = `session-${Date.now()}`;
    await AsyncStorage.setItem('sessionId', sessionId);
  }
  return sessionId;
}

/**
 * Récupère les événements stockés
 */
async function getStoredEvents(): Promise<AnalyticsEvent[]> {
  try {
    const stored = await AsyncStorage.getItem('analyticsEvents');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Calcule les analytics utilisateur
 */
export async function calculateUserAnalytics(userId: string): Promise<UserAnalytics> {
  try {
    const events = await getStoredEvents();
    const userEvents = events.filter(e => e.userId === userId);

    const sessionsCount = userEvents.filter(e => e.eventName === 'session_completed').length;
    const xpGained = userEvents
      .filter(e => e.eventName === 'xp_earned')
      .reduce((sum, e) => sum + (e.properties.amount || 0), 0);

    const badgesUnlocked = userEvents.filter(e => e.eventName === 'badge_unlocked').length;

    return {
      userId,
      totalSessions: sessionsCount,
      totalXP: xpGained,
      averageSessionDuration: 25, // Placeholder
      lastSessionDate: userEvents.length > 0 ? userEvents[userEvents.length - 1].timestamp : Date.now(),
      skillsAttempted: 6,
      skillsCompleted: 3,
      badgesUnlocked,
      streakCurrent: 5,
      streakLongest: 12,
      engagementScore: Math.min(100, (sessionsCount / 30) * 100),
      retentionDays: Math.floor((Date.now() - (userEvents[0]?.timestamp || Date.now())) / (24 * 60 * 60 * 1000)),
    };
  } catch (error) {
    console.error('Erreur lors du calcul des analytics:', error);
    return {
      userId,
      totalSessions: 0,
      totalXP: 0,
      averageSessionDuration: 0,
      lastSessionDate: Date.now(),
      skillsAttempted: 0,
      skillsCompleted: 0,
      badgesUnlocked: 0,
      streakCurrent: 0,
      streakLongest: 0,
      engagementScore: 0,
      retentionDays: 0,
    };
  }
}

/**
 * Génère un rapport de progression
 */
export function generateProgressReport(
  userId: string,
  analytics: UserAnalytics,
  period: 'daily' | 'weekly' | 'monthly' = 'weekly'
): ProgressReport {
  const now = Date.now();
  const periodMs = period === 'daily' ? 24 * 60 * 60 * 1000 : period === 'weekly' ? 7 * 24 * 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000;

  return {
    id: `report-${Date.now()}`,
    userId,
    period,
    startDate: now - periodMs,
    endDate: now,
    summary: {
      sessionsCompleted: analytics.totalSessions,
      xpGained: analytics.totalXP,
      badgesUnlocked: analytics.badgesUnlocked,
      skillsImproved: ['public-speaking', 'productivity'],
      streakMaintained: analytics.streakCurrent > 0,
    },
    insights: [
      'Vous pratiquez régulièrement le coaching IA',
      'Votre engagement augmente chaque semaine',
      'Vous excellez en gestion du temps',
    ],
    recommendations: [
      'Essayez une nouvelle compétence cette semaine',
      'Relevez le défi "Maître de la conversation"',
      'Invitez un ami pour un défi',
    ],
    trends: {
      mostPracticedSkill: 'public-speaking',
      bestTimeToLearn: '09:00',
      improvementAreas: ['leadership', 'communication'],
    },
  };
}

/**
 * Génère des recommandations IA
 */
export function generateAIRecommendations(analytics: UserAnalytics): AIRecommendation[] {
  const recommendations: AIRecommendation[] = [];

  // Recommandation de compétence
  if (analytics.skillsAttempted < 3) {
    recommendations.push({
      id: `rec-${Date.now()}-1`,
      userId: analytics.userId,
      type: 'skill_suggestion',
      title: 'Explorez de nouvelles compétences',
      description: 'Vous avez essayé moins de 3 compétences. Découvrez le leadership ou la communication !',
      reason: 'Diversifier vos compétences augmente votre engagement',
      targetSkill: 'leadership',
      priority: 'medium',
      timestamp: Date.now(),
      dismissed: false,
    });
  }

  // Recommandation de défi
  if (analytics.totalSessions > 5) {
    recommendations.push({
      id: `rec-${Date.now()}-2`,
      userId: analytics.userId,
      type: 'challenge_recommendation',
      title: 'Relevez un défi difficile',
      description: 'Vous êtes prêt pour les défis difficiles. Essayez "Marathonien" !',
      reason: 'Vous avez complété suffisamment de sessions',
      priority: 'high',
      timestamp: Date.now(),
      dismissed: false,
    });
  }

  // Recommandation de chemin d'apprentissage
  if (analytics.engagementScore > 50) {
    recommendations.push({
      id: `rec-${Date.now()}-3`,
      userId: analytics.userId,
      type: 'learning_path',
      title: 'Créer un chemin d\'apprentissage personnalisé',
      description: 'Basé sur vos préférences, nous recommandons un parcours de 30 jours',
      reason: 'Votre engagement est excellent',
      priority: 'medium',
      timestamp: Date.now(),
      dismissed: false,
    });
  }

  return recommendations;
}

/**
 * Crée un chemin d'apprentissage personnalisé
 */
export function createLearningPath(
  userId: string,
  skills: string[],
  difficulty: 'beginner' | 'intermediate' | 'advanced' = 'intermediate'
): LearningPath {
  const durationDays = difficulty === 'beginner' ? 14 : difficulty === 'intermediate' ? 30 : 60;

  return {
    id: `path-${Date.now()}`,
    userId,
    name: `Chemin ${difficulty} - ${new Date().toLocaleDateString()}`,
    description: `Parcours d'apprentissage personnalisé pour ${skills.length} compétences`,
    skills,
    duration: durationDays,
    difficulty,
    progress: 0,
    createdAt: Date.now(),
    milestones: skills.map((skill, idx) => ({
      id: `milestone-${idx}`,
      name: `Maîtriser ${skill}`,
      description: `Atteindre le niveau 5 en ${skill}`,
      skillId: skill,
      targetValue: 500,
      completed: false,
      reward: {
        xp: 200,
        badge: `master-${skill}`,
      },
    })),
  };
}

/**
 * Génère des insights utilisateur
 */
export function generateUserInsights(analytics: UserAnalytics): UserInsight[] {
  const insights: UserInsight[] = [];

  // Force
  if (analytics.streakCurrent >= 7) {
    insights.push({
      id: `insight-${Date.now()}-1`,
      userId: analytics.userId,
      type: 'strength',
      title: 'Excellente constance',
      description: `Vous maintenez un streak de ${analytics.streakCurrent} jours !`,
      data: { streakDays: analytics.streakCurrent },
      actionable: false,
      timestamp: Date.now(),
    });
  }

  // Faiblesse
  if (analytics.skillsCompleted < 2) {
    insights.push({
      id: `insight-${Date.now()}-2`,
      userId: analytics.userId,
      type: 'weakness',
      title: 'Peu de compétences complétées',
      description: 'Vous avez commencé plusieurs compétences mais peu complétées',
      data: { skillsAttempted: analytics.skillsAttempted, skillsCompleted: analytics.skillsCompleted },
      actionable: true,
      suggestedAction: 'Concentrez-vous sur une seule compétence jusqu\'au niveau 5',
      timestamp: Date.now(),
    });
  }

  // Opportunité
  if (analytics.engagementScore > 60) {
    insights.push({
      id: `insight-${Date.now()}-3`,
      userId: analytics.userId,
      type: 'opportunity',
      title: 'Prêt pour le premium',
      description: 'Votre engagement suggère que le premium pourrait vous être bénéfique',
      data: { engagementScore: analytics.engagementScore },
      actionable: true,
      suggestedAction: 'Explorez les fonctionnalités premium',
      timestamp: Date.now(),
    });
  }

  return insights;
}

/**
 * Exporte les données utilisateur
 */
export async function exportUserData(userId: string, format: 'pdf' | 'csv' | 'json' = 'json'): Promise<string> {
  try {
    const analytics = await calculateUserAnalytics(userId);
    const events = await getStoredEvents();
    const userEvents = events.filter(e => e.userId === userId);

    const data = {
      userId,
      exportDate: new Date().toISOString(),
      analytics,
      eventCount: userEvents.length,
      format,
    };

    // Simuler l'export
    return JSON.stringify(data, null, 2);
  } catch (error) {
    console.error('Erreur lors de l\'export:', error);
    throw error;
  }
}
