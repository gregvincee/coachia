import { beforeEach, describe, expect, it, vi } from "vitest";

const asyncStorage = vi.hoisted(() => {
  const values = new Map<string, string>();
  return {
    values,
    getItem: vi.fn(async (key: string) => values.get(key) ?? null),
    setItem: vi.fn(async (key: string, value: string) => {
      values.set(key, value);
    }),
  };
});

vi.mock("@react-native-async-storage/async-storage", () => ({
  default: {
    getItem: asyncStorage.getItem,
    setItem: asyncStorage.setItem,
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
}));

import {
  createBetaFeedback,
  formatBetaFeedbackExport,
  validateBetaFeedback,
} from "../lib/beta-feedback";
import { addBetaFeedback, getBetaFeedback } from "../lib/storage";

describe("feedback bêta", () => {
  beforeEach(() => {
    asyncStorage.values.clear();
    vi.clearAllMocks();
  });

  it("exige une note, une catégorie valide et un retour exploitable", () => {
    expect(validateBetaFeedback({ rating: 0, category: "experience", message: "Un retour suffisamment long" })).toMatchObject({ valid: false });
    expect(validateBetaFeedback({ rating: 4, category: "experience", message: "Trop court" })).toMatchObject({ valid: false });
    expect(validateBetaFeedback({ rating: 5, category: "suggestion", message: "Ajouter un récapitulatif de la session en fin de coaching." })).toEqual({ valid: true });
  });

  it("crée et exporte un retour anonymisé", () => {
    const feedback = createBetaFeedback(
      { rating: 5, category: "coaching", message: "Le premier exercice m’a aidé à structurer mon pitch." },
      new Date("2026-08-19T12:00:00.000Z"),
    );
    const output = formatBetaFeedbackExport([feedback]);

    expect(feedback).toMatchObject({ rating: 5, category: "coaching", createdAt: "2026-08-19T12:00:00.000Z" });
    expect(output).toContain("CoachIA — Retours bêta (1)");
    expect(output).toContain("Coaching IA — 5/5");
    expect(output).toContain("structurer mon pitch");
  });

  it("conserve les retours localement du plus récent au plus ancien", async () => {
    const first = createBetaFeedback(
      { rating: 4, category: "experience", message: "La première session était facile à prendre en main." },
      new Date("2026-08-18T12:00:00.000Z"),
    );
    const second = createBetaFeedback(
      { rating: 3, category: "technical", message: "Le retour au profil après une session mérite d’être plus clair." },
      new Date("2026-08-19T12:00:00.000Z"),
    );

    await addBetaFeedback(first);
    await addBetaFeedback(second);

    await expect(getBetaFeedback()).resolves.toEqual([second, first]);
  });
});
