// server/_core/redis-config.ts
// ✅ Configuration Redis pour CoachIA

export const redisConfig = {
  // Connexion
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),

  // Performance
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  enableOfflineQueue: true,

  // Timeouts
  connectTimeout: 10000,
  commandTimeout: 5000,

  // Retry strategy
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },

  // Key prefix pour organiser les données
  keyPrefix: 'coachia:',

  // Stratégies de cache par défaut
  defaultTTL: {
    aiResponse: 7200, // 2 heures pour les réponses IA
    userProfile: 1800, // 30 minutes pour les profils
    session: 3600, // 1 heure pour les sessions
    leaderboard: 300, // 5 minutes pour le leaderboard
    stats: 600, // 10 minutes pour les stats
  },

  // Limites de rate limiting
  rateLimits: {
    aiRequests: {
      maxRequests: 100,
      windowMs: 3600000, // 1 heure
    },
    apiRequests: {
      maxRequests: 1000,
      windowMs: 3600000, // 1 heure
    },
    authAttempts: {
      maxRequests: 5,
      windowMs: 900000, // 15 minutes
    },
  },

  // Stratégies de cache
  strategies: {
    cacheAside: true, // Lazy loading
    writeThrough: false, // Sync write
    writeBehind: true, // Async write
    refreshAhead: true, // Proactive refresh
  },

  // Monitoring
  monitoring: {
    trackHitRate: true,
    trackMemoryUsage: true,
    alertThreshold: {
      hitRate: 0.6, // Alerte si < 60%
      memoryUsage: 0.9, // Alerte si > 90%
    },
  },
};

// Types pour la configuration
export interface RedisConfigType {
  host: string;
  port: number;
  password?: string;
  db: number;
  maxRetriesPerRequest: number;
  enableReadyCheck: boolean;
  enableOfflineQueue: boolean;
  connectTimeout: number;
  commandTimeout: number;
  retryStrategy: (times: number) => number;
  keyPrefix: string;
  defaultTTL: Record<string, number>;
  rateLimits: Record<string, { maxRequests: number; windowMs: number }>;
  strategies: Record<string, boolean>;
  monitoring: {
    trackHitRate: boolean;
    trackMemoryUsage: boolean;
    alertThreshold: {
      hitRate: number;
      memoryUsage: number;
    };
  };
}
