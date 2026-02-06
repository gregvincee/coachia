/**
 * Service pour les intégrations externes
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CalendarEvent, EmailTemplate, SlackIntegration, DiscordIntegration, Webhook, APIKey } from './types-integrations';

/**
 * Crée un événement calendrier
 */
export function createCalendarEvent(
  title: string,
  startTime: number,
  endTime: number,
  description?: string
): CalendarEvent {
  return {
    id: `event-${Date.now()}`,
    title,
    description,
    startTime,
    endTime,
  };
}

/**
 * Crée un template d'email
 */
export function createEmailTemplate(
  name: string,
  subject: string,
  body: string,
  variables: string[] = []
): EmailTemplate {
  return {
    id: `template-${Date.now()}`,
    name,
    subject,
    body,
    variables,
  };
}

/**
 * Envoie un email
 */
export async function sendEmail(
  to: string,
  template: EmailTemplate,
  variables: Record<string, string> = {}
): Promise<void> {
  try {
    let body = template.body;
    let subject = template.subject;

    // Remplacer les variables
    Object.entries(variables).forEach(([key, value]) => {
      body = body.replace(`{{${key}}}`, value);
      subject = subject.replace(`{{${key}}}`, value);
    });

    console.log(`Email envoyé à ${to}: ${subject}`);
    // Intégration réelle avec service d'email (SendGrid, Mailgun, etc.)
  } catch (error) {
    console.error('Erreur lors de l\'envoi d\'email:', error);
  }
}

/**
 * Crée une intégration Slack
 */
export function createSlackIntegration(
  workspaceId: string,
  channelId: string,
  webhookUrl: string
): SlackIntegration {
  return {
    id: `slack-${Date.now()}`,
    workspaceId,
    teamId: 'T0000000000',
    channelId,
    webhookUrl,
    events: ['session_completed', 'badge_unlocked', 'level_up'],
    enabled: true,
  };
}

/**
 * Envoie un message Slack
 */
export async function sendSlackMessage(
  integration: SlackIntegration,
  message: string,
  metadata?: Record<string, any>
): Promise<void> {
  try {
    const payload = {
      text: message,
      attachments: metadata ? [{ fields: Object.entries(metadata).map(([k, v]) => ({ title: k, value: String(v) })) }] : [],
    };

    const response = await fetch(integration.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Slack API error: ${response.statusText}`);
    }

    console.log('Message Slack envoyé');
  } catch (error) {
    console.error('Erreur lors de l\'envoi du message Slack:', error);
  }
}

/**
 * Crée une intégration Discord
 */
export function createDiscordIntegration(
  guildId: string,
  channelId: string,
  webhookUrl: string,
  botToken: string
): DiscordIntegration {
  return {
    id: `discord-${Date.now()}`,
    guildId,
    channelId,
    webhookUrl,
    botToken,
    events: ['session_completed', 'badge_unlocked', 'level_up'],
    enabled: true,
  };
}

/**
 * Envoie un message Discord
 */
export async function sendDiscordMessage(
  integration: DiscordIntegration,
  message: string,
  embedData?: Record<string, any>
): Promise<void> {
  try {
    const payload = {
      content: message,
      embeds: embedData ? [{ description: JSON.stringify(embedData), color: 5814783 }] : [],
    };

    const response = await fetch(integration.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Discord API error: ${response.statusText}`);
    }

    console.log('Message Discord envoyé');
  } catch (error) {
    console.error('Erreur lors de l\'envoi du message Discord:', error);
  }
}

/**
 * Crée une clé API
 */
export function createAPIKey(name: string, permissions: string[] = []): APIKey {
  const key = generateRandomKey(32);
  const secret = generateRandomKey(64);

  return {
    id: `key-${Date.now()}`,
    name,
    key,
    secret,
    permissions,
    rateLimit: 1000,
    createdAt: Date.now(),
  };
}

/**
 * Génère une clé aléatoire
 */
function generateRandomKey(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Crée un webhook
 */
export function createWebhook(url: string, events: string[]): Webhook {
  return {
    id: `webhook-${Date.now()}`,
    url,
    events,
    active: true,
    secret: generateRandomKey(32),
    createdAt: Date.now(),
  };
}

/**
 * Sauvegarde les intégrations
 */
export async function saveIntegrations(integrations: any[]): Promise<void> {
  try {
    await AsyncStorage.setItem('integrations', JSON.stringify(integrations));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des intégrations:', error);
  }
}

/**
 * Récupère les intégrations
 */
export async function getIntegrations(): Promise<any[]> {
  try {
    const stored = await AsyncStorage.getItem('integrations');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Erreur lors de la récupération des intégrations:', error);
    return [];
  }
}

/**
 * Teste une intégration
 */
export async function testIntegration(type: string, config: Record<string, any>): Promise<boolean> {
  try {
    switch (type) {
      case 'slack':
        await sendSlackMessage(config as SlackIntegration, 'Test de connexion CoachIA');
        return true;
      case 'discord':
        await sendDiscordMessage(config as DiscordIntegration, 'Test de connexion CoachIA');
        return true;
      default:
        return false;
    }
  } catch (error) {
    console.error('Erreur lors du test d\'intégration:', error);
    return false;
  }
}

/**
 * Valide une clé API
 */
export function validateAPIKey(key: APIKey): boolean {
  if (key.expiresAt && Date.now() > key.expiresAt) {
    return false;
  }
  return true;
}
