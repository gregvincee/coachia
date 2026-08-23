import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = join(__dirname, "..");

describe("page publique de lancement CoachIA", () => {
  it("présente la proposition de valeur, la cohorte bêta et les deux parcours", () => {
    const launch = readFileSync(join(root, "app/launch.tsx"), "utf8");

    expect(launch).toContain("COHORTE BÊTA PRIVÉE");
    expect(launch).toContain('color: "#72D6FF"');
    expect(launch).toContain("Commencer gratuitement");
    expect(launch).toContain("Découvrir le parcours bêta");
    expect(launch).toContain('router.replace("/onboarding")');
    expect(launch).toContain('router.push("/beta-welcome")');
    expect(launch).toContain('containerClassName="bg-[#05070A]"');
  });

  it("reste accessible avant la fin de l’onboarding", () => {
    const rootLayout = readFileSync(join(root, "app/_layout.tsx"), "utf8");

    expect(rootLayout).toContain("const inLaunch = (segments[0] as string | undefined) === 'launch'");
    expect(rootLayout).toContain("!inOnboarding && !inLaunch");
    expect(rootLayout).toContain('<Stack.Screen name="launch" />');
  });
});
