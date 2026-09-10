import { FORMAT_PRESETS, resolveFormat, type FormatPreset } from "../document/layout/presets.ts";

export interface ParsedBrief {
  raw: string;
  title: string;
  industry: string | null;
  formats: FormatPreset[];
  variations: number;
  outputs: Array<"svg" | "png" | "jpg" | "pdf" | "jsx">;
  cta: string;
  tone: string;
  objectiveKeywords: string[];
  questions: string[];
}

const INDUSTRY_HINTS: Array<[RegExp, string]> = [
  [/real[- ]?estate|residenc|apartments?|villa|property/i, "real-estate"],
  [/restaurant|cafe|bistro|dining|menu/i, "hospitality"],
  [/hotel|resort/i, "hospitality"],
  [/fashion|apparel/i, "fashion"],
  [/tech|saas|software/i, "technology"],
];

export function parseBrief(
  raw: string,
  options: { formatIds?: string[]; businessName?: string } = {},
): ParsedBrief {
  const formats: FormatPreset[] = [];
  const seen = new Set<string>();
  const add = (preset: FormatPreset | null | undefined) => {
    if (preset && !seen.has(preset.id)) {
      seen.add(preset.id);
      formats.push(preset);
    }
  };

  if (options.formatIds?.length) {
    for (const id of options.formatIds) {
      add(FORMAT_PRESETS[id] ?? resolveFormat(id));
    }
  }

  if (formats.length === 0) {
    if (/instagram\s+(post|posts)/i.test(raw) || /ig\s+post/i.test(raw)) add(FORMAT_PRESETS["instagram-post"]);
    if (/stor(y|ies)/i.test(raw)) add(FORMAT_PRESETS["instagram-story"]);
    if (/facebook\s+cover|fb\s+cover/i.test(raw)) add(FORMAT_PRESETS["facebook-cover"]);
    if (/facebook(?!\s+cover)/i.test(raw)) add(FORMAT_PRESETS["facebook-post"]);
    if (/\ba4\b|poster|print/i.test(raw)) add(FORMAT_PRESETS["a4-poster"]);
    if (/pdf/i.test(raw) && !formats.some((f) => f.id === "a4-poster")) add(FORMAT_PRESETS["a4-poster"]);

    const tokens = raw.toLowerCase().split(/[^a-z0-9-]+/);
    for (const token of tokens) {
      add(resolveFormat(token));
    }
  }

  if (formats.length === 0) add(FORMAT_PRESETS["instagram-post"]);

  let variations = 1;
  const varMatch = raw.match(/(\d+)\s+(variations?|versions?|options?)/i);
  if (varMatch?.[1]) variations = Math.min(6, Number(varMatch[1]));
  const countMatch = raw.match(/(\d+)\s+instagram\s+posts?/i);
  if (countMatch?.[1]) {
    variations = Math.max(variations, Number(countMatch[1]));
  }

  const outputs: ParsedBrief["outputs"] = ["svg", "png", "pdf", "jsx"];
  if (/\bjpg|jpeg\b/i.test(raw)) outputs.push("jpg");

  const ctaMatch =
    raw.match(/reservations? are open/i) ||
    raw.match(/now open/i) ||
    raw.match(/book now/i) ||
    raw.match(/shop now/i) ||
    raw.match(/launching/i);
  const cta = ctaMatch ? titleCase(ctaMatch[0]) : "Learn more";

  let industry: string | null = null;
  for (const [re, value] of INDUSTRY_HINTS) {
    if (re.test(raw)) {
      industry = value;
      break;
    }
  }

  const tone = /premium|luxury|quiet luxury|editorial/i.test(raw)
    ? "premium"
    : /playful|fun|bold/i.test(raw)
      ? "energetic"
      : "professional";

  const objectiveKeywords = unique(
    raw
      .toLowerCase()
      .match(/reservations?|launch|open|sale|opening|announce|campaign/g)
      ?.map((s) => s) ?? [],
  );

  const questions: string[] = [];
  if (!industry && !options.businessName) {
    questions.push("Which industry or category should this campaign speak to?");
  }

  const title = deriveTitle(raw);
  return { raw, title, industry, formats, variations, outputs, cta, tone, objectiveKeywords, questions };
}

function deriveTitle(raw: string): string {
  const cleaned = raw.replace(/\s+/g, " ").trim();
  if (cleaned.length <= 72) return cleaned;
  return `${cleaned.slice(0, 69)}…`;
}

function titleCase(s: string): string {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

function unique(items: string[]): string[] {
  return [...new Set(items)];
}
