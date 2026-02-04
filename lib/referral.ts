/**
 * Service de gestion du parrainage et de la communauté
 */

import type { ReferralCode, Referral, FriendChallenge, CommunityLeaderboard } from './types-referral';

/**
 * Génère un code de parrainage unique
 */
export function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Crée un nouveau code de parrainage
 */
export function createReferralCode(userId: string): ReferralCode {
  return {
    id: `ref-${Date.now()}`,
    code: generateReferralCode(),
    userId,
    createdAt: Date.now(),
    expiresAt: Date.now() + 365 * 24 * 60 * 60 * 1000, // 1 an
    usageCount: 0,
    maxUsage: undefined, // Illimité
    bonus: {
      referrerXP: 100,
      refereeXP: 50,
      badge: 'referral-master',
    },
    active: true,
  };
}

/**
 * Crée un nouveau parrainage
 */
export function createReferral(referrerId: string, refereeId: string, referralCode: string): Referral {
  return {
    id: `ref-${Date.now()}`,
    referrerId,
    refereeId,
    referralCode,
    createdAt: Date.now(),
    status: 'pending',
    bonusAwarded: false,
  };
}

/**
 * Complète un parrainage
 */
export function completeReferral(referral: Referral): Referral {
  return {
    ...referral,
    status: 'completed',
    completedAt: Date.now(),
  };
}

/**
 * Crée un défi entre amis
 */
export function createFriendChallenge(
  challengerId: string,
  challengeeId: string,
  skillId: string,
  targetValue: number
): FriendChallenge {
  return {
    id: `challenge-${Date.now()}`,
    challengerId,
    challengeeId,
    skillId,
    targetValue,
    createdAt: Date.now(),
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 jours
    status: 'pending',
    challengerProgress: 0,
    challengeeProgress: 0,
    reward: {
      xp: 150,
      badge: 'friend-champion',
    },
  };
}

/**
 * Met à jour la progression d'un défi entre amis
 */
export function updateFriendChallengeProgress(
  challenge: FriendChallenge,
  userId: string,
  progress: number
): FriendChallenge {
  const updated = { ...challenge };

  if (userId === challenge.challengerId) {
    updated.challengerProgress = Math.min(progress, challenge.targetValue);
  } else if (userId === challenge.challengeeId) {
    updated.challengeeProgress = Math.min(progress, challenge.targetValue);
  }

  // Vérifier si le défi est complété
  if (updated.challengerProgress >= challenge.targetValue || updated.challengeeProgress >= challenge.targetValue) {
    updated.status = 'completed';
    updated.winner =
      updated.challengerProgress >= challenge.targetValue ? challenge.challengerId : challenge.challengeeId;
  }

  return updated;
}

/**
 * Génère le leaderboard communautaire
 */
export function generateCommunityLeaderboard(users: any[]): CommunityLeaderboard[] {
  return users
    .map((user, index) => ({
      userId: user.id,
      username: user.username || `User ${user.id.slice(0, 8)}`,
      avatar: user.avatar,
      totalXP: user.totalXP || 0,
      level: user.level || 1,
      skillsCount: user.skillsCount || 0,
      badgesCount: user.badgesCount || 0,
      rank: index + 1,
    }))
    .sort((a, b) => b.totalXP - a.totalXP)
    .map((user, index) => ({
      ...user,
      rank: index + 1,
    }));
}

/**
 * Calcule les statistiques de parrainage
 */
export function calculateReferralStats(referrals: Referral[]) {
  const completed = referrals.filter(r => r.status === 'completed').length;
  const pending = referrals.filter(r => r.status === 'pending').length;
  const totalXP = completed * 100; // 100 XP par parrainage complété

  return {
    totalReferrals: referrals.length,
    completedReferrals: completed,
    pendingReferrals: pending,
    totalXP,
  };
}

/**
 * Valide un code de parrainage
 */
export function validateReferralCode(code: ReferralCode): boolean {
  if (!code.active) return false;
  if (code.expiresAt && Date.now() > code.expiresAt) return false;
  if (code.maxUsage && code.usageCount >= code.maxUsage) return false;
  return true;
}

/**
 * Récupère les défis entre amis actifs
 */
export function getActiveFriendChallenges(challenges: FriendChallenge[], userId: string): FriendChallenge[] {
  return challenges.filter(
    c =>
      (c.challengerId === userId || c.challengeeId === userId) &&
      c.status !== 'expired' &&
      Date.now() < c.expiresAt
  );
}

/**
 * Récupère les défis entre amis complétés
 */
export function getCompletedFriendChallenges(challenges: FriendChallenge[], userId: string): FriendChallenge[] {
  return challenges.filter(
    c =>
      (c.challengerId === userId || c.challengeeId === userId) &&
      c.status === 'completed'
  );
}

/**
 * Calcule le taux de victoire dans les défis entre amis
 */
export function calculateWinRate(challenges: FriendChallenge[], userId: string): number {
  const completed = getCompletedFriendChallenges(challenges, userId);
  if (completed.length === 0) return 0;

  const wins = completed.filter(c => c.winner === userId).length;
  return Math.round((wins / completed.length) * 100);
}
