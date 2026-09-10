import { getDb } from "../db/client.ts";
import { id } from "../lib/ids.ts";
import { redactRecord } from "../lib/redact.ts";

export function audit(input: {
  orgId?: string;
  actor: string;
  action: string;
  payload: Record<string, unknown>;
}): void {
  getDb()
    .prepare(`INSERT INTO audit_log (id, org_id, actor, action, payload_json, created_at) VALUES (?, ?, ?, ?, ?, ?)`)
    .run(
      id("audit"),
      input.orgId ?? null,
      input.actor,
      input.action,
      JSON.stringify(redactRecord(input.payload)),
      new Date().toISOString(),
    );
}

export function listAudit(orgId?: string): Array<{ action: string; actor: string; payload: unknown; createdAt: string }> {
  const rows = (
    orgId
      ? getDb().prepare(`SELECT * FROM audit_log WHERE org_id = ? ORDER BY created_at`).all(orgId)
      : getDb().prepare(`SELECT * FROM audit_log ORDER BY created_at`).all()
  ) as Array<{ action: string; actor: string; payload_json: string; created_at: string }>;
  return rows.map((r) => ({
    action: r.action,
    actor: r.actor,
    payload: JSON.parse(r.payload_json),
    createdAt: r.created_at,
  }));
}
