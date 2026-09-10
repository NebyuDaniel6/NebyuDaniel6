import { ingestAsset } from "../assets/service.ts";
import { createBrand, listBrands, updateBrandProfile } from "../brand/service.ts";
import { createOrg, createProject, listOrgs } from "../tenant/service.ts";
import { profileFromStudio } from "./profile.ts";
import type { StudioInput, StudioPrefs } from "./types.ts";

const STUDIO_ORG_NAME = "Local Studio";

export function ensureStudioWorkspace(prefs: StudioPrefs): {
  orgId: string;
  brandId: string;
  projectId: string;
} {
  const existingOrg = listOrgs().find((o) => o.name === STUDIO_ORG_NAME);
  const org = existingOrg ?? createOrg(STUDIO_ORG_NAME);
  const profile = profileFromStudio(prefs);
  const existingBrand = listBrands(org.id).find((b) => b.name === prefs.businessName);
  const brand = existingBrand ?? createBrand(org.id, prefs.businessName, profile);
  if (existingBrand) updateBrandProfile(brand.id, profile);
  const project = createProject(org.id, brand.id, `${prefs.businessName} campaign`);
  return { orgId: org.id, brandId: brand.id, projectId: project.id };
}

export function ingestStudioPhoto(
  orgId: string,
  brandId: string,
  input: Pick<StudioInput, "photoBase64" | "photoFilename" | "photoMime">,
): string | undefined {
  if (!input.photoBase64) return undefined;
  const bytes = Buffer.from(input.photoBase64, "base64");
  if (bytes.length === 0 || bytes.length > 8 * 1024 * 1024) return undefined;
  const filename = (input.photoFilename ?? "photo.jpg").replace(/[^a-zA-Z0-9._-]/g, "_");
  const mime = input.photoMime ?? "image/jpeg";
  const asset = ingestAsset({
    orgId,
    brandId,
    kind: "image",
    filename,
    mime,
    bytes,
    description: "Uploaded campaign photograph",
  });
  return asset.path;
}
