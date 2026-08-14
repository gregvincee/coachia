import { createHash } from "node:crypto";
import Redis from "ioredis";

import { recordRedisCacheOutcome } from "../db";
import { redisConfig } from "./redis-config";

type CachedCoachingResponse = {
  message: string;
  suggestions: string[];
};

let client: Redis | null = null;
let unavailableUntil = 0;

function isRedisConfigured(): boolean {
  return Boolean(process.env.REDIS_URL || process.env.REDIS_HOST);
}

async function getRedisClient(): Promise<Redis | null> {
  if (!isRedisConfigured() || Date.now() < unavailableUntil) return null;
  if (client) return client;

  const instance = process.env.REDIS_URL
    ? new Redis(process.env.REDIS_URL, { lazyConnect: true, maxRetriesPerRequest: redisConfig.maxRetriesPerRequest })
    : new Redis({ ...redisConfig, lazyConnect: true });
  instance.on("error", () => undefined);

  try {
    await instance.connect();
    client = instance;
    return client;
  } catch {
    unavailableUntil = Date.now() + 5 * 60 * 1000;
    instance.disconnect();
    return null;
  }
}

/** Ne conserve aucun identifiant ; la clé est un hash du contexte strictement identique. */
export function createCoachingCacheKey(skillId: string, messages: Array<{ role: string; content: string }>): string {
  const source = JSON.stringify({ skillId, messages });
  return `ai-response:${createHash("sha256").update(source).digest("hex")}`;
}

export async function getCachedCoachingResponse(key: string): Promise<CachedCoachingResponse | null> {
  const redis = await getRedisClient();
  if (!redis) return null;

  try {
    const value = await redis.get(key);
    await recordRedisCacheOutcome(value ? "hit" : "miss");
    return value ? (JSON.parse(value) as CachedCoachingResponse) : null;
  } catch {
    unavailableUntil = Date.now() + 5 * 60 * 1000;
    return null;
  }
}

export async function setCachedCoachingResponse(key: string, value: CachedCoachingResponse): Promise<void> {
  const redis = await getRedisClient();
  if (!redis) return;

  try {
    await redis.set(key, JSON.stringify(value), "EX", redisConfig.defaultTTL.aiResponse);
  } catch {
    unavailableUntil = Date.now() + 5 * 60 * 1000;
  }
}
