import { describe, expect, it } from "vitest";

import {
  CHECKOUT_CONVERSION_WARNING_RATIO,
  CHECKOUT_MINIMUM_STARTS,
  checkAIBudgetAlert,
  checkCheckoutConversionAlerts,
  checkRedisCacheAlert,
} from "../server/alert-engine";
import { getEffectiveAiQuota } from "../lib/subscription-limits";
import { assertActionableAlert, type CoachIAAlert } from "../lib/types-alerts";

describe("COACHIA ALERT ENGINE", () => {
  it("émet un avertissement à 70 % du budget IA sans réduire les quotas", () => {
    const alert = checkAIBudgetAlert({ estimatedCostMilliCents: 700_000, requestCount: 15 }, 1000);

    expect(alert).toMatchObject({
      level: "WARNING",
      type: "AI_BUDGET",
      valeurActuelle: 700,
      seuil: 700,
      actionAutomatiqueAutorisée: false,
      actionAutomatiqueAppliquée: false,
    });
    expect(getEffectiveAiQuota("free", alert?.level ?? null)).toMatchObject({
      dailyPrompts: 5,
      protectionApplied: false,
    });
  });

  it("déclenche la protection Free à 90 % sans affecter Pro ni Elite", () => {
    const alert = checkAIBudgetAlert({ estimatedCostMilliCents: 900_000, requestCount: 25 }, 1000);

    expect(alert).toMatchObject({
      level: "CRITICAL",
      actionAutomatiqueAutorisée: true,
      actionAutomatiqueAppliquée: true,
      action: { id: "reduce_free_quotas" },
    });
    expect(getEffectiveAiQuota("free", "CRITICAL")).toMatchObject({ dailyPrompts: 3, monthlyCoachingSessions: 1, protectionApplied: true });
    expect(getEffectiveAiQuota("pro", "CRITICAL")).toMatchObject({ dailyPrompts: 50, protectionApplied: false });
    expect(getEffectiveAiQuota("elite", "CRITICAL")).toMatchObject({ dailyPrompts: 200, protectionApplied: false });
  });

  it("ne crée aucune alerte IA avant le seuil d’avertissement", () => {
    expect(checkAIBudgetAlert({ estimatedCostMilliCents: 699_000, requestCount: 4 }, 1000)).toBeNull();
  });

  it("attend un volume exploitable avant d’alerter sur le cache Redis", () => {
    expect(checkRedisCacheAlert({ cacheHits: 0, cacheMisses: 5 })).toBeNull();

    const alert = checkRedisCacheAlert({ cacheHits: 9, cacheMisses: 11 });
    expect(alert).toMatchObject({
      type: "REDIS_CACHE",
      level: "WARNING",
      valeurActuelle: 0.45,
      seuil: 0.5,
      volumeMinimalAtteint: true,
      actionAutomatiqueAutorisée: false,
      action: { id: "inspect_redis_cache" },
    });
  });

  it("cible le produit sous 15 % de conversion après 20 checkouts et compare la période précédente", () => {
    const alerts = checkCheckoutConversionAlerts({
      current: [{
        productId: "session_pack_5",
        checkoutStarts: CHECKOUT_MINIMUM_STARTS,
        paidEvents: 2,
        paidOrders: 2,
        revenueCents: 998,
        conversionRate: 2 / CHECKOUT_MINIMUM_STARTS,
      }],
      previous: [{
        productId: "session_pack_5",
        checkoutStarts: 20,
        paidEvents: 5,
        paidOrders: 5,
        revenueCents: 2495,
        conversionRate: 0.25,
      }],
      paymentFailures: { session_pack_5: 4 },
    });

    expect(alerts).toHaveLength(1);
    expect(alerts[0]).toMatchObject({
      type: "CHECKOUT_CONVERSION",
      level: "WARNING",
      valeurActuelle: 0.1,
      seuil: CHECKOUT_CONVERSION_WARNING_RATIO,
      action: { productId: "session_pack_5", stripePath: "https://dashboard.stripe.com/test/payments" },
      comparaisonPériodePrécédente: { valeur: 0.25, évolution: -0.15 },
      contexte: { échecsPaiement: 4 },
    });
  });

  it("ne crée pas d’alerte checkout si le volume minimal n’est pas atteint", () => {
    const alerts = checkCheckoutConversionAlerts({
      current: [{ productId: "hint_pack", checkoutStarts: 19, paidEvents: 0, paidOrders: 0, revenueCents: 0, conversionRate: 0 }],
      previous: [],
      paymentFailures: {},
    });
    expect(alerts).toEqual([]);
  });

  it("refuse toute alerte qui ne mène à aucune décision", () => {
    const invalidAlert = {
      id: "invalid",
      type: "AI_BUDGET",
      level: "WARNING",
      problème: "Signal isolé",
      métrique: "Métrique",
      valeurActuelle: 1,
      seuil: 1,
      période: "Maintenant",
      volumeMinimalAtteint: true,
      impactEstimé: "Aucun",
      actionRecommandée: "",
      actionAutomatiqueAutorisée: false,
      actionAutomatiqueAppliquée: false,
      action: { id: "review_ai_costs", label: "", destination: "/admin-dashboard" },
    } as CoachIAAlert;

    expect(() => assertActionableAlert(invalidAlert)).toThrow(/décision exploitable/i);
  });
});
