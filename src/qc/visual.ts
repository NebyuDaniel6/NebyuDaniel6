import { allTextNodes, type DesignDocument, type TextNode } from "../document/types.ts";
import { contrastRatio } from "./contrast.ts";
import { measureText } from "../document/fonts.ts";
import type { QcFinding } from "./types.ts";

function overflow(t: TextNode): boolean {
  const lines = t.text.split("\n");
  if (lines.length * t.lineHeight > t.height * 1.15) return true;
  return lines.some((line) => measureText(line, t.fontFamily, t.fontSize, t.fontWeight).width > t.width * 1.08);
}

export function visualChecks(doc: DesignDocument): QcFinding[] {
  const findings: QcFinding[] = [];
  for (const art of doc.artboards) {
    const texts = allTextNodes({ ...doc, artboards: [art] });
    const headlines = texts.filter((t) => t.role === "headline");
    const kickers = texts.filter((t) => t.role === "kicker");
    const ctas = texts.filter((t) => t.role === "cta");
    if (headlines.length === 0) {
      findings.push({
        area: "visual",
        code: "no_headline",
        severity: "error",
        message: `${art.name} has no headline.`,
        suggestedFix: "Establish a single dominant headline.",
      });
    }
    if (headlines.length > 1) {
      findings.push({
        area: "visual",
        code: "competing_headlines",
        severity: "warning",
        message: `${art.name} has ${headlines.length} headlines; hierarchy may flatten.`,
      });
    }
    if (kickers.length === 0) {
      findings.push({
        area: "visual",
        code: "no_kicker",
        severity: "warning",
        message: `${art.name} has no kicker; hierarchy is weaker.`,
      });
    }
    if (ctas.length === 0) {
      findings.push({
        area: "visual",
        code: "no_cta",
        severity: "error",
        message: `${art.name} has no call to action.`,
        suggestedFix: "Add a single clear CTA.",
      });
    }
    for (const t of texts) {
      if (overflow(t)) {
        findings.push({
          area: "visual",
          code: "text_overflow",
          severity: "error",
          message: `Text "${t.name}" overflows its frame on ${art.name}.`,
          suggestedFix: "Reduce type size or shorten copy.",
        });
      }
      const ratio = contrastRatio(t.fill, art.background);
      const large = t.fontSize >= 24;
      const needed = large ? 3 : 4.5;
      if (ratio < needed && t.role !== "cta") {
        findings.push({
          area: "visual",
          code: "low_contrast",
          severity: "error",
          message: `Text "${t.name}" contrast ${ratio.toFixed(2)} is below ${needed}:1 on ${art.name}.`,
          suggestedFix: "Use a darker/lighter type color against the field.",
        });
      }
    }
    const margin = Math.min(art.width, art.height) * 0.04;
    for (const t of texts) {
      if (t.x < margin * 0.4 || t.y < margin * 0.4) {
        findings.push({
          area: "visual",
          code: "edge_collision",
          severity: "warning",
          message: `"${t.name}" sits too close to the edge on ${art.name}.`,
        });
      }
    }
  }
  return findings;
}
