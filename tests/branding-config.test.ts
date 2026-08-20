import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = join(__dirname, "..");

describe("branding CoachIA", () => {
  it("fournit la même icône dans les déclinaisons mobile essentielles", () => {
    [
      "assets/images/icon.png",
      "assets/images/splash-icon.png",
      "assets/images/favicon.png",
      "assets/images/android-icon-foreground.png",
      "public/icon-192.png",
      "public/icon-512.png",
      "public/icon-maskable-512.png",
    ].forEach((asset) => expect(existsSync(join(root, asset))).toBe(true));
  });

  it("utilise la palette métallique du logo dans le manifeste PWA et la configuration Expo", () => {
    const manifest = JSON.parse(readFileSync(join(root, "public/manifest.json"), "utf8"));
    const config = readFileSync(join(root, "app.config.ts"), "utf8");

    expect(manifest).toMatchObject({ background_color: "#05070A", theme_color: "#05070A" });
    expect(config).toContain('logoUrl: ""');
    expect(config).toContain('backgroundColor: "#05070A"');
    expect(config).not.toContain("ERYFJLFDQzlyXpmC");
  });
});
