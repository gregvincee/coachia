import { beforeEach, describe, expect, it, vi } from "vitest";

const dbMocks = vi.hoisted(() => ({
  getMicroPurchaseByPaymentIntent: vi.fn(),
  getOrCreateUserWallet: vi.fn(),
  recordCommerceEvent: vi.fn(),
  recordMicroPurchase: vi.fn(),
  updateMicroPurchase: vi.fn(),
  updateUserWallet: vi.fn(),
}));

vi.mock("../server/db", () => dbMocks);

import { fulfilMicroPurchase } from "../server/micro-purchase-service";

const wallet = {
  id: 1,
  userId: 7,
  sessionCredits: 0,
  hintCredits: 0,
  streakSavers: 0,
  challengePasses: 0,
  premiumContentPasses: 0,
  masterclassPasses: 0,
  coachingMinutes: 0,
  xpBoostExpiresAt: null,
  monthlyBundleExpiresAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("attribution sécurisée des micro-achats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    dbMocks.getMicroPurchaseByPaymentIntent.mockResolvedValue(undefined);
    dbMocks.getOrCreateUserWallet.mockResolvedValue(wallet);
    dbMocks.updateUserWallet.mockResolvedValue(wallet);
    dbMocks.recordMicroPurchase.mockResolvedValue(undefined);
    dbMocks.recordCommerceEvent.mockResolvedValue(undefined);
  });

  it("crédite le bon portefeuille après une confirmation", async () => {
    const result = await fulfilMicroPurchase({
      userId: 7,
      paymentIntentId: "pi_confirmed",
      productId: "session_pack_5",
      amountCents: 499,
      currency: "usd",
      metadata: { userId: "7", productId: "session_pack_5" },
    });

    expect(result).toMatchObject({ productId: "session_pack_5", alreadyFulfilled: false });
    expect(dbMocks.updateUserWallet).toHaveBeenCalledWith(7, { sessionCredits: 5 });
    expect(dbMocks.recordMicroPurchase).toHaveBeenCalledWith(expect.objectContaining({
      paymentIntentId: "pi_confirmed",
      status: "paid",
      amountCents: 499,
    }));
    expect(dbMocks.recordCommerceEvent).toHaveBeenCalledWith(expect.objectContaining({
      eventType: "payment_confirmed",
      paymentIntentId: "pi_confirmed",
    }));
  });

  it("ne crédite jamais deux fois le même PaymentIntent", async () => {
    dbMocks.getMicroPurchaseByPaymentIntent.mockResolvedValue({ status: "paid" });

    const result = await fulfilMicroPurchase({
      userId: 7,
      paymentIntentId: "pi_already_paid",
      productId: "hint_pack",
      amountCents: 199,
      currency: "usd",
      metadata: { userId: "7", productId: "hint_pack" },
    });

    expect(result.alreadyFulfilled).toBe(true);
    expect(dbMocks.updateUserWallet).not.toHaveBeenCalled();
    expect(dbMocks.recordMicroPurchase).not.toHaveBeenCalled();
  });

  it("refuse un produit absent du catalogue", async () => {
    await expect(fulfilMicroPurchase({
      userId: 7,
      paymentIntentId: "pi_invalid_product",
      productId: "prix_modifie_cote_client",
      amountCents: 1,
      currency: "usd",
      metadata: {},
    })).rejects.toThrow("Produit introuvable");

    expect(dbMocks.updateUserWallet).not.toHaveBeenCalled();
  });
});
