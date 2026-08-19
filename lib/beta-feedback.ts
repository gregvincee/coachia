export const BETA_FEEDBACK_CATEGORIES = [
  { id: "experience", label: "Expérience générale" },
  { id: "coaching", label: "Coaching IA" },
  { id: "technical", label: "Problème technique" },
  { id: "suggestion", label: "Suggestion" },
] as const;

export type BetaFeedbackCategory = (typeof BETA_FEEDBACK_CATEGORIES)[number]["id"];

export type BetaFeedbackDraft = {
  rating: number;
  category: BetaFeedbackCategory;
  message: string;
};

export type BetaFeedback = BetaFeedbackDraft & {
  id: string;
  createdAt: string;
};

export type BetaFeedbackValidation = {
  valid: boolean;
  message?: string;
};

const categoryLabels = new Map(BETA_FEEDBACK_CATEGORIES.map((category) => [category.id, category.label]));

export function validateBetaFeedback(draft: BetaFeedbackDraft): BetaFeedbackValidation {
  if (!Number.isInteger(draft.rating) || draft.rating < 1 || draft.rating > 5) {
    return { valid: false, message: "Choisissez une note de 1 à 5." };
  }
  if (!categoryLabels.has(draft.category)) {
    return { valid: false, message: "Choisissez une catégorie de retour." };
  }
  if (draft.message.trim().length < 15) {
    return { valid: false, message: "Ajoutez au moins 15 caractères pour rendre votre retour exploitable." };
  }
  return { valid: true };
}

export function createBetaFeedback(draft: BetaFeedbackDraft, createdAt = new Date()): BetaFeedback {
  const validation = validateBetaFeedback(draft);
  if (!validation.valid) throw new Error(validation.message);

  return {
    id: `beta_feedback_${createdAt.getTime()}_${Math.random().toString(36).slice(2, 8)}`,
    rating: draft.rating,
    category: draft.category,
    message: draft.message.trim(),
    createdAt: createdAt.toISOString(),
  };
}

/** Format texte anonymisé, pratique pour transférer les retours hors de l’application. */
export function formatBetaFeedbackExport(feedbacks: BetaFeedback[]): string {
  if (feedbacks.length === 0) return "CoachIA — Aucun retour bêta enregistré.";

  const rows = feedbacks.map((feedback, index) => {
    const label = categoryLabels.get(feedback.category) ?? feedback.category;
    const date = new Intl.DateTimeFormat("fr-CA", { dateStyle: "medium", timeStyle: "short" }).format(new Date(feedback.createdAt));
    return `${index + 1}. ${label} — ${feedback.rating}/5\n${feedback.message}\n${date}`;
  });

  return `CoachIA — Retours bêta (${feedbacks.length})\n\n${rows.join("\n\n")}`;
}
