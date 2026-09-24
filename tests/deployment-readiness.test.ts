import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = join(__dirname, "..");

describe("préparation du lancement public", () => {
  it("présente CoachIA comme un apprentissage par mission", () => {
    const launch = readFileSync(join(root, "app/launch.tsx"), "utf8");
    expect(launch).toContain("missions concrètes");
    expect(launch).toContain("diagnostic");
    expect(launch).toContain("maîtrise");
  });

  it("prépare une publication Pages sans déplacer le backend ni les secrets", () => {
    const workflowPath = join(root, ".github/workflows/deploy-pages.yml");
    const guide = readFileSync(join(root, "GITHUB_DEPLOYMENT.md"), "utf8");
    const workflow = readFileSync(workflowPath, "utf8");

    expect(existsSync(workflowPath)).toBe(true);
    expect(workflow).toContain("actions/upload-pages-artifact@v3");
    expect(workflow).toContain("actions/deploy-pages@v4");
    expect(workflow).toContain("pnpm check && pnpm test");
    expect(guide).toContain("GitHub Pages héberge uniquement");
    expect(guide).toContain("COACHIA_API_BASE_URL");
    expect(guide).toContain("COACHIA_STRIPE_SECRET_KEY");
    expect(guide).toContain("fichier `CNAME` ne doit pas être inventé");
  });
});
