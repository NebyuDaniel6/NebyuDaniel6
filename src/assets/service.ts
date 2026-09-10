import fs from "node:fs";
import path from "node:path";
import { getDb } from "../db/client.ts";
import { id } from "../lib/ids.ts";
import { assetDir } from "../lib/paths.ts";
import type { AssetKind, AssetRecord } from "./types.ts";

function mapRow(row: {
  id: string;
  org_id: string;
  brand_id: string | null;
  kind: AssetKind;
  filename: string;
  mime: string;
  path: string;
  description: string;
  metadata_json: string;
  created_at: string;
}): AssetRecord {
  return {
    id: row.id,
    orgId: row.org_id,
    brandId: row.brand_id ?? undefined,
    kind: row.kind,
    filename: row.filename,
    mime: row.mime,
    path: row.path,
    description: row.description,
    metadata: JSON.parse(row.metadata_json) as Record<string, unknown>,
    createdAt: row.created_at,
  };
}

export function ingestAsset(input: {
  orgId: string;
  brandId?: string;
  kind: AssetKind;
  filename: string;
  mime: string;
  bytes: Buffer;
  description: string;
  metadata?: Record<string, unknown>;
}): AssetRecord {
  const assetId = id("asset");
  const destDir = assetDir(input.orgId, input.brandId);
  const dest = path.join(destDir, `${assetId}_${input.filename.replace(/[^a-zA-Z0-9._-]/g, "_")}`);
  fs.writeFileSync(dest, input.bytes);
  const now = new Date().toISOString();
  const record: AssetRecord = {
    id: assetId,
    orgId: input.orgId,
    brandId: input.brandId,
    kind: input.kind,
    filename: input.filename,
    mime: input.mime,
    path: dest,
    description: input.description,
    metadata: input.metadata ?? {},
    createdAt: now,
  };
  getDb()
    .prepare(
      `INSERT INTO assets (id, org_id, brand_id, kind, filename, mime, path, description, metadata_json, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      record.id,
      record.orgId,
      record.brandId ?? null,
      record.kind,
      record.filename,
      record.mime,
      record.path,
      record.description,
      JSON.stringify(record.metadata),
      now,
    );
  return record;
}

export function getAsset(assetId: string): AssetRecord | null {
  const row = getDb().prepare(`SELECT * FROM assets WHERE id = ?`).get(assetId) as
    | Parameters<typeof mapRow>[0]
    | undefined;
  return row ? mapRow(row) : null;
}

export function searchAssets(input: {
  orgId: string;
  brandId?: string;
  query?: string;
  kind?: AssetKind;
}): AssetRecord[] {
  let sql = `SELECT * FROM assets WHERE org_id = ?`;
  const params: string[] = [input.orgId];
  if (input.brandId) {
    sql += ` AND (brand_id = ? OR brand_id IS NULL)`;
    params.push(input.brandId);
  }
  if (input.kind) {
    sql += ` AND kind = ?`;
    params.push(input.kind);
  }
  const q = input.query?.trim().toLowerCase();
  const rows = getDb()
    .prepare(sql)
    .all(...params) as Array<Parameters<typeof mapRow>[0]>;
  let assets = rows.map(mapRow);
  if (q) {
    assets = assets.filter(
      (a) =>
        a.filename.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.kind.includes(q),
    );
  }
  return assets;
}
