import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = join(__dirname, "..");
const read = (file: string) => readFileSync(join(root, file), "utf8");

describe("suppression de compte", () => {
  it("exige une procédure protégée et une confirmation littérale", () => {
    const router = read("server/routers.ts");
    expect(router).toContain("account: router({");
    expect(router).toContain("delete: protectedProcedure");
    expect(router).toContain("confirm: z.literal(true)");
    expect(router).toContain("ctx.res.clearCookie(COOKIE_NAME");
  });

  it("efface les tables rattachées au compte sans toucher aux agrégats globaux", () => {
    const db = read("server/db.ts");
    expect(db).toContain("export async function deleteUserAccount(userId: number)");
    expect(db).toContain("tx.delete(userWallets)");
    expect(db).toContain("tx.delete(microPurchaseTransactions)");
    expect(db).toContain("tx.delete(commerceEvents)");
    expect(db).toContain("tx.delete(userDailyAiUsage)");
    expect(db).toContain("tx.delete(betaCohortMembers)");
    expect(db).toContain("tx.delete(betaCohortFeedback)");
    expect(db).toContain("tx.delete(users)");
    expect(db).not.toContain("tx.delete(aiDailyUsage)");
  });

  it("présente une confirmation accessible dans les paramètres", () => {
    const settings = read("app/(tabs)/settings.tsx");
    expect(settings).toContain("Supprimer mon compte");
    expect(settings).toContain("Cette action est irréversible.");
    expect(settings).toContain("Confirmer la suppression définitive de mon compte");
    expect(settings).toContain("deleteAccount.mutateAsync({ confirm: true })");
    expect(settings).toContain("vragelab@gmail.com");
  });
});
