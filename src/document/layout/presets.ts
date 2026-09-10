export interface FormatPreset {
  id: string;
  label: string;
  width: number;
  height: number;
  dpi: number;
  platform: string;
  kind: "social" | "print" | "web";
}

export const FORMAT_PRESETS: Record<string, FormatPreset> = {
  "instagram-post": {
    id: "instagram-post",
    label: "Instagram post",
    width: 1080,
    height: 1080,
    dpi: 72,
    platform: "instagram",
    kind: "social",
  },
  "instagram-story": {
    id: "instagram-story",
    label: "Instagram story",
    width: 1080,
    height: 1920,
    dpi: 72,
    platform: "instagram",
    kind: "social",
  },
  "facebook-cover": {
    id: "facebook-cover",
    label: "Facebook cover",
    width: 1640,
    height: 624,
    dpi: 72,
    platform: "facebook",
    kind: "social",
  },
  "facebook-post": {
    id: "facebook-post",
    label: "Facebook post",
    width: 1200,
    height: 630,
    dpi: 72,
    platform: "facebook",
    kind: "social",
  },
  "a4-poster": {
    id: "a4-poster",
    label: "A4 poster",
    width: 2480,
    height: 3508,
    dpi: 300,
    platform: "print",
    kind: "print",
  },
  "web-hero": {
    id: "web-hero",
    label: "Web hero",
    width: 1920,
    height: 1080,
    dpi: 72,
    platform: "web",
    kind: "web",
  },
};

export function resolveFormat(token: string): FormatPreset | null {
  const key = token.trim().toLowerCase().replace(/\s+/g, "-");
  if (FORMAT_PRESETS[key]) return FORMAT_PRESETS[key];
  const aliases: Record<string, string> = {
    instagram: "instagram-post",
    "instagram-posts": "instagram-post",
    ig: "instagram-post",
    story: "instagram-story",
    stories: "instagram-story",
    "ig-story": "instagram-story",
    "ig-stories": "instagram-story",
    "facebook-cover": "facebook-cover",
    "fb-cover": "facebook-cover",
    poster: "a4-poster",
    a4: "a4-poster",
    print: "a4-poster",
  };
  const aliased = aliases[key];
  return aliased ? FORMAT_PRESETS[aliased] ?? null : null;
}
