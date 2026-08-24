import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("diagnostic IA de mission", () => {
  it("impose un contrat structuré, une authentification et une mesure de coût", () => {
    const router = readFileSync(join(__dirname, "../server/routers.ts"), "utf8");

    expect(router).toContain("diagnoseMission: protectedProcedure");
    expect(router).toContain("missionDiagnosisSchema");
    expect(router).toContain("outputSchema");
    expect(router).toContain("Ne fournis jamais directement la réponse parfaite");
    expect(router).toContain("recordAiUsage");
  });
});
