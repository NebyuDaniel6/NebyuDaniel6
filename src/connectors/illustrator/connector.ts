import type { ApplicationConnector, ConnectorHealth, ConnectorOperation, ConnectorResult } from "../types.ts";
import { detectIllustrator } from "./detect.ts";
import { createSession, exportSession, getSession, reopenFromDisk } from "./backends/svg-engine.ts";
import { executeExtendScript } from "./backends/extendscript.ts";
import { illustratorViaComputer } from "./backends/computer-control.ts";
import { inspectDocument } from "../../document/ops.ts";
import type { DesignDocument } from "../../document/types.ts";

const CAPABILITIES = [
  "create_document",
  "define_document_size",
  "create_artboards",
  "create_text",
  "edit_text",
  "choose_fonts",
  "set_font_sizes",
  "set_colors",
  "create_shapes",
  "create_paths",
  "import_images",
  "position_assets",
  "resize_assets",
  "align_objects",
  "distribute_objects",
  "group_objects",
  "create_clipping_masks",
  "layers",
  "name_layers",
  "export_png",
  "export_jpg",
  "export_pdf",
  "save_editable_source",
  "reopen_existing",
  "inspect_document_state",
];

export function illustratorConnector(): ApplicationConnector {
  return {
    id: "illustrator",
    application: "Adobe Illustrator",
    health(): ConnectorHealth {
      const detection = detectIllustrator();
      const backend = detection.installed && detection.running ? "extendscript" : "svg-document";
      return {
        available: true,
        backend,
        application: "Adobe Illustrator",
        version: null,
        message: detection.message,
        capabilities: CAPABILITIES,
      };
    },
    async execute(op: ConnectorOperation): Promise<ConnectorResult> {
      const health = this.health();
      try {
        switch (op.name) {
          case "health":
            return { ok: true, operation: op.name, backend: health.backend, data: health as unknown as Record<string, unknown> };
          case "create_document": {
            const taskId = String(op.input.taskId ?? "");
            const document = op.input.document as DesignDocument;
            if (!taskId || !document) {
              return fail(op.name, health.backend, "invalid_input", "taskId and document are required.");
            }
            const session = createSession(taskId, document);
            return {
              ok: true,
              operation: op.name,
              backend: health.backend,
              data: { inspect: inspectDocument(session.document), dir: session.dir },
            };
          }
          case "inspect": {
            const taskId = String(op.input.taskId ?? "");
            const live = getSession(taskId);
            if (live) {
              return {
                ok: true,
                operation: op.name,
                backend: health.backend,
                data: inspectDocument(live.document) as unknown as Record<string, unknown>,
              };
            }
            const reopened = reopenFromDisk(taskId);
            if (!reopened.ok) return fail(op.name, health.backend, reopened.error.code, reopened.error.message);
            return {
              ok: true,
              operation: op.name,
              backend: health.backend,
              data: inspectDocument(reopened.value.document) as unknown as Record<string, unknown>,
            };
          }
          case "export": {
            const taskId = String(op.input.taskId ?? "");
            const formats = (op.input.formats as Array<"svg" | "png" | "jpg" | "pdf" | "jsx" | "json">) ?? [
              "svg",
              "png",
              "pdf",
              "jsx",
              "json",
            ];
            const result = await exportSession(taskId, formats);
            if (!result.ok) return fail(op.name, health.backend, result.error.code, result.error.message, result.error.retryable);
            return { ok: true, operation: op.name, backend: health.backend, data: result.value };
          }
          case "run_extendscript": {
            const jsxPath = String(op.input.jsxPath ?? "");
            const result = executeExtendScript(jsxPath);
            if (!result.ok) {
              return fail(op.name, "extendscript", result.error.code, result.error.message, result.error.retryable);
            }
            return { ok: true, operation: op.name, backend: "extendscript", data: result.value };
          }
          case "computer_fallback": {
            const result = illustratorViaComputer();
            if (!result.ok) return fail(op.name, "computer-control", result.error.code, result.error.message);
            return { ok: true, operation: op.name, backend: "computer-control", data: result.value };
          }
          default:
            return fail(op.name, health.backend, "unsupported_operation", `Illustrator connector has no operation ${op.name}.`);
        }
      } catch (error) {
        return fail(op.name, health.backend, "connector_error", error instanceof Error ? error.message : String(error));
      }
    },
  };
}

function fail(
  operation: string,
  backend: string,
  code: string,
  message: string,
  retryable = false,
): ConnectorResult {
  return { ok: false, operation, backend, error: { code, message, retryable } };
}
