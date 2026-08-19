export const BETA_CELEBRATION_DURATION_MS = 2200;
export const BETA_CELEBRATION_REDUCED_MOTION_DURATION_MS = 1400;

export function getBetaCelebrationConfig(reduceMotion: boolean) {
  return reduceMotion
    ? { duration: BETA_CELEBRATION_REDUCED_MOTION_DURATION_MS, useScale: false }
    : { duration: BETA_CELEBRATION_DURATION_MS, useScale: true };
}
