import { describe, expect, it } from "vitest";
import { boot } from "../src/bootstrap.ts";
import { createOrg } from "../src/tenant/service.ts";
import { addMemory, createBrand, getBrand, listMemories } from "../src/brand/service.ts";
import { useIsolatedDb } from "./helpers.ts";

useIsolatedDb();

describe("brand memory", () => {
  it("stores profiles and does not promote inferences to rules", () => {
    boot();
    const org = createOrg("Acme");
    const brand = createBrand(org.id, "Acme", {
      name: "Acme",
      industry: "tech",
      colors: [{ name: "Black", hex: "#111111", role: "primary" }],
      typefaces: [{ family: "Inter", role: "display", weights: [400] }],
      toneOfVoice: "direct",
      imageryPreferences: [],
      visualStyle: "flat",
      restrictions: ["No neon"],
      targetAudience: "operators",
      competitors: [],
    });
    addMemory({ brandId: brand.id, strength: "inferred_preference", kind: "style", content: "Maybe likes navy" });
    addMemory({ brandId: brand.id, strength: "explicit_rule", kind: "style", content: "No neon" });
    const loaded = getBrand(brand.id);
    expect(loaded?.name).toBe("Acme");
    const mem = listMemories(brand.id);
    expect(mem.some((m) => m.strength === "inferred_preference")).toBe(true);
    expect(mem.filter((m) => m.strength === "explicit_rule").map((m) => m.content)).toContain("No neon");
    expect(loaded?.profile.restrictions).toContain("No neon");
  });
});
