import { execFileSync } from "node:child_process";
import os from "node:os";
import { existsSync } from "node:fs";
import { detectIllustrator } from "../detect.ts";
import { err, type Result } from "../../../lib/result.ts";

export function executeExtendScript(jsxPath: string): Result<{ stdout: string }> {
  const detection = detectIllustrator();
  if (!detection.installed) {
    return err("illustrator_unavailable", detection.message);
  }
  if (!detection.running) {
    return err("illustrator_closed", "Adobe Illustrator is installed but not running. Open it, then retry.");
  }
  if (!existsSync(jsxPath)) {
    return err("script_missing", `ExtendScript file not found: ${jsxPath}`);
  }
  if (os.platform() === "darwin") {
    try {
      const stdout = execFileSync(
        "osascript",
        ["-e", `tell application "Adobe Illustrator" to do javascript file POSIX file ${JSON.stringify(jsxPath)}`],
        { encoding: "utf8", timeout: 60_000 },
      );
      return { ok: true, value: { stdout } };
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
