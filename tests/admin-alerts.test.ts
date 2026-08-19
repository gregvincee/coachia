import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "../server/_core/context";

const alertMocks = vi.hoisted(() => ({ getCoachIAAlerts: vi.fn(), checkAIBudgetAlert: vi.fn() }));

vi.mock("../server/alert-engine", () => ({
  getCoachIAAlerts: alertMocks.getCoachIAAlerts,
  checkAIBudgetAlert: alertMocks.checkAIBudgetAlert,
}));

vi.mock("../server/db", () => ({
  getAiDailyUsage: vi.fn(),
  getBetaCohortMetrics: vi.fn(),
  getCommerceMetrics: vi.fn(),
  getUserDailyPromptUsage: vi.fn(),
  getUserPurchaseHistory: vi.fn(),
  getUserWallet: vi.fn(),
  recordAiUsage: vi.fn(),
  recordBetaCohortActivity: vi.fn(),
  recordBetaFeedbackRating: vi.fn(),
  recordCommerceEvent: vi.fn(),
}));

import { appRouter } from "../server/routers";

function createContext(role: "user" | "admin"): TrpcContext {
  return {
    user: {
      id: 21,
      openId: "alert-test-user",
      name: "Alert Test",
      email: "alerts@example.com",
      loginMethod: "manus",
      role,
      subscriptionPlan: "free",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { headers: {}, protocol: "https" } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("API d’alertes administrateur", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    alertMocks.getCoachIAAlerts.mockResolvedValue([
      {
        id: "ai-budget-daily",
        type: "AI_BUDGET",
        level: "CRITICAL",
        problème: "Budget IA",
        métrique: "Dépense IA quotidienne",
        valeurActuelle: 900,
        seuil: 900,
        période: "Aujourd’hui",
        volumeMinimalAtteint: true,
        impactEstimé: "Quotas Free réduits",
        actionRecommandée: "Analyser le coût/session",
        actionAutomatiqueAutorisée: true,
        actionAutomatiqueAppliquée: true,
        action: { id: "reduce_free_quotas", label: "Vérifier", destination: "/admin-dashboard" },
      },
    ]);
  });

  it("refuse les alertes aux non-administrateurs", async () => {
    const caller = appRouter.createCaller(createContext("user"));
    await expect(caller.commerce.alerts()).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(alertMocks.getCoachIAAlerts).not.toHaveBeenCalled();
  });

  it("retourne les alertes structurées au compte administrateur", async () => {
    const caller = appRouter.createCaller(createContext("admin"));
    const result = await caller.commerce.alerts();
    expect(result.alerts).toHaveLength(1);
    expect(result.alerts[0]).toMatchObject({
      id: "ai-budget-daily",
      level: "CRITICAL",
      actionAutomatiqueAppliquée: true,
      action: { id: "reduce_free_quotas" },
    });
  });
});
