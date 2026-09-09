import { z } from "zod";
import { getConnector } from "../../connectors/types.ts";
import { registerTool } from "../registry.ts";
import type { DesignDocument } from "../../document/types.ts";

export function registerIllustratorTools(): void {
  const connector = () => {
    const c = getConnector("illustrator");
    if (!c) throw new Error("Illustrator connector is not registered.");
    return c;
  };

  registerTool({
    name: "illustrator.create_document",
    description: "Create a design document through the Illustrator connector (svg-document or live Illustrator).",
    application: "illustrator",
    risk: "medium",
    permissions: [{ name: "illustrator.write", description: "Create documents" }],
    inputSchema: z.object({ taskId: z.string(), document: z.any() }),
    outputSchema: z.any(),
    async execute(input: { taskId: string; document: DesignDocument }) {
      const result = await connector().execute({ name: "create_document", input });
      if (!result.ok) throw new Error(result.error?.message ?? "create_document failed");
      return result.data;
    },
  });

  registerTool({
    name: "illustrator.inspect",
    description: "Inspect the current document state (artboards, layers, text, images).",
    application: "illustrator",
    risk: "low",
    permissions: [{ name: "illustrator.read", description: "Inspect documents" }],
    inputSchema: z.object({ taskId: z.string() }),
    outputSchema: z.any(),
    async execute(input: { taskId: string }) {
      const result = await connector().execute({ name: "inspect", input });
      if (!result.ok) throw new Error(result.error?.message ?? "inspect failed");
      return result.data;
    },
  });

  registerTool({
    name: "illustrator.export",
    description: "Export SVG, PNG, JPG, PDF, JSX, and canonical JSON.",
    application: "illustrator",
    risk: "medium",
    permissions: [{ name: "illustrator.export", description: "Export documents" }],
    inputSchema: z.object({
      taskId: z.string(),
      formats: z.array(z.enum(["svg", "png", "jpg", "pdf", "jsx", "json"])).optional(),
    }),
    outputSchema: z.any(),
    async execute(input: { taskId: string; formats?: string[] }) {
      const result = await connector().execute({ name: "export", input });
      if (!result.ok) throw new Error(result.error?.message ?? "export failed");
      return result.data;
    },
  });

  registerTool({
    name: "illustrator.save_source",
    description: "Persist the editable source (JSON + SVG + JSX).",
    application: "illustrator",
    risk: "medium",
    permissions: [{ name: "illustrator.write", description: "Save source" }],
    inputSchema: z.object({ taskId: z.string() }),
    outputSchema: z.any(),
    async execute(input: { taskId: string }) {
      const result = await connector().execute({
        name: "export",
        input: { taskId: input.taskId, formats: ["json", "svg", "jsx"] },
      });
      if (!result.ok) throw new Error(result.error?.message ?? "save_source failed");
      return result.data;
    },
  });
}
