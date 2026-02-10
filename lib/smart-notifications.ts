/**
 * Service de notifications intelligentes basées sur les patterns d'utilisation
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

export interface SmartNotification {
  id: string;
  title: string;
  body: string;
  type: 'reminder' | 'achievement' | 'recommendation' | 'social' | 'promotion';
  priority: 'low' | 'normal' | 'high';
  scheduledTime?: number;
  sent: boolean;
  opened: boolean;
  data?: Record<string, any>;
}

export interface NotificationPreference {
  type: string;
  enabled: boolean;
  quietHours?: { start: number; end: number }; // 0-23
  frequency: 'always' | 'daily' | 'weekly' | 'never';
}

export interface UserBehaviorPattern {
  userId: string;
  activeHours: number[]; // Heures les plus actives (0-23)
  preferredNotificationTime: number; // En minutes depuis minuit
  sessionFrequency: number; // Sessions par semaine
  engagementLevel: number; // 0-1
  lastActiveTime: number;
  streakDays: number;
}

class SmartNotificationManager {
  private notifications: SmartNotification[] = [];
  private preferences: Map<string, NotificationPreference> = new Map();
  private behaviorPatterns: Map<string, UserBehaviorPattern> = new Map();

  /**
   * Initialise le gestionnaire de notifications
   */
  async initialize(): Promise<void> {
    try {
      // Configurer le gestionnaire de notifications
      Notifications.setNotificationHandler({
        handleNotification: async notification => {
          return {
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
            shouldShowBanner: true,
            shouldShowList: true,
          };
        },
      });

      await this.loadPreferences();
      await this.loadNotifications();
    } catch (error) {
      console.error('Erreur lors de l\'initialisation des notifications:', error);
    }
  }

  /**
   * Crée une notification intelligente
   */
  createNotification(
    title: string,
    body: string,
    type: SmartNotification['type'],
    priority: SmartNotification['priority'] = 'normal',
    data?: Record<string, any>
  ): SmartNotification {
    return {
      id: `notif-${Date.now()}`,
      title,
      body,
      type,
      priority,
      sent: false,
      opened: false,
      data,
    };
  }

  /**
   * Envoie une notification immédiatement
   */
  async sendNotification(notification: SmartNotification): Promise<void> {
    try {
      // Vérifier les préférences
      if (!this.shouldSendNotification(notification)) {
        console.log(`Notification supprimée selon les préférences: ${notification.type}`);
        return;
      }

      // Envoyer la notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          sound: 'default',
          badge: 1,
          data: notification.data,
        },
        trigger: null,
      });

      notification.sent = true;
      await this.saveNotification(notification);
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la notification:', error);
    }
  }

  /**
   * Planifie une notification
   */
  async scheduleNotification(
    notification: SmartNotification,
    delayMinutes: number
  ): Promise<void> {
    try {
      notification.scheduledTime = Date.now() + delayMinutes * 60 * 1000;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          sound: 'default',
          badge: 1,
          data: notification.data,
        },
        trigger: { type: 'interval', seconds: delayMinutes * 60, repeats: false } as any,
      });

      await this.saveNotification(notification);
    } catch (error) {
      console.error('Erreur lors de la planification de la notification:', error);
    }
  }

  /**
   * Vérifie si une notification doit être envoyée
   */
  private shouldSendNotification(notification: SmartNotification): boolean {
    const preference = this.preferences.get(notification.type);

    if (!preference || !preference.enabled) {
      return false;
    }

    // Vérifier les heures calmes
    if (preference.quietHours) {
      const now = new Date();
      const currentHour = now.getHours();

      if (
        currentHour >= preference.quietHours.start &&
        currentHour < preference.quietHours.end
      ) {
        return false;
      }
    }

    return true;
  }

  /**
   * Génère des notifications recommandées
   */
  generateRecommendedNotifications(userId: string, userProfile: any): SmartNotification[] {
    const notifications: SmartNotification[] = [];
    const pattern = this.behaviorPatterns.get(userId);

    if (!pattern) return notifications;

    // Notification de rappel si pas actif depuis longtemps
    if (Date.now() - pattern.lastActiveTime > 24 * 60 * 60 * 1000) {
      notifications.push(
        this.createNotification(
          'Vous nous manquez !',
          'Revenez pratiquer et maintenez votre série',
          'reminder',
          'high',
          { action: 'open_home' }
        )
      );
    }

    // Notification de streak
    if (pattern.streakDays > 0 && pattern.streakDays % 7 === 0) {
      notifications.push(
        this.createNotification(
          `Série de ${pattern.streakDays} jours !`,
          'Vous êtes incroyable ! Continuez comme ça.',
          'achievement',
          'high',
          { action: 'open_profile' }
        )
      );
    }

    // Notification de recommandation
    if (pattern.engagementLevel > 0.7) {
      notifications.push(
        this.createNotification(
          'Nouvelle compétence recommandée',
          'Basée sur votre progression, essayez cette nouvelle compétence',
          'recommendation',
          'normal',
          { action: 'open_skills' }
        )
      );
    }

    // Notification sociale
    if (pattern.engagementLevel > 0.5) {
      notifications.push(
        this.createNotification(
          'Vos amis vous attendent',
          'Rejoignez les défis avec vos amis',
          'social',
          'normal',
          { action: 'open_community' }
        )
      );
    }

    return notifications;
  }

  /**
   * Planifie les notifications pour le jour
   */
  async scheduleNotificationsForDay(userId: string, userProfile: any): Promise<void> {
    const recommendations = this.generateRecommendedNotifications(userId, userProfile);
    const pattern = this.behaviorPatterns.get(userId);

    if (!pattern) return;

    // Planifier les notifications aux heures préférées
    for (let i = 0; i < recommendations.length; i++) {
      const delayMinutes = pattern.preferredNotificationTime + i * 60; // Espacer les notifications
      await this.scheduleNotification(recommendations[i], delayMinutes);
    }
  }

  /**
   * Met à jour le pattern de comportement
   */
  updateBehaviorPattern(userId: string, pattern: Partial<UserBehaviorPattern>): void {
    const existing = this.behaviorPatterns.get(userId) || {
      userId,
      activeHours: [],
      preferredNotificationTime: 9 * 60, // 9h du matin
      sessionFrequency: 3,
      engagementLevel: 0.5,
      lastActiveTime: Date.now(),
      streakDays: 0,
    };

    this.behaviorPatterns.set(userId, { ...existing, ...pattern });
  }

  /**
   * Définit les préférences de notification
   */
  setNotificationPreference(type: string, preference: NotificationPreference): void {
    this.preferences.set(type, preference);
  }

  /**
   * Obtient les préférences de notification
   */
  getNotificationPreference(type: string): NotificationPreference | undefined {
    return this.preferences.get(type);
  }

  /**
   * Sauvegarde une notification
   */
  private async saveNotification(notification: SmartNotification): Promise<void> {
    try {
      this.notifications.push(notification);
      await AsyncStorage.setItem('notifications', JSON.stringify(this.notifications));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la notification:', error);
    }
  }

  /**
   * Charge les notifications
   */
  private async loadNotifications(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('notifications');
      if (stored) {
        this.notifications = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
    }
  }

  /**
   * Charge les préférences
   */
  private async loadPreferences(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('notificationPreferences');
      if (stored) {
        const prefs = JSON.parse(stored);
        Object.entries(prefs).forEach(([key, value]) => {
          this.preferences.set(key, value as NotificationPreference);
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement des préférences:', error);
    }
  }

  /**
   * Obtient l'historique des notifications
   */
  getNotificationHistory(limit: number = 20): SmartNotification[] {
    return this.notifications.slice(-limit);
  }

  /**
   * Marque une notification comme ouverte
   */
  markNotificationAsOpened(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.opened = true;
    }
  }
}

// Instance globale
const notificationManager = new SmartNotificationManager();

/**
 * Initialise les notifications intelligentes
 */
export async function initializeSmartNotifications(): Promise<void> {
  await notificationManager.initialize();
}

/**
 * Envoie une notification
 */
export async function sendSmartNotification(notification: SmartNotification): Promise<void> {
  await notificationManager.sendNotification(notification);
}

/**
 * Planifie une notification
 */
export async function scheduleSmartNotification(
  notification: SmartNotification,
  delayMinutes: number
): Promise<void> {
  await notificationManager.scheduleNotification(notification, delayMinutes);
}

/**
 * Génère des notifications recommandées
 */
export function generateRecommendedNotifications(
  userId: string,
  userProfile: any
): SmartNotification[] {
  return notificationManager.generateRecommendedNotifications(userId, userProfile);
}

/**
 * Planifie les notifications pour le jour
 */
export async function scheduleNotificationsForDay(
  userId: string,
  userProfile: any
): Promise<void> {
  await notificationManager.scheduleNotificationsForDay(userId, userProfile);
}

/**
 * Met à jour le pattern de comportement
 */
export function updateBehaviorPattern(
  userId: string,
  pattern: Partial<UserBehaviorPattern>
): void {
  notificationManager.updateBehaviorPattern(userId, pattern);
}

/**
 * Définit les préférences de notification
 */
export function setNotificationPreference(
  type: string,
  preference: NotificationPreference
): void {
  notificationManager.setNotificationPreference(type, preference);
}

/**
 * Obtient les préférences de notification
 */
export function getNotificationPreference(type: string): NotificationPreference | undefined {
  return notificationManager.getNotificationPreference(type);
}

/**
 * Obtient l'historique des notifications
 */
export function getNotificationHistory(limit?: number): SmartNotification[] {
  return notificationManager.getNotificationHistory(limit);
}

/**
 * Marque une notification comme ouverte
 */
export function markNotificationAsOpened(notificationId: string): void {
  notificationManager.markNotificationAsOpened(notificationId);
}

/**
 * Hook React pour les notifications intelligentes
 */
export function useSmartNotifications() {
  return {
    send: sendSmartNotification,
    schedule: scheduleSmartNotification,
    generateRecommended: generateRecommendedNotifications,
    scheduleForDay: scheduleNotificationsForDay,
    updateBehavior: updateBehaviorPattern,
    setPreference: setNotificationPreference,
    getPreference: getNotificationPreference,
    getHistory: getNotificationHistory,
    markAsOpened: markNotificationAsOpened,
  };
}
