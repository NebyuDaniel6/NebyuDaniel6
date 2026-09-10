import { describe, expect, it } from "vitest";
import { addArtboard, addLayer, append, emptyDocument } from "../src/document/ops.ts";
import { compileExtendScript, artboardDocumentOrigins } from "../src/document/export/jsx.ts";
import { compilePhotoshopScript } from "../src/document/export/photoshop-jsx.ts";
import { rgb } from "../src/document/types.ts";

describe("Illustrator artboard coordinates", () => {
  it("offsets each format onto its own artboard instead of stacking on artboard 1", () => {
    const doc = emptyDocument("Multi");
    const post = addArtboard(doc, { name: "Instagram post", width: 1080, height: 1080, background: rgb(20, 20, 20) });
    const story = addArtboard(doc, { name: "Instagram story", width: 1080, height: 1920, background: rgb(20, 20, 20) });
    const layer = addLayer(post, "Type");
    append(layer, {
      id: "r1",
      type: "rect",
      name: "Post mark",
      x: 80,
      y: 40,
      visible: true,
      width: 100,
      height: 20,
      fill: rgb(200, 160, 80),
      stroke: null,
      strokeWidth: 0,
      radius: 0,
    });
    const storyLayer = addLayer(story, "Type");
    append(storyLayer, {
      id: "r2",
      type: "rect",
      name: "Story mark",
      x: 80,
      y: 40,
      visible: true,
      width: 100,
      height: 20,
      fill: rgb(200, 160, 80),
      stroke: null,
      strokeWidth: 0,
      radius: 0,
    });

    const origins = artboardDocumentOrigins(doc);
    expect(origins[0]).toBe(0);
    expect(origins[1]).toBe(1080 + 120);
    expect(story.x).toBe(1080 + 120);

    const jsx = compileExtendScript(doc);
    expect(jsx).toContain("#target illustrator");
    expect(jsx).toContain("doc.artboards[0].artboardRect = [0, 1080, 1080, 0]");
    expect(jsx).toContain(`doc.artboards.add([${1080 + 120}, 1920, ${1080 + 120 + 1080}, 0])`);
    expect(jsx).toContain("Story mark");
    expect(jsx).toMatch(new RegExp(`pathItems\\.rectangle\\([^,]+,\\s*${origins[1]! + 80},`));
  });
});

describe("Photoshop script", () => {
  it("creates one document per format", () => {
    const doc = emptyDocument("PS");
    addArtboard(doc, { name: "Instagram post", width: 1080, height: 1080, background: rgb(20, 20, 20) });
    addArtboard(doc, { name: "Instagram story", width: 1080, height: 1920, background: rgb(20, 20, 20) });
    const ps = compilePhotoshopScript(doc);
    expect(ps).toContain("#target photoshop");
    expect(ps.match(/documents\.add/g)?.length).toBe(2);
    expect(ps).toContain("1080, 1920");
  });
});
