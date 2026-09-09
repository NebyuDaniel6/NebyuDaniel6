import { getDb } from "../db/client.ts";
import { id } from "../lib/ids.ts";
import type { BrandMemory, BrandProfile, BrandRecord, MemoryStrength } from "./types.ts";

export function createBrand(orgId: string, name: string, profile: BrandProfile): BrandRecord {
  const now = new Date().toISOString();
  const record: BrandRecord = {
    id: id("brand"),
    orgId,
    name,
    profile,
    createdAt: now,
    updatedAt: now,
  };
  getDb()
    .prepare(
      `INSERT INTO brands (id, org_id, name, profile_json, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .run(record.id, orgId, name, JSON.stringify(profile), now, now);
  return record;
}

export function getBrand(brandId: string): BrandRecord | null {
  const row = getDb()
    .prepare(`SELECT * FROM brands WHERE id = ?`)
    .get(brandId) as
    | {
        id: string;
        org_id: string;
        name: string;
        profile_json: string;
        created_at: string;
        updated_at: string;
      }
    | undefined;
  if (!row) return null;
  return {
    id: row.id,
    orgId: row.org_id,
    name: row.name,
    profile: JSON.parse(row.profile_json) as BrandProfile,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function listBrands(orgId: string): BrandRecord[] {
  const rows = getDb()
    .prepare(`SELECT * FROM brands WHERE org_id = ? ORDER BY created_at`)
    .all(orgId) as Array<{
    id: string;
    org_id: string;
    name: string;
    profile_json: string;
    created_at: string;
    updated_at: string;
  }>;
  return rows.map((row) => ({
    id: row.id,
    orgId: row.org_id,
    name: row.name,
    profile: JSON.parse(row.profile_json) as BrandProfile,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export function updateBrandProfile(brandId: string, profile: BrandProfile): void {
  getDb()
    .prepare(`UPDATE brands SET profile_json = ?, updated_at = ? WHERE id = ?`)
    .run(JSON.stringify(profile), new Date().toISOString(), brandId);
}

export function addMemory(input: {
  brandId: string;
  strength: MemoryStrength;
  kind: string;
  content: string;
  sourceTaskId?: string;
}): BrandMemory {
  const now = new Date().toISOString();
  const mem: BrandMemory = {
    id: id("mem"),
    brandId: input.brandId,
    strength: input.strength,
    kind: input.kind,
    content: input.content,
    sourceTaskId: input.sourceTaskId,
    createdAt: now,
  };
  getDb()
    .prepare(
      `INSERT INTO brand_memories (id, brand_id, strength, kind, content, source_task_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(mem.id, mem.brandId, mem.strength, mem.kind, mem.content, mem.sourceTaskId ?? null, now);
  return mem;
}

export function listMemories(brandId: string): BrandMemory[] {
  const rows = getDb()
    .prepare(`SELECT * FROM brand_memories WHERE brand_id = ? ORDER BY created_at`)
    .all(brandId) as Array<{
    id: string;
    brand_id: string;
    strength: MemoryStrength;
    kind: string;
    content: string;
    source_task_id: string | null;
    created_at: string;
  }>;
  return rows.map((r) => ({
    id: r.id,
    brandId: r.brand_id,
    strength: r.strength,
    kind: r.kind,
    content: r.content,
    sourceTaskId: r.source_task_id ?? undefined,
    createdAt: r.created_at,
  }));
}

export function explicitRules(brand: BrandRecord, memories: BrandMemory[]): string[] {
  return [
    ...brand.profile.restrictions,
    ...memories.filter((m) => m.strength === "explicit_rule").map((m) => m.content),
  ];
}
