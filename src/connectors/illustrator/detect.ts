import { existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import os from "node:os";
import { loadConfig } from "../../config.ts";

export interface IllustratorDetection {
  installed: boolean;
  running: boolean;
  path: string | null;
  platform: NodeJS.Platform;
  mechanism: "extendscript-macos" | "extendscript-windows" | "none";
  message: string;
}

function which(bin: string): string | null {
  try {
    return execFileSync("which", [bin], { encoding: "utf8" }).trim() || null;
  } catch {
    return null;
  }
}

function processRunning(pattern: string): boolean {
  try {
    const out = execFileSync("ps", ["-A", "-o", "comm="], { encoding: "utf8" });
    return out.toLowerCase().includes(pattern.toLowerCase());
  } catch {
    return false;
  }
}

export function detectIllustrator(): IllustratorDetection {
  const config = loadConfig();
  const platform = os.platform();
  const candidates = [
    config.illustratorPath,
    which("illustrator"),
    "/Applications/Adobe Illustrator 2025/Adobe Illustrator.app",
    "/Applications/Adobe Illustrator 2024/Adobe Illustrator.app",
    "/Applications/Adobe Illustrator.app",
  ].filter((p): p is string => typeof p === "string" && existsSync(p));

  const installed = candidates.length > 0;
  const running = processRunning("illustrator");
  const mechanism =
    platform === "darwin" ? "extendscript-macos" : platform === "win32" ? "extendscript-windows" : "none";

  let message: string;
  if (platform === "linux") {
    message =
      "Adobe Illustrator is not available on Linux. The Illustrator connector uses the svg-document backend and compiles ExtendScript for later execution on macOS/Windows.";
  } else if (!installed) {
    message = "Adobe Illustrator is not installed at any known path. Set ILLUSTRATOR_PATH if it lives elsewhere.";
  } else if (!running) {
    message = "Illustrator is installed but not running. The ExtendScript backend will report that and refuse to fake success.";
  } else {
    message = "Illustrator appears installed and running. ExtendScript backend can be used.";
  }

  return {
    installed,
    running: running && installed,
    path: candidates[0] ?? null,
    platform,
    mechanism: installed ? mechanism : "none",
    message,
  };
}
