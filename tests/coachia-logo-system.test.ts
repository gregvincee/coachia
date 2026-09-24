import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = join(__dirname, "..");

describe("système de logo CoachIA", () => {
  it("conserve le monogramme compact pour les icônes d’application", () => {
    const monogram = readFileSync(join(root, "assets/images/coachia-logo.svg"), "utf8");
    expect(monogram).toContain("C delta I monogram");
    expect(existsSync(join(root, "assets/images/icon.png"))).toBe(true);
  });

  it("utilise les assets métalliques locaux au lieu de l’ancienne URL de logo", () => {
    const appConfig = readFileSync(join(root, "app.config.ts"), "utf8");

    expect(appConfig).toContain('logoUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663334609213/cpOlsdSDfczJjkTv.png"');
    expect(appConfig).not.toContain("ERYFJLFDQzlyXpmC");
    expect(appConfig).toContain('backgroundColor: "#07080C"');
    expect(existsSync(join(root, "assets/images/splash-icon.png"))).toBe(true);
    expect(existsSync(join(root, "assets/images/favicon.png"))).toBe(true);
    expect(existsSync(join(root, "assets/images/android-icon-foreground.png"))).toBe(true);
  });

  it("fournit un wordmark Coach∆I pour les surfaces de présentation", () => {
    const wordmark = readFileSync(join(root, "assets/images/coachia-wordmark.svg"), "utf8");
    const onboarding = readFileSync(join(root, "app/onboarding.tsx"), "utf8");
    expect(wordmark).toContain(">Coach</text>");
    expect(wordmark).toContain("#D6B36A");
    expect(existsSync(join(root, "public/coachia-wordmark.svg"))).toBe(true);
    expect(onboarding).toContain("CoachIAWordmark");
    expect(onboarding).toContain("require('@/assets/images/icon.png')");
    expect(onboarding).toContain('accessibilityLabel="Monogramme CoachIA C delta I"');
    expect(onboarding).toContain("width: 72");
    expect(onboarding).toContain('backgroundColor: "#090B10"');
  });

  it("affiche le monogramme métallique dans l’en-tête de l’accueil", () => {
    const home = readFileSync(join(root, "app/(tabs)/index.tsx"), "utf8");

    expect(home).toContain("require('@/assets/images/icon.png')");
    expect(home).toContain('accessibilityLabel="Monogramme CoachIA C delta I"');
    expect(home).toContain('resizeMode="contain"');
    expect(home).toContain("numberOfLines={2}");
    expect(home).toContain("width: 48");
  });
});
