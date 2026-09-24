import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = join(__dirname, "..");

describe("Store métallique CoachIA", () => {
  it("applique les surfaces noir, argent et bleu électrique", () => {
    const store = readFileSync(join(root, "app/store.tsx"), "utf8");

    expect(store).toContain('containerClassName="bg-[#07080C]"');
    expect(store).toContain('bg-[#151820]');
    expect(store).toContain('border-[#343947]');
    expect(store).toContain('text-[#E8C98A]');
    expect(store).toContain('require("@/assets/images/icon.png")');
  });

  it("préserve la sélection de produit et le checkout serveur", () => {
    const store = readFileSync(join(root, "app/store.tsx"), "utf8");

    expect(store).toContain("trackStoreEvent.mutate({ eventType: \"product_selected\", productId })");
    expect(store).toContain("checkout.mutateAsync({ productId, returnBaseUrl })");
    expect(store).toContain("Platform.OS !== \"web\"");
  });
});
