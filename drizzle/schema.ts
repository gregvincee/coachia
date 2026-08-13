import { int, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Solde non monétaire des achats ponctuels. Les montants sont attribués
 * exclusivement par le serveur après vérification d'un paiement Stripe.
 */
export const userWallets = mysqlTable(
  "userWallets",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    sessionCredits: int("sessionCredits").default(0).notNull(),
    hintCredits: int("hintCredits").default(0).notNull(),
    streakSavers: int("streakSavers").default(0).notNull(),
    challengePasses: int("challengePasses").default(0).notNull(),
    premiumContentPasses: int("premiumContentPasses").default(0).notNull(),
    masterclassPasses: int("masterclassPasses").default(0).notNull(),
    coachingMinutes: int("coachingMinutes").default(0).notNull(),
    xpBoostExpiresAt: timestamp("xpBoostExpiresAt"),
    monthlyBundleExpiresAt: timestamp("monthlyBundleExpiresAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [uniqueIndex("userWallets_userId_unique").on(table.userId)],
);

/**
 * Journal immuable des paiements ponctuels. paymentIntentId est unique afin
 * de rendre les webhooks Stripe idempotents et d'empêcher tout double crédit.
 */
export const microPurchaseTransactions = mysqlTable(
  "microPurchaseTransactions",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    productId: varchar("productId", { length: 80 }).notNull(),
    paymentIntentId: varchar("paymentIntentId", { length: 255 }).notNull(),
    status: mysqlEnum("status", ["pending", "paid", "failed", "refunded"]).default("pending").notNull(),
    amountCents: int("amountCents").notNull(),
    currency: varchar("currency", { length: 8 }).default("usd").notNull(),
    metadata: text("metadata"),
    fulfilledAt: timestamp("fulfilledAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [uniqueIndex("microPurchaseTransactions_paymentIntentId_unique").on(table.paymentIntentId)],
);

export type UserWallet = typeof userWallets.$inferSelect;
export type InsertUserWallet = typeof userWallets.$inferInsert;
export type MicroPurchaseTransaction = typeof microPurchaseTransactions.$inferSelect;
export type InsertMicroPurchaseTransaction = typeof microPurchaseTransactions.$inferInsert;

/** Événements minimaux nécessaires pour mesurer l’entonnoir sans stocker de données sensibles. */
export const commerceEvents = mysqlTable("commerceEvents", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  eventType: mysqlEnum("eventType", ["store_view", "product_selected", "checkout_started", "payment_confirmed", "payment_failed"]).notNull(),
  productId: varchar("productId", { length: 80 }),
  paymentIntentId: varchar("paymentIntentId", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CommerceEvent = typeof commerceEvents.$inferSelect;
export type InsertCommerceEvent = typeof commerceEvents.$inferInsert;
