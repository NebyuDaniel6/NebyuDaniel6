import type { BrandProfile } from "../../brand/types.ts";
import type { BrandMemory } from "../../brand/types.ts";
import { id } from "../../lib/ids.ts";
import { addArtboard, addLayer, append, emptyDocument } from "../ops.ts";
import { fitFontSize, resolveFont } from "../fonts.ts";
import { hexToRgb, rgb, type DesignDocument, type RgbColor, type TextNode } from "../types.ts";
import type { FormatPreset } from "./presets.ts";

export interface LayoutCopy {
  kicker: string;
  headline: string;
  subhead: string;
  cta: string;
}

export interface LayoutInput {
  name: string;
  brand: BrandProfile;
  memories: BrandMemory[];
  copy: LayoutCopy;
  formats: FormatPreset[];
  logoPath?: string;
  variationIndex: number;
}

export interface LayoutResult {
  document: DesignDocument;
  fontSubstitutions: string[];
  notes: string[];
}

function parseHex(hex: string): RgbColor {
  return hexToRgb(hex);
}

function luminance(c: RgbColor): number {
  const lin = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b);
}

function contrast(a: RgbColor, b: RgbColor): number {
  const l1 = luminance(a);
  const l2 = luminance(b);
  const hi = Math.max(l1, l2);
  const lo = Math.min(l1, l2);
  return (hi + 0.05) / (lo + 0.05);
}

export function pickPalette(brand: BrandProfile, variationIndex: number): {
  background: RgbColor;
  text: RgbColor;
  accent: RgbColor;
  muted: RgbColor;
  panel: RgbColor;
} {
  const colors = brand.colors;
  const primary = parseHex(colors.find((c) => c.role === "primary")?.hex ?? "#1B3A2F");
  const accent = parseHex(colors.find((c) => c.role === "accent")?.hex ?? "#C4A35A");
  const backgroundToken = colors.find((c) => c.role === "background");
  const textToken = colors.find((c) => c.role === "text");
  const cream = parseHex(backgroundToken?.hex ?? "#F4EFE6");
  const ink = parseHex(textToken?.hex ?? "#1A1A1A");

  const darkMode = variationIndex % 2 === 0;
  if (darkMode) {
    const text = contrast(primary, rgb(255, 255, 255)) >= 4.5 ? rgb(255, 255, 255) : cream;
    return {
      background: primary,
      text,
      accent,
      muted: rgb(
        Math.round(primary.r * 0.6 + text.r * 0.4),
        Math.round(primary.g * 0.6 + text.g * 0.4),
        Math.round(primary.b * 0.6 + text.b * 0.4),
      ),
      panel: rgb(
        Math.min(255, Math.round(primary.r * 0.85)),
        Math.min(255, Math.round(primary.g * 0.85)),
        Math.min(255, Math.round(primary.b * 0.85)),
      ),
    };
  }
  return {
    background: cream,
    text: ink,
    accent,
    muted: rgb(90, 90, 90),
    panel: primary,
  };
}

function displayFamily(brand: BrandProfile): string {
  return brand.typefaces.find((t) => t.role === "display")?.family ?? "Inter";
}

function bodyFamily(brand: BrandProfile): string {
  return brand.typefaces.find((t) => t.role === "body")?.family ?? displayFamily(brand);
}

function textNode(partial: Omit<TextNode, "id" | "type" | "visible" | "fontStyle" | "letterSpacing"> & Partial<Pick<TextNode, "fontStyle" | "letterSpacing">>): TextNode {
  return {
    id: id("text"),
    type: "text",
    visible: true,
    fontStyle: partial.fontStyle ?? "normal",
    letterSpacing: partial.letterSpacing ?? 0,
    ...partial,
  };
}

function rejectedStyles(memories: BrandMemory[]): string[] {
  return memories.filter((m) => m.strength === "rejected_concept").map((m) => m.content.toLowerCase());
}

export function layoutCampaign(input: LayoutInput): LayoutResult {
  const notes: string[] = [];
  const substitutions: string[] = [];
  const rejected = rejectedStyles(input.memories);
  if (rejected.some((r) => r.includes("gradient") || r.includes("glow") || r.includes("3d"))) {
    notes.push("Rejected decorative styles remembered; using flat color fields and type hierarchy only.");
  }

  const display = displayFamily(input.brand);
  const body = bodyFamily(input.brand);
  for (const family of [display, body]) {
    const resolved = resolveFont(family, 400);
    if (resolved.substituted) substitutions.push(`${family} → ${resolved.family}`);
  }

  const doc = emptyDocument(input.name);
  const palette = pickPalette(input.brand, input.variationIndex);

  for (const format of input.formats) {
    composeArtboard(doc, format, input, palette, display, body);
  }

  return { document: doc, fontSubstitutions: substitutions, notes };
}

function composeArtboard(
  doc: DesignDocument,
  format: FormatPreset,
  input: LayoutInput,
  palette: ReturnType<typeof pickPalette>,
  display: string,
  body: string,
): void {
  const art = addArtboard(doc, {
    name: `${format.label} ${input.variationIndex + 1}`,
    width: format.width,
    height: format.height,
    background: palette.background,
  });

  const bg = addLayer(art, "Background");
  append(bg, {
    id: id("rect"),
    type: "rect",
    name: "Field",
    x: 0,
    y: 0,
    visible: true,
    width: format.width,
    height: format.height,
    fill: palette.background,
    stroke: null,
    strokeWidth: 0,
    radius: 0,
  });

  const isCover = format.id === "facebook-cover";
  const isStory = format.id === "instagram-story";
  const isPrint = format.kind === "print";
  const margin = Math.round(Math.min(format.width, format.height) * (isPrint ? 0.08 : isCover ? 0.06 : 0.09));

  const brandLayer = addLayer(art, "Brand");
  if (input.logoPath) {
    const logoH = Math.round(format.height * (isCover ? 0.16 : 0.07));
    const logoW = Math.round(logoH * 2.4);
    append(brandLayer, {
      id: id("img"),
      type: "image",
      name: "Logo",
      x: margin,
      y: margin,
      visible: true,
      path: input.logoPath,
      width: logoW,
      height: logoH,
      fit: "contain",
    });
  } else {
    const mark = Math.round(Math.min(format.width, format.height) * 0.018);
    append(brandLayer, {
      id: id("rect"),
      type: "rect",
      name: "Brand mark",
      x: margin,
      y: margin,
      visible: true,
      width: mark * 6,
      height: mark,
      fill: palette.accent,
      stroke: null,
      strokeWidth: 0,
      radius: 0,
    });
  }

  const typeLayer = addLayer(art, "Typography");
  const contentWidth = format.width - margin * 2;
  const kickerY = margin + Math.round(format.height * (isCover ? 0.22 : isStory ? 0.22 : 0.2));
  const kickerSize = Math.max(14, Math.round(format.height * (isPrint ? 0.014 : 0.018)));

  append(
    typeLayer,
    textNode({
      name: "Kicker",
      role: "kicker",
      text: input.copy.kicker.toUpperCase(),
      x: margin,
      y: kickerY,
      width: contentWidth,
      height: kickerSize * 1.4,
      fontFamily: body,
      fontWeight: 600,
      fontSize: kickerSize,
      lineHeight: kickerSize * 1.2,
      fill: palette.accent,
      align: "left",
      letterSpacing: 3,
    }),
  );

  const headlineMaxH = format.height * (isCover ? 0.28 : isStory ? 0.28 : 0.32);
  const headlineMax = Math.round(format.height * (isCover ? 0.14 : isStory ? 0.09 : isPrint ? 0.07 : 0.11));
  const fitted = fitFontSize(
    input.copy.headline,
    display,
    700,
    contentWidth,
    headlineMaxH,
    headlineMax,
    Math.max(22, Math.round(headlineMax * 0.45)),
    isCover ? 3 : 5,
  );
  const headlineY = kickerY + kickerSize * 2;
  const headlineHeight = fitted.lines.length * fitted.size * 1.12;

  append(
    typeLayer,
    textNode({
      name: "Headline",
      role: "headline",
      text: fitted.lines.join("\n"),
      x: margin,
      y: headlineY,
      width: contentWidth,
      height: headlineHeight,
      fontFamily: display,
      fontWeight: 700,
      fontSize: fitted.size,
      lineHeight: fitted.size * 1.12,
      fill: palette.text,
      align: "left",
    }),
  );

  const subMax = Math.round(format.height * (isPrint ? 0.018 : 0.026));
  const subFit = fitFontSize(
    input.copy.subhead,
    body,
    400,
    contentWidth * (isCover ? 0.7 : 0.92),
    format.height * 0.16,
    subMax,
    14,
    4,
  );
  append(
    typeLayer,
    textNode({
      name: "Subhead",
      role: "subhead",
      text: subFit.lines.join("\n"),
      x: margin,
      y: headlineY + headlineHeight + Math.round(format.height * 0.03),
      width: contentWidth * (isCover ? 0.7 : 1),
      height: subFit.lines.length * subFit.size * 1.25,
      fontFamily: body,
      fontWeight: 400,
      fontSize: subFit.size,
      lineHeight: subFit.size * 1.25,
      fill: palette.text,
      align: "left",
    }),
  );

  const action = addLayer(art, "Call to action");
  const ctaHeight = Math.round(format.height * (isCover ? 0.14 : 0.09));
  const ctaWidth = Math.min(contentWidth, Math.round(format.width * (isCover ? 0.38 : 0.62)));
  const ctaX = margin;
  const ctaY = format.height - margin - ctaHeight;

  append(action, {
    id: id("rect"),
    type: "rect",
    name: "CTA plate",
    x: ctaX,
    y: ctaY,
    visible: true,
    width: ctaWidth,
    height: ctaHeight,
    fill: palette.accent,
    stroke: null,
    strokeWidth: 0,
    radius: isPrint ? 0 : Math.round(ctaHeight * 0.08),
  });

  const ctaSize = Math.round(ctaHeight * 0.32);
  append(
    action,
    textNode({
      name: "CTA label",
      role: "cta",
      text: input.copy.cta,
      x: ctaX + Math.round(ctaWidth * 0.08),
      y: ctaY + (ctaHeight - ctaSize) / 2,
      width: ctaWidth * 0.84,
      height: ctaSize * 1.2,
      fontFamily: display,
      fontWeight: 700,
      fontSize: ctaSize,
      lineHeight: ctaSize,
      fill: contrast(palette.accent, rgb(20, 20, 20)) >= 4.5 ? rgb(20, 20, 20) : rgb(255, 255, 255),
      align: "center",
    }),
  );

  const meta = addLayer(art, "Meta");
  append(
    meta,
    textNode({
      name: "Brand name",
      role: "label",
      text: input.brand.name,
      x: margin,
      y: format.height - margin - ctaHeight - Math.round(format.height * 0.05),
      width: contentWidth,
      height: Math.round(format.height * 0.025),
      fontFamily: body,
      fontWeight: 500,
      fontSize: Math.max(12, Math.round(format.height * 0.016)),
      lineHeight: Math.round(format.height * 0.02),
      fill: palette.text,
      align: "left",
    }),
  );
}

export { contrast, luminance };
