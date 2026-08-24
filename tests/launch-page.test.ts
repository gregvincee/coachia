import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = join(__dirname, "..");

describe("page publique de lancement CoachIA", () => {
  it("présente la proposition de valeur, la cohorte bêta et les deux parcours", () => {
    const launch = readFileSync(join(root, "app/launch.tsx"), "utf8");

    expect(launch).toContain("COHORTE BÊTA PRIVÉE");
    expect(launch).toContain("coachia-launch-hero_e49cb82e.jpg");
    expect(launch).toContain('color: "#72D6FF"');
    expect(launch).toContain("Commencer gratuitement");
    expect(launch).toContain("Découvrir le parcours bêta");
    expect(launch).toContain("Rejoindre la liste bêta");
    expect(launch).toContain("J’accepte que CoachIA conserve mon adresse");
    expect(launch).toContain("trpc.beta.joinWaitlist.useMutation()");
    expect(launch).toContain('router.push("/privacy")');
    expect(launch).toContain('router.replace("/onboarding")');
    expect(launch).toContain('router.push("/beta-welcome")');
    expect(launch).toContain('containerClassName="bg-[#05070A]"');
  });

  it("reste accessible avant la fin de l’onboarding", () => {
    const rootLayout = readFileSync(join(root, "app/_layout.tsx"), "utf8");

    expect(rootLayout).toContain("const inLaunch = (segments[0] as string | undefined) === 'launch'");
    expect(rootLayout).toContain("!inOnboarding && !inLaunch && !inBetaWelcome && !inPrivacy");
    expect(rootLayout).toContain('<Stack.Screen name="launch" />');
  });

  it("n’envoie une candidature bêta qu’avec un consentement explicite", () => {
    const router = readFileSync(join(root, "server/routers.ts"), "utf8");
    const schema = readFileSync(join(root, "drizzle/schema.ts"), "utf8");

    expect(router).toContain("joinWaitlist: publicProcedure");
    expect(router).toContain("consent: z.literal(true)");
    expect(schema).toContain("betaWaitlistApplications_email_unique");
  });

  it("propose une page de confidentialité publique et distincte des métriques anonymisées", () => {
    const privacy = readFileSync(join(root, "app/privacy.tsx"), "utf8");

    expect(privacy).toContain("Votre confidentialité, simplement expliquée.");
    expect(privacy).toContain("rapports administratifs affichent des tendances de cohorte anonymisées");
    expect(privacy).toContain("Retour à la page de lancement");
  });

  it("permet un retrait de la liste sans révéler si l’adresse était inscrite", () => {
    const privacy = readFileSync(join(root, "app/privacy.tsx"), "utf8");
    const router = readFileSync(join(root, "server/routers.ts"), "utf8");
    const db = readFileSync(join(root, "server/db.ts"), "utf8");

    expect(privacy).toContain("trpc.beta.withdrawWaitlist.useMutation()");
    expect(privacy).toContain("La réponse ne confirme jamais si elle était présente");
    expect(router).toContain("withdrawWaitlist: publicProcedure");
    expect(router).toContain("confirm: z.literal(true)");
    expect(db).toContain("db.delete(betaWaitlistApplications)");
  });
});
