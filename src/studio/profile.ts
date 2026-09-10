import type { BrandProfile } from "../brand/types.ts";
import { FORMAT_PRESETS, resolveFormat } from "../document/layout/presets.ts";
import {
  DESIGN_STYLES,
  FONT_STYLES,
  TARGET_APPS,
  type DesignStyleId,
  type FontStyleId,
  type StudioInput,
  type StudioPrefs,
  type TargetApp,
} from "./types.ts";

const FONT_MAP: Record<FontStyleId, { display: string; body: string }> = {
  "modern-sans": { display: "Inter", body: "Inter" },
  "elegant-serif": { display: "Noto Serif", body: "Inter" },
  "bold-display": { display: "Inter", body: "Public Sans" },
  friendly: { display: "Public Sans", body: "Public Sans" },
};

const STYLE_COPY: Record<DesignStyleId, string> = {
  editorial: "Editorial, generous margins, one accent rule, type does the work.",
  bold: "Bold, high contrast, large type, short copy, one punchy CTA.",
  minimal: "Minimal, lots of air, thin rules, quiet type hierarchy.",
  warm: "Warm, approachable, light field, friendly type, local-business feel.",
  luxury: "Quiet luxury, dark field, restrained gold/accent, architectural space.",
};

export function normalizeHex(input: string | undefined, fallback: string): string {
  const raw = (input ?? "").trim();
  const h = raw.startsWith("#") ? raw.slice(1) : raw;
  if (/^[0-9a-fA-F]{6}$/.test(h)) return `#${h.toUpperCase()}`;
  if (/^[0-9a-fA-F]{3}$/.test(h)) {
    return `#${h
      .split("")
      .map((c) => c + c)
      .join("")
      .toUpperCase()}`;
  }
  return fallback;
}

export function asFontStyle(value: string | undefined): FontStyleId {
  return FONT_STYLES.includes(value as FontStyleId) ? (value as FontStyleId) : "modern-sans";
}

export function asDesignStyle(value: string | undefined): DesignStyleId {
  return DESIGN_STYLES.includes(value as DesignStyleId) ? (value as DesignStyleId) : "editorial";
}

export function asTargetApp(value: string | undefined): TargetApp {
  return TARGET_APPS.includes(value as TargetApp) ? (value as TargetApp) : "illustrator";
}

export function resolveStudioFormats(ids: string[] | undefined): string[] {
  if (!ids?.length) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of ids) {
    const preset = FORMAT_PRESETS[raw] ?? resolveFormat(raw);
    if (preset && !seen.has(preset.id)) {
      seen.add(preset.id);
      out.push(preset.id);
    }
  }
  return out;
}

export function photoIdeaFromPrompt(brief: string, businessName: string, designStyle: DesignStyleId): string {
  const photoMatch = brief.match(
    /(?:photo|photograph|picture|image|shot|imagery)(?:\s+of|\s+showing|\s*:)?\s+([^.]{8,90})/i,
  );
  if (photoMatch?.[1]) return photoMatch[1].replace(/\s+/g, " ").trim();
  const first = brief.split(/[.!?]/)[0]?.replace(/\s+/g, " ").trim() ?? businessName;
  return `${STYLE_COPY[designStyle].split(",")[0]} photograph for ${businessName}: real people, place, or product from “${first.slice(0, 72)}” — not a fake stock skyline.`;
}

export function normalizeStudio(input: StudioInput, brief: string): StudioPrefs {
  const businessName = (input.businessName ?? "").trim() || "Your business";
  const designStyle = asDesignStyle(input.designStyle);
  const photoFromPrompt = Boolean(input.photoFromPrompt);
  return {
    businessName,
    primaryColor: normalizeHex(input.primaryColor, "#1F3D34"),
    accentColor: normalizeHex(input.accentColor, "#D4A017"),
    fontStyle: asFontStyle(input.fontStyle),
    designStyle,
    targetApp: asTargetApp(input.targetApp),
    formats: resolveStudioFormats(input.formats),
    photoFromPrompt,
    photoPath: input.photoPath,
    photoIdea: photoFromPrompt ? photoIdeaFromPrompt(brief, businessName, designStyle) : undefined,
    plan: input.plan ?? "studio",
  };
}

export function profileFromStudio(prefs: StudioPrefs): BrandProfile {
  const fonts = FONT_MAP[prefs.fontStyle];
  const lightField = prefs.designStyle !== "luxury" && prefs.designStyle !== "bold";
  return {
    name: prefs.businessName,
    industry: "local-business",
    tagline: undefined,
    colors: [
      { name: "Primary", hex: prefs.primaryColor, role: "primary" },
      { name: "Accent", hex: prefs.accentColor, role: "accent" },
      { name: "Field", hex: lightField ? "#F6F1E8" : prefs.primaryColor, role: "background" },
      { name: "Ink", hex: lightField ? "#1A1A1A" : "#F6F1E8", role: "text" },
    ],
    typefaces: [
      { family: fonts.display, role: "display", weights: [400, 600, 700] },
      { family: fonts.body, role: "body", weights: [400, 500] },
    ],
    toneOfVoice: STYLE_COPY[prefs.designStyle],
    imageryPreferences: prefs.photoIdea ? [prefs.photoIdea] : ["Real location", "Real product", "Real people"],
    visualStyle: STYLE_COPY[prefs.designStyle],
    restrictions: [
      "Do not use glowing gradients",
      "Do not add random 3D objects",
      "Do not fake a photograph when none was uploaded",
    ],
    targetAudience: "Local customers",
    competitors: [],
  };
}

export function typefacesFor(fontStyle: FontStyleId): { display: string; body: string } {
  return FONT_MAP[fontStyle];
}
