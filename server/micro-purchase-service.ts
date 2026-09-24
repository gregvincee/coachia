import Stripe from "stripe";

import {
  getMicroPurchaseByPaymentIntent,
  getOrCreateUserWallet,
  recordCommerceEvent,
  recordMicroPurchase,
  updateMicroPurchase,
  updateUserWallet,
} from "./db";
import { MICRO_PURCHASES_CATALOG } from "../lib/micro-purchases";

type PurchaseId = keyof typeof MICRO_PURCHASES_CATALOG;

export type PurchaseIntent = {
  paymentIntentId: string;
  clientSecret: string;
  amountCents: number;
  currency: "usd";
  productId: PurchaseId;
};

export type CheckoutSession = {
  checkoutUrl: string;
  sessionId: string;
  productId: PurchaseId;
};

export type PurchaseFulfilment = {
  paymentIntentId: string;
  productId: PurchaseId;
  alreadyFulfilled: boolean;
};

export type StripeMode = "not_configured" | "test" | "live" | "invalid";

export type StripeConfiguration = {
  configured: boolean;
  mode: StripeMode;
  webhookConfigured: boolean;
};

function getStripeSecretKey() {
  return process.env.COACHIA_STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY || "";
}

function getWebhookSecret() {
  return process.env.COACHIA_STRIPE_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET || "";
}

function getStripeMode(secretKey: string): StripeMode {
  if (!secretKey) return "not_configured";
  if (secretKey.startsWith("sk_test_") || secretKey.startsWith("rk_test_")) return "test";
  if (secretKey.startsWith("sk_live_") || secretKey.startsWith("rk_live_")) return "live";
  return "invalid";
}

/** Stat sans secret pour que l'interface puisse distinguer préparation, test et production. */
export function getStripeConfiguration(): StripeConfiguration {
  const mode = getStripeMode(getStripeSecretKey());
  return {
    configured: mode === "test" || mode === "live",
    mode,
    webhookConfigured: Boolean(getWebhookSecret()),
  };
}

export function isStripeConfigured() {
  return getStripeConfiguration().configured;
}

function getStripeClient() {
  const secretKey = getStripeSecretKey();
  const configuration = getStripeConfiguration();
  if (!configuration.configured) {
    if (configuration.mode === "invalid") {
      throw new Error("La clé Stripe doit commencer par sk_test_, sk_live_, rk_test_ ou rk_live_.");
    }
    throw new Error("Stripe n’est pas configuré. Ajoutez COACHIA_STRIPE_SECRET_KEY pour activer les paiements.");
  }
  return new Stripe(secretKey);
}

function getPurchase(productId: string) {
  const purchase = MICRO_PURCHASES_CATALOG[productId as PurchaseId];
  if (!purchase) throw new Error("Produit introuvable ou non disponible.");
  return purchase;
}

export function resolveSafeReturnUrl(returnBaseUrl: string) {
  const candidate = new URL(returnBaseUrl);
  const isLocal = candidate.hostname === "localhost" || candidate.hostname === "127.0.0.1";
  if (candidate.protocol !== "https:" && !isLocal) {
    throw new Error("URL de retour Stripe non sécurisée.");
  }
  return candidate.origin;
}

/** Crée une intention en recalculant systématiquement le prix côté serveur. */
export async function createMicroPurchaseIntent(userId: number, productId: string): Promise<PurchaseIntent> {
  const purchase = getPurchase(productId);
  const stripe = getStripeClient();
  const amountCents = Math.round(purchase.price * 100);

  const intent = await stripe.paymentIntents.create({
    amount: amountCents,
    currency: "usd",
    automatic_payment_methods: { enabled: true },
    metadata: {
      userId: String(userId),
      productId: purchase.id,
      source: "coachia_micro_store",
    },
  });

  if (!intent.client_secret) throw new Error("Stripe did not return a payment client secret.");
  await recordCommerceEvent({
    userId,
    eventType: "checkout_started",
    productId: purchase.id,
    paymentIntentId: intent.id,
  });

  return {
    paymentIntentId: intent.id,
    clientSecret: intent.client_secret,
    amountCents,
    currency: "usd",
    productId: purchase.id as PurchaseId,
  };
}

/**
 * Checkout Stripe hébergé, réservé au Web. Les achats numériques mobiles
 * utiliseront l’achat intégré Apple ou Google avant publication en boutique.
 */
export async function createMicroPurchaseCheckout(
  userId: number,
  productId: string,
  returnBaseUrl: string,
): Promise<CheckoutSession> {
  const purchase = getPurchase(productId);
  const stripe = getStripeClient();
  const baseUrl = resolveSafeReturnUrl(returnBaseUrl);

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: Math.round(purchase.price * 100),
          product_data: { name: purchase.name, description: purchase.description },
        },
      },
    ],
    metadata: {
      userId: String(userId),
      productId: purchase.id,
      source: "coachia_web_store",
    },
    payment_intent_data: {
      metadata: {
        userId: String(userId),
        productId: purchase.id,
        source: "coachia_web_store",
      },
    },
    success_url: `${baseUrl}/store?payment=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/store?payment=cancelled`,
  });

  if (!session.url) throw new Error("Stripe n’a pas retourné d’URL de checkout.");
  await recordCommerceEvent({
    userId,
    eventType: "checkout_started",
    productId: purchase.id,
    paymentIntentId: session.id,
  });
  return { checkoutUrl: session.url, sessionId: session.id, productId: purchase.id as PurchaseId };
}

/**
 * Vérifie le paiement auprès de Stripe avant de donner un droit. Il n'y a pas
 * de confiance côté mobile : l'ID utilisateur présent dans la metadata doit
 * correspondre à l'utilisateur connecté.
 */
export async function verifyAndFulfilMicroPurchase(
  userId: number,
  paymentIntentId: string,
): Promise<PurchaseFulfilment> {
  const stripe = getStripeClient();
  const intent = await stripe.paymentIntents.retrieve(paymentIntentId);

  if (intent.status !== "succeeded") throw new Error("Le paiement n’est pas confirmé par Stripe.");
  if (intent.metadata.userId !== String(userId)) throw new Error("Ce paiement n’appartient pas à cet utilisateur.");
  if (!intent.metadata.productId) throw new Error("Le produit est absent des métadonnées de paiement.");

  return fulfilMicroPurchase({
    userId,
    paymentIntentId: intent.id,
    productId: intent.metadata.productId,
    amountCents: intent.amount,
    currency: intent.currency,
    metadata: intent.metadata,
  });
}

/** Traite un webhook Stripe signé ; à raccorder à la route HTTP de production. */
export async function processStripeWebhook(rawBody: string | Buffer, signature: string) {
  const webhookSecret = getWebhookSecret();
  if (!webhookSecret) throw new Error("COACHIA_STRIPE_WEBHOOK_SECRET is not configured.");

  const stripe = getStripeClient();
  const event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);

  if (event.type !== "payment_intent.succeeded") return { received: true, fulfilled: false };

  const intent = event.data.object as Stripe.PaymentIntent;
  const userId = Number(intent.metadata.userId);
  const productId = intent.metadata.productId;
  if (!Number.isInteger(userId) || !productId) throw new Error("Webhook Stripe incomplet.");

  const result = await fulfilMicroPurchase({
    userId,
    paymentIntentId: intent.id,
    productId,
    amountCents: intent.amount,
    currency: intent.currency,
    metadata: intent.metadata,
  });
  return { received: true, fulfilled: true, result };
}

type FulfilmentInput = {
  userId: number;
  paymentIntentId: string;
  productId: string;
  amountCents: number;
  currency: string;
  metadata: Stripe.Metadata;
};

/** Attribution idempotente d’un achat : un même PaymentIntent ne crédite jamais deux fois. */
export async function fulfilMicroPurchase(input: FulfilmentInput): Promise<PurchaseFulfilment> {
  const purchase = getPurchase(input.productId);
  const existing = await getMicroPurchaseByPaymentIntent(input.paymentIntentId);

  if (existing?.status === "paid") {
    return { paymentIntentId: input.paymentIntentId, productId: purchase.id as PurchaseId, alreadyFulfilled: true };
  }

  await getOrCreateUserWallet(input.userId);
  await applyPurchaseEntitlement(input.userId, purchase.id);

  if (existing) {
    await updateMicroPurchase(input.paymentIntentId, { status: "paid", fulfilledAt: new Date() });
  } else {
    await recordMicroPurchase({
      userId: input.userId,
      productId: purchase.id,
      paymentIntentId: input.paymentIntentId,
      status: "paid",
      amountCents: input.amountCents,
      currency: input.currency,
      metadata: JSON.stringify(input.metadata),
      fulfilledAt: new Date(),
    });
  }

  await recordCommerceEvent({
    userId: input.userId,
    eventType: "payment_confirmed",
    productId: purchase.id,
    paymentIntentId: input.paymentIntentId,
  });

  return { paymentIntentId: input.paymentIntentId, productId: purchase.id as PurchaseId, alreadyFulfilled: false };
}

async function applyPurchaseEntitlement(userId: number, productId: string) {
  const wallet = await getOrCreateUserWallet(userId);
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;
  const thirtyDays = 30 * oneDay;

  switch (productId) {
    case "xp_boost_24h": {
      const start = Math.max(wallet.xpBoostExpiresAt?.getTime() ?? now, now);
      return updateUserWallet(userId, { xpBoostExpiresAt: new Date(start + oneDay) });
    }
    case "streak_saver":
      return updateUserWallet(userId, { streakSavers: wallet.streakSavers + 1 });
    case "daily_challenge":
      return updateUserWallet(userId, { challengePasses: wallet.challengePasses + 1 });
    case "hint_pack":
      return updateUserWallet(userId, { hintCredits: wallet.hintCredits + 5 });
    case "session_pack_5":
      return updateUserWallet(userId, { sessionCredits: wallet.sessionCredits + 5 });
    case "session_pack_10":
      return updateUserWallet(userId, { sessionCredits: wallet.sessionCredits + 10 });
    case "premium_content":
      return updateUserWallet(userId, { premiumContentPasses: wallet.premiumContentPasses + 10 });
    case "skill_mastery_pack":
      return updateUserWallet(userId, {
        sessionCredits: wallet.sessionCredits + 10,
        challengePasses: wallet.challengePasses + 5,
      });
    case "masterclass_access":
      return updateUserWallet(userId, { masterclassPasses: wallet.masterclassPasses + 5 });
    case "live_coaching_30min":
      return updateUserWallet(userId, { coachingMinutes: wallet.coachingMinutes + 30 });
    case "live_coaching_60min":
      return updateUserWallet(userId, { coachingMinutes: wallet.coachingMinutes + 60 });
    case "monthly_bundle": {
      const start = Math.max(wallet.monthlyBundleExpiresAt?.getTime() ?? now, now);
      return updateUserWallet(userId, { monthlyBundleExpiresAt: new Date(start + thirtyDays) });
    }
    case "badge_collection":
      return updateUserWallet(userId, { premiumContentPasses: wallet.premiumContentPasses + 5 });
    default:
      throw new Error("Produit sans droit associé.");
  }
}
