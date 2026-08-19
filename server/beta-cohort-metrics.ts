export type BetaCohortMemberMetric = {
  userId: number;
  activatedAt: Date;
  latestActivityAt: Date;
};

export type BetaCohortFeedbackMetric = {
  userId: number;
  rating: number;
  createdAt: Date;
};

export type BetaCohortDecision = {
  id: "collect_more_data" | "improve_activation" | "improve_retention" | "continue_beta";
  title: string;
  description: string;
};

/**
 * Transforme des signaux internes minimaux en rapport anonyme exploitable par
 * l’administration. Aucun identifiant utilisateur n’est inclus dans le retour.
 */
export function buildBetaCohortMetrics(
  members: BetaCohortMemberMetric[],
  feedbacks: BetaCohortFeedbackMetric[],
  since: Date,
  now = new Date(),
) {
  const cohortSize = members.length;
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const activatedInPeriod = members.filter((member) => member.activatedAt >= since).length;
  const activeUsers = members.filter((member) => member.latestActivityAt >= since).length;
  const eligibleForRetention = members.filter((member) => member.activatedAt <= weekAgo);
  const returningAfterSevenDays = eligibleForRetention.filter((member) => {
    const seventhDay = new Date(member.activatedAt);
    seventhDay.setDate(seventhDay.getDate() + 7);
    return member.latestActivityAt >= seventhDay;
  }).length;

  const feedbacksInPeriod = feedbacks.filter((feedback) => feedback.createdAt >= since);
  const feedbackSubmitters = new Set(feedbacksInPeriod.map((feedback) => feedback.userId)).size;
  const averageFeedbackRating = feedbacksInPeriod.length === 0
    ? null
    : Math.round((feedbacksInPeriod.reduce((total, feedback) => total + feedback.rating, 0) / feedbacksInPeriod.length) * 10) / 10;

  const activityRate = cohortSize === 0 ? 0 : activeUsers / cohortSize;
  const retention7dRate = eligibleForRetention.length === 0 ? null : returningAfterSevenDays / eligibleForRetention.length;
  const feedbackRate = cohortSize === 0 ? 0 : feedbackSubmitters / cohortSize;
  const sampleSizeReached = cohortSize >= 5;

  let decision: BetaCohortDecision;
  if (!sampleSizeReached) {
    decision = {
      id: "collect_more_data",
      title: "Consolider la cohorte",
      description: "Invitez encore quelques testeurs avant de tirer une conclusion : le seuil de lecture est fixé à 5 participants activés.",
    };
  } else if (activityRate < 0.6) {
    decision = {
      id: "improve_activation",
      title: "Améliorer la première session",
      description: "Moins de 60 % de la cohorte est active sur la période. Simplifiez l’onboarding ou rendez la première micro-victoire plus évidente.",
    };
  } else if (retention7dRate !== null && eligibleForRetention.length >= 5 && retention7dRate < 0.25) {
    decision = {
      id: "improve_retention",
      title: "Renforcer le retour à 7 jours",
      description: "Moins de 25 % des participants éligibles reviennent après une semaine. Travaillez les rappels utiles, le streak et le prochain exercice recommandé.",
    };
  } else {
    decision = {
      id: "continue_beta",
      title: "Poursuivre la validation bêta",
      description: "Les premiers signaux sont suffisants pour continuer à recueillir les retours et prioriser les améliorations observées.",
    };
  }

  return {
    cohortSize,
    activatedInPeriod,
    activeUsers,
    activityRate,
    eligibleForRetention: eligibleForRetention.length,
    returningAfterSevenDays,
    retention7dRate,
    feedbackCount: feedbacksInPeriod.length,
    feedbackSubmitters,
    feedbackRate,
    averageFeedbackRating,
    sampleSizeReached,
    decision,
  };
}
