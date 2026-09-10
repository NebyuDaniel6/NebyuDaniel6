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
import { getLatestTrace, saveTrace } from "../observability/store.ts";
import { getDb } from "../db/client.ts";
import { id } from "../lib/ids.ts";
import { jobDir } from "../lib/paths.ts";
import type { DesignDocument } from "../document/types.ts";
import type { QcReport } from "../qc/types.ts";
import { detectIllustrator } from "../connectors/illustrator/detect.ts";
import { normalizeStudio } from "../studio/profile.ts";
import { ensureStudioWorkspace, ingestStudioPhoto } from "../studio/workspace.ts";
import type { StudioInput, TargetApp } from "../studio/types.ts";
import { canTransition } from "../tasks/states.ts";

export interface RunRequest {
  brief: string;
  policy?: ApprovalPolicy;
  autoApprove?: boolean;
  studio?: StudioInput;
  orgId?: string;
  brandId?: string;
  projectId?: string;
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
  photoshopRuntime?: {
    attempted: boolean;
    ok: boolean;
    message: string;
  };
  targetApp?: TargetApp;
  connectorHealth?: Record<string, unknown>;
  waitingFor?: "direction" | "final";
  error?: { code: string; message: string };
  trace: ExecutionTrace;
}

export function createStudioTask(req: RunRequest): TaskRecord {
  const useStudio = Boolean(req.studio) || !req.orgId || !req.brandId || !req.projectId;
  const studio = useStudio ? normalizeStudio(req.studio ?? {}, req.brief) : undefined;

  let orgId = req.orgId;
  let brandId = req.brandId;
  let projectId = req.projectId;
  if (!orgId || !brandId || !projectId) {
    const workspace = ensureStudioWorkspace(studio ?? normalizeStudio({}, req.brief));
    orgId = workspace.orgId;
    brandId = workspace.brandId;
    projectId = workspace.projectId;
  }

  if (studio && req.studio?.photoBase64) {
    const photoPath = ingestStudioPhoto(orgId, brandId, req.studio);
    if (photoPath) studio.photoPath = photoPath;
  }

  const policy: ApprovalPolicy = {
    direction: req.policy?.direction ?? (req.autoApprove ? "auto" : "require"),
    final: req.policy?.final ?? (req.autoApprove ? "auto" : "require"),
    studio,
  };

  const parsed = parseBrief(req.brief, {
    formatIds: studio?.formats,
    businessName: studio?.businessName,
  });
  return createTask({
    orgId,
    brandId,
    projectId,
    title: parsed.title,
    brief: req.brief,
    policy,
  });
}

export async function startJob(req: RunRequest): Promise<RunSnapshot> {
  return continueJob(createStudioTask(req).id);
}

/** HTTP path: return the task immediately so the UI is not stuck on “Running…”. */
export function enqueueJob(req: RunRequest): TaskRecord {
  const task = createStudioTask(req);
  setImmediate(() => {
    continueJob(task.id).catch((error) => failOpenTask(task.id, error));
  });
  return task;
}

function failOpenTask(taskId: string, error: unknown): void {
  const message = error instanceof Error ? error.message : String(error);
  const task = getTask(taskId);
  if (!task || task.status === "approved" || task.status === "failed") {
    saveResult(taskId, { error: { code: "job_failed", message } });
    return;
  }
  try {
    if (canTransition(task.status, "failed")) transition(taskId, "failed", { reason: message });
  } catch {
    /* already terminal */
  }
  saveResult(taskId, { error: { code: "job_failed", message } });
}

export function hydrateSnapshot(taskId: string): RunSnapshot | null {
  const task = getTask(taskId);
  if (!task) return null;
  const result = (task.result ?? {}) as Partial<RunSnapshot> & { error?: RunSnapshot["error"] };
  const waitingFor: RunSnapshot["waitingFor"] =
    task.status === "awaiting_direction_approval"
      ? "direction"
      : task.status === "awaiting_final_approval"
        ? "final"
        : undefined;
  const files = result.files ?? listDeliverables(taskId).map((d) => d.path);
  return {
    task,
    brief: result.brief,
    plan: (result.plan as CampaignPlan | undefined) ?? (task.plan as CampaignPlan | null) ?? undefined,
    qc: result.qc,
    files,
    illustratorRuntime: result.illustratorRuntime,
    photoshopRuntime: result.photoshopRuntime,
    targetApp: result.targetApp ?? task.policy.studio?.targetApp,
    waitingFor,
    error: result.error,
    trace: getLatestTrace(taskId) ?? {
      taskId,
      plan: [],
      spans: [],
      toolsUsed: [],
      result: task.status,
    },
  };
}

export async function continueJob(taskId: string, decision?: "approve" | "reject", note?: string): Promise<RunSnapshot> {
  try {
    return await runJob(taskId, decision, note);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const task = getTask(taskId);
    if (task && canTransition(task.status, "failed")) {
      return snapshot(transition(task.id, "failed", { reason: "uncaught" }), [], [], {
        error: { code: "uncaught", message },
      });
    }
    throw error;
  }
}

async function runJob(taskId: string, decision?: "approve" | "reject", note?: string): Promise<RunSnapshot> {
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
  const studio = task.policy.studio;
  const memories = listMemories(brand.id);
  const parsed = parseBrief(task.brief, {
    formatIds: studio?.formats,
    businessName: studio?.businessName ?? brand.profile.name,
  });
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
      photoPath: studio?.photoPath,
      photoIdea: studio?.photoFromPrompt ? studio.photoIdea : undefined,
      designStyle: studio?.designStyle,
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
    const targetApp: TargetApp = studio?.targetApp ?? "illustrator";
    // SVG + JSX are the product. PNG/PDF use a native rasterizer that can crash Node on some Macs.
    const formats: Array<"svg" | "png" | "jpg" | "pdf" | "jsx" | "psjsx" | "json"> = [
      "svg",
      "json",
      ...(targetApp === "photoshop" ? (["psjsx"] as const) : (["jsx"] as const)),
    ];
    if (process.env.CREATIVE_AGENT_RASTER === "1") {
      formats.push("png", "pdf");
      if (parsed.outputs.includes("jpg")) formats.push("jpg");
    }
    const exported = await invokeTool(
      "illustrator.export",
      { taskId: task.id, formats },
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

    const jsx = files.find((f) => f.endsWith("illustrator-job.jsx"));
    const psjsx = files.find((f) => f.endsWith("photoshop-job.jsx"));
    const detection = detectIllustrator();
    const illustratorRuntime = {
      attempted: false,
      ok: false,
      message:
        jsx
          ? `${detection.message} Files are ready — open illustrator-job.jsx in Illustrator (File → Scripts → Other Script). Each format is its own artboard. The studio does not wait for Illustrator, so this page will not freeze.`
          : detection.message,
    };
    const photoshopRuntime = {
      attempted: false,
      ok: false,
      message: psjsx
        ? "Open photoshop-job.jsx in Photoshop (File → Scripts). One document per format. This page does not wait for Photoshop."
        : "Adobe Photoshop is not driven from this host.",
    };
    if (targetApp === "photoshop") {
      illustratorRuntime.message = "Target app is Photoshop; Illustrator JSX was not written for this job.";
    }

    addMemory({
      brandId: brand.id,
      strength: "approved_concept",
      kind: "campaign",
      content: `Approved campaign: ${plan.copy.headline}`,
      sourceTaskId: task.id,
    });
    recordTool("brand.remember");
    span = endSpan(span, true, { files, illustratorRuntime, photoshopRuntime, targetApp });
    spans.push(span);
    const approved = transition(task.id, "approved");
    const result = { files, plan, qc, illustratorRuntime, photoshopRuntime, targetApp };
    saveResult(task.id, result);
    audit({ orgId: task.orgId, actor: "orchestrator", action: "task.approved", payload: { taskId: task.id } });
    return snapshot(approved, spans, toolsUsed, {
      brief: parsed,
      plan,
      qc,
      files,
      illustratorRuntime,
      photoshopRuntime,
      targetApp,
    });
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
