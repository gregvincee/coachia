import { describe, expect, it } from "vitest";
import { buildBetaCohortMetrics } from "../server/beta-cohort-metrics";

const now = new Date("2026-08-19T12:00:00.000Z");
const since = new Date("2026-08-12T12:00:00.000Z");

describe("métriques de cohorte bêta", () => {
  it("demande davantage de données avant le seuil de cinq participants", () => {
    const metrics = buildBetaCohortMetrics([
      { userId: 1, activatedAt: new Date("2026-08-18T12:00:00.000Z"), latestActivityAt: now },
      { userId: 2, activatedAt: new Date("2026-08-17T12:00:00.000Z"), latestActivityAt: now },
    ], [], since, now);

    expect(metrics).toMatchObject({ cohortSize: 2, activityRate: 1, sampleSizeReached: false, decision: { id: "collect_more_data" } });
  });

  it("recommande de simplifier l’activation si moins de 60 % de la cohorte est active", () => {
    const metrics = buildBetaCohortMetrics([
      { userId: 1, activatedAt: new Date("2026-08-10T12:00:00.000Z"), latestActivityAt: now },
      { userId: 2, activatedAt: new Date("2026-08-10T12:00:00.000Z"), latestActivityAt: new Date("2026-08-11T12:00:00.000Z") },
      { userId: 3, activatedAt: new Date("2026-08-10T12:00:00.000Z"), latestActivityAt: new Date("2026-08-11T12:00:00.000Z") },
      { userId: 4, activatedAt: new Date("2026-08-10T12:00:00.000Z"), latestActivityAt: new Date("2026-08-11T12:00:00.000Z") },
      { userId: 5, activatedAt: new Date("2026-08-10T12:00:00.000Z"), latestActivityAt: new Date("2026-08-11T12:00:00.000Z") },
    ], [], since, now);

    expect(metrics).toMatchObject({ activeUsers: 1, activityRate: 0.2, decision: { id: "improve_activation" } });
  });

  it("calcule les notes sans exposer les identités des testeurs", () => {
    const metrics = buildBetaCohortMetrics([
      { userId: 1, activatedAt: new Date("2026-08-10T12:00:00.000Z"), latestActivityAt: now },
      { userId: 2, activatedAt: new Date("2026-08-10T12:00:00.000Z"), latestActivityAt: now },
      { userId: 3, activatedAt: new Date("2026-08-10T12:00:00.000Z"), latestActivityAt: now },
      { userId: 4, activatedAt: new Date("2026-08-10T12:00:00.000Z"), latestActivityAt: now },
      { userId: 5, activatedAt: new Date("2026-08-10T12:00:00.000Z"), latestActivityAt: now },
    ], [
      { userId: 1, rating: 4, createdAt: now },
      { userId: 2, rating: 5, createdAt: now },
    ], since, now);

    expect(metrics).toMatchObject({ feedbackCount: 2, feedbackSubmitters: 2, feedbackRate: 0.4, averageFeedbackRating: 4.5 });
    expect(metrics).not.toHaveProperty("userId");
  });
});
