/**
 * Service de gestion des notifications push
 */

import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PushNotification, NotificationPreferences, NotificationType } from './types-notifications';

// Configuration des notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  } as any),
});

/**
 * Initialise les notifications push
 */
export async function initializeNotifications(): Promise<string | null> {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    
    if (status !== 'granted') {
      console.log('Permissions de notification refusées');
      return null;
    }

    const token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log('Push token:', token);
    
    // Sauvegarder le token
    await AsyncStorage.setItem('expoPushToken', token);
    
    return token;
  } catch (error) {
    console.error('Erreur lors de l\'initialisation des notifications:', error);
    return null;
  }
}

/**
 * Envoie une notification locale
 */
export async function sendLocalNotification(
  title: string,
  body: string,
  delay: number = 5,
  data?: Record<string, string>
): Promise<void> {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
        sound: 'default',
        badge: 1,
      },
      trigger: { type: 'timeInterval', seconds: delay } as any,
    });
  } catch (error) {
    console.error('Erreur lors de l\'envoi de la notification:', error);
  }
}

/**
 * Planifie une notification quotidienne
 */
export async function scheduleDailyNotification(
  title: string,
  body: string,
  hour: number = 9,
  minute: number = 0
): Promise<void> {
  try {
    const now = new Date();
    const scheduledTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute);
    
    // Si l'heure est passée, programmer pour demain
    if (scheduledTime < now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const secondsUntilNotification = Math.floor((scheduledTime.getTime() - now.getTime()) / 1000);

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: 'default',
        badge: 1,
      },
      trigger: {
        type: 'timeInterval',
        seconds: secondsUntilNotification,
        repeats: true,
      } as any,
    });
  } catch (error) {
    console.error('Erreur lors de la planification de la notification quotidienne:', error);
  }
}

/**
 * Crée une notification de rappel quotidien
 */
export async function createDailyReminder(preferences: NotificationPreferences): Promise<void> {
  if (!preferences.dailyReminder) return;

  await scheduleDailyNotification(
    '⏰ Rappel quotidien',
    'Continuez votre progression ! Complétez une session de coaching aujourd\'hui.',
    9,
    0
  );
}

/**
 * Crée une notification d'avertissement de streak
 */
export async function createStreakWarning(daysLeft: number): Promise<void> {
  const message = 
    daysLeft === 1
      ? 'Votre streak est en danger ! Complétez une session aujourd\'hui pour la maintenir.'
      : `Votre streak expire dans ${daysLeft} jour(s). Continuez !`;

  await sendLocalNotification(
    '🔥 Attention au streak',
    message,
    3600 // 1 heure
  );
}

/**
 * Crée une notification de défi disponible
 */
export async function createChallengeNotification(challengeTitle: string): Promise<void> {
  await sendLocalNotification(
    '🎯 Nouveau défi disponible',
    `Le défi "${challengeTitle}" est maintenant disponible. Relevez-le !`,
    5
  );
}

/**
 * Crée une notification de badge débloqué
 */
export async function createBadgeNotification(badgeName: string, badgeIcon: string): Promise<void> {
  await sendLocalNotification(
    `${badgeIcon} Badge débloqué !`,
    `Félicitations ! Vous avez débloqué le badge "${badgeName}".`,
    2
  );
}

/**
 * Crée une notification de level up
 */
export async function createLevelUpNotification(skillName: string, newLevel: number): Promise<void> {
  await sendLocalNotification(
    '⭐ Level Up !',
    `Vous avez atteint le niveau ${newLevel} en ${skillName} !`,
    2
  );
}

/**
 * Charge les préférences de notification
 */
export async function loadNotificationPreferences(): Promise<NotificationPreferences> {
  try {
    const stored = await AsyncStorage.getItem('notificationPreferences');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Erreur lors du chargement des préférences:', error);
  }

  // Préférences par défaut
  return {
    dailyReminder: true,
    streakWarning: true,
    challengeNotifications: true,
    badgeNotifications: true,
    levelUpNotifications: true,
    referralNotifications: true,
    premiumOffers: false,
    quietHours: {
      enabled: true,
      startTime: '22:00',
      endTime: '08:00',
    },
  };
}

/**
 * Sauvegarde les préférences de notification
 */
export async function saveNotificationPreferences(
  preferences: NotificationPreferences
): Promise<void> {
  try {
    await AsyncStorage.setItem('notificationPreferences', JSON.stringify(preferences));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des préférences:', error);
  }
}

/**
 * Vérifie si on est dans les heures silencieuses
 */
export function isInQuietHours(preferences: NotificationPreferences): boolean {
  if (!preferences.quietHours.enabled) return false;

  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const [startHour, startMin] = preferences.quietHours.startTime.split(':').map(Number);
  const [endHour, endMin] = preferences.quietHours.endTime.split(':').map(Number);
  const [currentHour, currentMin] = currentTime.split(':').map(Number);

  const startInMinutes = startHour * 60 + startMin;
  const endInMinutes = endHour * 60 + endMin;
  const currentInMinutes = currentHour * 60 + currentMin;

  // Gestion du passage minuit
  if (startInMinutes > endInMinutes) {
    return currentInMinutes >= startInMinutes || currentInMinutes < endInMinutes;
  }

  return currentInMinutes >= startInMinutes && currentInMinutes < endInMinutes;
}

/**
 * Envoie une notification en respectant les heures silencieuses
 */
export async function sendSmartNotification(
  title: string,
  body: string,
  preferences: NotificationPreferences,
  delay: number = 5
): Promise<void> {
  if (isInQuietHours(preferences)) {
    console.log('Notification programmée pour après les heures silencieuses');
    // Programmer pour 8h du matin
    const now = new Date();
    const tomorrow8am = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 8, 0);
    const secondsUntil = Math.floor((tomorrow8am.getTime() - now.getTime()) / 1000);
    
    await Notifications.scheduleNotificationAsync({
      content: { title, body, sound: 'default', badge: 1 },
      trigger: { type: 'timeInterval', seconds: secondsUntil } as any,
    });
  } else {
    await sendLocalNotification(title, body, delay);
  }
}
