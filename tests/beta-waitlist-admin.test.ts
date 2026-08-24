import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = join(__dirname, "..");

describe("invitation de cohorte bêta", () => {
  it("réserve les agrégats et la préparation d’invitation aux administrateurs", () => {
    const router = readFileSync(join(root, "server/routers.ts"), "utf8");
    const dashboard = readFileSync(join(root, "app/admin-dashboard.tsx"), "utf8");

    expect(router).toContain("waitlistSummary: protectedProcedure");
    expect(router).toContain("prepareNextInvite: protectedProcedure");
    expect(router).toContain("ctx.user.role !== \"admin\"");
    expect(dashboard).toContain("trpc.beta.waitlistSummary.useQuery");
    expect(dashboard).toContain("Préparer la prochaine invitation");
    expect(dashboard).toContain("aucune adresse e-mail n’apparaît dans ce tableau");
  });
});
