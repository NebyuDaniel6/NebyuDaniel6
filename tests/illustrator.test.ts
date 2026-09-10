import { describe, expect, it } from "vitest";
import { boot } from "../src/bootstrap.ts";
import { detectIllustrator } from "../src/connectors/illustrator/detect.ts";
import { getConnector } from "../src/connectors/types.ts";
import { executeExtendScript } from "../src/connectors/illustrator/backends/extendscript.ts";
import { emptyDocument, addArtboard, addLayer, append } from "../src/document/ops.ts";
import { rgb } from "../src/document/types.ts";
import { compileExtendScript } from "../src/document/export/jsx.ts";
import { useIsolatedDb } from "./helpers.ts";
import { invokeTool } from "../src/tools/registry.ts";

useIsolatedDb();

describe("illustrator connector", () => {
  it("reports that Illustrator is not installed on Linux", () => {
    const detection = detectIllustrator();
    expect(detection.installed).toBe(false);
    expect(detection.mechanism).toBe("none");
    expect(detection.message.toLowerCase()).toMatch(/linux|not/);
  });

  it("refuses to fake ExtendScript execution", () => {
    const result = executeExtendScript("/tmp/missing.jsx");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toMatch(/illustrator_/);
  });

  it("creates a document, inspects it, and exports source", async () => {
    boot();
    const connector = getConnector("illustrator");
    expect(connector?.health().backend).toBe("svg-document");
    const doc = emptyDocument("Test");
    const art = addArtboard(doc, { name: "Post", width: 1080, height: 1080, background: rgb(27, 58, 47) });
    const layer = addLayer(art, "Typography");
    append(layer, {
      id: "t1",
      type: "text",
      name: "Headline",
      role: "headline",
      x: 80,
      y: 200,
      visible: true,
      text: "Reservations are open.",
      fontFamily: "Inter",
      fontWeight: 700,
      fontStyle: "normal",
      fontSize: 64,
      lineHeight: 72,
      letterSpacing: 0,
      fill: rgb(255, 255, 255),
      width: 900,
      height: 160,
      align: "left",
    });
    const created = await invokeTool(
      "illustrator.create_document",
      { taskId: "task_test_1", document: doc },
      { taskId: "task_test_1" },
    );
    expect(created.ok).toBe(true);
    const inspect = await invokeTool("illustrator.inspect", { taskId: "task_test_1" }, { taskId: "task_test_1" });
    expect(inspect.ok).toBe(true);
    expect((inspect.output as { texts: number }).texts).toBe(1);
    const exported = await invokeTool(
      "illustrator.export",
      { taskId: "task_test_1", formats: ["svg", "json", "jsx"] },
      { taskId: "task_test_1" },
    );
    expect(exported.ok).toBe(true);
    const files = (exported.output as { files: string[] }).files;
    expect(files.some((f) => f.endsWith(".svg"))).toBe(true);
    expect(files.some((f) => f.endsWith(".jsx"))).toBe(true);
    const jsx = compileExtendScript(doc);
    expect(jsx).toContain("#target illustrator");
    expect(jsx).toContain("textFrames");
    expect(jsx).toContain("artboardRect");
  });
});
