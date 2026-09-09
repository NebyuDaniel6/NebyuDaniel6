import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));

export const REPO_ROOT = path.resolve(here, "..", "..");

export function dataDir(): string {
  const fromEnv = process.env.CREATIVE_AGENT_DATA_DIR;
  return path.resolve(fromEnv && fromEnv.length > 0 ? fromEnv : path.join(REPO_ROOT, "data"));
}

export function ensureDir(dir: string): string {
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export function skillsDir(): string {
  return path.join(REPO_ROOT, "skills");
}

export function dbPath(): string {
  return path.join(ensureDir(dataDir()), "creative-agent.sqlite");
}

export function assetDir(orgId: string, brandId?: string): string {
  const parts = [dataDir(), "assets", orgId];
  if (brandId) parts.push(brandId);
  return ensureDir(path.join(...parts));
}

export function jobDir(taskId: string): string {
  return ensureDir(path.join(dataDir(), "jobs", taskId));
}

export function isInsideDataDir(target: string): boolean {
  const resolved = path.resolve(target);
  const root = path.resolve(dataDir());
  return resolved === root || resolved.startsWith(root + path.sep);
}
