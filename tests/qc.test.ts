import { describe, expect, it } from "vitest";
import { parseBrief } from "../src/agent/brief.ts";
import { emptyDocument, addArtboard, addLayer, append } from "../src/document/ops.ts";
import { rgb } from "../src/document/types.ts";
import { runQualityControl } from "../src/qc/agent.ts";
import type { BrandProfile } from "../src/brand/types.ts";

const brand: BrandProfile = {
  name: "Aether Residences",
  industry: "real-estate",
  colors: [{ name: "Forest", hex: "#1B3A2F", role: "primary" }],
  typefaces: [{ family: "Inter", role: "display", weights: [700] }],
  toneOfVoice: "calm",
  imageryPreferences: [],
  visualStyle: "editorial",
  restrictions: [],
  targetAudience: "",
  competitors: [],
};

describe("quality control", () => {
  it("fails an empty document", () => {
    const brief = parseBrief("Instagram post announcing reservations are open");
    const report = runQualityControl({ document: emptyDocument("x"), brand, brief });
    expect(report.verdict).toBe("revise");
    expect(report.findings.some((f) => f.code === "no_artboards")).toBe(true);
  });

  it("passes a complete high-contrast layout", () => {
    const brief = parseBrief("Instagram post announcing reservations are open");
    const doc = emptyDocument("Campaign");
    const art = addArtboard(doc, {
      name: "Post",
      width: 1080,
      height: 1080,
      background: rgb(27, 58, 47),
    });
    const type = addLayer(art, "Typography");
    const action = addLayer(art, "CTA");
    append(type, {
      id: "k",
      type: "text",
      name: "Kicker",
      role: "kicker",
      x: 80,
      y: 120,
      visible: true,
      text: "NEW RESIDENCES",
      fontFamily: "Inter",
      fontWeight: 600,
      fontStyle: "normal",
      fontSize: 18,
      lineHeight: 22,
      letterSpacing: 2,
      fill: rgb(196, 163, 90),
      width: 800,
      height: 28,
      align: "left",
    });
    append(type, {
      id: "h",
      type: "text",
      name: "Headline",
      role: "headline",
      x: 80,
      y: 180,
      visible: true,
      text: "Reservations are open.",
      fontFamily: "Inter",
      fontWeight: 700,
      fontStyle: "normal",
      fontSize: 56,
      lineHeight: 64,
      letterSpacing: 0,
      fill: rgb(255, 255, 255),
      width: 900,
      height: 80,
      align: "left",
    });
    append(type, {
      id: "n",
      type: "text",
      name: "Brand",
      role: "label",
      x: 80,
      y: 900,
      visible: true,
      text: "Aether Residences",
      fontFamily: "Inter",
      fontWeight: 500,
      fontStyle: "normal",
      fontSize: 18,
      lineHeight: 22,
      letterSpacing: 0,
      fill: rgb(255, 255, 255),
      width: 800,
      height: 28,
      align: "left",
    });
    append(action, {
      id: "c",
      type: "text",
      name: "CTA",
      role: "cta",
      x: 80,
      y: 960,
      visible: true,
      text: "Reservations Are Open",
      fontFamily: "Inter",
      fontWeight: 700,
      fontStyle: "normal",
      fontSize: 24,
      lineHeight: 28,
      letterSpacing: 0,
      fill: rgb(20, 20, 20),
      width: 400,
      height: 36,
      align: "left",
    });
    const report = runQualityControl({ document: doc, brand, brief });
    expect(report.findings.filter((f) => f.severity === "error")).toEqual([]);
    expect(report.verdict).toBe("pass");
  });
});
