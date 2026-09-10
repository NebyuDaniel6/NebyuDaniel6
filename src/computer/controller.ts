import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { dataDir, ensureDir } from "../lib/paths.ts";
import { err, ok, type Result } from "../lib/result.ts";
import { loadConfig } from "../config.ts";

export interface AppIdentity {
  name: string;
  windowId?: string;
}

function which(bin: string): string | null {
  try {
    return execFileSync("which", [bin], { encoding: "utf8" }).trim() || null;
  } catch {
    return null;
  }
}

export function identifyForegroundApp(): Result<AppIdentity> {
  if (!which("xdotool")) {
    return err("xdotool_missing", "xdotool is not installed; cannot identify the foreground application.");
  }
  if (!process.env.DISPLAY) {
    return err("no_display", "DISPLAY is not set; computer control has no screen.");
  }
  try {
    const windowId = execFileSync("xdotool", ["getactivewindow"], { encoding: "utf8" }).trim();
    const name = execFileSync("xdotool", ["getwindowname", windowId], { encoding: "utf8" }).trim();
    return ok({ name, windowId });
  } catch (error) {
    return err("identify_failed", error instanceof Error ? error.message : String(error));
  }
}

export function focusApplication(name: string): Result<{ windowId: string }> {
  if (!which("xdotool")) return err("xdotool_missing", "xdotool is not installed.");
  try {
    const windowId = execFileSync("xdotool", ["search", "--name", name], { encoding: "utf8" })
      .trim()
      .split("\n")[0];
    if (!windowId) return err("window_not_found", `No window matching ${name}.`);
    execFileSync("xdotool", ["windowactivate", "--sync", windowId]);
    return ok({ windowId });
  } catch (error) {
    return err("focus_failed", error instanceof Error ? error.message : String(error));
  }
}

export function clickAt(x: number, y: number): Result<true> {
  const gate = requireComputer();
  if (!gate.ok) return gate;
  execFileSync("xdotool", ["mousemove", String(x), String(y), "click", "1"]);
  return ok(true);
}

export function typeText(text: string): Result<true> {
  const gate = requireComputer();
  if (!gate.ok) return gate;
  execFileSync("xdotool", ["type", "--clearmodifiers", text]);
  return ok(true);
}

export function sendKey(key: string): Result<true> {
  const gate = requireComputer();
  if (!gate.ok) return gate;
  execFileSync("xdotool", ["key", key]);
  return ok(true);
}

export function captureScreenshot(): Result<{ path: string }> {
  if (!which("ffmpeg")) {
    return err("ffmpeg_missing", "ffmpeg is required to capture the screen.");
  }
  if (!process.env.DISPLAY) {
    return err("no_display", "DISPLAY is not set.");
  }
  const dir = ensureDir(path.join(dataDir(), "screenshots"));
  const file = path.join(dir, `shot-${Date.now()}.png`);
  try {
    execFileSync(
      "ffmpeg",
      ["-y", "-f", "x11grab", "-video_size", "1280x720", "-i", process.env.DISPLAY ?? ":1", "-frames:v", "1", file],
      { stdio: "ignore", timeout: 10_000 },
    );
    if (!fs.existsSync(file)) return err("screenshot_failed", "ffmpeg did not write a screenshot.");
    return ok({ path: file });
  } catch (error) {
    return err("screenshot_failed", error instanceof Error ? error.message : String(error));
  }
}

function requireComputer(): Result<true> {
  if (!loadConfig().computerControlAllowed) {
    return err("computer_control_disabled", "GUI input is disabled by policy.");
  }
  if (!which("xdotool")) return err("xdotool_missing", "xdotool is not installed.");
  return ok(true);
}
