export const BETA_WELCOME_STEPS = [
  {
    id: "first_session",
    title: "Faire une première session",
    description: "Choisissez une compétence et envoyez au moins un message au coach IA.",
  },
  {
    id: "share_feedback",
    title: "Partager votre retour",
    description: "Notez votre expérience et indiquez ce qui mérite d’être amélioré.",
  },
] as const;

export type BetaWelcomeStepId = (typeof BETA_WELCOME_STEPS)[number]["id"];

export type BetaWelcomeProgress = Record<BetaWelcomeStepId, boolean>;

export const DEFAULT_BETA_WELCOME_PROGRESS: BetaWelcomeProgress = {
  first_session: false,
  share_feedback: false,
};

export function normalizeBetaWelcomeProgress(value: Partial<BetaWelcomeProgress> | null | undefined): BetaWelcomeProgress {
  return {
    first_session: value?.first_session === true,
    share_feedback: value?.share_feedback === true,
  };
}

export function getBetaWelcomeCompletion(progress: BetaWelcomeProgress) {
  const completed = BETA_WELCOME_STEPS.filter((step) => progress[step.id]).length;
  return { completed, total: BETA_WELCOME_STEPS.length, ratio: completed / BETA_WELCOME_STEPS.length };
}
