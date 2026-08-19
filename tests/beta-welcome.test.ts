import { beforeEach, describe, expect, it, vi } from "vitest";

const asyncStorage = vi.hoisted(() => {
  const values = new Map<string, string>();
  return {
    values,
    getItem: vi.fn(async (key: string) => values.get(key) ?? null),
    setItem: vi.fn(async (key: string, value: string) => { values.set(key, value); }),
  };
});

vi.mock("@react-native-async-storage/async-storage", () => ({
  default: { getItem: asyncStorage.getItem, setItem: asyncStorage.setItem, removeItem: vi.fn(), clear: vi.fn() },
}));

import { getBetaWelcomeCompletion, normalizeBetaWelcomeProgress } from "../lib/beta-welcome";
import { completeBetaWelcomeStep, getBetaWelcomeProgress } from "../lib/storage";

describe("accueil bêta guidé", () => {
  beforeEach(() => { asyncStorage.values.clear(); vi.clearAllMocks(); });

  it("initialise les deux jalons non complétés", async () => {
    await expect(getBetaWelcomeProgress()).resolves.toEqual({ first_session: false, share_feedback: false });
    expect(getBetaWelcomeCompletion(normalizeBetaWelcomeProgress(null))).toEqual({ completed: 0, total: 2, ratio: 0 });
  });

  it("conserve les jalons terminés entre les ouvertures", async () => {
    await completeBetaWelcomeStep("first_session");
    await completeBetaWelcomeStep("share_feedback");

    await expect(getBetaWelcomeProgress()).resolves.toEqual({ first_session: true, share_feedback: true });
    expect(getBetaWelcomeCompletion({ first_session: true, share_feedback: true })).toEqual({ completed: 2, total: 2, ratio: 1 });
  });
});
