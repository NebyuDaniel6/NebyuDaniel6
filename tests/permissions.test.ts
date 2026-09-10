import { describe, expect, it } from "vitest";
import { boot } from "../src/bootstrap.ts";
import { invokeTool } from "../src/tools/registry.ts";
import { dataDir } from "../src/lib/paths.ts";
import path from "node:path";
import { useIsolatedDb } from "./helpers.ts";

useIsolatedDb();

describe("permissions", () => {
  it("blocks filesystem reads outside the data directory", async () => {
    boot();
    const result = await invokeTool("filesystem.read", { path: "/etc/passwd" }, {});
    expect(result.ok).toBe(false);
  });

  it("allows writes inside the data directory", async () => {
    boot();
    const target = path.join(dataDir(), "notes", "ok.txt");
    const result = await invokeTool("filesystem.write", { path: target, contents: "hello" }, {});
    expect(result.ok).toBe(true);
  });

  it("blocks computer.click when GUI control is not allowed", async () => {
    boot();
    process.env.CREATIVE_AGENT_ALLOW_COMPUTER_CONTROL = "0";
    const result = await invokeTool("computer.click", { x: 1, y: 1 }, {});
    expect(result.ok).toBe(false);
  });
});
