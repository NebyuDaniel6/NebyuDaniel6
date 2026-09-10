import { DatabaseSync } from "node:sqlite";
import { dbPath, ensureDir, dataDir } from "../lib/paths.ts";

let singleton: DatabaseSync | null = null;

export function getDb(): DatabaseSync {
  if (singleton) return singleton;
  ensureDir(dataDir());
  singleton = new DatabaseSync(dbPath());
  singleton.exec("PRAGMA foreign_keys = ON;");
  singleton.exec("PRAGMA journal_mode = WAL;");
  singleton.exec("PRAGMA busy_timeout = 5000;");
  return singleton;
}

export function closeDb(): void {
  if (singleton) {
    singleton.close();
    singleton = null;
  }
}

export function resetDbForTests(): void {
  closeDb();
}
