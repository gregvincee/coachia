import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = join(__dirname, "..");

describe("URL publique du logo CoachIA", () => {
  it("sert le monogramme métallique C∆I configuré pour les surfaces de projet", async () => {
    const appConfig = readFileSync(join(root, "app.config.ts"), "utf8");
    const logoUrl = appConfig.match(/logoUrl: "([^"]+)"/)?.[1];

    expect(logoUrl).toBe("https://files.manuscdn.com/user_upload_by_module/session_file/310519663334609213/cpOlsdSDfczJjkTv.png");

    const response = await fetch(logoUrl!);
    expect(response.ok).toBe(true);
    expect(response.headers.get("content-type")).toContain("image/png");
  });
});
