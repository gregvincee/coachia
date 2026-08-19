import { describe, expect, it } from "vitest";
import { BETA_CELEBRATION_DURATION_MS, BETA_CELEBRATION_REDUCED_MOTION_DURATION_MS, getBetaCelebrationConfig } from "../lib/beta-celebration";

describe("célébration des jalons bêta", () => {
  it("utilise une animation courte quand les mouvements sont autorisés", () => {
    expect(getBetaCelebrationConfig(false)).toEqual({ duration: BETA_CELEBRATION_DURATION_MS, useScale: true });
  });

  it("supprime l’effet de zoom lorsque la réduction des mouvements est activée", () => {
    expect(getBetaCelebrationConfig(true)).toEqual({ duration: BETA_CELEBRATION_REDUCED_MOTION_DURATION_MS, useScale: false });
  });
});
