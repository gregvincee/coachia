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
    expect(launch).toContain("Rejoindre la liste bêta");
    expect(launch).toContain("J’accepte que CoachIA conserve mon adresse");
    expect(launch).toContain("trpc.beta.joinWaitlist.useMutation()");
    expect(launch).toContain('router.replace("/onboarding")');
    expect(launch).toContain('router.push("/beta-welcome")');
    expect(launch).toContain('containerClassName="bg-[#05070A]"');
  });

  it("reste accessible avant la fin de l’onboarding", () => {
    const rootLayout = readFileSync(join(root, "app/_layout.tsx"), "utf8");

    expect(rootLayout).toContain("const inLaunch = (segments[0] as string | undefined) === 'launch'");
    expect(rootLayout).toContain("!inOnboarding && !inLaunch && !inBetaWelcome");
    expect(rootLayout).toContain('<Stack.Screen name="launch" />');
  });

  it("n’envoie une candidature bêta qu’avec un consentement explicite", () => {
    const router = readFileSync(join(root, "server/routers.ts"), "utf8");
    const schema = readFileSync(join(root, "drizzle/schema.ts"), "utf8");

    expect(router).toContain("joinWaitlist: publicProcedure");
    expect(router).toContain("consent: z.literal(true)");
    expect(schema).toContain("betaWaitlistApplications_email_unique");
  });
});
