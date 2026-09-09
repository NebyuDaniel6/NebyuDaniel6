import { describe, expect, it } from "vitest";
import { boot } from "../src/bootstrap.ts";
import { createOrg } from "../src/tenant/service.ts";
import { ingestAsset, searchAssets } from "../src/assets/service.ts";
import { useIsolatedDb } from "./helpers.ts";

useIsolatedDb();

describe("assets", () => {
  it("ingests and searches by description", () => {
    boot();
    const org = createOrg("Org");
    ingestAsset({
      orgId: org.id,
      kind: "logo",
      filename: "mark.svg",
      mime: "image/svg+xml",
      bytes: Buffer.from("<svg xmlns='http://www.w3.org/2000/svg'/>"),
      description: "Primary wordmark",
    });
    const hits = searchAssets({ orgId: org.id, query: "wordmark" });
    expect(hits).toHaveLength(1);
    expect(hits[0]?.kind).toBe("logo");
  });
});
