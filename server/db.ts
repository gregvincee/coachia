import { and, desc, eq, gte, lt, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertMicroPurchaseTransaction,
  InsertCommerceEvent,
  InsertUser,
  InsertUserWallet,
  aiDailyUsage,
  commerceEvents,
  microPurchaseTransactions,
  redisCacheDailyMetrics,
  userDailyAiUsage,
  users,
  userWallets,
} from "../drizzle/schema";
import { ENV } from "./_core/env";
import { buildCommerceMetrics } from "./commerce-metrics";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserWallet(userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const results = await db.select().from(userWallets).where(eq(userWallets.userId, userId)).limit(1);
  return results[0];
}

export async function getOrCreateUserWallet(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await getUserWallet(userId);
  if (existing) return existing;

  const values: InsertUserWallet = { userId };
  await db.insert(userWallets).values(values).onDuplicateKeyUpdate({ set: { updatedAt: new Date() } });
  const wallet = await getUserWallet(userId);
  if (!wallet) throw new Error("Unable to create user wallet");
  return wallet;
}

export async function updateUserWallet(
  userId: number,
  values: Partial<Omit<InsertUserWallet, "id" | "userId" | "createdAt">>,
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await getOrCreateUserWallet(userId);
  await db.update(userWallets).set({ ...values, updatedAt: new Date() }).where(eq(userWallets.userId, userId));
  return getUserWallet(userId);
}

export async function getMicroPurchaseByPaymentIntent(paymentIntentId: string) {
  const db = await getDb();
  if (!db) return undefined;

  const results = await db
    .select()
    .from(microPurchaseTransactions)
    .where(eq(microPurchaseTransactions.paymentIntentId, paymentIntentId))
    .limit(1);
  return results[0];
}

export async function recordMicroPurchase(values: InsertMicroPurchaseTransaction) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(microPurchaseTransactions).values(values);
  return getMicroPurchaseByPaymentIntent(values.paymentIntentId);
}

export async function updateMicroPurchase(
  paymentIntentId: string,
  values: Partial<Omit<InsertMicroPurchaseTransaction, "id" | "userId" | "productId" | "paymentIntentId" | "createdAt">>,
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(microPurchaseTransactions)
    .set({ ...values, updatedAt: new Date() })
    .where(eq(microPurchaseTransactions.paymentIntentId, paymentIntentId));
  return getMicroPurchaseByPaymentIntent(paymentIntentId);
}

export async function recordCommerceEvent(values: InsertCommerceEvent) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(commerceEvents).values(values);
}

export async function getUserPurchaseHistory(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(microPurchaseTransactions)
    .where(eq(microPurchaseTransactions.userId, userId))
    .orderBy(desc(microPurchaseTransactions.createdAt));
}

/**
 * Agrège uniquement les événements et montants nécessaires au pilotage du
 * Store. Les identifiants personnels n’apparaissent pas dans ce rapport.
 */
export async function getCommerceMetrics(since: Date) {
  return getCommerceMetricsBetween(since);
}

/** Agrège une période fermée pour comparer la conversion actuelle à la précédente. */
export async function getCommerceMetricsBetween(since: Date, until?: Date) {
  const db = await getDb();
  if (!db) {
    return {
      since,
      products: [],
      totalCheckoutStarts: 0,
      totalConfirmedEvents: 0,
      totalRevenueCents: 0,
      paidOrders: 0,
      conversionRate: 0,
      averageOrderValueCents: 0,
    };
  }

  const periodFilter = until
    ? and(gte(commerceEvents.createdAt, since), lt(commerceEvents.createdAt, until))
    : gte(commerceEvents.createdAt, since);
  const transactionPeriodFilter = until
    ? and(gte(microPurchaseTransactions.createdAt, since), lt(microPurchaseTransactions.createdAt, until))
    : gte(microPurchaseTransactions.createdAt, since);

  const events = await db
    .select({
      productId: commerceEvents.productId,
      checkoutStarts: sql<number>`SUM(CASE WHEN ${commerceEvents.eventType} = 'checkout_started' THEN 1 ELSE 0 END)`,
      paidEvents: sql<number>`SUM(CASE WHEN ${commerceEvents.eventType} = 'payment_confirmed' THEN 1 ELSE 0 END)`,
    })
    .from(commerceEvents)
    .where(periodFilter)
    .groupBy(commerceEvents.productId);

  const transactions = await db
    .select({
      productId: microPurchaseTransactions.productId,
      paidOrders: sql<number>`COUNT(*)`,
      revenueCents: sql<number>`SUM(${microPurchaseTransactions.amountCents})`,
    })
    .from(microPurchaseTransactions)
    .where(transactionPeriodFilter)
    .groupBy(microPurchaseTransactions.productId);

  const summary = buildCommerceMetrics(events, transactions);
  return {
    since,
    ...summary,
  };
}

function getDayKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export type AiUsageInput = {
  userId: number;
  promptTokens: number;
  completionTokens: number;
  estimatedCostMilliCents: number;
  occurredAt?: Date;
};

/** Enregistre des coûts agrégés et le compteur individuel minimal requis pour les quotas. */
export async function recordAiUsage(input: AiUsageInput) {
  const db = await getDb();
  if (!db) return;
  const day = getDayKey(input.occurredAt);

  await db.insert(aiDailyUsage).values({
    day,
    requestCount: 1,
    promptTokens: input.promptTokens,
    completionTokens: input.completionTokens,
    estimatedCostMilliCents: input.estimatedCostMilliCents,
  }).onDuplicateKeyUpdate({
    set: {
      requestCount: sql`${aiDailyUsage.requestCount} + 1`,
      promptTokens: sql`${aiDailyUsage.promptTokens} + ${input.promptTokens}`,
      completionTokens: sql`${aiDailyUsage.completionTokens} + ${input.completionTokens}`,
      estimatedCostMilliCents: sql`${aiDailyUsage.estimatedCostMilliCents} + ${input.estimatedCostMilliCents}`,
      updatedAt: new Date(),
    },
  });

  await db.insert(userDailyAiUsage).values({ userId: input.userId, day, promptRequests: 1 }).onDuplicateKeyUpdate({
    set: {
      promptRequests: sql`${userDailyAiUsage.promptRequests} + 1`,
      updatedAt: new Date(),
    },
  });
}

export async function getAiDailyUsage(date = new Date()) {
  const db = await getDb();
  const day = getDayKey(date);
  if (!db) {
    return { day, requestCount: 0, promptTokens: 0, completionTokens: 0, estimatedCostMilliCents: 0 };
  }
  const [usage] = await db.select().from(aiDailyUsage).where(eq(aiDailyUsage.day, day)).limit(1);
  return usage ?? { day, requestCount: 0, promptTokens: 0, completionTokens: 0, estimatedCostMilliCents: 0 };
}

export async function getUserDailyPromptUsage(userId: number, date = new Date()): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const [usage] = await db.select().from(userDailyAiUsage).where(and(eq(userDailyAiUsage.userId, userId), eq(userDailyAiUsage.day, getDayKey(date)))).limit(1);
  return usage?.promptRequests ?? 0;
}

export async function recordRedisCacheOutcome(outcome: "hit" | "miss", occurredAt = new Date()) {
  const db = await getDb();
  if (!db) return;
  const day = getDayKey(occurredAt);
  const hitIncrement = outcome === "hit" ? 1 : 0;
  const missIncrement = outcome === "miss" ? 1 : 0;

  await db.insert(redisCacheDailyMetrics).values({ day, cacheHits: hitIncrement, cacheMisses: missIncrement }).onDuplicateKeyUpdate({
    set: {
      cacheHits: sql`${redisCacheDailyMetrics.cacheHits} + ${hitIncrement}`,
      cacheMisses: sql`${redisCacheDailyMetrics.cacheMisses} + ${missIncrement}`,
      updatedAt: new Date(),
    },
  });
}

export async function getRedisCacheMetricsSince(since: Date) {
  const db = await getDb();
  if (!db) return { cacheHits: 0, cacheMisses: 0 };
  const [metrics] = await db.select({
    cacheHits: sql<number>`COALESCE(SUM(${redisCacheDailyMetrics.cacheHits}), 0)`,
    cacheMisses: sql<number>`COALESCE(SUM(${redisCacheDailyMetrics.cacheMisses}), 0)`,
  }).from(redisCacheDailyMetrics).where(gte(redisCacheDailyMetrics.day, getDayKey(since)));
  return { cacheHits: Number(metrics?.cacheHits ?? 0), cacheMisses: Number(metrics?.cacheMisses ?? 0) };
}

/** Nombre d’échecs de paiement par produit, pour diagnostiquer une faible conversion sans exposer les acheteurs. */
export async function getCheckoutFailuresBetween(since: Date, until?: Date): Promise<Record<string, number>> {
  const db = await getDb();
  if (!db) return {};
  const filter = until
    ? and(gte(commerceEvents.createdAt, since), lt(commerceEvents.createdAt, until), eq(commerceEvents.eventType, "payment_failed"))
    : and(gte(commerceEvents.createdAt, since), eq(commerceEvents.eventType, "payment_failed"));
  const rows = await db.select({
    productId: commerceEvents.productId,
    failureCount: sql<number>`COUNT(*)`,
  }).from(commerceEvents).where(filter).groupBy(commerceEvents.productId);

  return Object.fromEntries(rows.filter((row) => row.productId).map((row) => [row.productId as string, Number(row.failureCount ?? 0)]));
}
