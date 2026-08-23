import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = join(__dirname, "..");

describe("Store métallique CoachIA", () => {
  it("applique les surfaces noir, argent et bleu électrique", () => {
    const store = readFileSync(join(root, "app/store.tsx"), "utf8");

    expect(store).toContain('containerClassName="bg-[#05070A]"');
    expect(store).toContain('bg-[#10141D]');
    expect(store).toContain('border-[#2C3B4E]');
    expect(store).toContain('text-[#72D6FF]');
    expect(store).toContain('require("@/assets/images/icon.png")');
  });

  it("préserve la sélection de produit et le checkout serveur", () => {
    const store = readFileSync(join(root, "app/store.tsx"), "utf8");

    expect(store).toContain("trackStoreEvent.mutate({ eventType: \"product_selected\", productId })");
    expect(store).toContain("checkout.mutateAsync({ productId, returnBaseUrl })");
    expect(store).toContain("Platform.OS !== \"web\"");
  });
});
