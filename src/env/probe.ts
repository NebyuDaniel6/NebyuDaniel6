import { existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import os from "node:os";
import { loadConfig } from "../config.ts";

export interface EnvironmentReport {
  os: {
    platform: NodeJS.Platform;
    release: string;
    arch: string;
    linux: boolean;
  };
  runtimes: Record<string, string | null>;
  display: string | null;
  computerControl: {
    xdotool: boolean;
    ffmpeg: boolean;
    xvfb: boolean;
    displaySet: boolean;
  };
  fonts: string[];
  applications: Record<string, { installed: boolean; path: string | null; notes: string }>;
  llmKeysConfigured: boolean;
  computerControlAllowed: boolean;
  blockers: string[];
}

function which(bin: string): string | null {
  try {
    const out = execFileSync("which", [bin], { encoding: "utf8" }).trim();
    return out.length > 0 ? out : null;
  } catch {
    return null;
  }
}

function version(bin: string, args: string[]): string | null {
  try {
    return execFileSync(bin, args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] })
      .split("\n")[0]
      ?.trim() ?? null;
  } catch {
    return null;
  }
}

const ILLUSTRATOR_PATHS = [
  "/Applications/Adobe Illustrator 2025/Adobe Illustrator.app",
  "/Applications/Adobe Illustrator 2024/Adobe Illustrator.app",
  "/Applications/Adobe Illustrator.app",
  "C:\\Program Files\\Adobe\\Adobe Illustrator 2025\\Support Files\\Contents\\Windows\\Illustrator.exe",
  "C:\\Program Files\\Adobe\\Adobe Illustrator 2024\\Support Files\\Contents\\Windows\\Illustrator.exe",
];

function detectApp(name: string, binaries: string[], extraPaths: string[], notes: string): {
  installed: boolean;
  path: string | null;
  notes: string;
} {
  const envPath = process.env[`${name.toUpperCase().replace(/\s+/g, "_")}_PATH`];
  const candidates = [envPath, ...binaries.map(which), ...extraPaths].filter(
    (p): p is string => typeof p === "string" && existsSync(p),
  );
  const path = candidates[0] ?? null;
  return {
    installed: path !== null,
    path,
    notes: path ? notes : `${name} was not found on this host. ${notes}`,
  };
}

export function probeEnvironment(): EnvironmentReport {
  const config = loadConfig();
  const illustrator = detectApp(
    "Illustrator",
    ["illustrator"],
    [config.illustratorPath, ...ILLUSTRATOR_PATHS].filter((p): p is string => Boolean(p)),
    "Illustrator automation requires macOS (AppleScript/ExtendScript) or Windows (COM/CEP). This Linux host cannot run the Adobe desktop app.",
  );

  const applications = {
    illustrator,
    photoshop: detectApp("Photoshop", ["photoshop"], [], "Not installed."),
    indesign: detectApp("InDesign", ["indesign"], [], "Not installed."),
    figma: detectApp("Figma", ["figma"], [], "Not installed."),
    blender: detectApp("Blender", ["blender"], [], "Not installed."),
    inkscape: detectApp("Inkscape", ["inkscape"], [], "Not installed."),
    gimp: detectApp("GIMP", ["gimp"], [], "Not installed."),
    canva: detectApp("Canva", ["canva"], [], "Not installed."),
  };

  const blockers: string[] = [];
  if (!illustrator.installed) {
    blockers.push(
      "Adobe Illustrator is not installed. Live Illustrator execution is unavailable. The svg-document backend plus JSX compilation remain active.",
    );
  }
  if (!config.llm.openaiKeyPresent && !config.llm.anthropicKeyPresent) {
    blockers.push("No LLM API key configured. Heuristic planner will run.");
  }

  return {
    os: {
      platform: os.platform(),
      release: os.release(),
      arch: os.arch(),
      linux: os.platform() === "linux",
    },
    runtimes: {
      node: process.version,
      python: version("python3", ["--version"]),
      ffmpeg: which("ffmpeg"),
      chrome: which("google-chrome"),
    },
    display: process.env.DISPLAY ?? null,
    computerControl: {
      xdotool: Boolean(which("xdotool")),
      ffmpeg: Boolean(which("ffmpeg")),
      xvfb: Boolean(which("Xvfb")),
      displaySet: Boolean(process.env.DISPLAY),
    },
    fonts: ["Inter", "Public Sans", "Source Sans 3", "JetBrains Mono"],
    applications,
    llmKeysConfigured: config.llm.openaiKeyPresent || config.llm.anthropicKeyPresent,
    computerControlAllowed: config.computerControlAllowed,
    blockers,
  };
}
