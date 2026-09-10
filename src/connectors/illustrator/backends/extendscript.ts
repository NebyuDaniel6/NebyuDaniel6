import { execFileSync } from "node:child_process";
import os from "node:os";
import { existsSync } from "node:fs";
import { detectIllustrator } from "../detect.ts";
import { err, type Result } from "../../../lib/result.ts";

export function executeExtendScript(jsxPath: string): Result<{ stdout: string; method: string }> {
  const detection = detectIllustrator();
  if (!detection.installed) {
    return err("illustrator_unavailable", detection.message);
  }
  if (!detection.running) {
    return err(
      "illustrator_closed",
      "Adobe Illustrator is installed on this computer but is not running. Open Illustrator, then run: pnpm cli open-illustrator --jsx <path-to-illustrator-job.jsx>",
    );
  }
  if (!existsSync(jsxPath)) {
    return err("script_missing", `ExtendScript file not found: ${jsxPath}`);
  }
  if (os.platform() === "darwin") {
    const appleScript = [
      'tell application "Adobe Illustrator"',
      "  activate",
      `  do javascript file POSIX file ${JSON.stringify(jsxPath)}`,
      "end tell",
    ].join("\n");
    try {
      const stdout = execFileSync("osascript", ["-e", appleScript], {
        encoding: "utf8",
        timeout: 15_000,
      });
      return { ok: true, value: { stdout, method: "osascript-extendscript" } };
    } catch (error) {
      return err("extendscript_failed", error instanceof Error ? error.message : String(error), { retryable: true });
    }
  }
  if (os.platform() === "win32") {
    return err(
      "illustrator_windows_host_unverified",
      "Windows COM execution is implemented only when Illustrator is detected on Windows. This host is not Windows.",
    );
  }
  return err("illustrator_unavailable", detection.message);
}
