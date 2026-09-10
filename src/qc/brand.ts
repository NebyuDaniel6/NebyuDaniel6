import type { BrandProfile } from "../brand/types.ts";
import { allTextNodes, type DesignDocument } from "../document/types.ts";
import type { QcFinding } from "./types.ts";

function hex(c: { r: number; g: number; b: number }): string {
  return `#${[c.r, c.g, c.b].map((v) => v.toString(16).padStart(2, "0")).join("")}`.toLowerCase();
}

export function brandChecks(doc: DesignDocument, brand: BrandProfile): QcFinding[] {
  const findings: QcFinding[] = [];
  const allowed = new Set(brand.colors.map((c) => c.hex.toLowerCase()));
  const texts = allTextNodes(doc);
  const display = brand.typefaces.find((t) => t.role === "display")?.family;
  if (display) {
    const used = new Set(texts.map((t) => t.fontFamily));
    if (![...used].some((f) => f === display || f === "Inter")) {
      findings.push({
        area: "brand",
        code: "wrong_typeface",
        severity: "warning",
        message: `Display typeface ${display} was not used.`,
      });
    }
  }
  const brandNamePresent = texts.some((t) => t.text.toLowerCase().includes(brand.name.toLowerCase()));
  if (!brandNamePresent) {
    findings.push({
      area: "brand",
      code: "brand_name_missing",
      severity: "error",
      message: `Brand name "${brand.name}" does not appear in the artwork.`,
      suggestedFix: "Add the brand name as a label or lockup.",
    });
  }
  for (const restriction of brand.restrictions) {
    const needle = restriction.toLowerCase();
    if (needle.includes("gradient") || needle.includes("glow") || needle.includes("3d")) {
      continue;
    }
    for (const t of texts) {
      if (t.text.toLowerCase().includes(needle) && needle.length > 8) {
        findings.push({
          area: "brand",
          code: "restriction_copy",
          severity: "warning",
          message: `Copy may conflict with restriction: ${restriction}`,
        });
      }
    }
  }
  if (allowed.size > 0) {
    const bg = hex(doc.artboards[0]?.background ?? { r: 0, g: 0, b: 0 });
    const close = [...allowed].some((c) => similarHex(c, bg));
    if (!close) {
      findings.push({
        area: "brand",
        code: "off_palette_field",
        severity: "warning",
        message: `Background ${bg} is not close to a brand color.`,
      });
    }
  }
  return findings;
}

function similarHex(a: string, b: string): boolean {
  const pa = parseInt(a.replace("#", ""), 16);
  const pb = parseInt(b.replace("#", ""), 16);
  const dr = ((pa >> 16) & 255) - ((pb >> 16) & 255);
  const dg = ((pa >> 8) & 255) - ((pb >> 8) & 255);
  const db = (pa & 255) - (pb & 255);
  return Math.sqrt(dr * dr + dg * dg + db * db) < 48;
}
