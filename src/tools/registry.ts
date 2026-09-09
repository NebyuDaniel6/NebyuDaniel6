import { getDb } from "../db/client.ts";
import { id } from "../lib/ids.ts";
import { redactRecord } from "../lib/redact.ts";
import type { Tool, ToolContext, ToolInvocationRecord } from "./types.ts";
import { assertAllowed } from "./permissions.ts";

const tools = new Map<string, Tool<unknown, unknown>>();

export function registerTool<I, O>(tool: Tool<I, O>): void {
  tools.set(tool.name, tool as Tool<unknown, unknown>);
}

export function listTools(): Array<Pick<Tool<unknown, unknown>, "name" | "description" | "application" | "risk" | "permissions">> {
  return [...tools.values()].map((t) => ({
    name: t.name,
    description: t.description,
    application: t.application,
    risk: t.risk,
    permissions: t.permissions,
  }));
}

export function getTool(name: string): Tool<unknown, unknown> | undefined {
  return tools.get(name);
}

export async function invokeTool<I, O>(name: string, input: I, ctx: ToolContext): Promise<ToolInvocationRecord> {
  const tool = tools.get(name);
  if (!tool) {
    const rec = {
      name,
      ok: false,
      risk: "high" as const,
      input,
      output: { error: { code: "unknown_tool", message: `Tool ${name} is not registered.` } },
    };
    persist(rec, ctx);
    return rec;
  }
  const allowed = assertAllowed(tool, ctx);
  if (!allowed.ok) {
    const rec = { name, ok: false, risk: tool.risk, input, output: { error: allowed.error } };
    persist(rec, ctx);
    return rec;
  }
  try {
    const output = await tool.execute(input, ctx);
    const rec = { name, ok: true, risk: tool.risk, input, output };
    persist(rec, ctx);
    return rec;
  } catch (error) {
    const rec = {
      name,
      ok: false,
      risk: tool.risk,
      input,
      output: {
        error: {
          code: "tool_threw",
          message: error instanceof Error ? error.message : String(error),
        },
      },
    };
    persist(rec, ctx);
    return rec;
  }
}

function persist(rec: ToolInvocationRecord, ctx: ToolContext): void {
  getDb()
    .prepare(
      `INSERT INTO tool_invocations (id, task_id, tool_name, risk, input_json, output_json, ok, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      id("inv"),
      ctx.taskId ?? null,
      rec.name,
      rec.risk,
      JSON.stringify(redactRecord({ input: rec.input as Record<string, unknown> })),
      JSON.stringify(redactRecord({ output: rec.output as Record<string, unknown> })),
      rec.ok ? 1 : 0,
      new Date().toISOString(),
    );
}
