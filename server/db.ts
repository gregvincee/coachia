import { desc, eq, gte, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertMicroPurchaseTransaction,
  InsertCommerceEvent,
  InsertUser,
  InsertUserWallet,
  commerceEvents,
  microPurchaseTransactions,
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
  const db = await getDb();
  if (!db) return { since, products: [], totalRevenueCents: 0, paidOrders: 0 };

  const events = await db
    .select({
      productId: commerceEvents.productId,
      checkoutStarts: sql<number>`SUM(CASE WHEN ${commerceEvents.eventType} = 'checkout_started' THEN 1 ELSE 0 END)`,
      paidEvents: sql<number>`SUM(CASE WHEN ${commerceEvents.eventType} = 'payment_confirmed' THEN 1 ELSE 0 END)`,
    })
    .from(commerceEvents)
    .where(gte(commerceEvents.createdAt, since))
    .groupBy(commerceEvents.productId);

  const transactions = await db
    .select({
      productId: microPurchaseTransactions.productId,
      paidOrders: sql<number>`COUNT(*)`,
      revenueCents: sql<number>`SUM(${microPurchaseTransactions.amountCents})`,
    })
    .from(microPurchaseTransactions)
    .where(gte(microPurchaseTransactions.createdAt, since))
    .groupBy(microPurchaseTransactions.productId);

  const summary = buildCommerceMetrics(events, transactions);
  return {
    since,
    ...summary,
  };
}
