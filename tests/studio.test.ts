import { describe, expect, it } from "vitest";
import { boot } from "../src/bootstrap.ts";
import { hydrateSnapshot, startJob } from "../src/agent/orchestrator.ts";
import { normalizeStudio, photoIdeaFromPrompt, profileFromStudio } from "../src/studio/profile.ts";
import { compileExtendScript } from "../src/document/export/jsx.ts";
import { createApp } from "../src/server/app.ts";
import { useIsolatedDb } from "./helpers.ts";
import fs from "node:fs";

useIsolatedDb();

describe("local-business studio", () => {
  it("maps colors, fonts, and style without an org/brand/project form", () => {
    const prefs = normalizeStudio(
      {
        businessName: "Harbor Bakery",
        primaryColor: "#2a1a12",
        accentColor: "#e07a3d",
        fontStyle: "elegant-serif",
        designStyle: "warm",
        targetApp: "illustrator",
        formats: ["instagram-post", "instagram-story"],
        photoFromPrompt: true,
      },
      "Saturday tasting is on. Photograph the shop window at dusk.",
    );
    expect(prefs.businessName).toBe("Harbor Bakery");
    expect(prefs.primaryColor).toBe("#2A1A12");
    expect(prefs.fontStyle).toBe("elegant-serif");
    const profile = profileFromStudio(prefs);
    expect(profile.name).toBe("Harbor Bakery");
    expect(profile.typefaces[0]?.family).toBe("Noto Serif");
    expect(prefs.photoIdea?.toLowerCase()).toMatch(/shop window|dusk|photograph/);
  });

  it("extracts a photo idea from the brief instead of inventing a picture", () => {
    const idea = photoIdeaFromPrompt(
      "Need a photo of the corner storefront with morning light.",
      "Corner Shop",
      "editorial",
    );
    expect(idea.toLowerCase()).toContain("corner storefront");
  });

  it("runs a studio job with no org dropdowns and writes offset artboards", async () => {
    boot();
    const snap = await startJob({
      brief: "Saturday tasting is on. Instagram post and story. Book a table.",
      autoApprove: true,
      studio: {
        businessName: "Harbor Bakery",
        primaryColor: "#1F3D34",
        accentColor: "#D4A017",
        fontStyle: "friendly",
        designStyle: "warm",
        targetApp: "illustrator",
        formats: ["instagram-post", "instagram-story"],
        photoFromPrompt: true,
      },
    });
    expect(snap.error).toBeUndefined();
    expect(snap.task.status).toBe("approved");
    expect(snap.targetApp).toBe("illustrator");
    expect(snap.files?.some((f) => f.endsWith("illustrator-job.jsx"))).toBe(true);
    expect(snap.files?.some((f) => f.endsWith("photoshop-job.jsx"))).toBe(false);
    const jsxPath = snap.files?.find((f) => f.endsWith("illustrator-job.jsx"));
    expect(jsxPath && fs.existsSync(jsxPath)).toBe(true);
    const jsx = fs.readFileSync(jsxPath!, "utf8");
    expect(jsx).toContain("artboards.add");
    expect(jsx).toMatch(/artboardRect = \[0,/);
    expect(jsx).toMatch(/artboards\.add\(\[1200,/);
    const jsonPath = snap.files?.find((f) => f.endsWith("document.json"));
    const doc = JSON.parse(fs.readFileSync(jsonPath!, "utf8"));
    expect(doc.artboards.length).toBe(2);
    expect(doc.artboards[1].x).toBeGreaterThan(doc.artboards[0].width);
    const compiled = compileExtendScript(doc);
    expect(compiled).toContain(String(doc.artboards[1].x));
  });

  it("writes a Photoshop script when that app is selected", async () => {
    boot();
    const snap = await startJob({
      brief: "Launch Instagram post. Shop now.",
      autoApprove: true,
      studio: {
        businessName: "Northside Gym",
        designStyle: "bold",
        targetApp: "photoshop",
        formats: ["instagram-post"],
      },
    });
    expect(snap.error).toBeUndefined();
    expect(snap.targetApp).toBe("photoshop");
    expect(snap.files?.some((f) => f.endsWith("photoshop-job.jsx"))).toBe(true);
    expect(snap.files?.some((f) => f.endsWith("illustrator-job.jsx"))).toBe(false);
    expect(snap.photoshopRuntime?.attempted).toBe(false);
    expect(snap.photoshopRuntime?.message.toLowerCase()).toMatch(/photoshop/);
  });

  it("health reports the studio version", async () => {
    boot();
    const app = createApp();
    const res = await app.request("/api/health");
    const json = (await res.json()) as { ok: boolean; version: string };
    expect(res.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(json.version).toBe("0.2.2-studio");
  });

  it("POST /api/jobs returns a finished campaign or a pollable task", async () => {
    boot();
    const app = createApp();
    const res = await app.request("/api/jobs", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        brief: "Now open. Instagram post. Book now.",
        businessName: "Quick Shop",
        autoApprove: true,
        formats: ["instagram-post"],
        fontStyle: "modern-sans",
        designStyle: "editorial",
        targetApp: "illustrator",
      }),
    });
    const json = (await res.json()) as {
      running?: boolean;
      error?: string;
      version?: string;
      task: { id: string; status: string };
      files?: string[];
    };
    expect(res.status).toBe(200);
    expect(json.error).toBeUndefined();
    expect(json.version).toMatch(/studio/);
    expect(json.task?.id).toBeTruthy();
    if (json.running && json.task.status === "planning") {
      let snap = hydrateSnapshot(json.task.id);
      for (let i = 0; i < 40 && snap && !["approved", "failed"].includes(snap.task.status); i += 1) {
        await new Promise((r) => setTimeout(r, 100));
        snap = hydrateSnapshot(json.task.id);
      }
      expect(snap?.task.status).toBe("approved");
      expect(snap?.files?.some((f) => f.endsWith("illustrator-job.jsx"))).toBe(true);
    } else {
      expect(json.task.status).toBe("approved");
      expect(json.files?.some((f) => f.endsWith("illustrator-job.jsx"))).toBe(true);
    }
  });
});
