import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = join(__dirname, "..");
const readProjectFile = (path: string) => readFileSync(join(root, path), "utf8");

describe("surfaces métalliques CoachIA", () => {
  it("expose la palette noir, argent et bleu électrique dans le thème et la PWA", () => {
    const theme = readProjectFile("theme.config.js");
    const html = readProjectFile("app/+html.tsx");

    expect(theme).toContain("#D6B36A");
    expect(theme).toContain("#07080C");
    expect(html).toContain('content="#07080C"');
  });

  it("applique le fond métallique aux surfaces administratives et bêta", () => {
    const dashboard = readProjectFile("app/admin-dashboard.tsx");
    const betaWelcome = readProjectFile("app/beta-welcome.tsx");
    const betaFeedback = readProjectFile("app/beta-feedback.tsx");

    expect(dashboard).toContain('containerClassName="bg-[#07080C]"');
    expect(dashboard).toContain("bg-[#151820]");
    expect(betaWelcome).toContain('containerClassName="bg-[#07080C]"');
    expect(betaFeedback).toContain('backgroundColor: "#151820"');
  });

  it("démarre CoachIA en mode sombre sur mobile et PWA", () => {
    const themeProvider = readProjectFile("lib/theme-provider.tsx");
    const rootLayout = readProjectFile("app/_layout.tsx");
    const appConfig = readProjectFile("app.config.ts");
    const html = readProjectFile("app/+html.tsx");

    expect(themeProvider).toContain('useState<ColorScheme>("dark")');
    expect(rootLayout).toContain('<StatusBar style="light" backgroundColor="#07080C" />');
    expect(appConfig).toContain('userInterfaceStyle: "dark"');
    expect(html).toContain('content="black-translucent"');
    expect(html).toContain('backgroundColor: "#07080C"');
  });
});
