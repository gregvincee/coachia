import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("kit d’invitation bêta", () => {
  const template = readFileSync(join(__dirname, "..", "BETA_INVITATION_TEMPLATE.md"), "utf8");

  it("contient un parcours de test, un accès et un retrait de la liste", () => {
    expect(template).toContain("{URL_DE_LANCEMENT}/launch");
    expect(template).toContain("{URL_DE_LANCEMENT}/privacy");
    expect(template).toContain("aucun achat n’est requis");
    expect(template).toContain("première session de coaching");
  });
});
