import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getStripeConfiguration } from "../server/micro-purchase-service";

const root = join(__dirname, "..");

beforeEach(() => {
  vi.stubEnv("COACHIA_STRIPE_SECRET_KEY", "");
  vi.stubEnv("STRIPE_SECRET_KEY", "");
  vi.stubEnv("COACHIA_STRIPE_WEBHOOK_SECRET", "");
  vi.stubEnv("STRIPE_WEBHOOK_SECRET", "");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("préparation Stripe sans clé live", () => {
  it("signale une intégration non configurée sans bloquer le catalogue", () => {
    expect(getStripeConfiguration()).toEqual({
      configured: false,
      mode: "not_configured",
      webhookConfigured: false,
    });
  });

  it("reconnaît le mode test et la présence du webhook sans exposer le secret", () => {
    vi.stubEnv("COACHIA_STRIPE_SECRET_KEY", "sk_test_coachia");
    vi.stubEnv("COACHIA_STRIPE_WEBHOOK_SECRET", "whsec_coachia");

    expect(getStripeConfiguration()).toEqual({
      configured: true,
      mode: "test",
      webhookConfigured: true,
    });
  });

  it("refuse une valeur qui n'est pas une clé Stripe reconnue", () => {
    vi.stubEnv("COACHIA_STRIPE_SECRET_KEY", "not-a-stripe-key");
    expect(getStripeConfiguration().mode).toBe("invalid");
    expect(getStripeConfiguration().configured).toBe(false);
  });
});

describe("progression visible de CoachIA", () => {
  it("sépare visuellement l'engagement XP de la maîtrise réelle dans Profil", () => {
    const profile = readFileSync(join(root, "app/(tabs)/profile.tsx"), "utf8");
    expect(profile).toContain("MAÎTRISE IA");
    expect(profile).toContain("Évolution d’engagement");
    expect(profile).toContain("Progression par capacité");
    expect(profile).toContain("getMasteryStage");
    expect(profile).toContain("getMissionLearningState");
  });

  it("applique l'identité métallique à Premium sans className fragile sur Pressable", () => {
    const premium = readFileSync(join(root, "app/(tabs)/premium.tsx"), "utf8");
    expect(premium).toContain('containerClassName="bg-[#07080C]"');
    expect(premium).toContain("bg-[#151820]");
    expect(premium).toContain("border-[#343947]");
    expect(premium).toContain("Préparer cet achat");
    expect(premium).not.toMatch(/<Pressable[^>]*className=/s);
  });
});
