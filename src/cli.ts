import { Command } from "commander";
import { boot } from "./bootstrap.ts";
import { probeEnvironment } from "./env/probe.ts";
import { seedSampleWorld } from "./seed.ts";
import { startJob, continueJob } from "./agent/orchestrator.ts";
import { loadConfig } from "./config.ts";
import { serve } from "./server/app.ts";
import { listTools } from "./tools/registry.ts";
import { loadSkills } from "./skills/loader.ts";
import { getConnector } from "./connectors/types.ts";
import { detectIllustrator } from "./connectors/illustrator/detect.ts";

const program = new Command();
program.name("creative-agent").description("Autonomous AI creative department").version("0.1.0");

program
  .command("doctor")
  .description("Probe the real environment and print capabilities (no secrets).")
  .action(() => {
    boot();
    const report = probeEnvironment();
    console.log(JSON.stringify({ ...report, illustrator: detectIllustrator(), tools: listTools().map((t) => t.name), skills: loadSkills().map((s) => s.id) }, null, 2));
  });

program
  .command("seed")
  .description("Optional: create the old sample brand (not required to use the studio).")
  .action(() => {
    const seeded = seedSampleWorld();
    console.log(JSON.stringify(seeded, null, 2));
  });

program
  .command("run")
  .description("Run a brief through the studio (colors, type, style, Illustrator or Photoshop).")
  .requiredOption("--brief <text>", "Natural-language brief")
  .option("--business <name>", "Business name")
  .option("--color <hex>", "Primary color")
  .option("--accent <hex>", "Accent color")
  .option("--font <style>", "modern-sans | elegant-serif | bold-display | friendly")
  .option("--style <design>", "editorial | bold | minimal | warm | luxury")
  .option("--app <name>", "illustrator | photoshop", "illustrator")
  .option("--formats <csv>", "Comma-separated format ids")
  .option("--photo-from-prompt", "Reserve a photo well from the brief (does not fake a photo)", false)
  .option("--org <id>", "Optional internal organization id")
  .option("--brand <id>", "Optional internal brand id")
  .option("--project <id>", "Optional internal project id")
  .option("--auto-approve", "Auto-approve direction and finals", false)
  .action(async (opts: {
    brief: string;
    business?: string;
    color?: string;
    accent?: string;
    font?: string;
    style?: string;
    app?: string;
    formats?: string;
    photoFromPrompt?: boolean;
    org?: string;
    brand?: string;
    project?: string;
    autoApprove?: boolean;
  }) => {
    boot();
    const snapshot = await startJob({
      brief: opts.brief,
      autoApprove: Boolean(opts.autoApprove),
      orgId: opts.org,
      brandId: opts.brand,
      projectId: opts.project,
      studio: {
        businessName: opts.business,
        primaryColor: opts.color,
        accentColor: opts.accent,
        fontStyle: opts.font,
        designStyle: opts.style,
        targetApp: opts.app,
        formats: opts.formats ? opts.formats.split(",").map((s) => s.trim()) : undefined,
        photoFromPrompt: Boolean(opts.photoFromPrompt),
      },
    });
    let current = snapshot;
    if (current.waitingFor === "direction") {
      current = await continueJob(current.task.id, "approve", "CLI auto-continue after direction");
    }
    if (current.waitingFor === "final") {
      current = await continueJob(current.task.id, "approve", "CLI auto-continue after final");
    }
    console.log(
      JSON.stringify(
        {
          taskId: current.task.id,
          status: current.task.status,
          planner: current.plan?.planner,
          files: current.files,
          qc: current.qc,
          illustratorRuntime: current.illustratorRuntime,
          error: current.error,
          toolsUsed: current.trace.toolsUsed,
          waitingFor: current.waitingFor,
        },
        null,
        2,
      ),
    );
    if (current.task.status === "failed") process.exitCode = 1;
  });

program
  .command("serve")
  .description("Start the operator console and API.")
  .option("--port <n>", "Port", String(loadConfig().port))
  .action(async (opts: { port: string }) => {
    boot();
    await serve(Number(opts.port));
  });

program
  .command("tools")
  .description("List registered tools.")
  .action(() => {
    boot();
    console.log(JSON.stringify(listTools(), null, 2));
  });

program
  .command("skills")
  .description("List loaded skills.")
  .action(() => {
    console.log(JSON.stringify(loadSkills().map((s) => ({ id: s.id, version: s.version, name: s.name })), null, 2));
  });

program
  .command("connectors")
  .description("Show connector health.")
  .action(() => {
    boot();
    const illo = getConnector("illustrator");
    console.log(JSON.stringify(illo?.health() ?? { error: "missing" }, null, 2));
  });

program
  .command("open-illustrator")
  .description("Rebuild a compiled .jsx inside Adobe Illustrator on THIS computer (macOS). Does not move the mouse.")
  .requiredOption("--jsx <path>", "Path to illustrator-job.jsx")
  .action(async (opts: { jsx: string }) => {
    boot();
    const { invokeTool } = await import("./tools/registry.ts");
    const result = await invokeTool("illustrator.run_extendscript", { jsxPath: opts.jsx }, {});
    console.log(JSON.stringify(result, null, 2));
    if (!result.ok) process.exitCode = 1;
  });

await program.parseAsync(process.argv);
