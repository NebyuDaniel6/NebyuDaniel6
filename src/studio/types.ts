export const FONT_STYLES = ["modern-sans", "elegant-serif", "bold-display", "friendly"] as const;
export type FontStyleId = (typeof FONT_STYLES)[number];

export const DESIGN_STYLES = ["editorial", "bold", "minimal", "warm", "luxury"] as const;
export type DesignStyleId = (typeof DESIGN_STYLES)[number];

export const TARGET_APPS = ["illustrator", "photoshop"] as const;
export type TargetApp = (typeof TARGET_APPS)[number];

export type StudioPlan = "free" | "studio";

/** What a local business actually sets. Org/brand/project stay internal. */
export interface StudioPrefs {
  businessName: string;
  primaryColor: string;
  accentColor: string;
  fontStyle: FontStyleId;
  designStyle: DesignStyleId;
  targetApp: TargetApp;
  formats: string[];
  photoFromPrompt: boolean;
  photoPath?: string;
  photoIdea?: string;
  plan: StudioPlan;
}

export interface StudioInput {
  businessName?: string;
  primaryColor?: string;
  accentColor?: string;
  fontStyle?: string;
  designStyle?: string;
  targetApp?: string;
  formats?: string[];
  photoFromPrompt?: boolean;
  photoPath?: string;
  photoBase64?: string;
  photoFilename?: string;
  photoMime?: string;
  plan?: StudioPlan;
}
