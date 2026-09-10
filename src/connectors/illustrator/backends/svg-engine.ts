import fs from "node:fs";
import path from "node:path";
import type { DesignDocument } from "../../../document/types.ts";
import { inspectDocument } from "../../../document/ops.ts";
import { writeDocumentSvgs } from "../../../document/export/svg.ts";
import { exportArtboardRaster } from "../../../document/export/png.ts";
import { exportDocumentPdf } from "../../../document/export/pdf.ts";
import { writeExtendScript } from "../../../document/export/jsx.ts";
import { writePhotoshopScript } from "../../../document/export/photoshop-jsx.ts";
import { jobDir } from "../../../lib/paths.ts";
import { err, ok, type Result } from "../../../lib/result.ts";

export interface SvgEngineSession {
  document: DesignDocument;
  dir: string;
}

const sessions = new Map<string, SvgEngineSession>();

export function createSession(taskId: string, document: DesignDocument): SvgEngineSession {
  const dir = jobDir(taskId);
  const session = { document, dir };
  sessions.set(taskId, session);
  fs.writeFileSync(path.join(dir, "document.json"), JSON.stringify(document, null, 2));
  return session;
}

export function getSession(taskId: string): SvgEngineSession | undefined {
  return sessions.get(taskId);
}

export function reopenFromDisk(taskId: string): Result<SvgEngineSession> {
  const file = path.join(jobDir(taskId), "document.json");
  if (!fs.existsSync(file)) {
    return err("document_not_found", `No saved document for task ${taskId}.`);
  }
  const document = JSON.parse(fs.readFileSync(file, "utf8")) as DesignDocument;
  const session = { document, dir: path.dirname(file) };
  sessions.set(taskId, session);
  return ok(session);
}

export async function exportSession(
  taskId: string,
  formats: Array<"svg" | "png" | "jpg" | "pdf" | "jsx" | "psjsx" | "json">,
): Promise<Result<{ files: string[]; inspect: ReturnType<typeof inspectDocument> }>> {
  const session = sessions.get(taskId) ?? reopenFromDisk(taskId);
  if (!session || ("ok" in session && session.ok === false)) {
    const failed = session as Result<SvgEngineSession>;
    if (failed && "ok" in failed && !failed.ok) return failed;
    return err("no_session", "No Illustrator/svg-document session is open.");
  }
  const live = "ok" in session && session.ok ? session.value : (session as SvgEngineSession);
  const dir = live.dir;
  const files: string[] = [];
  const wants = new Set(formats);

  if (wants.has("json") || wants.size === 0) {
    const p = path.join(dir, "document.json");
    fs.writeFileSync(p, JSON.stringify(live.document, null, 2));
    files.push(p);
  }
  if (wants.has("svg")) {
    files.push(...writeDocumentSvgs(live.document, path.join(dir, "svg")));
  }
  if (wants.has("jsx")) {
    files.push(writeExtendScript(live.document, path.join(dir, "illustrator-job.jsx")));
  }
  if (wants.has("psjsx")) {
    files.push(writePhotoshopScript(live.document, path.join(dir, "photoshop-job.jsx")));
  }
  if (wants.has("png") || wants.has("jpg")) {
    const rasterDir = path.join(dir, "raster");
    fs.mkdirSync(rasterDir, { recursive: true });
    for (const [i, art] of live.document.artboards.entries()) {
      if (wants.has("png")) {
        files.push(exportArtboardRaster(art, path.join(rasterDir, `${String(i + 1).padStart(2, "0")}.png`), "png"));
      }
      if (wants.has("jpg")) {
        files.push(exportArtboardRaster(art, path.join(rasterDir, `${String(i + 1).padStart(2, "0")}.jpg`), "jpeg"));
      }
    }
  }
  if (wants.has("pdf")) {
    files.push(await exportDocumentPdf(live.document, path.join(dir, "campaign.pdf")));
  }
  return ok({ files, inspect: inspectDocument(live.document) });
}
