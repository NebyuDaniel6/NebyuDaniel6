import { getDb } from "../db/client.ts";
import { id } from "../lib/ids.ts";
import { canTransition, type TaskStatus } from "./states.ts";

export interface ApprovalPolicy {
  direction: "auto" | "require";
  final: "auto" | "require";
}

export interface TaskRecord {
  id: string;
  orgId: string;
  brandId: string;
  projectId: string;
  title: string;
  brief: string;
  status: TaskStatus;
  policy: ApprovalPolicy;
  plan: unknown;
  result: unknown;
  createdAt: string;
  updatedAt: string;
}

export function createTask(input: {
  orgId: string;
  brandId: string;
  projectId: string;
  title: string;
  brief: string;
  policy: ApprovalPolicy;
}): TaskRecord {
  const now = new Date().toISOString();
  const task: TaskRecord = {
    id: id("task"),
    orgId: input.orgId,
    brandId: input.brandId,
    projectId: input.projectId,
    title: input.title,
    brief: input.brief,
    status: "planning",
    policy: input.policy,
    plan: null,
    result: null,
    createdAt: now,
    updatedAt: now,
  };
  getDb()
    .prepare(
      `INSERT INTO tasks (id, org_id, brand_id, project_id, title, brief, status, policy_json, plan_json, result_json, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, ?, ?)`,
    )
    .run(
      task.id,
      task.orgId,
      task.brandId,
      task.projectId,
      task.title,
      task.brief,
      task.status,
      JSON.stringify(task.policy),
      now,
      now,
    );
  addEvent(task.id, "created", { title: task.title });
  return task;
}

export function getTask(taskId: string): TaskRecord | null {
  const row = getDb().prepare(`SELECT * FROM tasks WHERE id = ?`).get(taskId) as unknown as DbTask | undefined;
  return row ? mapTask(row) : null;
}

export function listTasks(orgId: string): TaskRecord[] {
  const rows = getDb()
    .prepare(`SELECT * FROM tasks WHERE org_id = ? ORDER BY created_at DESC`)
    .all(orgId) as unknown as DbTask[];
  return rows.map(mapTask);
}

export function transition(taskId: string, to: TaskStatus, payload: Record<string, unknown> = {}): TaskRecord {
  const task = getTask(taskId);
  if (!task) throw new Error(`Task ${taskId} not found.`);
  if (!canTransition(task.status, to)) {
    throw new Error(`Illegal transition ${task.status} → ${to}`);
  }
  const now = new Date().toISOString();
  getDb().prepare(`UPDATE tasks SET status = ?, updated_at = ? WHERE id = ?`).run(to, now, taskId);
  addEvent(taskId, "transition", { from: task.status, to, ...payload });
  const updated = getTask(taskId);
  if (!updated) throw new Error("Task vanished after transition.");
  return updated;
}

export function savePlan(taskId: string, plan: unknown): void {
  getDb()
    .prepare(`UPDATE tasks SET plan_json = ?, updated_at = ? WHERE id = ?`)
    .run(JSON.stringify(plan), new Date().toISOString(), taskId);
}

export function saveResult(taskId: string, result: unknown): void {
  getDb()
    .prepare(`UPDATE tasks SET result_json = ?, updated_at = ? WHERE id = ?`)
    .run(JSON.stringify(result), new Date().toISOString(), taskId);
}

export function addEvent(taskId: string, type: string, payload: Record<string, unknown>): void {
  getDb()
    .prepare(`INSERT INTO task_events (id, task_id, type, payload_json, created_at) VALUES (?, ?, ?, ?, ?)`)
    .run(id("evt"), taskId, type, JSON.stringify(payload), new Date().toISOString());
}

export function listEvents(taskId: string): Array<{ type: string; payload: unknown; createdAt: string }> {
  const rows = getDb()
    .prepare(`SELECT type, payload_json, created_at FROM task_events WHERE task_id = ? ORDER BY created_at`)
    .all(taskId) as Array<{ type: string; payload_json: string; created_at: string }>;
  return rows.map((r) => ({ type: r.type, payload: JSON.parse(r.payload_json), createdAt: r.created_at }));
}

interface DbTask {
  id: string;
  org_id: string;
  brand_id: string;
  project_id: string;
  title: string;
  brief: string;
  status: TaskStatus;
  policy_json: string;
  plan_json: string | null;
  result_json: string | null;
  created_at: string;
  updated_at: string;
}

function mapTask(row: DbTask): TaskRecord {
  return {
    id: row.id,
    orgId: row.org_id,
    brandId: row.brand_id,
    projectId: row.project_id,
    title: row.title,
    brief: row.brief,
    status: row.status,
    policy: JSON.parse(row.policy_json) as ApprovalPolicy,
    plan: row.plan_json ? JSON.parse(row.plan_json) : null,
    result: row.result_json ? JSON.parse(row.result_json) : null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
