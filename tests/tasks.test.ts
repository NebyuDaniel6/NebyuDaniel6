import { describe, expect, it } from "vitest";
import { boot } from "../src/bootstrap.ts";
import { createOrg, createProject } from "../src/tenant/service.ts";
import { createBrand } from "../src/brand/service.ts";
import { canTransition } from "../src/tasks/states.ts";
import { createTask, transition } from "../src/tasks/engine.ts";
import { useIsolatedDb } from "./helpers.ts";

useIsolatedDb();

describe("task state machine", () => {
  it("allows the production path and rejects illegal jumps", () => {
    expect(canTransition("planning", "concept")).toBe(true);
    expect(canTransition("approved", "production")).toBe(false);
    boot();
    const org = createOrg("O");
    const brand = createBrand(org.id, "B", {
      name: "B",
      industry: "x",
      colors: [],
      typefaces: [],
      toneOfVoice: "",
      imageryPreferences: [],
      visualStyle: "",
      restrictions: [],
      targetAudience: "",
      competitors: [],
    });
    const project = createProject(org.id, brand.id, "P");
    const task = createTask({
      orgId: org.id,
      brandId: brand.id,
      projectId: project.id,
      title: "t",
      brief: "b",
      policy: { direction: "auto", final: "auto" },
    });
    const next = transition(task.id, "concept");
    expect(next.status).toBe("concept");
    expect(() => transition(task.id, "export")).toThrow(/Illegal transition/);
  });
});
