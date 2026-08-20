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

  it("utilise la palette indigo du logo dans le manifeste PWA et la configuration Expo", () => {
    const manifest = JSON.parse(readFileSync(join(root, "public/manifest.json"), "utf8"));
    const config = readFileSync(join(root, "app.config.ts"), "utf8");

    expect(manifest).toMatchObject({ background_color: "#1B1C65", theme_color: "#5539CE" });
    expect(config).toContain("logoUrl: \"https://files.manuscdn.com/user_upload_by_module/session_file/310519663334609213/ERYFJLFDQzlyXpmC.png\"");
    expect(config).toContain('backgroundColor: "#1B1C65"');
  });
});
