import fs from "node:fs";
import path from "node:path";
import { dataDir, ensureDir } from "./paths.ts";

export function lastErrorPath(): string {
  return path.join(ensureDir(dataDir()), "last-error.json");
}

export function recordLastError(message: string, extra?: unknown): void {
  try {
    fs.writeFileSync(
      lastErrorPath(),
      JSON.stringify(
        {
          ts: new Date().toISOString(),
          message,
          extra: extra === undefined ? undefined : String(extra).slice(0, 2000),
        },
        null,
        2,
      ),
    );
  } catch {
    /* ignore */
  }
}

export function readLastError(): { ts: string; message: string } | null {
  try {
    const raw = fs.readFileSync(lastErrorPath(), "utf8");
    return JSON.parse(raw) as { ts: string; message: string };
  } catch {
    return null;
  }
}
