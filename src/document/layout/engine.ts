import type { BrandProfile } from "../../brand/types.ts";
import type { BrandMemory } from "../../brand/types.ts";
import { id } from "../../lib/ids.ts";
import { addArtboard, addLayer, append, emptyDocument } from "../ops.ts";
import { fitFontSize, resolveFont, wrapText } from "../fonts.ts";
import { hexToRgb, rgb, type DesignDocument, type RgbColor, type TextNode } from "../types.ts";
import type { DesignStyleId } from "../../studio/types.ts";
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
  photoPath?: string;
  photoIdea?: string;
  designStyle?: DesignStyleId;
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

function darkFieldFor(style: DesignStyleId | undefined, variationIndex: number): boolean {
  if (style === "luxury" || style === "bold") return true;
  if (style === "editorial" || style === "minimal" || style === "warm") return false;
  return variationIndex % 2 === 0;
}

export function pickPalette(
  brand: BrandProfile,
  variationIndex: number,
  designStyle?: DesignStyleId,
): {
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
  const warmCream = designStyle === "warm" ? rgb(246, 232, 214) : cream;

  if (darkFieldFor(designStyle, variationIndex)) {
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
    background: warmCream,
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

function textNode(
  partial: Omit<TextNode, "id" | "type" | "visible" | "fontStyle" | "letterSpacing"> &
    Partial<Pick<TextNode, "fontStyle" | "letterSpacing">>,
): TextNode {
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

function marginRatio(format: FormatPreset, style: DesignStyleId | undefined): number {
  const isCover = format.id === "facebook-cover";
  const isPrint = format.kind === "print";
  const base = isPrint ? 0.08 : isCover ? 0.06 : 0.09;
  if (style === "bold") return Math.max(0.05, base * 0.75);
  if (style === "minimal" || style === "editorial") return base * 1.15;
  return base;
}

function headlineScale(style: DesignStyleId | undefined): number {
  if (style === "bold") return 1.12;
  if (style === "minimal") return 0.88;
  return 1;
}

export function layoutCampaign(input: LayoutInput): LayoutResult {
  const notes: string[] = [];
  const substitutions: string[] = [];
  const rejected = rejectedStyles(input.memories);
  if (rejected.some((r) => r.includes("gradient") || r.includes("glow") || r.includes("3d"))) {
    notes.push("Rejected decorative styles remembered; using flat color fields and type hierarchy only.");
  }
  if (input.photoPath) notes.push("Placed the uploaded photograph in a reserved photo well on each format.");
  else if (input.photoIdea) {
    notes.push(
      "No photograph was uploaded. Photo wells show a shoot direction from the brief — not a generated fake photo.",
    );
  }

  const display = displayFamily(input.brand);
  const body = bodyFamily(input.brand);
  for (const family of [display, body]) {
    const resolved = resolveFont(family, 400);
    if (resolved.substituted) substitutions.push(`${family} → ${resolved.family}`);
  }

  const doc = emptyDocument(input.name);
  const palette = pickPalette(input.brand, input.variationIndex, input.designStyle);

  for (const format of input.formats) {
    composeArtboard(doc, format, input, palette, display, body);
  }

  return { document: doc, fontSubstitutions: substitutions, notes };
}

function photoRectFor(
  format: FormatPreset,
  wantsPhoto: boolean,
): { x: number; y: number; width: number; height: number } | null {
  if (!wantsPhoto) return null;
  const isCover = format.id === "facebook-cover";
  const isStory = format.id === "instagram-story";
  const isPrint = format.kind === "print";
  if (isCover) {
    return {
      x: Math.round(format.width * 0.56),
      y: 0,
      width: Math.round(format.width * 0.44),
      height: format.height,
    };
  }
  if (isStory) {
    return { x: 0, y: 0, width: format.width, height: Math.round(format.height * 0.46) };
  }
  if (isPrint) {
    return { x: 0, y: 0, width: format.width, height: Math.round(format.height * 0.34) };
  }
  return { x: 0, y: 0, width: format.width, height: Math.round(format.height * 0.46) };
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
  const margin = Math.round(Math.min(format.width, format.height) * marginRatio(format, input.designStyle));
  const wantsPhoto = Boolean(input.photoPath || input.photoIdea);
  const photoBox = photoRectFor(format, wantsPhoto);
  const kickerColor =
    contrast(palette.accent, palette.background) >= 3 ? palette.accent : palette.panel;

  if (photoBox) {
    const photoLayer = addLayer(art, "Photograph");
    if (input.photoPath && /\.(png|jpe?g|webp)$/i.test(input.photoPath)) {
      append(photoLayer, {
        id: id("clip"),
        type: "clipGroup",
        name: "Photo crop",
        x: photoBox.x,
        y: photoBox.y,
        visible: true,
        clip: {
          id: id("rect"),
          type: "rect",
          name: "Photo mask",
          x: photoBox.x,
          y: photoBox.y,
          visible: true,
          width: photoBox.width,
          height: photoBox.height,
          fill: null,
          stroke: null,
          strokeWidth: 0,
          radius: 0,
        },
        children: [
          {
            id: id("img"),
            type: "image",
            name: "Campaign photo",
            x: photoBox.x,
            y: photoBox.y,
            visible: true,
            path: input.photoPath,
            width: photoBox.width,
            height: photoBox.height,
            fit: "cover",
          },
        ],
      });
    } else {
      append(photoLayer, {
        id: id("rect"),
        type: "rect",
        name: "Photo well",
        x: photoBox.x,
        y: photoBox.y,
        visible: true,
        width: photoBox.width,
        height: photoBox.height,
        fill: luminance(palette.background) > 0.45 ? palette.background : palette.panel,
        stroke: kickerColor,
        strokeWidth: Math.max(2, Math.round(photoBox.height * 0.006)),
        radius: 0,
      });
      const wellMargin = Math.round(Math.min(photoBox.width, photoBox.height) * 0.08);
      const idea = input.photoIdea ?? "Photograph the real place, product, or people from this brief.";
      const ideaSize = Math.max(24, Math.round(photoBox.height * 0.04));
      const ideaLines = wrapText(idea, body, ideaSize, photoBox.width - wellMargin * 2, 400);
      append(
        photoLayer,
        textNode({
          name: "Photo direction label",
          role: "label",
          text: "PHOTO DIRECTION",
          x: photoBox.x + wellMargin,
          y: photoBox.y + wellMargin,
          width: photoBox.width - wellMargin * 2,
          height: ideaSize * 1.4,
          fontFamily: body,
          fontWeight: 600,
          fontSize: 24,
          lineHeight: 28,
          fill: palette.text,
          align: "left",
          letterSpacing: 1.5,
        }),
      );
      append(
        photoLayer,
        textNode({
          name: "Photo direction",
          role: "body",
          text: ideaLines.slice(0, 6).join("\n"),
          x: photoBox.x + wellMargin,
          y: photoBox.y + wellMargin + 40,
          width: photoBox.width - wellMargin * 2,
          height: Math.min(photoBox.height - wellMargin * 3, Math.max(ideaLines.length, 1) * ideaSize * 1.25),
          fontFamily: body,
          fontWeight: 400,
          fontSize: ideaSize,
          lineHeight: ideaSize * 1.25,
          fill: palette.text,
          align: "left",
        }),
      );
    }
  }

  const typeTop = photoBox && !isCover ? photoBox.height + Math.round(margin * 0.4) : margin;
  const contentRight = photoBox && isCover ? photoBox.x : format.width;
  const contentWidth = contentRight - margin * 2;

  const brandLayer = addLayer(art, "Brand");
  const mark = Math.round(Math.min(format.width, format.height) * (input.designStyle === "minimal" ? 0.008 : 0.014));
  append(brandLayer, {
    id: id("rect"),
    type: "rect",
    name: "Brand rule",
    x: margin,
    y: typeTop,
    visible: true,
    width: mark * (input.designStyle === "bold" ? 8 : 5),
    height: mark,
    fill: palette.accent,
    stroke: null,
    strokeWidth: 0,
    radius: 0,
  });
  const lockupSize = Math.max(14, Math.round(format.height * (isCover ? 0.045 : 0.028)));
  append(
    brandLayer,
    textNode({
      name: "Wordmark",
      role: "label",
      text: input.brand.name,
      x: margin,
      y: typeTop + mark * 2.2,
      width: contentWidth,
      height: lockupSize * 1.3,
      fontFamily: display,
      fontWeight: 600,
      fontSize: lockupSize,
      lineHeight: lockupSize,
      fill: palette.text,
      align: "left",
    }),
  );
  if (input.logoPath && /\.(png|jpe?g)$/i.test(input.logoPath) && !photoBox) {
    const logoH = Math.round(format.height * (isCover ? 0.12 : 0.06));
    append(brandLayer, {
      id: id("img"),
      type: "image",
      name: "Logo",
      x: format.width - margin - Math.round(logoH * 2.2),
      y: margin,
      visible: true,
      path: input.logoPath,
      width: Math.round(logoH * 2.2),
      height: logoH,
      fit: "contain",
    });
  }

  const typeLayer = addLayer(art, "Typography");
  const kickerY = typeTop + mark * 2.2 + lockupSize * 1.6;
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
      fill: kickerColor,
      align: "left",
      letterSpacing: 3,
    }),
  );

  const headlineMaxH = format.height * (isCover ? 0.28 : isStory ? 0.22 : 0.28) * (photoBox && !isCover ? 0.7 : 1);
  const headlineMax = Math.round(
    format.height * (isCover ? 0.14 : isStory ? 0.09 : isPrint ? 0.07 : 0.11) * headlineScale(input.designStyle),
  );
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
    contentWidth * (isCover ? 0.95 : 0.92),
    format.height * (photoBox && !isCover ? 0.1 : 0.16),
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
      width: contentWidth,
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
  const ctaHeight = Math.round(format.height * (isCover ? 0.16 : input.designStyle === "minimal" ? 0.07 : 0.09));
  const ctaWidth = Math.min(contentWidth, Math.round(format.width * (isCover ? 0.5 : 0.72)));
  const ctaX = margin;
  const ctaY = format.height - margin - ctaHeight;
  const innerW = ctaWidth * 0.88;
  const ctaFit = fitFontSize(
    input.copy.cta,
    display,
    700,
    innerW,
    ctaHeight * 0.6,
    Math.round(ctaHeight * 0.34),
    12,
    1,
  );

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
    radius: isPrint || input.designStyle === "editorial" ? 0 : Math.round(ctaHeight * 0.08),
  });

  append(
    action,
    textNode({
      name: "CTA label",
      role: "cta",
      text: ctaFit.lines.join(" "),
      x: ctaX,
      y: ctaY + (ctaHeight - ctaFit.size) / 2,
      width: ctaWidth,
      height: ctaFit.size * 1.2,
      fontFamily: display,
      fontWeight: 700,
      fontSize: ctaFit.size,
      lineHeight: ctaFit.size,
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
