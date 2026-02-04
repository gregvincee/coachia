/**
 * Service de gestion des défis hebdomadaires
 */

import type { Challenge, UserChallenge, ChallengeStatus, ChallengeDifficulty } from './types-challenges';

// Défis hebdomadaires prédéfinis
export const WEEKLY_CHALLENGES: Challenge[] = [
  {
    id: 'daily-session',
    title: 'Session quotidienne',
    description: 'Complétez une session de coaching chaque jour',
    skillId: 'all',
    difficulty: 'easy',
    category: 'daily',
    objective: 'Complétez 7 sessions en 7 jours',
    targetValue: 7,
    reward: {
      xp: 70,
      bonus: 50,
      badge: 'daily-champion',
    },
    startDate: Date.now(),
    endDate: Date.now() + 7 * 24 * 60 * 60 * 1000,
    icon: '📅',
    color: '#3B82F6',
  },
  {
    id: 'message-master',
    title: 'Maître de la conversation',
    description: 'Envoyez 50 messages au coach IA',
    skillId: 'all',
    difficulty: 'medium',
    category: 'weekly',
    objective: 'Envoyez 50 messages en une semaine',
    targetValue: 50,
    reward: {
      xp: 100,
      bonus: 75,
      badge: 'message-master',
    },
    startDate: Date.now(),
    endDate: Date.now() + 7 * 24 * 60 * 60 * 1000,
    icon: '💬',
    color: '#8B5CF6',
  },
  {
    id: 'skill-explorer',
    title: 'Explorateur de compétences',
    description: 'Essayez 3 compétences différentes',
    skillId: 'all',
    difficulty: 'easy',
    category: 'weekly',
    objective: 'Pratiquez 3 compétences différentes',
    targetValue: 3,
    reward: {
      xp: 75,
      bonus: 50,
      badge: 'skill-explorer',
    },
    startDate: Date.now(),
    endDate: Date.now() + 7 * 24 * 60 * 60 * 1000,
    icon: '🎯',
    color: '#10B981',
  },
  {
    id: 'consistency-king',
    title: 'Roi de la constance',
    description: 'Maintenez un streak de 7 jours',
    skillId: 'all',
    difficulty: 'hard',
    category: 'weekly',
    objective: 'Pratiquez 7 jours consécutifs',
    targetValue: 7,
    reward: {
      xp: 150,
      bonus: 100,
      badge: 'consistency-king',
    },
    startDate: Date.now(),
    endDate: Date.now() + 7 * 24 * 60 * 60 * 1000,
    icon: '🔥',
    color: '#EF4444',
  },
  {
    id: 'deep-dive',
    title: 'Plongée profonde',
    description: 'Complétez 10 sessions dans une même compétence',
    skillId: 'all',
    difficulty: 'hard',
    category: 'weekly',
    objective: 'Pratiquez intensément une compétence',
    targetValue: 10,
    reward: {
      xp: 120,
      bonus: 80,
      badge: 'deep-dive',
    },
    startDate: Date.now(),
    endDate: Date.now() + 7 * 24 * 60 * 60 * 1000,
    icon: '🏊',
    color: '#06B6D4',
  },
];

/**
 * Crée un nouveau défi utilisateur
 */
export function createUserChallenge(challengeId: string): UserChallenge {
  return {
    id: `${challengeId}-${Date.now()}`,
    challengeId,
    userId: 'current-user', // À remplacer par l'ID utilisateur réel
    status: 'active',
    progress: 0,
    startedAt: Date.now(),
    claimed: false,
  };
}

/**
 * Met à jour la progression d'un défi
 */
export function updateChallengeProgress(
  challenge: UserChallenge,
  challengeDefinition: Challenge,
  increment: number
): UserChallenge {
  const newProgress = challenge.progress + increment;
  const isCompleted = newProgress >= challengeDefinition.targetValue;

  return {
    ...challenge,
    progress: Math.min(newProgress, challengeDefinition.targetValue),
    status: isCompleted ? 'completed' : challenge.status,
    completedAt: isCompleted ? Date.now() : challenge.completedAt,
  };
}

/**
 * Calcule le pourcentage de progression d'un défi
 */
export function getChallengeProgress(
  challenge: UserChallenge,
  challengeDefinition: Challenge
): number {
  return Math.min((challenge.progress / challengeDefinition.targetValue) * 100, 100);
}

/**
 * Vérifie si un défi est expiré
 */
export function isChallengeExpired(challenge: Challenge): boolean {
  return Date.now() > challenge.endDate;
}

/**
 * Récupère les défis actifs pour cette semaine
 */
export function getWeekChallenges(): Challenge[] {
  return WEEKLY_CHALLENGES.filter(c => !isChallengeExpired(c));
}

/**
 * Récupère les défis par difficulté
 */
export function getChallengesByDifficulty(difficulty: ChallengeDifficulty): Challenge[] {
  return WEEKLY_CHALLENGES.filter(c => c.difficulty === difficulty && !isChallengeExpired(c));
}

/**
 * Calcule le total de récompenses XP pour les défis complétés
 */
export function calculateTotalReward(completedChallenges: UserChallenge[], challengeDefinitions: Challenge[]): number {
  return completedChallenges.reduce((total, userChallenge) => {
    const definition = challengeDefinitions.find(c => c.id === userChallenge.challengeId);
    if (definition && userChallenge.status === 'completed') {
      return total + definition.reward.xp + definition.reward.bonus;
    }
    return total;
  }, 0);
}

/**
 * Génère le leaderboard des défis
 */
export function generateLeaderboard(userChallenges: UserChallenge[], challengeDefinitions: Challenge[]) {
  const leaderboard = new Map<string, { completedCount: number; totalXP: number }>();

  userChallenges.forEach(uc => {
    const definition = challengeDefinitions.find(c => c.id === uc.challengeId);
    if (definition && uc.status === 'completed') {
      const current = leaderboard.get(uc.userId) || { completedCount: 0, totalXP: 0 };
      leaderboard.set(uc.userId, {
        completedCount: current.completedCount + 1,
        totalXP: current.totalXP + definition.reward.xp + definition.reward.bonus,
      });
    }
  });

  return Array.from(leaderboard.entries())
    .map(([userId, data], index) => ({
      userId,
      username: `User ${userId.slice(0, 8)}`,
      challengesCompleted: data.completedCount,
      totalXP: data.totalXP,
      rank: index + 1,
    }))
    .sort((a, b) => b.totalXP - a.totalXP);
}
