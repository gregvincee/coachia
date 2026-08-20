import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = join(__dirname, "..");
const readProjectFile = (path: string) => readFileSync(join(root, path), "utf8");

describe("surfaces métalliques CoachIA", () => {
  it("expose la palette noir, argent et bleu électrique dans le thème et la PWA", () => {
    const theme = readProjectFile("theme.config.js");
    const html = readProjectFile("app/+html.tsx");

    expect(theme).toContain("#1875FF");
    expect(theme).toContain("#05070A");
    expect(html).toContain('content="#05070A"');
  });

  it("applique le fond métallique aux surfaces administratives et bêta", () => {
    const dashboard = readProjectFile("app/admin-dashboard.tsx");
    const betaWelcome = readProjectFile("app/beta-welcome.tsx");
    const betaFeedback = readProjectFile("app/beta-feedback.tsx");

    expect(dashboard).toContain('containerClassName="bg-[#05070A]"');
    expect(dashboard).toContain("bg-[#10141D]");
    expect(betaWelcome).toContain('containerClassName="bg-[#05070A]"');
    expect(betaFeedback).toContain('backgroundColor: "#10141D"');
  });
});
