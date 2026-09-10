import { loadConfig } from "../config.ts";
import { err, ok, type Result } from "../lib/result.ts";
import type { Tool, ToolContext } from "./types.ts";

const DEFAULT_ALLOW = new Set([
  "brand.get",
  "brand.update",
  "brand.remember",
  "asset.search",
  "asset.get",
  "asset.ingest",
  "filesystem.read",
  "filesystem.write",
  "illustrator.create_document",
  "illustrator.inspect",
  "illustrator.export",
  "illustrator.save_source",
  "illustrator.run_extendscript",
  "computer.screenshot",
  "computer.identify_application",
]);

export function assertAllowed(tool: Tool<unknown, unknown>, ctx: ToolContext): Result<true> {
  const config = loadConfig();
    if (tool.application === "computer" && !config.computerControlAllowed) {
      if (["computer.click", "computer.type", "computer.key", "computer.scroll"].includes(tool.name)) {
        return err(
          "permission_denied",
          "Computer control is disabled. Set CREATIVE_AGENT_ALLOW_COMPUTER_CONTROL=1 to enable GUI fallback.",
        );
      }
    }
    if (config.computerControlAllowed && tool.application === "computer") {
      return ok(true);
    }
  if (tool.risk === "destructive" && !ctx.confirmDestructive) {
    return err("confirmation_required", `Tool ${tool.name} is destructive and requires confirmation.`);
  }
  if (!DEFAULT_ALLOW.has(tool.name) && tool.risk === "high") {
    return err("not_allowlisted", `Tool ${tool.name} is not on the default allowlist.`);
  }
  return ok(true);
}
