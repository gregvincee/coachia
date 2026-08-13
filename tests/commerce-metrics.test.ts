import { describe, expect, it } from "vitest";
import { buildCommerceMetrics } from "../server/commerce-metrics";

describe("métriques de conversion Commerce", () => {
  it("combine les checkout et paiements sans exposer les utilisateurs", () => {
    const metrics = buildCommerceMetrics(
      [{ productId: "session_pack_5", checkoutStarts: 10, paidEvents: 3 }],
      [{ productId: "session_pack_5", paidOrders: 3, revenueCents: 1497 }],
    );

    expect(metrics.products).toEqual([
      {
        productId: "session_pack_5",
        checkoutStarts: 10,
        paidEvents: 3,
        paidOrders: 3,
        revenueCents: 1497,
        conversionRate: 0.3,
      },
    ]);
    expect(metrics.totalRevenueCents).toBe(1497);
    expect(metrics.paidOrders).toBe(3);
    expect(metrics.totalCheckoutStarts).toBe(10);
    expect(metrics.totalConfirmedEvents).toBe(3);
    expect(metrics.conversionRate).toBe(0.3);
    expect(metrics.averageOrderValueCents).toBe(499);
  });

  it("gère un paiement sans événement de checkout", () => {
    const metrics = buildCommerceMetrics(
      [],
      [{ productId: "streak_saver", paidOrders: "1", revenueCents: "199" }],
    );

    expect(metrics.products[0]).toMatchObject({
      productId: "streak_saver",
      checkoutStarts: 0,
      paidOrders: 1,
      revenueCents: 199,
      conversionRate: 0,
    });
  });
});
