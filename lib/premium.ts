/**
 * Service de gestion de la monétisation premium
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PremiumPlan, UserSubscription, CoachingPackage, SubscriptionPlan } from './types-premium';

/**
 * Plans premium disponibles
 */
export const PREMIUM_PLANS: PremiumPlan[] = [
  {
    id: 'free',
    name: 'Gratuit',
    description: 'Accès complet aux fonctionnalités de base',
    price: { monthly: 0, yearly: 0 },
    features: [
      'Accès à toutes les compétences',
      'Sessions de coaching illimitées',
      'Système de gamification complet',
      'Sauvegarde locale des données',
    ],
    limits: {
      dailyPrompts: 5,
      monthlyCoachingSessions: 30,
      storageGB: 1,
      prioritySupport: false,
      customCoaching: false,
      advancedAnalytics: false,
      adFree: false,
    },
    color: '#6B7280',
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Pour les utilisateurs sérieux',
    price: { monthly: 7.99, yearly: 79.99 },
    features: [
      'Tout du plan Gratuit',
      'Prompts IA avancés et personnalisés',
      'Analyses de progression détaillées',
      'Contenu exclusif et challenges privés',
      'Coaching personnalisé sur mesure',
      'Synchronisation multi-appareils',
      'Support prioritaire',
    ],
    limits: {
      dailyPrompts: 50,
      monthlyCoachingSessions: 200,
      storageGB: 10,
      prioritySupport: true,
      customCoaching: true,
      advancedAnalytics: true,
      adFree: true,
    },
    badge: 'pro-member',
    color: '#8B5CF6',
  },
  {
    id: 'elite',
    name: 'Elite',
    description: 'Pour les experts en quête de perfection',
    price: { monthly: 14.99, yearly: 149.99 },
    features: [
      'Tout du plan Pro',
      'Coaching 1-on-1 avec experts',
      'Rapports de progression hebdomadaires',
      'Accès API pour intégrations',
      'Contenu premium exclusif',
      'Priorité absolue du support',
      'Accès aux bêta-tests',
      'Réductions sur les packs coaching',
    ],
    limits: {
      dailyPrompts: 200,
      monthlyCoachingSessions: 500,
      storageGB: 100,
      prioritySupport: true,
      customCoaching: true,
      advancedAnalytics: true,
      adFree: true,
    },
    badge: 'elite-member',
    color: '#F59E0B',
  },
];

/**
 * Packs coaching personnalisés
 */
export const COACHING_PACKAGES: CoachingPackage[] = [
  {
    id: 'starter-pack',
    name: 'Pack Démarrage',
    description: '5 sessions de coaching guidées',
    price: 19.99,
    duration: 30,
    sessions: 5,
    customization: false,
    bonus: { xp: 100 },
  },
  {
    id: 'intensive-pack',
    name: 'Pack Intensif',
    description: '15 sessions avec feedback personnalisé',
    price: 49.99,
    duration: 60,
    sessions: 15,
    customization: true,
    bonus: { xp: 300, badge: 'intensive-learner' },
  },
  {
    id: 'master-pack',
    name: 'Pack Maître',
    description: '30 sessions + coaching 1-on-1',
    price: 99.99,
    duration: 90,
    sessions: 30,
    customization: true,
    bonus: { xp: 500, badge: 'master-student' },
  },
];

/**
 * Crée une nouvelle souscription
 */
export function createSubscription(userId: string, plan: SubscriptionPlan): UserSubscription {
  const now = Date.now();
  const renewalDate = now + 30 * 24 * 60 * 60 * 1000; // 30 jours

  return {
    id: `sub-${Date.now()}`,
    userId,
    plan,
    status: 'active',
    billingCycle: 'monthly',
    startDate: now,
    renewalDate,
    autoRenew: true,
  };
}

/**
 * Vérifie si un utilisateur a accès à une fonctionnalité premium
 */
export function hasPremiumAccess(subscription: UserSubscription | null, requiredPlan: SubscriptionPlan): boolean {
  if (!subscription || subscription.status !== 'active') return false;

  const planHierarchy = { free: 0, pro: 1, elite: 2 };
  const userLevel = planHierarchy[subscription.plan] || 0;
  const requiredLevel = planHierarchy[requiredPlan] || 0;

  return userLevel >= requiredLevel;
}

/**
 * Obtient le plan premium par ID
 */
export function getPremiumPlan(planId: string): PremiumPlan | undefined {
  return PREMIUM_PLANS.find(p => p.id === planId);
}

/**
 * Calcule le prix avec réduction
 */
export function calculateDiscountedPrice(price: number, discountPercent: number): number {
  return Math.round(price * (1 - discountPercent / 100) * 100) / 100;
}

/**
 * Vérifie si une souscription est expirée
 */
export function isSubscriptionExpired(subscription: UserSubscription): boolean {
  return subscription.status === 'expired' || Date.now() > subscription.renewalDate;
}

/**
 * Calcule les jours restants avant renouvellement
 */
export function getDaysUntilRenewal(subscription: UserSubscription): number {
  const daysLeft = Math.ceil((subscription.renewalDate - Date.now()) / (24 * 60 * 60 * 1000));
  return Math.max(0, daysLeft);
}

/**
 * Charge la souscription utilisateur
 */
export async function loadUserSubscription(userId: string): Promise<UserSubscription | null> {
  try {
    const stored = await AsyncStorage.getItem(`subscription-${userId}`);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Erreur lors du chargement de la souscription:', error);
    return null;
  }
}

/**
 * Sauvegarde la souscription utilisateur
 */
export async function saveUserSubscription(subscription: UserSubscription): Promise<void> {
  try {
    await AsyncStorage.setItem(`subscription-${subscription.userId}`, JSON.stringify(subscription));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de la souscription:', error);
  }
}

/**
 * Annule une souscription
 */
export function cancelSubscription(subscription: UserSubscription): UserSubscription {
  return {
    ...subscription,
    status: 'canceled',
    canceledAt: Date.now(),
    autoRenew: false,
  };
}

/**
 * Renouvelle une souscription
 */
export function renewSubscription(subscription: UserSubscription): UserSubscription {
  const renewalDate = Date.now() + 30 * 24 * 60 * 60 * 1000;
  return {
    ...subscription,
    status: 'active',
    renewalDate,
    startDate: Date.now(),
  };
}

/**
 * Obtient les limites pour un plan
 */
export function getPlanLimits(plan: SubscriptionPlan) {
  const planObj = PREMIUM_PLANS.find(p => p.id === plan);
  return planObj?.limits || PREMIUM_PLANS[0].limits;
}

/**
 * Vérifie si l'utilisateur peut effectuer une action
 */
export function canPerformAction(
  subscription: UserSubscription | null,
  action: 'use_prompt' | 'start_session' | 'access_analytics',
  currentUsage: number
): boolean {
  const plan = subscription?.plan || 'free';
  const limits = getPlanLimits(plan);

  switch (action) {
    case 'use_prompt':
      return currentUsage < limits.dailyPrompts;
    case 'start_session':
      return currentUsage < limits.monthlyCoachingSessions;
    case 'access_analytics':
      return limits.advancedAnalytics;
    default:
      return false;
  }
}
