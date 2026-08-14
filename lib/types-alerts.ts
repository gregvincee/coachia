/** Niveaux de gravité réservés au pilotage opérationnel. */
export const ALERT_LEVELS = ["INFO", "WARNING", "CRITICAL"] as const;
export type AlertLevel = (typeof ALERT_LEVELS)[number];

/** Les signaux ne sont admis que lorsqu’une décision explicite leur est associée. */
export const ALERT_TYPES = ["AI_BUDGET", "REDIS_CACHE", "CHECKOUT_CONVERSION"] as const;
export type AlertType = (typeof ALERT_TYPES)[number];

export type AlertAction = {
  id: "review_ai_costs" | "reduce_free_quotas" | "inspect_redis_cache" | "review_checkout_product";
  label: string;
  destination: "/admin-dashboard";
  productId?: string;
  stripePath?: string;
};

/**
 * Objet décisionnel présenté dans /admin. Les libellés suivent volontairement
 * le vocabulaire métier défini pour CoachIA, tandis que les champs techniques
 * servent au rendu et à la navigation sans exposer de données personnelles.
 */
export type CoachIAAlert = {
  id: string;
  type: AlertType;
  level: AlertLevel;
  problème: string;
  métrique: string;
  valeurActuelle: number;
  seuil: number;
  période: string;
  volumeMinimalAtteint: boolean;
  impactEstimé: string;
  actionRecommandée: string;
  actionAutomatiqueAutorisée: boolean;
  actionAutomatiqueAppliquée: boolean;
  action: AlertAction;
  comparaisonPériodePrécédente?: {
    valeur: number;
    évolution: number | null;
    période: string;
  };
  contexte?: Record<string, number | string | boolean>;
};

/** Ne laisse jamais entrer une alerte qui ne conduit à aucune décision. */
export function assertActionableAlert(alert: CoachIAAlert): CoachIAAlert {
  const hasDecision =
    alert.actionRecommandée.trim().length > 0 &&
    alert.action.id.trim().length > 0 &&
    alert.action.label.trim().length > 0;

  if (!hasDecision) {
    throw new Error("Une alerte CoachIA doit toujours comporter une décision exploitable.");
  }

  if (alert.level === "CRITICAL" && alert.actionAutomatiqueAutorisée && !alert.actionAutomatiqueAppliquée) {
    throw new Error("Une alerte critique autorisant une action automatique doit indiquer son application.");
  }

  return alert;
}
