import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "../server/_core/context";

const dbMocks = vi.hoisted(() => ({ getCommerceMetrics: vi.fn(), getBetaCohortMetrics: vi.fn() }));

vi.mock("../server/db", () => ({
  getCommerceMetrics: dbMocks.getCommerceMetrics,
  getBetaCohortMetrics: dbMocks.getBetaCohortMetrics,
  getUserPurchaseHistory: vi.fn(),
  getUserWallet: vi.fn(),
  getAiDailyUsage: vi.fn(),
  getUserDailyPromptUsage: vi.fn(),
  recordAiUsage: vi.fn(),
  recordCommerceEvent: vi.fn(),
  recordBetaCohortActivity: vi.fn(),
  recordBetaFeedbackRating: vi.fn(),
}));

import { appRouter } from "../server/routers";

function createContext(role: "user" | "admin"): TrpcContext {
  return {
    user: {
      id: 11,
      openId: "dashboard-test-user",
      name: "Test Admin",
      email: "admin@example.com",
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

describe("API du tableau de bord administrateur", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    dbMocks.getCommerceMetrics.mockResolvedValue({
      since: new Date("2026-08-01"),
      totalRevenueCents: 1497,
      paidOrders: 3,
      totalCheckoutStarts: 10,
      totalConfirmedEvents: 3,
      conversionRate: 0.3,
      averageOrderValueCents: 499,
      products: [
        {
          productId: "session_pack_5",
          checkoutStarts: 10,
          paidEvents: 3,
          paidOrders: 3,
          revenueCents: 1497,
          conversionRate: 0.3,
        },
      ],
    });
  });

  it("refuse les métriques aux utilisateurs non administrateurs", async () => {
    const caller = appRouter.createCaller(createContext("user"));

    await expect(caller.commerce.metrics({ days: 30 })).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(dbMocks.getCommerceMetrics).not.toHaveBeenCalled();
  });

  it("retourne une synthèse enrichie au compte administrateur", async () => {
    const caller = appRouter.createCaller(createContext("admin"));
    const result = await caller.commerce.metrics({ days: 30 });

    expect(result.periodDays).toBe(30);
    expect(result.totals).toMatchObject({
      revenueCents: 1497,
      paidOrders: 3,
      checkoutStarts: 10,
      totalConfirmedEvents: 3,
      conversionRate: 0.3,
      averageOrderValueCents: 499,
    });
    expect(result.products).toEqual([
      expect.objectContaining({
        productId: "session_pack_5",
        name: "Pack de 5 sessions",
        category: "sessions",
        revenueCents: 1497,
      }),
    ]);
  });
});
