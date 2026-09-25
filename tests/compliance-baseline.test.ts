import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = join(__dirname, "..");

function read(relative: string) {
  return readFileSync(join(root, relative), "utf8");
}

describe("socle conformité CoachIA", () => {
  it("publie les conditions, la confidentialité et l'engagement IA responsable", () => {
    const launch = read("app/launch.tsx");
    const privacy = read("app/privacy.tsx");
    expect(launch).toContain('router.push("/terms")');
    expect(launch).toContain('router.push("/responsible-ai")');
    expect(privacy).toContain("La suppression complète des données rattachées à un compte est désormais accessible depuis Paramètres");
    expect(read("app/terms.tsx")).toContain("Accès équitable");
    expect(read("app/responsible-ai.tsx")).toContain("Vérification humaine");
  });

  it("évite le texte blanc sur les surfaces champagne", () => {
    for (const directory of ["app", "components"]) {
      for (const name of readdirSync(join(root, directory), { recursive: true })) {
        if (typeof name !== "string" || !name.endsWith(".tsx")) continue;
        const source = read(join(directory, name));
        expect(source).not.toMatch(/bg-\[#D6B36A\][^\n]*text-white/);
      }
    }
  });

  it("nomme les principaux contrôles du parcours bêta", () => {
    expect(read("app/launch.tsx")).toContain('accessibilityLabel="Adresse e-mail pour l’inscription bêta"');
    expect(read("app/launch.tsx")).toContain('accessibilityRole="checkbox"');
    expect(read("app/privacy.tsx")).toContain('accessibilityLabel="Adresse e-mail à retirer de la liste bêta"');
  });
});
