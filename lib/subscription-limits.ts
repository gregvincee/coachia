import type { AlertLevel } from "./types-alerts";
import type { SubscriptionPlan } from "./types-premium";

export type EffectiveAiQuota = {
  dailyPrompts: number;
  monthlyCoachingSessions: number;
  protectionApplied: boolean;
  reason: string | null;
};

const BASE_AI_QUOTAS: Record<SubscriptionPlan, Omit<EffectiveAiQuota, "protectionApplied" | "reason">> = {
  free: { dailyPrompts: 5, monthlyCoachingSessions: 3 },
  pro: { dailyPrompts: 50, monthlyCoachingSessions: 200 },
  elite: { dailyPrompts: 200, monthlyCoachingSessions: 500 },
};

const PROTECTED_FREE_AI_QUOTA: Omit<EffectiveAiQuota, "protectionApplied" | "reason"> = {
  dailyPrompts: 3,
  monthlyCoachingSessions: 1,
};

/**
 * Calcule la limite effective au moment de la demande. Seuls les comptes Free
 * sont réduits lorsqu’un seuil critique de budget IA est atteint ; Pro et Elite
 * restent strictement sur leurs limites contractuelles.
 */
export function getEffectiveAiQuota(plan: SubscriptionPlan, aiBudgetAlertLevel: AlertLevel | null): EffectiveAiQuota {
  const shouldProtectBudget = plan === "free" && aiBudgetAlertLevel === "CRITICAL";

  if (shouldProtectBudget) {
    return {
      ...PROTECTED_FREE_AI_QUOTA,
      protectionApplied: true,
      reason: "Protection automatique du budget IA quotidien",
    };
  }

  return {
    ...BASE_AI_QUOTAS[plan],
    protectionApplied: false,
    reason: null,
  };
}

export function isFreeQuotaProtectionRequired(plan: SubscriptionPlan, aiBudgetAlertLevel: AlertLevel | null): boolean {
  return getEffectiveAiQuota(plan, aiBudgetAlertLevel).protectionApplied;
}
