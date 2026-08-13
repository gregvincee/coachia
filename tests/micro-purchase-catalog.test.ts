import { describe, expect, it } from "vitest";

import {
  MICRO_PURCHASES_CATALOG,
  getMicroPurchase,
  getMicroPurchasesByCategory,
} from "../lib/micro-purchases";
import { resolveSafeReturnUrl } from "../server/micro-purchase-service";

describe("catalogue des micro-achats", () => {
  it("ne contient que des montants positifs en dollars", () => {
    for (const product of Object.values(MICRO_PURCHASES_CATALOG)) {
      expect(product.price).toBeGreaterThan(0);
      expect(product.price).toBeLessThanOrEqual(20);
    }
  });

  it("conserve les packs de sessions nécessaires au modèle freemium", () => {
    expect(getMicroPurchase("session_pack_5")).toMatchObject({ quantity: 5 });
    expect(getMicroPurchase("session_pack_10")).toMatchObject({ quantity: 10 });
  });

  it("présente au moins un produit dans chaque famille stratégique", () => {
    expect(getMicroPurchasesByCategory("boost").length).toBeGreaterThan(0);
    expect(getMicroPurchasesByCategory("sessions").length).toBeGreaterThan(0);
    expect(getMicroPurchasesByCategory("content").length).toBeGreaterThan(0);
    expect(getMicroPurchasesByCategory("coaching").length).toBeGreaterThan(0);
    expect(getMicroPurchasesByCategory("bundle").length).toBeGreaterThan(0);
  });
});

describe("sécurité du checkout", () => {
  it("accepte une URL HTTPS et retire tout chemin injecté", () => {
    expect(resolveSafeReturnUrl("https://coachia.example/store?trial=1")).toBe("https://coachia.example");
  });

  it("rejette les URL HTTP non locales", () => {
    expect(() => resolveSafeReturnUrl("http://untrusted.example")).toThrow("non sécurisée");
  });

  it("autorise localhost pour les tests de développement", () => {
    expect(resolveSafeReturnUrl("http://localhost:8081/store")).toBe("http://localhost:8081");
  });
});
