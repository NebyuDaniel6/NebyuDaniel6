import { z } from "zod";
import { addMemory, getBrand, updateBrandProfile } from "../../brand/service.ts";
import type { BrandProfile, MemoryStrength } from "../../brand/types.ts";
import { registerTool } from "../registry.ts";

export function registerBrandTools(): void {
  registerTool({
    name: "brand.get",
    description: "Load a brand profile and memories.",
    risk: "low",
    permissions: [{ name: "brand.read", description: "Read brand profiles" }],
    inputSchema: z.object({ brandId: z.string() }),
    outputSchema: z.any(),
    execute(input: { brandId: string }) {
      const brand = getBrand(input.brandId);
      if (!brand) throw new Error(`Brand ${input.brandId} not found.`);
      return brand;
    },
  });

  registerTool({
    name: "brand.update",
    description: "Replace a brand profile. Requires care; does not silently promote inferences.",
    risk: "high",
    permissions: [{ name: "brand.write", description: "Update brand profile" }],
    inputSchema: z.object({ brandId: z.string(), profile: z.any() }),
    outputSchema: z.object({ ok: z.boolean() }),
    execute(input: { brandId: string; profile: BrandProfile }) {
      updateBrandProfile(input.brandId, input.profile);
      return { ok: true };
    },
  });

  registerTool({
    name: "brand.remember",
    description: "Store a brand memory with an explicit strength tag.",
    risk: "medium",
    permissions: [{ name: "brand.memory", description: "Append brand memory" }],
    inputSchema: z.object({
      brandId: z.string(),
      strength: z.enum([
        "explicit_rule",
        "inferred_preference",
        "campaign_temporary",
        "approved_concept",
        "rejected_concept",
      ]),
      kind: z.string(),
      content: z.string(),
      sourceTaskId: z.string().optional(),
    }),
    outputSchema: z.any(),
    execute(input: {
      brandId: string;
      strength: MemoryStrength;
      kind: string;
      content: string;
      sourceTaskId?: string;
    }) {
      return addMemory(input);
    },
  });
}
