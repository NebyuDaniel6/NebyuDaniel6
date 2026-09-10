import fs from "node:fs";
import path from "node:path";
import { parseBrief, type ParsedBrief } from "./brief.ts";
import { planCampaign, type CampaignPlan } from "./planner.ts";
import { loadSkills, selectSkills } from "../skills/loader.ts";
import { getBrand, listMemories, addMemory } from "../brand/service.ts";
import { searchAssets } from "../assets/service.ts";
import { layoutCampaign } from "../document/layout/engine.ts";
import { applyAutomaticFixes, runQualityControl } from "../qc/agent.ts";
import { invokeTool } from "../tools/registry.ts";
import {
  addEvent,
  createTask,
  getTask,
  savePlan,
  saveResult,
  transition,
  type ApprovalPolicy,
  type TaskRecord,
} from "../tasks/engine.ts";
import { audit } from "../security/audit.ts";
import { endSpan, startSpan, type ExecutionTrace, type TraceSpan } from "../observability/trace.ts";
import { saveTrace } from "../observability/store.ts";
import { getDb } from "../db/client.ts";
import { id } from "../lib/ids.ts";
import { jobDir } from "../lib/paths.ts";
import type { DesignDocument } from "../document/types.ts";
import type { QcReport } from "../qc/types.ts";
import { detectIllustrator } from "../connectors/illustrator/detect.ts";

export interface RunRequest {
  orgId: string;
  brandId: string;
  projectId: string;
  brief: string;
  policy?: ApprovalPolicy;
  autoApprove?: boolean;
}

export interface RunSnapshot {
  task: TaskRecord;
  brief?: ParsedBrief;
  plan?: CampaignPlan;
  qc?: QcReport;
  files?: string[];
  illustratorRuntime?: {
    attempted: boolean;
    ok: boolean;
    message: string;
  };
  connectorHealth?: Record<string, unknown>;
  waitingFor?: "direction" | "final";
  error?: { code: string; message: string };
  trace: ExecutionTrace;
}

export async function startJob(req: RunRequest): Promise<RunSnapshot> {
  const policy: ApprovalPolicy = req.policy ?? {
    direction: req.autoApprove ? "auto" : "require",
    final: req.autoApprove ? "auto" : "require",
  };
  const parsed = parseBrief(req.brief);
  const task = createTask({
    orgId: req.orgId,
    brandId: req.brandId,
    projectId: req.projectId,
    title: parsed.title,
    brief: req.brief,
    policy,
  });
  return continueJob(task.id);
}

export async function continueJob(taskId: string, decision?: "approve" | "reject", note?: string): Promise<RunSnapshot> {
  const task = getTask(taskId);
  if (!task) throw new Error(`Task ${taskId} not found`);
  const spans: TraceSpan[] = [];
  const toolsUsed: string[] = [];
  const recordTool = (name: string) => {
    if (!toolsUsed.includes(name)) toolsUsed.push(name);
  };

  const brand = getBrand(task.brandId);
  if (!brand) {
    const failed = transition(task.id, "failed", { reason: "brand_missing" });
    return snapshot(failed, spans, toolsUsed, { error: { code: "brand_missing", message: "Brand not found." } });
  }
  const memories = listMemories(brand.id);
  const parsed = parseBrief(task.brief);
  const skills = selectSkills(task.brief, loadSkills());

  let span = startSpan("analyze_brief");
  span = endSpan(span, true, { formats: parsed.formats.map((f) => f.id), questions: parsed.questions });
  spans.push(span);

  if (task.status === "planning") {
    transition(task.id, "concept");
  }

  let live = getTask(task.id)!;
  if (live.status === "concept") {
    span = startSpan("plan");
    const plan = planCampaign({ brief: parsed, brand: brand.profile, skills });
    savePlan(task.id, plan);
    recordTool("brand.get");
    span = endSpan(span, true, { planner: plan.planner, skills: plan.skills });
    spans.push(span);
    if (live.policy.direction === "require") {
      transition(task.id, "awaiting_direction_approval");
      return snapshot(getTask(task.id)!, spans, toolsUsed, { brief: parsed, plan, waitingFor: "direction" });
    }
    transition(task.id, "asset_preparation");
  }

  live = getTask(task.id)!;
  if (live.status === "awaiting_direction_approval") {
    if (decision === "reject") {
      addEvent(task.id, "direction_rejected", { note });
      addMemory({
        brandId: brand.id,
        strength: "rejected_concept",
        kind: "concept",
        content: note ?? "Direction rejected by human.",
        sourceTaskId: task.id,
      });
      const failed = transition(task.id, "failed", { reason: "direction_rejected" });
      return snapshot(failed, spans, toolsUsed, { error: { code: "direction_rejected", message: note ?? "Rejected." } });
    }
    if (decision !== "approve") {
      return snapshot(live, spans, toolsUsed, {
        brief: parsed,
        plan: live.plan as CampaignPlan,
        waitingFor: "direction",
      });
    }
    addEvent(task.id, "direction_approved", { note });
    transition(task.id, "asset_preparation");
  }

  live = getTask(task.id)!;
  const plan = (getTask(task.id)?.plan ?? planCampaign({ brief: parsed, brand: brand.profile, skills })) as CampaignPlan;

  if (live.status === "asset_preparation") {
    span = startSpan("prepare_assets");
    const logos = searchAssets({ orgId: task.orgId, brandId: brand.id, query: "logo" });
    recordTool("asset.search");
    recordTool("brand.get");
    span = endSpan(span, true, { logos: logos.map((a) => a.id) });
    spans.push(span);
    transition(task.id, "production");
  }

  live = getTask(task.id)!;
  let document: DesignDocument | null = null;
  let qc: QcReport | undefined;
  const logo = searchAssets({ orgId: task.orgId, brandId: brand.id, query: "logo" })[0];

  if (live.status === "production" || live.status === "revision") {
    span = startSpan("produce");
    const layout = layoutCampaign({
      name: plan.copy.headline,
      brand: brand.profile,
      memories,
      copy: plan.copy,
      formats: parsed.formats,
      logoPath: logo?.path,
      variationIndex: 0,
    });
    document = layout.document;
    const created = await invokeTool(
      "illustrator.create_document",
      { taskId: task.id, document },
      { taskId: task.id, orgId: task.orgId, brandId: brand.id },
    );
    recordTool("illustrator.create_document");
    if (!created.ok) {
      span = endSpan(span, false, { error: created.output });
      spans.push(span);
      const failed = transition(task.id, "failed", { reason: "production_failed" });
      return snapshot(failed, spans, toolsUsed, {
        error: { code: "production_failed", message: JSON.stringify(created.output) },
      });
    }
    span = endSpan(span, true, { notes: layout.notes, substitutions: layout.fontSubstitutions });
    spans.push(span);
    transition(task.id, "quality_control");
  }

  live = getTask(task.id)!;
  if (live.status === "quality_control") {
    span = startSpan("quality_control");
    const inspect = await invokeTool("illustrator.inspect", { taskId: task.id }, { taskId: task.id });
    recordTool("illustrator.inspect");
    const docPath = path.join(jobDir(task.id), "document.json");
    document = JSON.parse(fs.readFileSync(docPath, "utf8")) as DesignDocument;
    qc = runQualityControl({ document, brand: brand.profile, brief: parsed });
    let iterations = 0;
    while (qc.verdict === "revise" && iterations < 3) {
      document = applyAutomaticFixes(document, qc);
      await invokeTool(
        "illustrator.create_document",
        { taskId: task.id, document },
        { taskId: task.id, orgId: task.orgId, brandId: brand.id },
      );
      recordTool("illustrator.create_document");
      qc = runQualityControl({ document, brand: brand.profile, brief: parsed });
      iterations += 1;
      if (qc.verdict === "revise") {
        transition(task.id, "revision", { iteration: iterations });
        transition(task.id, "production");
        transition(task.id, "quality_control");
      }
    }
    span = endSpan(span, qc.verdict === "pass", { qc, inspect: inspect.output });
    spans.push(span);
    if (qc.verdict === "revise") {
      const blocked = getTask(task.id)!;
      saveResult(task.id, { qc, waiting: "human_qc" });
      return snapshot(transition(blocked.id, "awaiting_final_approval"), spans, toolsUsed, {
        brief: parsed,
        plan,
        qc,
        waitingFor: "final",
      });
    }
    const policy = getTask(task.id)!.policy;
    if (policy.final === "require") {
      transition(task.id, "awaiting_final_approval");
      return snapshot(getTask(task.id)!, spans, toolsUsed, { brief: parsed, plan, qc, waitingFor: "final" });
    }
    transition(task.id, "awaiting_final_approval");
    transition(task.id, "export");
  }

  live = getTask(task.id)!;
  if (live.status === "awaiting_final_approval") {
    if (decision === "reject") {
      addMemory({
        brandId: brand.id,
        strength: "rejected_concept",
        kind: "layout",
        content: note ?? "Final rejected.",
        sourceTaskId: task.id,
      });
      return snapshot(transition(task.id, "failed", { reason: "final_rejected" }), spans, toolsUsed, {
        error: { code: "final_rejected", message: note ?? "Rejected." },
      });
    }
    if (decision === "approve" || live.policy.final === "auto") {
      if (decision === "approve") addEvent(task.id, "final_approved", { note });
      transition(task.id, "export");
    } else {
      return snapshot(live, spans, toolsUsed, { waitingFor: "final", plan, qc });
    }
  }

  live = getTask(task.id)!;
  if (live.status === "export") {
    span = startSpan("export");
    const exported = await invokeTool(
      "illustrator.export",
      { taskId: task.id, formats: [...parsed.outputs, "json"] as Array<"svg" | "png" | "jpg" | "pdf" | "jsx" | "json"> },
      { taskId: task.id, orgId: task.orgId, brandId: brand.id },
    );
    recordTool("illustrator.export");
    recordTool("illustrator.save_source");
    if (!exported.ok) {
      span = endSpan(span, false, { error: exported.output });
      spans.push(span);
      return snapshot(transition(task.id, "failed", { reason: "export_failed" }), spans, toolsUsed, {
        error: { code: "export_failed", message: JSON.stringify(exported.output) },
      });
    }
    const files = ((exported.output as { files?: string[] })?.files ?? []) as string[];
    persistDeliverables(task.id, files);

    const jsx = files.find((f) => f.endsWith(".jsx"));
    const detection = detectIllustrator();
    const illustratorRuntime = {
      attempted: false,
      ok: false,
      message: detection.message,
    };
    if (jsx && detection.installed) {
      illustratorRuntime.attempted = true;
      const opened = await invokeTool(
        "illustrator.run_extendscript",
        { jsxPath: jsx },
        { taskId: task.id, orgId: task.orgId, brandId: brand.id },
      );
      recordTool("illustrator.run_extendscript");
      illustratorRuntime.ok = opened.ok;
      illustratorRuntime.message = opened.ok
        ? "Opened the job inside Adobe Illustrator on this computer via ExtendScript (no mouse)."
        : JSON.stringify(opened.output);
    } else {
      illustratorRuntime.message = `${detection.message} Editable SVG and illustrator-job.jsx were still written. Run this project on the Mac that has Illustrator, with Illustrator open, to rebuild native .ai artboards.`;
    }

    addMemory({
      brandId: brand.id,
      strength: "approved_concept",
      kind: "campaign",
      content: `Approved campaign: ${plan.copy.headline}`,
      sourceTaskId: task.id,
    });
    recordTool("brand.remember");
    span = endSpan(span, true, { files, illustratorRuntime });
    spans.push(span);
    const approved = transition(task.id, "approved");
    const result = { files, plan, qc, illustratorRuntime };
    saveResult(task.id, result);
    audit({ orgId: task.orgId, actor: "orchestrator", action: "task.approved", payload: { taskId: task.id } });
    return snapshot(approved, spans, toolsUsed, { brief: parsed, plan, qc, files, illustratorRuntime });
  }

  return snapshot(getTask(task.id)!, spans, toolsUsed, { brief: parsed, plan, qc });
}

function persistDeliverables(taskId: string, files: string[]): void {
  const db = getDb();
  for (const file of files) {
    db.prepare(
      `INSERT INTO deliverables (id, task_id, kind, path, artboard_id, metadata_json, created_at)
       VALUES (?, ?, ?, ?, NULL, ?, ?)`,
    ).run(id("deliv"), taskId, path.extname(file).slice(1) || "file", file, "{}", new Date().toISOString());
  }
}

function snapshot(
  task: TaskRecord,
  spans: TraceSpan[],
  toolsUsed: string[],
  extra: Partial<RunSnapshot>,
): RunSnapshot {
  const trace: ExecutionTrace = {
    taskId: task.id,
    plan: (extra.plan as CampaignPlan | undefined)?.steps ?? [],
    spans,
    toolsUsed,
    result: task.status,
  };
  saveTrace(trace);
  return { task, trace, ...extra };
}

export function listDeliverables(taskId: string): Array<{ kind: string; path: string }> {
  const rows = getDb()
    .prepare(`SELECT kind, path FROM deliverables WHERE task_id = ?`)
    .all(taskId) as Array<{ kind: string; path: string }>;
  return rows;
}
