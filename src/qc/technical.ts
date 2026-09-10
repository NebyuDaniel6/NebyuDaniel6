import { existsSync } from "node:fs";
import { allImages, allTextNodes, type DesignDocument } from "../document/types.ts";
import { FORMAT_PRESETS } from "../document/layout/presets.ts";
import { resolveFont } from "../document/fonts.ts";
import type { QcFinding } from "./types.ts";

export function technicalChecks(doc: DesignDocument, expectedFormats: string[]): QcFinding[] {
  const findings: QcFinding[] = [];
  if (doc.artboards.length === 0) {
    findings.push({
      area: "technical",
      code: "no_artboards",
      severity: "error",
      message: "Document has no artboards.",
      suggestedFix: "Create at least one artboard at the requested size.",
    });
  }
  for (const art of doc.artboards) {
    if (art.width < 1 || art.height < 1) {
      findings.push({
        area: "technical",
        code: "invalid_dimensions",
        severity: "error",
        message: `Artboard ${art.name} has invalid size ${art.width}×${art.height}.`,
      });
    }
    const unnamed = art.layers.filter((l) => !l.name.trim());
    if (unnamed.length > 0) {
      findings.push({
        area: "technical",
        code: "unnamed_layers",
        severity: "warning",
        message: `${unnamed.length} layer(s) on ${art.name} are unnamed.`,
        suggestedFix: "Name every layer.",
      });
    }
  }
  for (const img of allImages(doc)) {
    if (!existsSync(img.path)) {
      findings.push({
        area: "technical",
        code: "missing_asset",
        severity: "error",
        message: `Placed image is missing: ${img.path}`,
        suggestedFix: "Restore the asset or remove the placement.",
      });
    }
  }
  for (const text of allTextNodes(doc)) {
    const resolved = resolveFont(text.fontFamily, text.fontWeight);
    if (resolved.substituted) {
      findings.push({
        area: "technical",
        code: "font_substituted",
        severity: "warning",
        message: `Font "${text.fontFamily}" is unavailable; used ${resolved.family}.`,
        suggestedFix: "Install the brand font or pick a licensed substitute explicitly.",
      });
    }
    if (!text.text.trim()) {
      findings.push({
        area: "technical",
        code: "empty_text",
        severity: "error",
        message: `Text node ${text.name} is empty.`,
      });
    }
  }
  for (const formatId of expectedFormats) {
    const preset = FORMAT_PRESETS[formatId];
    if (!preset) continue;
    const match = doc.artboards.find((a) => a.width === preset.width && a.height === preset.height);
    if (!match) {
      findings.push({
        area: "technical",
        code: "wrong_dimensions",
        severity: "error",
        message: `Missing artboard at ${preset.label} (${preset.width}×${preset.height}).`,
        suggestedFix: `Add a ${preset.width}×${preset.height} artboard.`,
      });
    }
  }
  return findings;
}
