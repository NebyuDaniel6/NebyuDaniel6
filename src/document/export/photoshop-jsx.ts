import fs from "node:fs";
import type { DesignDocument, RgbColor, SceneNode } from "../types.ts";

function rgb(c: RgbColor): string {
  return `[${c.r}, ${c.g}, ${c.b}]`;
}

/**
 * Photoshop ExtendScript has no reliable multi-size artboard API.
 * This script creates one Photoshop document per format — that is the correct PS workflow.
 */
export function compilePhotoshopScript(doc: DesignDocument): string {
  const lines: string[] = [];
  lines.push(`#target photoshop`);
  lines.push(`app.preferences.rulerUnits = Units.PIXELS;`);
  lines.push(`app.displayDialogs = DialogModes.NO;`);
  lines.push(`function fillRect(doc, name, x, y, w, h, rgbArr) {`);
  lines.push(`  var layer = doc.artLayers.add();`);
  lines.push(`  layer.name = name;`);
  lines.push(`  doc.selection.select([[x,y],[x+w,y],[x+w,y+h],[x,y+h]]);`);
  lines.push(`  var c = new SolidColor();`);
  lines.push(`  c.rgb.red = rgbArr[0]; c.rgb.green = rgbArr[1]; c.rgb.blue = rgbArr[2];`);
  lines.push(`  doc.selection.fill(c);`);
  lines.push(`  doc.selection.deselect();`);
  lines.push(`}`);
  lines.push(`function textLayer(doc, name, contents, x, y, size, rgbArr) {`);
  lines.push(`  var layer = doc.artLayers.add();`);
  lines.push(`  layer.kind = LayerKind.TEXT;`);
  lines.push(`  layer.name = name;`);
  lines.push(`  layer.textItem.contents = contents;`);
  lines.push(`  layer.textItem.position = [x, y+size];`);
  lines.push(`  layer.textItem.size = size;`);
  lines.push(`  var c = new SolidColor();`);
  lines.push(`  c.rgb.red = rgbArr[0]; c.rgb.green = rgbArr[1]; c.rgb.blue = rgbArr[2];`);
  lines.push(`  layer.textItem.color = c;`);
  lines.push(`}`);
  lines.push(`function placeImage(doc, name, filePath, x, y, w, h) {`);
  lines.push(`  var f = new File(filePath);`);
  lines.push(`  if (!f.exists) return;`);
  lines.push(`  var src = app.open(f);`);
  lines.push(`  src.resizeImage(UnitValue(w, "px"), UnitValue(h, "px"));`);
  lines.push(`  src.activeLayer.duplicate(doc, ElementPlacement.PLACEATBEGINNING);`);
  lines.push(`  src.close(SaveOptions.DONOTSAVECHANGES);`);
  lines.push(`  app.activeDocument = doc;`);
  lines.push(`  var placed = doc.activeLayer;`);
  lines.push(`  placed.name = name;`);
  lines.push(`  placed.translate(x - placed.bounds[0].as("px"), y - placed.bounds[1].as("px"));`);
  lines.push(`}`);

  doc.artboards.forEach((art, i) => {
    lines.push(`(function(){`);
    lines.push(
      `  var doc = app.documents.add(${art.width}, ${art.height}, 72, ${JSON.stringify(art.name)}, NewDocumentMode.RGB, DocumentFill.WHITE);`,
    );
    const walk = (nodes: SceneNode[]) => {
      for (const n of nodes) {
        if (!n.visible) continue;
        if (n.type === "rect" && n.fill) {
          lines.push(
            `  fillRect(doc, ${JSON.stringify(n.name)}, ${n.x}, ${n.y}, ${n.width}, ${n.height}, ${rgb(n.fill)});`,
          );
        } else if (n.type === "text") {
          lines.push(
            `  textLayer(doc, ${JSON.stringify(n.name)}, ${JSON.stringify(n.text.replaceAll("\n", " "))}, ${n.x}, ${n.y}, ${n.fontSize}, ${rgb(n.fill)});`,
          );
        } else if (n.type === "image") {
          lines.push(
            `  placeImage(doc, ${JSON.stringify(n.name)}, ${JSON.stringify(n.path)}, ${n.x}, ${n.y}, ${n.width}, ${n.height});`,
          );
        } else if (n.type === "group" || n.type === "clipGroup") {
          walk(n.children);
        }
      }
    };
    for (const layer of art.layers) walk(layer.children);
    lines.push(`  try { doc.artLayers.getByName("Background").visible = false; } catch (e) {}`);
    lines.push(`})();`);
    lines.push(`// Document ${i + 1}/${doc.artboards.length}: ${art.name} (${art.width}x${art.height})`);
  });
  return lines.join("\n");
}

export function writePhotoshopScript(doc: DesignDocument, filePath: string): string {
  fs.writeFileSync(filePath, compilePhotoshopScript(doc));
  return filePath;
}
