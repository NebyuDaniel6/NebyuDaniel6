import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";
import { z } from "zod";
import { skillsDir } from "../lib/paths.ts";

export const SkillSchema = z.object({
  id: z.string(),
  version: z.string(),
  name: z.string(),
  category: z.string(),
  summary: z.string(),
  capabilities: z.array(z.string()),
  constraints: z.array(z.string()),
  requires_tools: z.array(z.string()).default([]),
  requires_connectors: z.array(z.string()).default([]),
  keywords: z.array(z.string()).default([]),
});

export type Skill = z.infer<typeof SkillSchema> & { instructions: string; dir: string };

export function loadSkills(root = skillsDir()): Skill[] {
  if (!fs.existsSync(root)) return [];
  const entries = fs.readdirSync(root, { withFileTypes: true });
  const skills: Skill[] = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const dir = path.join(root, entry.name);
    const yamlPath = path.join(dir, "skill.yaml");
    if (!fs.existsSync(yamlPath)) continue;
    const parsed = SkillSchema.parse(YAML.parse(fs.readFileSync(yamlPath, "utf8")));
    const instructionsFile = path.join(dir, "instructions.md");
    const instructions = fs.existsSync(instructionsFile) ? fs.readFileSync(instructionsFile, "utf8") : "";
    skills.push({ ...parsed, instructions, dir });
  }
  return skills.sort((a, b) => a.id.localeCompare(b.id));
}

export function selectSkills(briefText: string, skills: Skill[]): Skill[] {
  const text = briefText.toLowerCase();
  const selected: Skill[] = [];
  for (const skill of skills) {
    const always = ["graphic-design", "typography", "layout", "branding", "quality-control", "brand-guidelines"];
    if (always.includes(skill.id)) {
      selected.push(skill);
      continue;
    }
    const hit = skill.keywords.some((k) => text.includes(k.toLowerCase()));
    if (hit) selected.push(skill);
  }
  if (text.includes("illustrator") || text.includes("vector") || text.includes("editable") || selected.length > 0) {
    const illo = skills.find((s) => s.id === "illustrator");
    if (illo && !selected.includes(illo)) selected.push(illo);
  }
  return unique(selected);
}

function unique(skills: Skill[]): Skill[] {
  const seen = new Set<string>();
  return skills.filter((s) => {
    if (seen.has(s.id)) return false;
    seen.add(s.id);
    return true;
  });
}
