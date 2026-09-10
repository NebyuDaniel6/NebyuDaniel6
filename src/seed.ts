import { boot } from "./bootstrap.ts";
import { createOrg, createProject, createUser, addMembership, listOrgs, listProjects } from "./tenant/service.ts";
import { createBrand, listBrands, updateBrandProfile } from "./brand/service.ts";
import { ingestAsset } from "./assets/service.ts";
import { addMemory } from "./brand/service.ts";

const LOGO_SVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="320" height="80" viewBox="0 0 320 80">
  <rect width="320" height="80" fill="none"/>
  <rect x="8" y="28" width="36" height="6" fill="#C4A35A"/>
  <text x="52" y="50" font-family="Inter, Helvetica, Arial, sans-serif" font-size="28" font-weight="600" fill="#F4EFE6">AETHER</text>
</svg>
`;

export function seedSampleWorld(): {
  orgId: string;
  userId: string;
  brandId: string;
  projectId: string;
} {
  boot();
  const existing = listOrgs().find((o) => o.name === "Aether Studio (sample)");
  if (existing) {
    const brand = listBrands(existing.id)[0];
    const project = listProjects(existing.id)[0];
    if (brand && project) {
      return { orgId: existing.id, userId: "seeded", brandId: brand.id, projectId: project.id };
    }
  }
  const org = existing ?? createOrg("Aether Studio (sample)");
  const user = createUser(`operator-${Date.now()}@local`, "Studio operator");
  addMembership(org.id, user.id, "owner");
  const brand = createBrand(org.id, "Aether Residences", {
    name: "Aether Residences",
    industry: "real-estate",
    tagline: "Residences above the avenue.",
    colors: [
      { name: "Forest", hex: "#1B3A2F", role: "primary" },
      { name: "Cream", hex: "#F4EFE6", role: "background" },
      { name: "Gold", hex: "#C4A35A", role: "accent" },
      { name: "Ink", hex: "#1A1A1A", role: "text" },
    ],
    typefaces: [
      { family: "Inter", role: "display", weights: [400, 600, 700] },
      { family: "Inter", role: "body", weights: [400, 500] },
    ],
    toneOfVoice: "Calm, architectural, precise. No hype.",
    imageryPreferences: ["Quiet interiors", "Dappled light", "Material close-ups"],
    visualStyle: "Editorial, generous margins, one gold accent rule.",
    restrictions: [
      "Do not use cartoon houses",
      "Do not use glowing gradients",
      "Do not add random 3D objects",
      "Do not use generic AI skylines as the hero",
    ],
    targetAudience: "Buyers seeking a long-term city residence",
    competitors: [],
  });
  addMemory({
    brandId: brand.id,
    strength: "explicit_rule",
    kind: "style",
    content: "Never use decorative glow, fake marble texture, or stock sunset palettes.",
  });
  const logo = ingestAsset({
    orgId: org.id,
    brandId: brand.id,
    kind: "logo",
    filename: "aether-wordmark.svg",
    mime: "image/svg+xml",
    bytes: Buffer.from(LOGO_SVG),
    description: "Aether Residences wordmark, gold rule + cream type",
  });
  updateBrandProfile(brand.id, { ...brand.profile, logoAssetId: logo.id });
  const project = createProject(org.id, brand.id, "Africa Avenue reservations");
  return { orgId: org.id, userId: user.id, brandId: brand.id, projectId: project.id };
}
