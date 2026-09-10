import { z } from "zod";
import { getAsset, ingestAsset, searchAssets } from "../../assets/service.ts";
import { registerTool } from "../registry.ts";

export function registerAssetTools(): void {
  registerTool({
    name: "asset.search",
    description: "Search the asset library by query, kind, organization, and brand.",
    risk: "low",
    permissions: [{ name: "asset.read", description: "Search assets" }],
    inputSchema: z.object({
      orgId: z.string(),
      brandId: z.string().optional(),
      query: z.string().optional(),
      kind: z.string().optional(),
    }),
    outputSchema: z.array(z.any()),
    execute(input) {
      return searchAssets(input as Parameters<typeof searchAssets>[0]);
    },
  });

  registerTool({
    name: "asset.get",
    description: "Fetch a single asset record.",
    risk: "low",
    permissions: [{ name: "asset.read", description: "Read asset metadata" }],
    inputSchema: z.object({ assetId: z.string() }),
    outputSchema: z.any(),
    execute(input: { assetId: string }) {
      const asset = getAsset(input.assetId);
      if (!asset) throw new Error(`Asset ${input.assetId} not found.`);
      return asset;
    },
  });

  registerTool({
    name: "asset.ingest",
    description: "Store an asset already written to disk as bytes in the library.",
    risk: "medium",
    permissions: [{ name: "asset.write", description: "Ingest assets" }],
    inputSchema: z.object({
      orgId: z.string(),
      brandId: z.string().optional(),
      kind: z.string(),
      filename: z.string(),
      mime: z.string(),
      contentsBase64: z.string(),
      description: z.string(),
    }),
    outputSchema: z.any(),
    execute(input: {
      orgId: string;
      brandId?: string;
      kind: string;
      filename: string;
      mime: string;
      contentsBase64: string;
      description: string;
    }) {
      return ingestAsset({
        orgId: input.orgId,
        brandId: input.brandId,
        kind: input.kind as "image",
        filename: input.filename,
        mime: input.mime,
        bytes: Buffer.from(input.contentsBase64, "base64"),
        description: input.description,
      });
    },
  });
}
