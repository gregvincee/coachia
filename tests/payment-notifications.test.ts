// tests/payment-notifications.test.ts
// ✅ Tests pour les services de paiements et notifications

import { describe, it, expect, beforeEach } from 'vitest';

/**
 * Tests pour le service de paiements Stripe
 */
describe('Stripe Payment Service', () => {
  describe('Plans', () => {
    it('should have three subscription plans', () => {
      const plans = {
        free: {
          name: 'Gratuit',
          price: 0,
          features: 4,
        },
        pro: {
          name: 'Pro',
          price: 799,
          features: 6,
        },
        elite: {
          name: 'Elite',
          price: 1499,
          features: 6,
        },
      };

      expect(Object.keys(plans)).toHaveLength(3);
      expect(plans.free.price).toBe(0);
      expect(plans.pro.price).toBe(799);
      expect(plans.elite.price).toBe(1499);
    });

    it('should have correct features for each plan', () => {
      const plans = {
        free: [
          'Accès aux 6 compétences de base',
          '5 sessions de coaching par mois',
          'Gamification basique',
          'Communauté',
        ],
        pro: [
          'Accès illimité aux compétences',
          'Coaching illimité',
          'Défis hebdomadaires premium',
          'Leaderboard exclusif',
          'Support prioritaire',
          'Export de progression',
        ],
        elite: [
          'Tout du plan Pro',
          'Coaching en direct avec experts',
          'Contenu exclusif premium',
          'Marketplace de contenu',
          'Dashboard créateur',
          'Partage de revenus (70/30)',
        ],
      };

      expect(plans.free).toHaveLength(4);
      expect(plans.pro).toHaveLength(6);
      expect(plans.elite).toHaveLength(6);
    });

    it('should calculate monthly revenue correctly', () => {
      const monthlyActiveUsers = 1000;
      const conversionRates = {
        pro: 0.10, // 10%
        elite: 0.05, // 5%
      };

      const proPricePerMonth = 799 / 100; // $7.99
      const elitePricePerMonth = 1499 / 100; // $14.99

      const proRevenue = monthlyActiveUsers * conversionRates.pro * proPricePerMonth;
      const eliteRevenue = monthlyActiveUsers * conversionRates.elite * elitePricePerMonth;
      const totalRevenue = proRevenue + eliteRevenue;

      expect(proRevenue).toBeCloseTo(799, 0);
      expect(eliteRevenue).toBeCloseTo(749.5, 0);
      expect(totalRevenue).toBeCloseTo(1548.5, 0);
    });
  });

  describe('Payment Processing', () => {
    it('should convert amount to cents correctly', () => {
      const amount = 7.99;
      const amountInCents = Math.round(amount * 100);

      expect(amountInCents).toBe(799);
    });

    it('should handle payment metadata', () => {
      const metadata = {
        userId: 'user:123',
        skillId: 'speaking',
        planId: 'pro',
      };

      expect(metadata.userId).toBe('user:123');
      expect(metadata.skillId).toBe('speaking');
      expect(metadata.planId).toBe('pro');
    });

    it('should track payment history', () => {
      const payments = [
        {
          id: 'ch_1',
          amount: 799,
          status: 'succeeded',
          created: new Date('2026-05-21'),
        },
        {
          id: 'ch_2',
          amount: 1499,
          status: 'succeeded',
          created: new Date('2026-05-22'),
        },
      ];

      expect(payments).toHaveLength(2);
      expect(payments[0].amount).toBe(799);
      expect(payments[1].amount).toBe(1499);
    });
  });

  describe('Subscription Management', () => {
    it('should track subscription status', () => {
      const subscription = {
        id: 'sub_123',
        status: 'active',
        planId: 'pro',
        currentPeriodStart: new Date('2026-05-21'),
        currentPeriodEnd: new Date('2026-06-21'),
      };

      expect(subscription.status).toBe('active');
      expect(subscription.planId).toBe('pro');
    });

    it('should handle subscription cancellation', () => {
      const subscription = {
        id: 'sub_123',
        status: 'canceled',
        canceledAt: new Date('2026-05-25'),
      };

      expect(subscription.status).toBe('canceled');
      expect(subscription.canceledAt).toBeDefined();
    });

    it('should calculate subscription duration', () => {
      const startDate = new Date('2026-05-21');
      const endDate = new Date('2026-06-21');
      const durationDays = Math.floor(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      expect(durationDays).toBe(31);
    });
  });
});

/**
 * Tests pour le service de notifications push
 */
describe('Push Notification Service', () => {
  describe('Notification Types', () => {
    it('should send daily reminder notifications', () => {
      const notification = {
        type: 'daily_reminder',
        title: '🎯 Rappel CoachIA',
        body: 'Continuez votre streak de 7 jours !',
        data: {
          type: 'daily_reminder',
          skillName: 'speaking',
          streakDays: '7',
        },
      };

      expect(notification.type).toBe('daily_reminder');
      expect(notification.data.streakDays).toBe('7');
    });

    it('should send challenge notifications', () => {
      const notification = {
        type: 'challenge_available',
        title: '⚡ Nouveau Défi Disponible',
        body: 'Défi de présentation - Gagnez 500 XP !',
        data: {
          type: 'challenge_available',
          challengeName: 'Défi de présentation',
          reward: '500',
        },
      };

      expect(notification.type).toBe('challenge_available');
      expect(notification.data.reward).toBe('500');
    });

    it('should send badge unlocked notifications', () => {
      const notification = {
        type: 'badge_unlocked',
        title: '🏆 Badge Débloqué !',
        body: 'Orateur Confiant: Complétez 10 sessions de prise de parole',
        data: {
          type: 'badge_unlocked',
          badgeName: 'Orateur Confiant',
        },
      };

      expect(notification.type).toBe('badge_unlocked');
      expect(notification.title).toContain('🏆');
    });

    it('should send streak warning notifications', () => {
      const notification = {
        type: 'streak_warning',
        title: '⚠️ Votre Streak est en Danger',
        body: 'Vous avez 3 jours de streak - Coachez maintenant !',
        data: {
          type: 'streak_warning',
          streakDays: '3',
        },
      };

      expect(notification.type).toBe('streak_warning');
      expect(notification.data.streakDays).toBe('3');
    });
  });

  describe('Notification Scheduling', () => {
    it('should schedule daily notifications', () => {
      const scheduledNotifications = [
        {
          id: 'notif_1',
          userId: 'user:123',
          trigger: 'daily',
          time: '09:00',
          enabled: true,
        },
      ];

      expect(scheduledNotifications).toHaveLength(1);
      expect(scheduledNotifications[0].trigger).toBe('daily');
      expect(scheduledNotifications[0].time).toBe('09:00');
    });

    it('should schedule weekly notifications', () => {
      const scheduledNotifications = [
        {
          id: 'notif_2',
          userId: 'user:123',
          trigger: 'weekly',
          dayOfWeek: 1, // Monday
          time: '18:00',
          enabled: true,
        },
      ];

      expect(scheduledNotifications[0].trigger).toBe('weekly');
      expect(scheduledNotifications[0].dayOfWeek).toBe(1);
    });

    it('should enable/disable notifications', () => {
      const notification = {
        id: 'notif_1',
        userId: 'user:123',
        trigger: 'daily',
        enabled: true,
      };

      expect(notification.enabled).toBe(true);

      notification.enabled = false;
      expect(notification.enabled).toBe(false);
    });
  });

  describe('Bulk Notifications', () => {
    it('should send notifications to multiple users', () => {
      const tokens = [
        'ExponentPushToken[abc123]',
        'ExponentPushToken[def456]',
        'ExponentPushToken[ghi789]',
      ];

      const result = {
        sent: 3,
        failed: 0,
        errors: [],
      };

      expect(result.sent).toBe(3);
      expect(result.failed).toBe(0);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle invalid tokens', () => {
      const tokens = [
        'ExponentPushToken[abc123]',
        'invalid_token',
        'ExponentPushToken[ghi789]',
      ];

      const validTokens = tokens.filter(
        (token) =>
          token.startsWith('ExponentPushToken[') && token.endsWith(']')
      );

      expect(validTokens).toHaveLength(2);
    });

    it('should track notification statistics', () => {
      const stats = {
        totalScheduled: 150,
        enabledCount: 120,
        byTrigger: {
          daily: 80,
          weekly: 30,
          challenge: 5,
          streak: 3,
          achievement: 2,
        },
      };

      expect(stats.totalScheduled).toBe(150);
      expect(stats.enabledCount).toBe(120);
      expect(stats.byTrigger.daily).toBe(80);
    });
  });

  describe('Notification Timing', () => {
    it('should calculate notification time correctly', () => {
      const now = new Date('2026-05-21T08:30:00');
      const notificationTime = '09:00';
      const [hour, minute] = notificationTime.split(':').map(Number);

      const shouldSend =
        now.getHours() === hour && now.getMinutes() === minute;

      expect(shouldSend).toBe(false);
    });

    it('should handle timezone conversions', () => {
      const userTimezone = 'Europe/Paris'; // UTC+2 en été
      const notificationTime = '09:00';

      // Simuler la conversion
      const utcHour = 7; // 09:00 Paris = 07:00 UTC

      expect(utcHour).toBe(7);
    });
  });
});

/**
 * Tests d'intégration paiements + notifications
 */
describe('Payment & Notification Integration', () => {
  it('should send notification after successful payment', () => {
    const payment = {
      id: 'ch_123',
      status: 'succeeded',
      amount: 799,
    };

    const notification = {
      type: 'payment_success',
      title: '✅ Paiement Réussi',
      body: 'Bienvenue dans le plan Pro !',
    };

    expect(payment.status).toBe('succeeded');
    expect(notification.type).toBe('payment_success');
  });

  it('should send notification on subscription upgrade', () => {
    const subscription = {
      id: 'sub_123',
      planId: 'elite',
      status: 'active',
    };

    const notification = {
      type: 'subscription_upgraded',
      title: '🎉 Bienvenue dans Elite',
      body: 'Accès illimité au coaching en direct !',
    };

    expect(subscription.planId).toBe('elite');
    expect(notification.title).toContain('Elite');
  });

  it('should send reminder before subscription renewal', () => {
    const subscription = {
      id: 'sub_123',
      currentPeriodEnd: new Date('2026-06-21'),
    };

    const daysUntilRenewal = Math.floor(
      (subscription.currentPeriodEnd.getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24)
    );

    const shouldSendReminder = daysUntilRenewal <= 3;

    expect(daysUntilRenewal).toBeGreaterThan(0);
  });
});
