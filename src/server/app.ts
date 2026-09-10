import { serve as nodeServe } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import path from "node:path";
import fs from "node:fs";
import { REPO_ROOT } from "../lib/paths.ts";
import { probeEnvironment } from "../env/probe.ts";
import { seedSampleWorld } from "../seed.ts";
import { continueJob, startJob, hydrateSnapshot } from "../agent/orchestrator.ts";
import { listOrgs, listProjects } from "../tenant/service.ts";
import { listBrands } from "../brand/service.ts";
import { listTasks } from "../tasks/engine.ts";
import { listTools } from "../tools/registry.ts";
import { loadSkills } from "../skills/loader.ts";
import { getConnector } from "../connectors/types.ts";
import { searchAssets } from "../assets/service.ts";
import { ingestAsset } from "../assets/service.ts";
import { log } from "../lib/logger.ts";
import { boot } from "../bootstrap.ts";
import type { StudioInput } from "../studio/types.ts";
import { readLastError, recordLastError } from "../lib/last-error.ts";
import { publicSnapshot, STUDIO_VERSION } from "./payload.ts";
import { respondError, respondJson } from "./respond.ts";

export function createApp(): Hono {
  boot();
  const app = new Hono();

  app.onError((err, c) => {
    const message = err instanceof Error ? err.message : String(err);
    recordLastError(message);
    log.error("http_error", { message });
    return c.json({ error: message, version: STUDIO_VERSION }, 500);
  });

  app.get("/api/health", (c) =>
    c.json({
      ok: true,
      service: "creative-agent",
      version: STUDIO_VERSION,
      lastError: readLastError(),
    }),
  );
  app.get("/api/doctor", (c) => c.json(probeEnvironment()));
  app.get("/api/tools", (c) => c.json(listTools()));
  app.get("/api/skills", (c) => c.json(loadSkills().map((s) => ({ id: s.id, version: s.version, name: s.name, summary: s.summary }))));
  app.get("/api/connectors", (c) => {
    const illustrator = getConnector("illustrator");
    return c.json({
      illustrator: illustrator?.health() ?? null,
      photoshop: {
        available: false,
        backend: "extendscript-file",
        application: "Adobe Photoshop",
        message:
          "Photoshop is not on this Linux host. Jobs write photoshop-job.jsx (one document per format) to open on a Mac.",
      },
    });
  });
  app.post("/api/seed", (c) => c.json(seedSampleWorld()));
  app.get("/api/orgs", (c) => {
    const orgs = listOrgs().map((org) => ({
      ...org,
      brands: listBrands(org.id),
      projects: listProjects(org.id),
    }));
    return c.json(orgs);
  });
  app.get("/api/orgs/:orgId/tasks", (c) => c.json(listTasks(c.req.param("orgId"))));
  app.get("/api/orgs/:orgId/assets", (c) => {
    return c.json(searchAssets({ orgId: c.req.param("orgId"), query: c.req.query("q") ?? undefined }));
  });
  app.get("/api/debug/last-error", (c) => respondJson(c, { lastError: readLastError() }));
  app.get("/api/tasks/:taskId", (c) => {
    try {
      const snap = hydrateSnapshot(c.req.param("taskId"));
      if (!snap) return respondJson(c, { error: "not_found" }, 404);
      return respondJson(c, publicSnapshot(snap));
    } catch (error) {
      return respondError(c, "GET /api/tasks/:id", error);
    }
  });
  app.post("/api/jobs", async (c) => {
    let body: {
      brief?: string;
      autoApprove?: boolean;
      businessName?: string;
      primaryColor?: string;
      accentColor?: string;
      fontStyle?: string;
      designStyle?: string;
      targetApp?: string;
      formats?: string[];
      photoFromPrompt?: boolean;
      photoBase64?: string;
      photoFilename?: string;
      photoMime?: string;
      orgId?: string;
      brandId?: string;
      projectId?: string;
    };
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: "Invalid JSON body" }, 400);
    }
    if (!body.brief?.trim()) return c.json({ error: "brief_required" }, 400);
    const studio: StudioInput = {
      businessName: body.businessName,
      primaryColor: body.primaryColor,
      accentColor: body.accentColor,
      fontStyle: body.fontStyle,
      designStyle: body.designStyle,
      targetApp: body.targetApp,
      formats: body.formats,
      photoFromPrompt: body.photoFromPrompt,
      photoBase64: body.photoBase64,
      photoFilename: body.photoFilename,
      photoMime: body.photoMime,
    };
    try {
      const snapshot = await startJob({
        brief: body.brief,
        autoApprove: body.autoApprove,
        studio,
        orgId: body.orgId,
        brandId: body.brandId,
        projectId: body.projectId,
      });
      return respondJson(c, publicSnapshot(snapshot));
    } catch (error) {
      return respondError(c, "POST /api/jobs", error);
    }
  });
  app.post("/api/tasks/:taskId/decision", async (c) => {
    try {
      const body = await c.req.json<{ decision: "approve" | "reject"; note?: string }>();
      const snapshot = await continueJob(c.req.param("taskId"), body.decision, body.note);
      return respondJson(c, publicSnapshot(snapshot));
    } catch (error) {
      return respondError(c, "POST /api/tasks/:id/decision", error);
    }
  });
  app.post("/api/assets", async (c) => {
    const body = await c.req.json<{
      orgId: string;
      brandId?: string;
      filename: string;
      mime: string;
      kind: string;
      description: string;
      contentsBase64: string;
    }>();
    const asset = ingestAsset({
      orgId: body.orgId,
      brandId: body.brandId,
      filename: body.filename,
      mime: body.mime,
      kind: body.kind as "image",
      description: body.description,
      bytes: Buffer.from(body.contentsBase64, "base64"),
    });
    return c.json(asset);
  });
  app.get("/api/files", (c) => {
    const file = c.req.query("path");
    if (!file || !file.startsWith(path.resolve(process.env.CREATIVE_AGENT_DATA_DIR ?? path.join(REPO_ROOT, "data")))) {
      const dataRoot = path.resolve(process.env.CREATIVE_AGENT_DATA_DIR ?? path.join(REPO_ROOT, "data"));
      if (!file || !path.resolve(file).startsWith(dataRoot)) {
        return c.json({ error: "forbidden" }, 403);
      }
    }
    const resolved = path.resolve(file!);
    if (!fs.existsSync(resolved)) return c.json({ error: "missing" }, 404);
    const buf = fs.readFileSync(resolved);
    const ext = path.extname(resolved);
    const mime =
      ext === ".svg"
        ? "image/svg+xml"
        : ext === ".png"
          ? "image/png"
          : ext === ".pdf"
            ? "application/pdf"
            : ext === ".jsx"
              ? "text/plain"
            : ext === ".json"
              ? "application/json"
              : "application/octet-stream";
    return new Response(buf, { headers: { "content-type": mime } });
  });

  app.use("/*", serveStatic({ root: path.join(REPO_ROOT, "public") }));
  return app;
}

export async function serve(port: number): Promise<void> {
  const app = createApp();
  process.on("uncaughtException", (err) => {
    recordLastError(`uncaughtException: ${err instanceof Error ? err.message : String(err)}`);
    log.error("uncaughtException", { message: err instanceof Error ? err.message : String(err) });
  });
  process.on("unhandledRejection", (err) => {
    recordLastError(`unhandledRejection: ${err instanceof Error ? err.message : String(err)}`);
    log.error("unhandledRejection", { message: err instanceof Error ? err.message : String(err) });
  });
  log.info("listening", { port, version: STUDIO_VERSION });
  nodeServe({ fetch: app.fetch, port, hostname: "0.0.0.0" });
  console.log(`Creative Studio ${STUDIO_VERSION} → http://127.0.0.1:${port}`);
}
