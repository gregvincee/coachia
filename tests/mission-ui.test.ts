import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = join(__dirname, "..");

describe("parcours de missions IA", () => {
  it("recentre l’accueil sur la mission, la difficulté et la maîtrise", () => {
    const home = readFileSync(join(root, "app/(tabs)/index.tsx"), "utf8");

    expect(home).toContain("MA MISSION");
    expect(home).toContain("Dernière difficulté détectée");
    expect(home).toContain("Maîtrise réelle");
    expect(home).toContain("Distincte de vos");
    expect(home).toContain("FlatList");
  });

  it("impose une tentative et une nouvelle tentative avant la maîtrise", () => {
    const mission = readFileSync(join(root, "app/mission/[missionId].tsx"), "utf8");

    expect(mission).toContain("VOTRE TENTATIVE");
    expect(mission).toContain("Diagnostiquer ma tentative");
    expect(mission).toContain("Nouvelle tentative");
    expect(mission).toContain("Pourquoi ?");
    expect(mission).toContain("Montre-moi");
    expect(mission).toContain("trpc.ai.diagnoseMission.useMutation()");
  });
});
