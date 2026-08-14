import { z } from "zod";
import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import { SKILL_PROMPTS } from "../lib/data";
import { MICRO_PURCHASES_CATALOG } from "../lib/micro-purchases";
import {
  getAiDailyUsage,
  getCommerceMetrics,
  getUserDailyPromptUsage,
  getUserPurchaseHistory,
  getUserWallet,
  recordAiUsage,
  recordCommerceEvent,
} from "./db";
import { TRPCError } from "@trpc/server";
import {
  createMicroPurchaseCheckout,
  createMicroPurchaseIntent,
  isStripeConfigured,
  verifyAndFulfilMicroPurchase,
} from "./micro-purchase-service";
import { checkAIBudgetAlert, getCoachIAAlerts } from "./alert-engine";
import { getEffectiveAiQuota } from "../lib/subscription-limits";
import { estimateAiCostMilliCents } from "./ai-cost";
import { createCoachingCacheKey, getCachedCoachingResponse, setCachedCoachingResponse } from "./_core/redis-cache";

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  commerce: router({
    /** Le catalogue et ses prix sont distribués en lecture seule. */
    catalog: publicProcedure.query(() => ({
      products: Object.values(MICRO_PURCHASES_CATALOG),
      stripeEnabled: isStripeConfigured(),
    })),

    /** Les crédits sont liés au compte authentifié, jamais à un identifiant client fourni. */
    wallet: protectedProcedure.query(async ({ ctx }) => {
      return (await getUserWallet(ctx.user.id)) ?? {
        userId: ctx.user.id,
        sessionCredits: 0,
        hintCredits: 0,
        streakSavers: 0,
        challengePasses: 0,
        premiumContentPasses: 0,
        masterclassPasses: 0,
        coachingMinutes: 0,
        xpBoostExpiresAt: null,
        monthlyBundleExpiresAt: null,
      };
    }),

    history: protectedProcedure.query(({ ctx }) => getUserPurchaseHistory(ctx.user.id)),

    trackStoreEvent: protectedProcedure
      .input(z.object({ eventType: z.enum(["store_view", "product_selected"]), productId: z.string().max(80).optional() }))
      .mutation(async ({ ctx, input }) => {
        await recordCommerceEvent({ userId: ctx.user.id, eventType: input.eventType, productId: input.productId ?? null });
        return { success: true };
      }),

    metrics: protectedProcedure
      .input(z.object({ days: z.number().int().min(1).max(365).default(30) }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "Accès administrateur requis." });
        const since = new Date();
        since.setDate(since.getDate() - input.days);
        const metrics = await getCommerceMetrics(since);
        return {
          periodDays: input.days,
          since: metrics.since,
          totals: {
            revenueCents: metrics.totalRevenueCents,
            paidOrders: metrics.paidOrders,
            checkoutStarts: metrics.totalCheckoutStarts,
            totalConfirmedEvents: metrics.totalConfirmedEvents,
            conversionRate: metrics.conversionRate,
            averageOrderValueCents: metrics.averageOrderValueCents,
          },
          products: metrics.products
            .map((product) => {
              const catalogProduct = MICRO_PURCHASES_CATALOG[product.productId as keyof typeof MICRO_PURCHASES_CATALOG];
              return {
                ...product,
                name: catalogProduct?.name ?? product.productId,
                category: catalogProduct?.category ?? "unknown",
                priceCents: catalogProduct ? Math.round(catalogProduct.price * 100) : null,
              };
            })
            .sort((left, right) => right.revenueCents - left.revenueCents),
        };
      }),

    /** Les alertes opérationnelles ne sont exposées qu’au compte administrateur. */
    alerts: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "Accès administrateur requis." });
      return { alerts: await getCoachIAAlerts() };
    }),

    /** Crée un paiement ponctuel en recalculant le prix depuis le catalogue serveur. */
    createIntent: protectedProcedure
      .input(z.object({ productId: z.string().min(1).max(80) }))
      .mutation(async ({ ctx, input }) => {
        return createMicroPurchaseIntent(ctx.user.id, input.productId);
      }),

    /** Checkout Stripe hébergé pour le Web. La base de retour est vérifiée côté serveur. */
    createCheckout: protectedProcedure
      .input(z.object({ productId: z.string().min(1).max(80), returnBaseUrl: z.string().url() }))
      .mutation(async ({ ctx, input }) => {
        return createMicroPurchaseCheckout(ctx.user.id, input.productId, input.returnBaseUrl);
      }),

    /**
     * Vérification de secours après le retour client. Le webhook reste la
     * source d’autorité : les deux flux sont idempotents par PaymentIntent.
     */
    confirmIntent: protectedProcedure
      .input(z.object({ paymentIntentId: z.string().min(3).max(255) }))
      .mutation(async ({ ctx, input }) => {
        return verifyAndFulfilMicroPurchase(ctx.user.id, input.paymentIntentId);
      }),
  }),

  // Chat IA pour le coaching
  ai: router({
    chat: protectedProcedure
      .input(
        z.object({
          skillId: z.string(),
          messages: z.array(
            z.object({
              role: z.enum(["user", "assistant"]),
              content: z.string(),
            })
          ),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { skillId, messages } = input;

        const dailyUsage = await getAiDailyUsage();
        const currentBudgetAlert = checkAIBudgetAlert(dailyUsage);
        const quota = getEffectiveAiQuota(ctx.user.subscriptionPlan, currentBudgetAlert?.level ?? null);
        const usedPrompts = await getUserDailyPromptUsage(ctx.user.id);
        if (usedPrompts >= quota.dailyPrompts) {
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: quota.protectionApplied
              ? "La protection budgétaire limite temporairement les demandes Free. Les abonnés ne sont pas concernés."
              : "Votre quota quotidien de coaching IA est atteint.",
          });
        }

        const cacheKey = createCoachingCacheKey(skillId, messages);
        const cached = await getCachedCoachingResponse(cacheKey);
        if (cached) {
          await recordAiUsage({ userId: ctx.user.id, promptTokens: 0, completionTokens: 0, estimatedCostMilliCents: 0 });
          return cached;
        }

        // Récupérer le prompt système pour la compétence
        const systemPrompt = SKILL_PROMPTS[skillId] || SKILL_PROMPTS["productivity"];

        // Construire les messages pour l'API LLM
        const llmMessages = [
          { role: "system" as const, content: systemPrompt },
          ...messages.map((msg) => ({
            role: msg.role as "user" | "assistant",
            content: msg.content,
          })),
        ];

        // Appeler l'API LLM
        const response = await invokeLLM({
          messages: llmMessages,
        });

        const content = response.choices[0]?.message?.content;
        const assistantMessage = typeof content === 'string' ? content : "Désolé, je n'ai pas pu générer de réponse.";

        // Générer des suggestions de réponses rapides
        const suggestions = generateQuickReplies(skillId, assistantMessage);

        await recordAiUsage({
          userId: ctx.user.id,
          promptTokens: response.usage?.prompt_tokens ?? 0,
          completionTokens: response.usage?.completion_tokens ?? 0,
          estimatedCostMilliCents: estimateAiCostMilliCents(response.usage),
        });
        await setCachedCoachingResponse(cacheKey, { message: assistantMessage, suggestions });

        return {
          message: assistantMessage,
          suggestions,
        };
      }),
  }),
});

// Fonction pour générer des suggestions de réponses rapides
function generateQuickReplies(skillId: string, lastMessage: string): string[] {
  const genericReplies = [
    "Dis-moi plus",
    "Donne-moi un exemple",
    "Comment faire ?",
  ];

  // Suggestions spécifiques par compétence
  const skillSpecificReplies: Record<string, string[]> = {
    "public-speaking": [
      "Donne-moi un exercice pratique",
      "Comment gérer le trac ?",
      "Aide-moi avec ma posture",
    ],
    "creative-writing": [
      "Propose-moi un exercice d'écriture",
      "Comment améliorer mon style ?",
      "Donne-moi de l'inspiration",
    ],
    "productivity": [
      "Explique-moi la méthode Pomodoro",
      "Comment prioriser mes tâches ?",
      "Aide-moi à planifier ma journée",
    ],
    "communication": [
      "Comment mieux écouter ?",
      "Aide-moi à gérer un conflit",
      "Comment être plus assertif ?",
    ],
    "leadership": [
      "Comment motiver mon équipe ?",
      "Aide-moi à prendre une décision",
      "Comment déléguer efficacement ?",
    ],
    "time-management": [
      "Comment éliminer les distractions ?",
      "Aide-moi à planifier ma semaine",
      "Comment équilibrer vie pro et perso ?",
    ],
  };

  const replies = skillSpecificReplies[skillId] || genericReplies;

  // Retourner 3 suggestions aléatoires
  const shuffled = [...replies].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3);
}

export type AppRouter = typeof appRouter;
