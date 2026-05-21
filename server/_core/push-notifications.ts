// server/_core/push-notifications.ts
// ✅ Service de notifications push backend pour CoachIA

import * as Expo from 'expo-server-sdk';

interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
  sound?: string;
  badge?: number;
}

interface ScheduledNotification {
  id: string;
  userId: string;
  trigger: 'daily' | 'weekly' | 'challenge' | 'streak' | 'achievement';
  time?: string; // HH:mm format
  dayOfWeek?: number; // 0-6 for weekly
  enabled: boolean;
}

/**
 * Service de notifications push
 * Envoie des notifications via Expo Push Notifications
 */
export class PushNotificationService {
  private expo: Expo.Expo;
  private scheduledNotifications: Map<string, ScheduledNotification> = new Map();

  constructor() {
    this.expo = new Expo.Expo();
  }

  /**
   * Envoie une notification push à un utilisateur
   */
  async sendNotification(
    expoPushToken: string,
    payload: NotificationPayload
  ): Promise<{ success: boolean; ticketId?: string; error?: string }> {
    if (!Expo.Expo.isExpoPushToken(expoPushToken)) {
      return {
        success: false,
        error: `Invalid Expo push token: ${expoPushToken}`,
      };
    }

    try {
      const messages = [
        {
          to: expoPushToken,
          sound: payload.sound || 'default',
          title: payload.title,
          body: payload.body,
          data: payload.data || {},
          badge: payload.badge,
        },
      ];

      const tickets = await this.expo.sendPushNotificationsAsync(messages);

      return {
        success: true,
        ticketId: (tickets[0] as any)?.id,
      };
    } catch (error) {
      console.error('Push notification error:', error);
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  /**
   * Envoie des notifications en masse
   */
  async sendBulkNotifications(
    tokens: string[],
    payload: NotificationPayload
  ): Promise<{ sent: number; failed: number; errors: string[] }> {
    const validTokens = tokens.filter((token) =>
      Expo.Expo.isExpoPushToken(token)
    );

    const messages = validTokens.map((token) => ({
      to: token,
      sound: payload.sound || 'default',
      title: payload.title,
      body: payload.body,
      data: payload.data || {},
      badge: payload.badge,
    }));

    let sent = 0;
    let failed = 0;
    const errors: string[] = [];

    try {
      const tickets = await this.expo.sendPushNotificationsAsync(messages);

      tickets.forEach((ticket: any) => {
        if ('id' in ticket && ticket.id) {
          sent++;
        } else if ('error' in ticket && ticket.error) {
          failed++;
          errors.push(ticket.error);
        }
      });
    } catch (error) {
      failed = messages.length;
      errors.push((error as Error).message);
    }

    return { sent, failed, errors };
  }

  /**
   * Envoie une notification de rappel quotidien
   */
  async sendDailyReminderNotification(
    expoPushToken: string,
    skillName: string,
    streakDays: number
  ): Promise<{ success: boolean; error?: string }> {
    const messages = [
      `Continuez votre streak de ${streakDays} jours !`,
      `Prêt pour une session de ${skillName} ?`,
      `Votre coach IA vous attend pour ${skillName} !`,
      `Maintenez votre streak - Coachez ${skillName} aujourd'hui !`,
    ];

    const randomMessage = messages[Math.floor(Math.random() * messages.length)];

    return await this.sendNotification(expoPushToken, {
      title: '🎯 Rappel CoachIA',
      body: randomMessage,
      data: {
        type: 'daily_reminder',
        skillName,
        streakDays: streakDays.toString(),
      },
      sound: 'default',
    });
  }

  /**
   * Envoie une notification de défi disponible
   */
  async sendChallengeAvailableNotification(
    expoPushToken: string,
    challengeName: string,
    reward: number
  ): Promise<{ success: boolean; error?: string }> {
    return await this.sendNotification(expoPushToken, {
      title: '⚡ Nouveau Défi Disponible',
      body: `${challengeName} - Gagnez ${reward} XP !`,
      data: {
        type: 'challenge_available',
        challengeName,
        reward: reward.toString(),
      },
      sound: 'default',
      badge: 1,
    });
  }

  /**
   * Envoie une notification de badge débloqué
   */
  async sendBadgeUnlockedNotification(
    expoPushToken: string,
    badgeName: string,
    badgeDescription: string
  ): Promise<{ success: boolean; error?: string }> {
    return await this.sendNotification(expoPushToken, {
      title: '🏆 Badge Débloqué !',
      body: `${badgeName}: ${badgeDescription}`,
      data: {
        type: 'badge_unlocked',
        badgeName,
      },
      sound: 'default',
      badge: 1,
    });
  }

  /**
   * Envoie une notification de streak en danger
   */
  async sendStreakWarningNotification(
    expoPushToken: string,
    streakDays: number
  ): Promise<{ success: boolean; error?: string }> {
    return await this.sendNotification(expoPushToken, {
      title: '⚠️ Votre Streak est en Danger',
      body: `Vous avez ${streakDays} jours de streak - Coachez maintenant pour ne pas le perdre !`,
      data: {
        type: 'streak_warning',
        streakDays: streakDays.toString(),
      },
      sound: 'default',
      badge: 1,
    });
  }

  /**
   * Planifie une notification récurrente
   */
  scheduleRecurringNotification(
    userId: string,
    notification: ScheduledNotification
  ): void {
    const notificationId = `${userId}:${notification.trigger}`;
    this.scheduledNotifications.set(notificationId, notification);

    console.log(`✅ Notification planifiée: ${notificationId}`);
  }

  /**
   * Annule une notification planifiée
   */
  cancelScheduledNotification(userId: string, trigger: string): void {
    const notificationId = `${userId}:${trigger}`;
    this.scheduledNotifications.delete(notificationId);

    console.log(`❌ Notification annulée: ${notificationId}`);
  }

  /**
   * Récupère les notifications planifiées d'un utilisateur
   */
  getUserScheduledNotifications(userId: string): ScheduledNotification[] {
    const userNotifications: ScheduledNotification[] = [];

    this.scheduledNotifications.forEach((notification) => {
      if (notification.userId === userId) {
        userNotifications.push(notification);
      }
    });

    return userNotifications;
  }

  /**
   * Récupère les statistiques des notifications
   */
  getNotificationStats() {
    return {
      totalScheduled: this.scheduledNotifications.size,
      enabledCount: Array.from(this.scheduledNotifications.values()).filter(
        (n) => n.enabled
      ).length,
      byTrigger: {
        daily: Array.from(this.scheduledNotifications.values()).filter(
          (n) => n.trigger === 'daily'
        ).length,
        weekly: Array.from(this.scheduledNotifications.values()).filter(
          (n) => n.trigger === 'weekly'
        ).length,
        challenge: Array.from(this.scheduledNotifications.values()).filter(
          (n) => n.trigger === 'challenge'
        ).length,
        streak: Array.from(this.scheduledNotifications.values()).filter(
          (n) => n.trigger === 'streak'
        ).length,
        achievement: Array.from(this.scheduledNotifications.values()).filter(
          (n) => n.trigger === 'achievement'
        ).length,
      },
    };
  }
}

// Instance singleton
let pushNotificationInstance: PushNotificationService | null = null;

export function getPushNotificationService(): PushNotificationService {
  if (!pushNotificationInstance) {
    pushNotificationInstance = new PushNotificationService();
  }
  return pushNotificationInstance;
}
