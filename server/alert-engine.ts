import type { ProductCommerceMetric } from "./commerce-metrics";
import {
  getAiDailyUsage,
  getCheckoutFailuresBetween,
  getCommerceMetricsBetween,
  getRedisCacheMetricsSince,
} from "./db";
import { assertActionableAlert, type AlertLevel, type CoachIAAlert } from "../lib/types-alerts";

export const AI_DAILY_BUDGET_CENTS = Number(process.env.COACHIA_AI_DAILY_BUDGET_CENTS ?? 1000);
export const AI_BUDGET_WARNING_RATIO = 0.7;
export const AI_BUDGET_CRITICAL_RATIO = 0.9;
export const REDIS_CACHE_WARNING_RATIO = 0.5;
export const REDIS_MINIMUM_REQUESTS = 20;
export const CHECKOUT_CONVERSION_WARNING_RATIO = 0.15;
export const CHECKOUT_MINIMUM_STARTS = 20;
export const CHECKOUT_PERIOD_DAYS = 7;

export type AiBudgetSnapshot = {
  estimatedCostMilliCents: number;
  requestCount: number;
};

export type RedisCacheSnapshot = {
  cacheHits: number;
  cacheMisses: number;
};

export type CheckoutSnapshot = {
  current: ProductCommerceMetric[];
  previous: ProductCommerceMetric[];
  paymentFailures: Record<string, number>;
};

const toCents = (milliCents: number) => Math.round(milliCents / 1000);
const roundRate = (rate: number) => Math.round(rate * 10_000) / 10_000;

/** Signale le budget puis autorise uniquement la protection automatique des comptes Free au niveau critique. */
export function checkAIBudgetAlert(
  snapshot: AiBudgetSnapshot,
  budgetCents = AI_DAILY_BUDGET_CENTS,
): CoachIAAlert | null {
  const costCents = toCents(snapshot.estimatedCostMilliCents);
  const ratio = budgetCents > 0 ? costCents / budgetCents : 0;
  if (ratio < AI_BUDGET_WARNING_RATIO) return null;

  const critical = ratio >= AI_BUDGET_CRITICAL_RATIO;
  return assertActionableAlert({
    id: "ai-budget-daily",
    type: "AI_BUDGET",
    level: critical ? "CRITICAL" : "WARNING",
    problème: "Le budget IA quotidien approche de sa limite.",
    métrique: "Dépense IA quotidienne",
    valeurActuelle: costCents,
    seuil: Math.round(budgetCents * (critical ? AI_BUDGET_CRITICAL_RATIO : AI_BUDGET_WARNING_RATIO)),
    période: "Aujourd’hui (UTC)",
    volumeMinimalAtteint: snapshot.requestCount > 0,
    impactEstimé: critical
      ? "Les quotas IA des comptes Free sont réduits jusqu’au prochain cycle quotidien. Les abonnés Pro et Elite ne sont pas affectés."
      : "La marge budgétaire quotidienne se réduit ; une dérive du coût par session peut déclencher la protection Free.",
    actionRecommandée: "Analyser le coût par session, la longueur des réponses et le taux de cache avant la prochaine hausse de trafic.",
    actionAutomatiqueAutorisée: critical,
    actionAutomatiqueAppliquée: critical,
    action: {
      id: critical ? "reduce_free_quotas" : "review_ai_costs",
      label: critical ? "Vérifier la protection Free" : "Analyser le coût IA",
      destination: "/admin-dashboard",
    },
    contexte: {
      dépenseBudgetRatio: roundRate(ratio),
      budgetCents,
      coûtEstiméCents: costCents,
      requêtesIA: snapshot.requestCount,
      abonnésProtégés: true,
    },
  });
}

/** Une alerte Redis n’est créée que si 24 h de données exploitables indiquent un taux de hit faible. */
export function checkRedisCacheAlert(snapshot: RedisCacheSnapshot): CoachIAAlert | null {
  const totalRequests = snapshot.cacheHits + snapshot.cacheMisses;
  const hitRate = totalRequests > 0 ? snapshot.cacheHits / totalRequests : 0;
  if (totalRequests < REDIS_MINIMUM_REQUESTS || hitRate >= REDIS_CACHE_WARNING_RATIO) return null;

  return assertActionableAlert({
    id: "redis-cache-hit-rate",
    type: "REDIS_CACHE",
    level: "WARNING",
    problème: "Le cache Redis évite trop peu d’appels coûteux.",
    métrique: "Taux de cache hit Redis",
    valeurActuelle: roundRate(hitRate),
    seuil: REDIS_CACHE_WARNING_RATIO,
    période: "Dernières 24 heures",
    volumeMinimalAtteint: true,
    impactEstimé: "Davantage de requêtes IA sont recalculées, ce qui augmente le coût et la latence évitable.",
    actionRecommandée: "Contrôler cache_hit, cache_miss, TTL et les clés de cache des réponses IA avant toute action automatique.",
    actionAutomatiqueAutorisée: false,
    actionAutomatiqueAppliquée: false,
    action: {
      id: "inspect_redis_cache",
      label: "Diagnostiquer le cache Redis",
      destination: "/admin-dashboard",
    },
    contexte: { cacheHits: snapshot.cacheHits, cacheMisses: snapshot.cacheMisses, requêtesCache: totalRequests },
  });
}

/** Émet une alerte ciblée par produit afin que l’administrateur puisse agir sans ambiguïté. */
export function checkCheckoutConversionAlerts(snapshot: CheckoutSnapshot): CoachIAAlert[] {
  const previousByProduct = new Map(snapshot.previous.map((metric) => [metric.productId, metric]));

  return snapshot.current.flatMap((currentMetric) => {
    if (
      currentMetric.checkoutStarts < CHECKOUT_MINIMUM_STARTS ||
      currentMetric.conversionRate >= CHECKOUT_CONVERSION_WARNING_RATIO
    ) {
      return [];
    }

    const previousMetric = previousByProduct.get(currentMetric.productId);
    const previousRate = previousMetric?.conversionRate ?? 0;
    const evolution = previousMetric && previousMetric.checkoutStarts > 0
      ? roundRate(currentMetric.conversionRate - previousRate)
      : null;

    return [assertActionableAlert({
      id: `checkout-conversion-${currentMetric.productId}`,
      type: "CHECKOUT_CONVERSION",
      level: "WARNING",
      problème: `La conversion du checkout est faible pour le produit ${currentMetric.productId}.`,
      métrique: "Conversion checkout → paiement confirmé",
      valeurActuelle: roundRate(currentMetric.conversionRate),
      seuil: CHECKOUT_CONVERSION_WARNING_RATIO,
      période: "7 derniers jours",
      volumeMinimalAtteint: true,
      impactEstimé: `${currentMetric.checkoutStarts - currentMetric.paidEvents} checkout(s) n’ont pas abouti durant la période.`,
      actionRecommandée: "Ouvrir le produit, comparer la période précédente, puis vérifier Stripe et les erreurs de paiement avant de modifier le prix ou l’offre.",
      actionAutomatiqueAutorisée: false,
      actionAutomatiqueAppliquée: false,
      action: {
        id: "review_checkout_product",
        label: "Examiner le produit et les paiements",
        destination: "/admin-dashboard",
        productId: currentMetric.productId,
        stripePath: "https://dashboard.stripe.com/test/payments",
      },
      comparaisonPériodePrécédente: {
        valeur: roundRate(previousRate),
        évolution: evolution,
        période: "7 jours précédents",
      },
      contexte: {
        produit: currentMetric.productId,
        checkoutStarts: currentMetric.checkoutStarts,
        paiementsConfirmés: currentMetric.paidEvents,
        échecsPaiement: snapshot.paymentFailures[currentMetric.productId] ?? 0,
      },
    })];
  });
}

export type AlertEngineDataSource = {
  getAiBudgetSnapshot: () => Promise<AiBudgetSnapshot>;
  getRedisSnapshot: () => Promise<RedisCacheSnapshot>;
  getCheckoutSnapshot: () => Promise<CheckoutSnapshot>;
};

function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export function createDefaultAlertDataSource(now = new Date()): AlertEngineDataSource {
  return {
    async getAiBudgetSnapshot() {
      const usage = await getAiDailyUsage(now);
      return { estimatedCostMilliCents: usage.estimatedCostMilliCents, requestCount: usage.requestCount };
    },
    async getRedisSnapshot() {
      const since = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      return getRedisCacheMetricsSince(since);
    },
    async getCheckoutSnapshot() {
      const currentStart = new Date(now.getTime() - CHECKOUT_PERIOD_DAYS * 24 * 60 * 60 * 1000);
      const previousStart = new Date(currentStart.getTime() - CHECKOUT_PERIOD_DAYS * 24 * 60 * 60 * 1000);
      const [current, previous, paymentFailures] = await Promise.all([
        getCommerceMetricsBetween(currentStart, now),
        getCommerceMetricsBetween(previousStart, currentStart),
        getCheckoutFailuresBetween(currentStart, now),
      ]);
      return { current: current.products, previous: previous.products, paymentFailures };
    },
  };
}

export async function getCoachIAAlerts(
  source: AlertEngineDataSource = createDefaultAlertDataSource(),
): Promise<CoachIAAlert[]> {
  const [aiSnapshot, redisSnapshot, checkoutSnapshot] = await Promise.all([
    source.getAiBudgetSnapshot(),
    source.getRedisSnapshot(),
    source.getCheckoutSnapshot(),
  ]);

  const alerts = [
    checkAIBudgetAlert(aiSnapshot),
    checkRedisCacheAlert(redisSnapshot),
    ...checkCheckoutConversionAlerts(checkoutSnapshot),
  ].filter((alert): alert is CoachIAAlert => alert !== null);

  const priority: Record<AlertLevel, number> = { CRITICAL: 0, WARNING: 1, INFO: 2 };
  return alerts.sort((left, right) => priority[left.level] - priority[right.level]);
}
