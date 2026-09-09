import type { DesignDocument } from "../document/types.ts";
import { allTextNodes } from "../document/types.ts";
import type { QcFinding } from "./types.ts";
import type { ParsedBrief } from "../agent/brief.ts";

export function briefChecks(doc: DesignDocument, brief: ParsedBrief): QcFinding[] {
  const findings: QcFinding[] = [];
  const corpus = allTextNodes(doc)
    .map((t) => t.text.toLowerCase())
    .join(" ");
  if (brief.cta && !corpus.includes(brief.cta.toLowerCase().slice(0, 12).trim())) {
    const ctaPresent = allTextNodes(doc).some((t) => t.role === "cta" && t.text.trim().length > 0);
    if (!ctaPresent) {
      findings.push({
        area: "brief",
        code: "cta_missing",
        severity: "error",
        message: "The requested call to action is not in the design.",
      });
    }
  }
  if (brief.objectiveKeywords.length > 0) {
    const hit = brief.objectiveKeywords.some((k) => corpus.includes(k.toLowerCase()));
    if (!hit) {
      findings.push({
        area: "brief",
        code: "objective_unspoken",
        severity: "warning",
        message: `None of the objective keywords (${brief.objectiveKeywords.join(", ")}) appear in the copy.`,
      });
    }
  }
  if (doc.artboards.length < brief.formats.length) {
    findings.push({
      area: "brief",
      code: "missing_formats",
      severity: "error",
      message: `Brief requested ${brief.formats.length} format(s); document has ${doc.artboards.length} artboard(s).`,
    });
  }
  return findings;
}
