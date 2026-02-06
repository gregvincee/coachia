/**
 * Types pour les intégrations externes
 */

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: number;
  endTime: number;
  location?: string;
  attendees?: string[];
  reminders?: number[]; // en minutes avant
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    endDate?: number;
  };
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
  tags?: string[];
}

export interface SlackIntegration {
  id: string;
  workspaceId: string;
  teamId: string;
  channelId: string;
  webhookUrl: string;
  events: SlackEventType[];
  enabled: boolean;
}

export type SlackEventType = 'session_completed' | 'badge_unlocked' | 'level_up' | 'challenge_completed';

export interface DiscordIntegration {
  id: string;
  guildId: string;
  channelId: string;
  webhookUrl: string;
  botToken: string;
  events: DiscordEventType[];
  enabled: boolean;
}

export type DiscordEventType = 'session_completed' | 'badge_unlocked' | 'level_up' | 'challenge_completed';

export interface OAuthProvider {
  id: string;
  name: 'google' | 'apple' | 'github' | 'microsoft';
  clientId: string;
  clientSecret?: string;
  redirectUri: string;
  scopes: string[];
  enabled: boolean;
}

export interface OAuthToken {
  provider: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  scopes: string[];
}

export interface WebhookEvent {
  id: string;
  type: string;
  timestamp: number;
  data: Record<string, any>;
  retryCount: number;
  lastRetry?: number;
  status: 'pending' | 'delivered' | 'failed';
}

export interface Webhook {
  id: string;
  url: string;
  events: string[];
  active: boolean;
  secret?: string;
  createdAt: number;
  lastDelivery?: number;
}

export interface APIKey {
  id: string;
  name: string;
  key: string;
  secret?: string;
  permissions: string[];
  rateLimit?: number;
  expiresAt?: number;
  createdAt: number;
  lastUsed?: number;
}

export interface ExternalService {
  id: string;
  name: string;
  type: 'calendar' | 'email' | 'chat' | 'oauth' | 'webhook' | 'api';
  status: 'connected' | 'disconnected' | 'error';
  config: Record<string, any>;
  lastSync?: number;
  syncInterval?: number;
}

export interface SyncLog {
  id: string;
  serviceId: string;
  timestamp: number;
  status: 'success' | 'error';
  itemsProcessed: number;
  error?: string;
  duration: number; // en ms
}
