import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "../server/_core/context";

const dbMocks = vi.hoisted(() => ({
  getAiDailyUsage: vi.fn(), getBetaCohortMetrics: vi.fn(), getCommerceMetrics: vi.fn(), getUserDailyPromptUsage: vi.fn(), getUserPurchaseHistory: vi.fn(), getUserWallet: vi.fn(), recordAiUsage: vi.fn(), recordBetaCohortActivity: vi.fn(), recordBetaFeedbackRating: vi.fn(), recordCommerceEvent: vi.fn(),
}));

vi.mock("../server/db", () => dbMocks);
vi.mock("../server/alert-engine", () => ({ getCoachIAAlerts: vi.fn(), checkAIBudgetAlert: vi.fn() }));

import { appRouter } from "../server/routers";

function createContext(role: "user" | "admin"): TrpcContext {
  return { user: { id: 42, openId: "beta-cohort-user", name: "Beta", email: "beta@example.com", loginMethod: "manus", role, subscriptionPlan: "free", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() }, req: { headers: {}, protocol: "https" } as TrpcContext["req"], res: {} as TrpcContext["res"] };
}

describe("API de cohorte bêta administrateur", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    dbMocks.getBetaCohortMetrics.mockResolvedValue({ cohortSize: 5, activeUsers: 4, activityRate: 0.8, eligibleForRetention: 0, returningAfterSevenDays: 0, retention7dRate: null, feedbackCount: 2, feedbackSubmitters: 2, feedbackRate: 0.4, averageFeedbackRating: 4.5, sampleSizeReached: true, decision: { id: "continue_beta", title: "Poursuivre", description: "La cohorte est exploitable." } });
  });

  it("refuse les métriques de cohorte aux non-administrateurs", async () => {
    const caller = appRouter.createCaller(createContext("user"));
    await expect(caller.beta.metrics({ days: 7 })).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(dbMocks.getBetaCohortMetrics).not.toHaveBeenCalled();
  });

  it("retourne exclusivement les agrégats de cohorte au compte administrateur", async () => {
    const caller = appRouter.createCaller(createContext("admin"));
    const result = await caller.beta.metrics({ days: 7 });
    expect(result).toMatchObject({ periodDays: 7, cohortSize: 5, averageFeedbackRating: 4.5, decision: { id: "continue_beta" } });
    expect(result).not.toHaveProperty("userId");
  });
});
