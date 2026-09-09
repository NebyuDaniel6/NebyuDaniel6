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
  .description("Create the sample organization, brand, and project.")
  .action(() => {
    const seeded = seedSampleWorld();
    console.log(JSON.stringify(seeded, null, 2));
  });

program
  .command("run")
  .description("Run a brief through the agent.")
  .requiredOption("--brief <text>", "Natural-language brief")
  .option("--org <id>", "Organization id")
  .option("--brand <id>", "Brand id")
  .option("--project <id>", "Project id")
  .option("--auto-approve", "Auto-approve direction and finals", false)
  .action(async (opts: { brief: string; org?: string; brand?: string; project?: string; autoApprove?: boolean }) => {
    boot();
    const seeded = opts.org && opts.brand && opts.project ? null : seedSampleWorld();
    const snapshot = await startJob({
      orgId: opts.org ?? seeded!.orgId,
      brandId: opts.brand ?? seeded!.brandId,
      projectId: opts.project ?? seeded!.projectId,
      brief: opts.brief,
      autoApprove: Boolean(opts.autoApprove),
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

await program.parseAsync(process.argv);
