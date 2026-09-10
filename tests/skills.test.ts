import { describe, expect, it } from "vitest";
import { loadSkills, selectSkills } from "../src/skills/loader.ts";

describe("skills", () => {
  it("loads versioned skills from disk", () => {
    const skills = loadSkills();
    expect(skills.length).toBeGreaterThanOrEqual(12);
    const illo = skills.find((s) => s.id === "illustrator");
    expect(illo?.version).toBe("1.0.0");
    expect(illo?.requires_connectors).toContain("illustrator");
  });

  it("selects social, real-estate, print, and illustrator for a campaign brief", () => {
    const selected = selectSkills(
      "Create a premium Instagram campaign for our real-estate project. Also an A4 poster PDF.",
      loadSkills(),
    ).map((s) => s.id);
    expect(selected).toContain("social-media");
    expect(selected).toContain("real-estate");
    expect(selected).toContain("print-design");
    expect(selected).toContain("illustrator");
    expect(selected).toContain("typography");
    expect(selected).not.toContain("photoshop");
  });
});
