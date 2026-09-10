import fs from "node:fs";
import { describe, expect, it } from "vitest";
import { boot } from "../src/bootstrap.ts";
import { seedSampleWorld } from "../src/seed.ts";
import { startJob } from "../src/agent/orchestrator.ts";
import { useIsolatedDb } from "./helpers.ts";

useIsolatedDb();

describe("end-to-end campaign", () => {
  it("produces editable SVG, JSX, JSON and reports Illustrator honestly", async () => {
    boot();
    const seeded = seedSampleWorld();
    const snap = await startJob({
      orgId: seeded.orgId,
      brandId: seeded.brandId,
      projectId: seeded.projectId,
      brief:
        "Create a premium Instagram campaign for our real-estate project announcing that reservations are open. I need 1 Instagram post, 1 story, a Facebook cover, and an A4 poster.",
      autoApprove: true,
    });
    expect(snap.error).toBeUndefined();
    expect(snap.task.status).toBe("approved");
    expect(snap.plan?.planner).toBe("heuristic");
    expect(snap.trace.toolsUsed).toContain("illustrator.create_document");
    expect(snap.trace.toolsUsed).toContain("illustrator.export");
    expect(snap.files?.some((f) => f.endsWith(".svg"))).toBe(true);
    expect(snap.files?.some((f) => f.endsWith(".jsx"))).toBe(true);
    expect(snap.files?.some((f) => f.endsWith(".json"))).toBe(true);
    expect(snap.files?.some((f) => f.endsWith(".png"))).toBe(true);
    expect(snap.files?.some((f) => f.endsWith(".pdf"))).toBe(true);
    for (const file of snap.files ?? []) {
      expect(fs.existsSync(file)).toBe(true);
      expect(fs.statSync(file).size).toBeGreaterThan(32);
    }
    expect(snap.qc?.verdict).toBe("pass");
    expect(snap.illustratorRuntime?.attempted).toBe(false);
    expect(snap.illustratorRuntime?.message.toLowerCase()).toMatch(/linux|not available|artboard/);
  });

  it("does not require org/brand/project when studio prefs are provided", async () => {
    boot();
    const snap = await startJob({
      brief: "Now open. Instagram post. Book now.",
      autoApprove: true,
      studio: {
        businessName: "Riverside Cafe",
        primaryColor: "#14221c",
        accentColor: "#c4a35a",
        fontStyle: "modern-sans",
        designStyle: "editorial",
        targetApp: "illustrator",
        formats: ["instagram-post"],
      },
    });
    expect(snap.error).toBeUndefined();
    expect(snap.task.status).toBe("approved");
    expect(snap.files?.some((f) => f.endsWith(".svg"))).toBe(true);
  });
});
