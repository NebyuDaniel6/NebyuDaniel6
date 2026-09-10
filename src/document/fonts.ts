import fs from "node:fs";
import path from "node:path";
import opentype from "opentype.js";
import type { Font } from "opentype.js";

const MAC_FALLBACKS = [
  "/System/Library/Fonts/Supplemental/Arial.ttf",
  "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
  "/Library/Fonts/Arial.ttf",
  "/System/Library/Fonts/Supplemental/Times New Roman.ttf",
  "/System/Library/Fonts/Supplemental/Georgia.ttf",
];

const FONT_CANDIDATES: Record<string, string[]> = {
  Inter: [
    "/usr/share/fonts/truetype/macos/Inter-Regular.ttf",
    "/usr/share/fonts/truetype/macos/Inter-Bold.ttf",
    ...MAC_FALLBACKS,
  ],
  "Inter Bold": ["/usr/share/fonts/truetype/macos/Inter-Bold.ttf", ...MAC_FALLBACKS],
  "Public Sans": ["/usr/share/fonts/truetype/macos/PublicSans-Regular.ttf", ...MAC_FALLBACKS],
  "Source Sans 3": ["/usr/share/fonts/truetype/macos/SourceSans3-Regular.ttf", ...MAC_FALLBACKS],
  "JetBrains Mono": ["/usr/share/fonts/truetype/macos/JetBrainsMono-Regular.ttf", ...MAC_FALLBACKS],
  "Noto Serif": [
    "/usr/share/fonts/truetype/noto/NotoSerif-Regular.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf",
    ...MAC_FALLBACKS,
  ],
  "DejaVu Serif": ["/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf", ...MAC_FALLBACKS],
};

const WEIGHT_FILES: Record<string, Record<number, string>> = {
  Inter: {
    400: "/usr/share/fonts/truetype/macos/Inter-Regular.ttf",
    500: "/usr/share/fonts/truetype/macos/Inter-Medium.ttf",
    600: "/usr/share/fonts/truetype/macos/Inter-SemiBold.ttf",
    700: "/usr/share/fonts/truetype/macos/Inter-Bold.ttf",
  },
  "Public Sans": {
    400: "/usr/share/fonts/truetype/macos/PublicSans-Regular.ttf",
    700: "/usr/share/fonts/truetype/macos/PublicSans-Bold.ttf",
  },
  "Noto Serif": {
    400: "/usr/share/fonts/truetype/noto/NotoSerif-Regular.ttf",
    700: "/usr/share/fonts/truetype/noto/NotoSerif-Bold.ttf",
  },
  "DejaVu Serif": {
    400: "/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf",
    700: "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf",
  },
};

const cache = new Map<string, Font>();

export interface ResolvedFont {
  family: string;
  file: string;
  substituted: boolean;
  requested: string;
}

export function resolveFont(family: string, weight = 400): ResolvedFont {
  const table = WEIGHT_FILES[family];
  const exact = table?.[weight] ?? table?.[400];
  if (exact && fs.existsSync(exact)) {
    return { family, file: exact, substituted: false, requested: family };
  }
  for (const candidate of FONT_CANDIDATES[family] ?? FONT_CANDIDATES.Inter ?? []) {
    if (fs.existsSync(candidate)) {
      return { family: family in FONT_CANDIDATES ? family : "Inter", file: candidate, substituted: true, requested: family };
    }
  }
  const discovered = discoverFontFile();
  if (discovered) {
    return { family: "System", file: discovered, substituted: true, requested: family };
  }
  throw new Error(`No usable font found for ${family}`);
}

function discoverFontFile(): string | undefined {
  const dirs = [
    "/usr/share/fonts/truetype/macos",
    "/usr/share/fonts/truetype/dejavu",
    "/usr/share/fonts/truetype/noto",
    "/System/Library/Fonts/Supplemental",
    "/Library/Fonts",
    path.join(process.env.HOME ?? "", "Library/Fonts"),
  ];
  for (const dir of dirs) {
    try {
      if (!fs.existsSync(dir)) continue;
      for (const name of fs.readdirSync(dir)) {
        if (/\.(ttf|otf)$/i.test(name) && !/emoji|color/i.test(name)) {
          return path.join(dir, name);
        }
      }
    } catch {
      /* skip unreadable font dirs */
    }
  }
  return undefined;
}

export function loadFont(family: string, weight = 400): { font: Font; resolved: ResolvedFont } {
  const resolved = resolveFont(family, weight);
  const cached = cache.get(resolved.file);
  if (cached) return { font: cached, resolved };
  const font = opentype.loadSync(resolved.file);
  cache.set(resolved.file, font);
  return { font, resolved };
}

export function measureText(text: string, family: string, fontSize: number, weight = 400): {
  width: number;
  height: number;
  resolved: ResolvedFont;
} {
  const { font, resolved } = loadFont(family, weight);
  const width = font.getAdvanceWidth(text, fontSize);
  return { width, height: fontSize * 1.2, resolved };
}

export function wrapText(
  text: string,
  family: string,
  fontSize: number,
  maxWidth: number,
  weight = 400,
): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const trial = current ? `${current} ${word}` : word;
    const { width } = measureText(trial, family, fontSize, weight);
    if (width <= maxWidth || current.length === 0) {
      current = trial;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines.length > 0 ? lines : [""];
}

export function fitFontSize(
  text: string,
  family: string,
  weight: number,
  maxWidth: number,
  maxHeight: number,
  maxSize: number,
  minSize: number,
  maxLines: number,
): { size: number; lines: string[] } {
  let lo = minSize;
  let hi = maxSize;
  let best = { size: minSize, lines: wrapText(text, family, minSize, maxWidth, weight) };
  while (hi - lo > 0.5) {
    const mid = (lo + hi) / 2;
    const lines = wrapText(text, family, mid, maxWidth, weight);
    const height = lines.length * mid * 1.15;
    const overflow = lines.length > maxLines || height > maxHeight;
    if (!overflow) {
      best = { size: mid, lines };
      lo = mid;
    } else {
      hi = mid;
    }
  }
  return best;
}

export function fontFileBuffer(family: string, weight = 400): { resolved: ResolvedFont; bytes: Buffer } {
  const resolved = resolveFont(family, weight);
  return { resolved, bytes: fs.readFileSync(resolved.file) };
}

export function relativeFontPath(family: string, weight = 400): string {
  return path.basename(resolveFont(family, weight).file);
}
