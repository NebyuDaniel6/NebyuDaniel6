import type { ParsedBrief } from "./brief.ts";
import type { Skill } from "../skills/loader.ts";
import type { BrandProfile } from "../brand/types.ts";

export interface CampaignPlan {
  planner: "heuristic" | "llm";
  concept: string;
  rationale: string[];
  steps: string[];
  skills: string[];
  tools: string[];
  copy: {
    kicker: string;
    headline: string;
    subhead: string;
    cta: string;
  };
  risks: string[];
}

export function planCampaign(input: {
  brief: ParsedBrief;
  brand: BrandProfile;
  skills: Skill[];
}): CampaignPlan {
  const { brief, brand, skills } = input;
  const headline = headlineFrom(brief, brand);
  const kicker = kickerFrom(brief, brand);
  const subhead = subheadFrom(brief, brand);
  const formats = brief.formats.map((f) => f.label).join(", ");
  return {
    planner: "heuristic",
    concept: `${brand.name}: a ${brief.tone} ${formats} system. Hierarchy first, brand color field, one CTA. No decorative effects.`,
    rationale: [
      "Type and space carry the message; extra illustration would compete with the brand.",
      `Formats: ${formats}.`,
      `CTA: ${brief.cta}.`,
      brand.restrictions.length > 0 ? `Respect restrictions: ${brand.restrictions.join("; ")}.` : "No extra brand restrictions recorded.",
    ],
    steps: [
      "Load brand profile and memories",
      "Analyze brief and resolve formats",
      "Select skills and tools",
      "Propose creative direction",
      "Prepare brand assets",
      "Create document via Illustrator connector",
      "Build layout (type, color, logo, CTA)",
      "Inspect document state",
      "Quality control",
      "Export editable source and requested formats",
      "Store approved work in brand memory",
    ],
    skills: skills.map((s) => s.id),
    tools: unique(skills.flatMap((s) => s.requires_tools)),
    copy: {
      kicker,
      headline,
      subhead,
      cta: brief.cta,
    },
    risks: [
      "Illustrator desktop app is not used on Linux; svg-document + JSX is the live path.",
      brief.questions.length > 0 ? "Some brief details are assumed; human can still reject the direction." : "",
    ].filter(Boolean),
  };
}

function headlineFrom(brief: ParsedBrief, brand: BrandProfile): string {
  if (/reservations? are open/i.test(brief.raw)) return "Reservations are open.";
  if (/launch/i.test(brief.raw)) return `${brand.name} is live.`;
  if (/now open/i.test(brief.raw)) return "Now open.";
  const firstSentence = brief.raw.split(/[.!?]/)[0]?.trim() ?? brand.name;
  if (firstSentence.length < 80) return firstSentence.replace(/^create\s+/i, "").replace(/^a\s+/i, "");
  return brand.tagline ?? brand.name;
}

function kickerFrom(brief: ParsedBrief, brand: BrandProfile): string {
  if (brief.industry === "real-estate") return "New residences";
  if (brief.industry === "hospitality") return "Now serving";
  if (brand.industry === "local-business") return brand.name;
  return brand.industry || "Campaign";
}

function subheadFrom(brief: ParsedBrief, brand: BrandProfile): string {
  if (brand.tagline) return brand.tagline;
  if (brief.industry === "real-estate") {
    return "A considered address. Enquire to reserve your residence.";
  }
  return brief.raw.length < 140 ? brief.raw : "Designed from the brand system. One message, several formats.";
}

function unique(items: string[]): string[] {
  return [...new Set(items.filter(Boolean))];
}
