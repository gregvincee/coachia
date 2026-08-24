export type MissionTrackId = "create" | "solve" | "build";
export type MasteryCapabilityId = "prompting" | "verification" | "reasoning" | "automation";
export type MasteryStage = "Découverte" | "Essai" | "Compréhension" | "Autonomie" | "Maîtrise" | "Transfert";

export interface MissionDefinition {
  id: MissionTrackId;
  label: string;
  title: string;
  goal: string;
  outcome: string;
  coachingSkillId: string;
  whyItMatters: string;
  firstAttemptHint: string;
}

export interface CapabilityMastery {
  score: number;
  attempts: number;
  stage: MasteryStage;
}

export interface MissionDiagnosis {
  overallScore: number;
  capabilityScores: Record<MasteryCapabilityId, number>;
  strength: string;
  difficulty: string;
  correction: string;
  retryPrompt: string;
}

export interface MissionAttempt {
  id: string;
  missionId: MissionTrackId;
  request: string;
  result: string;
  diagnosis: MissionDiagnosis;
  createdAt: string;
}

export interface MissionLearningState {
  activeMissionId: MissionTrackId;
  mastery: Record<MasteryCapabilityId, CapabilityMastery>;
  attempts: MissionAttempt[];
  lastDifficulty: string | null;
}

export const MISSION_DEFINITIONS: Record<MissionTrackId, MissionDefinition> = {
  create: {
    id: "create",
    label: "Créer",
    title: "Créer un livrable utile avec l’IA",
    goal: "Transformez une idée floue en contenu immédiatement exploitable.",
    outcome: "Un brouillon de publication, de pitch ou de message prêt à adapter.",
    coachingSkillId: "creative-writing",
    whyItMatters: "Créer avec l’IA demande de préciser l’audience, le format et la contrainte avant de demander une réponse.",
    firstAttemptHint: "Décrivez votre objectif, votre audience, le format attendu et une contrainte concrète.",
  },
  solve: {
    id: "solve",
    label: "Résoudre",
    title: "Résoudre un problème réel avec l’IA",
    goal: "Décomposez une situation difficile au lieu d’accepter la première réponse proposée.",
    outcome: "Un plan de décision vérifiable avec des critères clairs.",
    coachingSkillId: "productivity",
    whyItMatters: "Résoudre avec l’IA demande de poser le contexte, d’exiger des options et de vérifier les hypothèses.",
    firstAttemptHint: "Présentez le problème, les contraintes, ce qui a déjà été essayé et le critère de réussite.",
  },
  build: {
    id: "build",
    label: "Construire",
    title: "Construire un workflow avec l’IA",
    goal: "Organisez plusieurs étapes pour automatiser ou faire avancer un petit projet.",
    outcome: "Un workflow réutilisable : déclencheur, étapes, contrôle et résultat.",
    coachingSkillId: "time-management",
    whyItMatters: "Construire avec l’IA demande de séquencer, prévoir des contrôles et savoir quoi faire si une étape échoue.",
    firstAttemptHint: "Décrivez le déclencheur, les étapes, le résultat attendu et la façon de vérifier le résultat.",
  },
};

const CAPABILITY_LABELS: Record<MasteryCapabilityId, string> = {
  prompting: "structurer une demande",
  verification: "vérifier une réponse",
  reasoning: "raisonner avec l’IA",
  automation: "concevoir un workflow",
};

const DEFAULT_MASTERY: Record<MasteryCapabilityId, CapabilityMastery> = {
  prompting: { score: 0, attempts: 0, stage: "Découverte" },
  verification: { score: 0, attempts: 0, stage: "Découverte" },
  reasoning: { score: 0, attempts: 0, stage: "Découverte" },
  automation: { score: 0, attempts: 0, stage: "Découverte" },
};

export function createMissionLearningState(): MissionLearningState {
  return {
    activeMissionId: "create",
    mastery: structuredClone(DEFAULT_MASTERY),
    attempts: [],
    lastDifficulty: null,
  };
}

export function getMasteryStage(score: number): MasteryStage {
  if (score < 20) return "Découverte";
  if (score < 40) return "Essai";
  if (score < 60) return "Compréhension";
  if (score < 75) return "Autonomie";
  if (score < 90) return "Maîtrise";
  return "Transfert";
}

function hasAny(text: string, markers: string[]) {
  return markers.some((marker) => text.includes(marker));
}

function scoreCapability(text: string, markers: string[], minimumLength = 0) {
  const markerScore = markers.filter((marker) => text.includes(marker)).length * 18;
  const lengthScore = text.length >= minimumLength ? 20 : Math.min(16, Math.floor(text.length / 16));
  return Math.min(100, 10 + markerScore + lengthScore);
}

/** Produit un diagnostic actionnable ; il ne fournit jamais simplement une « bonne réponse ». */
export function diagnoseMissionAttempt(missionId: MissionTrackId, request: string, result: string): MissionDiagnosis {
  const mission = MISSION_DEFINITIONS[missionId];
  const text = `${request} ${result}`.toLowerCase();
  const capabilityScores: Record<MasteryCapabilityId, number> = {
    prompting: scoreCapability(text, ["objectif", "contexte", "audience", "public", "format", "ton", "contrainte", "longueur"], 90),
    verification: scoreCapability(text, ["vérif", "source", "contrôle", "preuve", "fact", "valide", "critère"], 60),
    reasoning: scoreCapability(text, ["pourquoi", "raison", "option", "compar", "étape", "priorit", "hypothèse"], 80),
    automation: scoreCapability(text, ["workflow", "déclenche", "puis", "ensuite", "si ", "automati", "répét"], 80),
  };

  if (missionId === "create") capabilityScores.prompting = Math.min(100, capabilityScores.prompting + 12);
  if (missionId === "solve") capabilityScores.reasoning = Math.min(100, capabilityScores.reasoning + 12);
  if (missionId === "build") capabilityScores.automation = Math.min(100, capabilityScores.automation + 12);

  const weakest = (Object.entries(capabilityScores) as Array<[MasteryCapabilityId, number]>).sort(([, left], [, right]) => left - right)[0][0];
  const strongest = (Object.entries(capabilityScores) as Array<[MasteryCapabilityId, number]>).sort(([, left], [, right]) => right - left)[0][0];
  const overallScore = Math.round(Object.values(capabilityScores).reduce((sum, score) => sum + score, 0) / 4);

  return {
    overallScore,
    capabilityScores,
    strength: `Vous commencez à ${CAPABILITY_LABELS[strongest]}. Gardez cet élément dans votre prochaine tentative.`,
    difficulty: `Votre prochaine marge de progression est de ${CAPABILITY_LABELS[weakest]}.`,
    correction: `Ne demandez pas une nouvelle réponse tout de suite : améliorez votre demande avec un contexte, un critère de réussite et une façon de contrôler le résultat.`,
    retryPrompt: `Refaites la mission « ${mission.label} » en ajoutant explicitement : 1) le contexte, 2) le résultat attendu, 3) un critère pour vérifier la réponse.`,
  };
}

export function recordMissionAttempt(state: MissionLearningState, attempt: MissionAttempt): MissionLearningState {
  const mastery = { ...state.mastery };
  (Object.entries(attempt.diagnosis.capabilityScores) as Array<[MasteryCapabilityId, number]>).forEach(([capabilityId, score]) => {
    const previous = mastery[capabilityId];
    const attempts = previous.attempts + 1;
    const nextScore = Math.round((previous.score * previous.attempts + score) / attempts);
    mastery[capabilityId] = { score: nextScore, attempts, stage: getMasteryStage(nextScore) };
  });

  return {
    activeMissionId: attempt.missionId,
    mastery,
    attempts: [attempt, ...state.attempts].slice(0, 20),
    lastDifficulty: attempt.diagnosis.difficulty,
  };
}
