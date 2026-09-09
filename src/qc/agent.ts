import type { BrandProfile } from "../brand/types.ts";
import type { DesignDocument } from "../document/types.ts";
import type { ParsedBrief } from "../agent/brief.ts";
import { brandChecks } from "./brand.ts";
import { briefChecks } from "./brief.ts";
import { technicalChecks } from "./technical.ts";
import { visualChecks } from "./visual.ts";
import { summarize, type QcReport } from "./types.ts";
import { allTextNodes } from "../document/types.ts";

export function runQualityControl(input: {
  document: DesignDocument;
  brand: BrandProfile;
  brief: ParsedBrief;
}): QcReport {
  const findings = [
    ...technicalChecks(input.document, input.brief.formats.map((f) => f.id)),
    ...visualChecks(input.document),
    ...brandChecks(input.document, input.brand),
    ...briefChecks(input.document, input.brief),
  ];
  return summarize(findings);
}

export function applyAutomaticFixes(doc: DesignDocument, report: QcReport): DesignDocument {
  const clone = structuredClone(doc);
  for (const finding of report.findings) {
    if (finding.code === "text_overflow") {
      for (const art of clone.artboards) {
        for (const layer of art.layers) {
          const shrink = (nodes: typeof layer.children) => {
            for (const n of nodes) {
              if (n.type === "text" && n.fontSize > 16) {
                n.fontSize *= 0.92;
                n.lineHeight = n.fontSize * 1.12;
              }
              if (n.type === "group" || n.type === "clipGroup") shrink(n.children);
            }
          };
          shrink(layer.children);
        }
      }
    }
    if (finding.code === "low_contrast") {
      for (const t of allTextNodes(clone)) {
        const lum = (t.fill.r * 299 + t.fill.g * 587 + t.fill.b * 114) / 1000;
        if (lum > 128) t.fill = { r: 255, g: 255, b: 255 };
        else t.fill = { r: 18, g: 18, b: 18 };
      }
    }
  }
  return clone;
}
