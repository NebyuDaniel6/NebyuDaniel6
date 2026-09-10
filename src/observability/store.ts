import { getDb } from "../db/client.ts";
import { id } from "../lib/ids.ts";
import type { ExecutionTrace } from "./trace.ts";

export function saveTrace(trace: ExecutionTrace): void {
  getDb()
    .prepare(`INSERT INTO traces (id, task_id, spans_json, created_at) VALUES (?, ?, ?, ?)`)
    .run(id("trace"), trace.taskId, JSON.stringify(trace), new Date().toISOString());
}

export function getLatestTrace(taskId: string): ExecutionTrace | null {
  const row = getDb()
    .prepare(`SELECT spans_json FROM traces WHERE task_id = ? ORDER BY created_at DESC LIMIT 1`)
    .get(taskId) as { spans_json: string } | undefined;
  return row ? (JSON.parse(row.spans_json) as ExecutionTrace) : null;
}
