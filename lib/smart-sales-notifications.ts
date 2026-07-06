// lib/smart-sales-notifications.ts
// ✅ Notifications intelligentes de vente basées sur le comportement utilisateur

export interface SalesNotification {
  id: string;
  title: string;
  message: string;
  purchaseId: string;
  purchasePrice: number;
  icon: string;
  urgency: 'low' | 'medium' | 'high';
  cta: string;
  trigger: 'session_complete' | 'streak_danger' | 'limit_reached' | 'defis_milestone' | 'inactive' | 'first_purchase';
}

/**
 * Génère une notification de vente basée sur le contexte utilisateur
 */
export function generateSalesNotification(context: {
  plan: 'free' | 'pro' | 'elite';
  sessionsUsed: number;
  sessionsLimit: number;
  streakDays: number;
  lastSessionDaysAgo: number;
  defisCompleted: number;
  totalSpent: number;
  hasMadePurchase: boolean;
}): SalesNotification | null {
  // Après session complète - proposer un boost
  if (context.plan === 'free' && context.sessionsUsed > 0 && context.sessionsUsed % 2 === 0) {
    return {
      id: 'post_session_boost',
      title: '⚡ Boostez votre XP !',
      message: 'Vous avez complété une session ! Double XP pendant 24h pour $0.99',
      purchaseId: 'xp_boost_24h',
      purchasePrice: 0.99,
      icon: '⚡',
      urgency: 'low',
      cta: 'Booster maintenant',
      trigger: 'session_complete',
    };
  }

  // Streak en danger - proposer sauveur
  if (context.streakDays > 1 && context.lastSessionDaysAgo >= 2) {
    return {
      id: 'streak_danger',
      title: '🔥 Votre streak est en danger !',
      message: `Vous n'avez pas fait de session depuis ${context.lastSessionDaysAgo} jours. Sauveur de Streak pour $1.99`,
      purchaseId: 'streak_saver',
      purchasePrice: 1.99,
      icon: '🔥',
      urgency: 'high',
      cta: 'Sauver mon streak',
      trigger: 'streak_danger',
    };
  }

  // Limite de sessions atteinte
  if (context.plan === 'free' && context.sessionsUsed >= context.sessionsLimit) {
    return {
      id: 'limit_reached',
      title: '📚 Limite de sessions atteinte',
      message: `Vous avez utilisé vos ${context.sessionsLimit} sessions. Pack 5 Sessions pour $4.99`,
      purchaseId: 'session_pack_5',
      purchasePrice: 4.99,
      icon: '📚',
      urgency: 'high',
      cta: 'Débloquer plus de sessions',
      trigger: 'limit_reached',
    };
  }

  // Milestone de défis - proposer coaching
  if (context.defisCompleted > 0 && context.defisCompleted % 5 === 0 && context.plan === 'pro') {
    return {
      id: 'defis_milestone',
      title: '🎓 Prêt pour le coaching en direct ?',
      message: `Vous avez complété ${context.defisCompleted} défis ! Session coaching 30min pour $9.99`,
      purchaseId: 'live_coaching_30min',
      purchasePrice: 9.99,
      icon: '🎓',
      urgency: 'medium',
      cta: 'Réserver une session',
      trigger: 'defis_milestone',
    };
  }

  // Utilisateur inactif - proposer streak saver ou session pack
  if (context.lastSessionDaysAgo >= 5 && context.plan === 'free') {
    return {
      id: 'inactive_user',
      title: '👋 On vous a manqué !',
      message: 'Vous n\'avez pas fait de session depuis 5 jours. Revenez avec Pack 5 Sessions pour $4.99',
      purchaseId: 'session_pack_5',
      purchasePrice: 4.99,
      icon: '👋',
      urgency: 'medium',
      cta: 'Revenir à CoachIA',
      trigger: 'inactive',
    };
  }

  // Premier achat - proposer bundle
  if (!context.hasMadePurchase && context.totalSpent === 0 && context.plan === 'free') {
    return {
      id: 'first_purchase',
      title: '📦 Bundle Mensuel à -15% !',
      message: 'Sessions illimitées + contenu premium pour $7.99 (économisez $15)',
      purchaseId: 'monthly_bundle',
      purchasePrice: 7.99,
      icon: '📦',
      urgency: 'low',
      cta: 'Découvrir le Bundle',
      trigger: 'first_purchase',
    };
  }

  return null;
}

/**
 * Génère plusieurs notifications recommandées
 */
export function generateRecommendedNotifications(context: {
  plan: 'free' | 'pro' | 'elite';
  sessionsUsed: number;
  sessionsLimit: number;
  streakDays: number;
  lastSessionDaysAgo: number;
  defisCompleted: number;
  totalSpent: number;
  hasMadePurchase: boolean;
}): SalesNotification[] {
  const notifications: SalesNotification[] = [];

  // Priorité 1 : Streak en danger
  if (context.streakDays > 1 && context.lastSessionDaysAgo >= 2) {
    notifications.push({
      id: 'streak_danger',
      title: '🔥 Votre streak est en danger !',
      message: `Vous n'avez pas fait de session depuis ${context.lastSessionDaysAgo} jours.`,
      purchaseId: 'streak_saver',
      purchasePrice: 1.99,
      icon: '🔥',
      urgency: 'high',
      cta: 'Sauver mon streak',
      trigger: 'streak_danger',
    });
  }

  // Priorité 2 : Limite atteinte
  if (context.plan === 'free' && context.sessionsUsed >= context.sessionsLimit * 0.9) {
    notifications.push({
      id: 'limit_warning',
      title: '📚 Vous approchez de votre limite',
      message: `${context.sessionsLimit - context.sessionsUsed} sessions restantes ce mois.`,
      purchaseId: 'session_pack_5',
      purchasePrice: 4.99,
      icon: '📚',
      urgency: 'medium',
      cta: 'Débloquer plus',
      trigger: 'limit_reached',
    });
  }

  // Priorité 3 : Inactivité
  if (context.lastSessionDaysAgo >= 3) {
    notifications.push({
      id: 'inactive_reminder',
      title: '👋 On vous a manqué !',
      message: 'Revenez pour maintenir votre streak.',
      purchaseId: 'session_pack_5',
      purchasePrice: 4.99,
      icon: '👋',
      urgency: 'low',
      cta: 'Revenir',
      trigger: 'inactive',
    });
  }

  return notifications.slice(0, 3); // Max 3 notifications
}

/**
 * Détermine le meilleur moment pour afficher une notification
 */
export function shouldShowNotification(context: {
  lastNotificationTime: number;
  notificationsShownToday: number;
  plan: 'free' | 'pro' | 'elite';
}): boolean {
  const now = Date.now();
  const hoursSinceLastNotification = (now - context.lastNotificationTime) / (1000 * 60 * 60);

  // Free : max 2 notifications par jour
  if (context.plan === 'free') {
    return hoursSinceLastNotification >= 4 && context.notificationsShownToday < 2;
  }

  // Pro : max 1 notification par jour
  if (context.plan === 'pro') {
    return hoursSinceLastNotification >= 12 && context.notificationsShownToday < 1;
  }

  // Elite : pas de notifications (ou très peu)
  return false;
}

/**
 * Calcule le score de probabilité d'achat
 */
export function calculatePurchaseProbability(context: {
  plan: 'free' | 'pro' | 'elite';
  sessionsUsed: number;
  sessionsLimit: number;
  streakDays: number;
  lastSessionDaysAgo: number;
  defisCompleted: number;
  totalSpent: number;
  hasMadePurchase: boolean;
  engagementScore: number; // 0-100
}): number {
  let probability = 0;

  // Base : engagement score
  probability += context.engagementScore * 0.5;

  // Facteur : limite atteinte
  if (context.plan === 'free' && context.sessionsUsed >= context.sessionsLimit * 0.8) {
    probability += 30;
  }

  // Facteur : streak en danger
  if (context.streakDays > 1 && context.lastSessionDaysAgo >= 2) {
    probability += 25;
  }

  // Facteur : inactivité
  if (context.lastSessionDaysAgo >= 5) {
    probability += 20;
  }

  // Facteur : utilisateur actif
  if (context.defisCompleted > 5) {
    probability += 15;
  }

  // Facteur : historique d'achat
  if (context.hasMadePurchase) {
    probability += 10;
  }

  return Math.min(probability, 100);
}

/**
 * Génère un message personnalisé basé sur le comportement
 */
export function generatePersonalizedMessage(context: {
  userName: string;
  skillName: string;
  sessionsCompleted: number;
  streakDays: number;
  nextMilestone: number;
}): string {
  const messages = [
    `${context.userName}, vous êtes à ${context.sessionsCompleted} sessions ! Continuez avec un Boost XP ⚡`,
    `Votre streak de ${context.streakDays} jours est impressionnant ! Protégez-le avec Sauveur de Streak 🔥`,
    `Plus que ${context.nextMilestone - context.sessionsCompleted} sessions avant le prochain badge ! 🎯`,
    `Vous maîtrisez ${context.skillName} ! Prêt pour le coaching en direct ? 🎓`,
  ];

  return messages[Math.floor(Math.random() * messages.length)];
}

/**
 * Génère un CTA (Call-To-Action) optimisé
 */
export function generateOptimizedCTA(purchaseId: string, plan: 'free' | 'pro' | 'elite'): string {
  const ctas: Record<string, Record<string, string>> = {
    xp_boost_24h: {
      free: '⚡ Booster pour $0.99',
      pro: '⚡ Booster (10% off)',
      elite: '⚡ Booster (20% off)',
    },
    streak_saver: {
      free: '🔥 Sauver mon streak',
      pro: '🔥 Sauver (10% off)',
      elite: '🔥 Sauver (20% off)',
    },
    session_pack_5: {
      free: '📚 5 sessions pour $4.99',
      pro: '📚 5 sessions (10% off)',
      elite: '📚 5 sessions (20% off)',
    },
    live_coaching_30min: {
      free: '🎓 Réserver 30min',
      pro: '🎓 Réserver (10% off)',
      elite: '🎓 Réserver (20% off)',
    },
    monthly_bundle: {
      free: '📦 Bundle pour $7.99',
      pro: '📦 Bundle (10% off)',
      elite: '📦 Bundle (20% off)',
    },
  };

  return ctas[purchaseId]?.[plan] || 'Acheter maintenant';
}

/**
 * Détermine le timing optimal pour envoyer une notification
 */
export function getOptimalNotificationTime(context: {
  userTimezone: string;
  lastActiveTime: number;
  plan: 'free' | 'pro' | 'elite';
}): Date {
  const now = new Date();

  // Free : envoyer après 2-4 heures d'inactivité
  if (context.plan === 'free') {
    const delay = 2 + Math.random() * 2; // 2-4 heures
    return new Date(now.getTime() + delay * 60 * 60 * 1000);
  }

  // Pro : envoyer après 6-12 heures d'inactivité
  if (context.plan === 'pro') {
    const delay = 6 + Math.random() * 6; // 6-12 heures
    return new Date(now.getTime() + delay * 60 * 60 * 1000);
  }

  // Elite : pas de notifications
  return new Date(now.getTime() + 24 * 60 * 60 * 1000);
}

/**
 * Analyse l'efficacité d'une notification
 */
export function analyzeNotificationEffectiveness(context: {
  notificationId: string;
  shown: boolean;
  clicked: boolean;
  purchased: boolean;
  purchaseAmount: number;
  timeSinceShown: number; // en secondes
}): {
  clickRate: number;
  conversionRate: number;
  roi: number;
  effectiveness: 'low' | 'medium' | 'high';
} {
  const clickRate = context.clicked ? 1 : 0;
  const conversionRate = context.purchased ? 1 : 0;
  const roi = context.purchased ? context.purchaseAmount : 0;

  let effectiveness: 'low' | 'medium' | 'high' = 'low';
  if (conversionRate > 0.1) effectiveness = 'high';
  else if (clickRate > 0.3) effectiveness = 'medium';

  return {
    clickRate,
    conversionRate,
    roi,
    effectiveness,
  };
}
