import { describe, expect, it } from "vitest";
import { boot } from "../src/bootstrap.ts";
import { listTools, getTool } from "../src/tools/registry.ts";
import { useIsolatedDb } from "./helpers.ts";

useIsolatedDb();

describe("tools", () => {
  it("discovers registered tools", () => {
    boot();
    const names = listTools().map((t) => t.name);
    expect(names).toContain("illustrator.create_document");
    expect(names).toContain("brand.get");
    expect(names).toContain("computer.screenshot");
    expect(getTool("illustrator.export")?.application).toBe("illustrator");
  });
});
