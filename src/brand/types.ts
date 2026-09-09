export type MemoryStrength =
  | "explicit_rule"
  | "inferred_preference"
  | "campaign_temporary"
  | "approved_concept"
  | "rejected_concept";

export interface BrandColor {
  name: string;
  hex: string;
  role: "primary" | "secondary" | "accent" | "neutral" | "background" | "text";
}

export interface BrandTypeface {
  family: string;
  role: "display" | "body" | "accent";
  weights: number[];
}

export interface BrandProfile {
  name: string;
  industry: string;
  tagline?: string;
  colors: BrandColor[];
  typefaces: BrandTypeface[];
  toneOfVoice: string;
  imageryPreferences: string[];
  visualStyle: string;
  restrictions: string[];
  targetAudience: string;
  competitors: string[];
  logoAssetId?: string;
}

export interface BrandRecord {
  id: string;
  orgId: string;
  name: string;
  profile: BrandProfile;
  createdAt: string;
  updatedAt: string;
}

export interface BrandMemory {
  id: string;
  brandId: string;
  strength: MemoryStrength;
  kind: string;
  content: string;
  sourceTaskId?: string;
  createdAt: string;
}
