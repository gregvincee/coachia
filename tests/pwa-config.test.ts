import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

describe("configuration PWA CoachIA", () => {
  it("déclare un manifeste installable et ses icônes", () => {
    const manifestPath = join(root, "public", "manifest.json");
    const manifest = JSON.parse(readFileSync(manifestPath, "utf-8")) as {
      name: string;
      short_name: string;
      display: string;
      start_url: string;
      icons: Array<{ src: string; sizes: string; purpose?: string }>;
    };

    expect(manifest).toMatchObject({
      name: "CoachIA — Micro-coaching IA",
      short_name: "CoachIA",
      display: "standalone",
      start_url: "/",
    });
    expect(manifest.icons).toEqual(expect.arrayContaining([
      expect.objectContaining({ src: "/icon-192.png", sizes: "192x192" }),
      expect.objectContaining({ src: "/icon-512.png", sizes: "512x512" }),
      expect.objectContaining({ src: "/icon-maskable-512.png", purpose: "maskable" }),
    ]));
    for (const icon of manifest.icons) {
      expect(existsSync(join(root, "public", icon.src.slice(1)))).toBe(true);
    }
  });

  it("lie le manifeste, la page hors ligne et la stratégie Workbox", () => {
    const html = readFileSync(join(root, "app", "+html.tsx"), "utf-8");
    const workbox = readFileSync(join(root, "workbox-config.cjs"), "utf-8");
    const packageJson = JSON.parse(readFileSync(join(root, "package.json"), "utf-8")) as { scripts: Record<string, string> };

    expect(html).toContain('rel="manifest" href="/manifest.json"');
    expect(html).toContain('rel="apple-touch-icon" href="/icon-192.png"');
    expect(workbox).toContain('navigateFallback: "/offline.html"');
    expect(workbox).toContain('cleanupOutdatedCaches: true');
    expect(workbox).toContain('skipWaiting: false');
    expect(existsSync(join(root, "public", "offline.html"))).toBe(true);
    expect(existsSync(join(root, "public", "sw-update-handler.js"))).toBe(true);
    expect(packageJson.scripts["build:web"]).toContain("expo export --platform web");
    expect(packageJson.scripts["build:web"]).toContain("workbox generateSW");
  });
});
