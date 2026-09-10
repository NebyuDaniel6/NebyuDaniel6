import fs from "node:fs";
import { afterEach, beforeEach } from "vitest";
import { closeDb } from "../src/db/client.ts";

export const TEST_DIR = "./data/test";

export function resetTestData(): void {
  closeDb();
  fs.rmSync(TEST_DIR, { recursive: true, force: true });
  process.env.CREATIVE_AGENT_DATA_DIR = TEST_DIR;
}

export function useIsolatedDb(): void {
  beforeEach(() => {
    resetTestData();
  });
  afterEach(() => {
    closeDb();
  });
}
