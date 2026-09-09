import { describe, expect, it } from "vitest";
import { parseBrief } from "../src/agent/brief.ts";
import { planCampaign } from "../src/agent/planner.ts";
import { loadSkills, selectSkills } from "../src/skills/loader.ts";

describe("planning", () => {
  it("extracts formats, CTA, and a real-estate industry", () => {
    const brief = parseBrief(
      "Create a premium Instagram campaign for our real-estate project announcing that reservations are open. I need 1 Instagram post, 1 story, Facebook cover, A4 poster printable PDF.",
    );
    expect(brief.formats.map((f) => f.id)).toEqual(
      expect.arrayContaining(["instagram-post", "instagram-story", "facebook-cover", "a4-poster"]),
    );
    expect(brief.cta.toLowerCase()).toContain("reservations");
    expect(brief.industry).toBe("real-estate");
    expect(brief.outputs).toContain("svg");
  });

  it("builds a heuristic plan with copy and steps", () => {
    const brief = parseBrief("Launch Instagram posts for the restaurant. Book now.");
    const skills = selectSkills(brief.raw, loadSkills());
    const plan = planCampaign({
      brief,
      brand: {
        name: "Sample Kitchen",
        industry: "hospitality",
        colors: [],
        typefaces: [],
        toneOfVoice: "warm",
        imageryPreferences: [],
        visualStyle: "simple",
        restrictions: [],
        targetAudience: "",
        competitors: [],
      },
      skills,
    });
    expect(plan.planner).toBe("heuristic");
    expect(plan.copy.headline.length).toBeGreaterThan(0);
    expect(plan.steps.length).toBeGreaterThan(5);
    expect(plan.skills).toContain("social-media");
  });
});
