/**
 * Service de gamification pour gérer XP, niveaux et badges
 */

import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import {
  getUserProfile,
  saveUserProfile,
  getBadges,
  unlockBadge,
  getSkillsProgress,
  updateSkillProgress,
} from './storage';
import { getLevelFromXP, getXPForLevel } from './data';

// Montants d'XP pour différentes actions
export const XP_REWARDS = {
  MESSAGE_SENT: 10,
  SESSION_COMPLETED: 50,
  STREAK_7_DAYS: 100,
  BADGE_UNLOCKED: 25,
};

/**
 * Ajouter de l'XP à l'utilisateur et vérifier le level up
 */
export async function addXP(amount: number): Promise<{ leveledUp: boolean; newLevel?: number }> {
  const profile = await getUserProfile();
  if (!profile) return { leveledUp: false };

  const oldLevel = profile.level;
  profile.xp += amount;
  profile.level = getLevelFromXP(profile.xp);

  await saveUserProfile(profile);

  const leveledUp = profile.level > oldLevel;

  if (leveledUp && Platform.OS !== 'web') {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  return {
    leveledUp,
    newLevel: leveledUp ? profile.level : undefined,
  };
}

/**
 * Ajouter de l'XP pour une compétence spécifique
 */
export async function addSkillXP(skillId: string, amount: number): Promise<void> {
  const progress = await getSkillsProgress();
  const skillProgress = progress[skillId] || {
    skillId,
    level: 1,
    xp: 0,
    sessionsCount: 0,
  };

  skillProgress.xp += amount;
  skillProgress.level = getLevelFromXP(skillProgress.xp);
  skillProgress.lastSessionAt = new Date();

  await updateSkillProgress(skillId, skillProgress);
}

/**
 * Marquer une session comme complétée
 */
export async function completeSession(skillId: string): Promise<void> {
  // Ajouter XP global
  await addXP(XP_REWARDS.SESSION_COMPLETED);

  // Ajouter XP pour la compétence
  await addSkillXP(skillId, XP_REWARDS.SESSION_COMPLETED);

  // Incrémenter le compteur de sessions
  const progress = await getSkillsProgress();
  const skillProgress = progress[skillId];
  if (skillProgress) {
    skillProgress.sessionsCount += 1;
    await updateSkillProgress(skillId, skillProgress);
  }

  // Mettre à jour la date de dernière session
  const profile = await getUserProfile();
  if (profile) {
    profile.lastSessionAt = new Date();
    await saveUserProfile(profile);
  }

  // Vérifier les badges
  await checkBadges();
}

/**
 * Vérifier et débloquer les badges
 */
export async function checkBadges(): Promise<string[]> {
  const profile = await getUserProfile();
  const badges = await getBadges();
  const skillsProgress = await getSkillsProgress();

  if (!profile) return [];

  const unlockedBadges: string[] = [];

  for (const badge of badges) {
    if (badge.unlocked) continue;

    let shouldUnlock = false;

    switch (badge.id) {
      case 'first-step':
        // Première session complétée
        const totalSessions = Object.values(skillsProgress).reduce(
          (sum, skill) => sum + skill.sessionsCount,
          0
        );
        shouldUnlock = totalSessions >= 1;
        break;

      case 'chatty':
        // 50 messages envoyés (approximation: 5 messages = 1 session)
        const totalMessages = Object.values(skillsProgress).reduce(
          (sum, skill) => sum + skill.sessionsCount * 5,
          0
        );
        shouldUnlock = totalMessages >= 50;
        break;

      case 'consistent':
        // Streak de 7 jours
        shouldUnlock = profile.streak >= 7;
        break;

      case 'versatile':
        // 3 compétences différentes essayées
        const skillsTriedCount = Object.keys(skillsProgress).length;
        shouldUnlock = skillsTriedCount >= 3;
        break;

      case 'expert':
        // Niveau 5 dans une compétence
        const hasLevel5 = Object.values(skillsProgress).some((skill) => skill.level >= 5);
        shouldUnlock = hasLevel5;
        break;

      case 'marathoner':
        // 30 sessions complétées
        const totalSessionsMarathon = Object.values(skillsProgress).reduce(
          (sum, skill) => sum + skill.sessionsCount,
          0
        );
        shouldUnlock = totalSessionsMarathon >= 30;
        break;

      case 'night-owl':
        // Session après 22h
        if (profile.lastSessionAt) {
          const hour = profile.lastSessionAt.getHours();
          shouldUnlock = hour >= 22 || hour < 6;
        }
        break;

      case 'early-bird':
        // Session avant 7h
        if (profile.lastSessionAt) {
          const hour = profile.lastSessionAt.getHours();
          shouldUnlock = hour >= 5 && hour < 7;
        }
        break;
    }

    if (shouldUnlock) {
      await unlockBadge(badge.id);
      await addXP(XP_REWARDS.BADGE_UNLOCKED);
      unlockedBadges.push(badge.id);

      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }
  }

  return unlockedBadges;
}

/**
 * Mettre à jour le streak de l'utilisateur
 */
export async function updateStreak(): Promise<void> {
  const profile = await getUserProfile();
  if (!profile) return;

  const now = new Date();
  const lastSession = profile.lastSessionAt;

  if (!lastSession) {
    // Première session
    profile.streak = 1;
  } else {
    const daysDiff = Math.floor(
      (now.getTime() - lastSession.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff === 0) {
      // Même jour, pas de changement
      return;
    } else if (daysDiff === 1) {
      // Jour consécutif, incrémenter le streak
      profile.streak += 1;

      // Vérifier le badge de streak
      if (profile.streak === 7) {
        await addXP(XP_REWARDS.STREAK_7_DAYS);
        await checkBadges();
      }
    } else {
      // Streak cassé, réinitialiser
      profile.streak = 1;
    }
  }

  profile.lastSessionAt = now;
  await saveUserProfile(profile);
}
