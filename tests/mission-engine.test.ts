import { describe, expect, it } from "vitest";

import {
  MISSION_DEFINITIONS,
  createMissionLearningState,
  diagnoseMissionAttempt,
  recordMissionAttempt,
} from "../lib/mission-engine";

describe("moteur de missions CoachIA", () => {
  it("propose les trois missions fondatrices", () => {
    expect(Object.keys(MISSION_DEFINITIONS)).toEqual(["create", "solve", "build"]);
    expect(MISSION_DEFINITIONS.build.outcome).toContain("workflow");
  });

  it("diagnostique une tentative sans se limiter à fournir une réponse", () => {
    const diagnosis = diagnoseMissionAttempt(
      "solve",
      "Contexte : je dois choisir une solution pour mon client. Compare deux options avec des critères de coût et de délai.",
      "Je vérifierai les sources et je sélectionnerai l’option qui répond au critère principal.",
    );

    expect(diagnosis.overallScore).toBeGreaterThan(0);
    expect(diagnosis.correction).toContain("Ne demandez pas une nouvelle réponse");
    expect(diagnosis.retryPrompt).toContain("critère");
  });

  it("sépare la maîtrise réelle du système XP", () => {
    const initial = createMissionLearningState();
    const diagnosis = diagnoseMissionAttempt("create", "Objectif : écrire un pitch. Audience : prospects. Format : 100 mots.", "Je vérifierai le ton et le résultat.");
    const next = recordMissionAttempt(initial, {
      id: "attempt-1",
      missionId: "create",
      request: "Objectif : écrire un pitch. Audience : prospects. Format : 100 mots.",
      result: "Je vérifierai le ton et le résultat.",
      diagnosis,
      createdAt: new Date().toISOString(),
    });

    expect(next.mastery.prompting.attempts).toBe(1);
    expect(next.mastery.prompting.score).toBeGreaterThan(0);
    expect("xp" in next).toBe(false);
  });
});
