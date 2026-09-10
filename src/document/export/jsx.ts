import fs from "node:fs";
import type { Artboard, DesignDocument, RgbColor, SceneNode } from "../types.ts";

const ARTBOARD_GAP = 120;

function rgbJs(c: RgbColor): string {
  return `(function(){var c=new RGBColor();c.red=${c.r};c.green=${c.g};c.blue=${c.b};return c;})()`;
}

/** Illustrator Y-up. Artboards in this compiler sit on a shared baseline y=0. */
function topY(artHeight: number, y: number): number {
  return artHeight - y;
}

function ident(id: string): string {
  return id.replace(/[^a-zA-Z0-9]/g, "_");
}

function emitNode(art: Artboard, originX: number, node: SceneNode, parent: string): string[] {
  if (!node.visible) return [];
  const x = originX + node.x;
  const lines: string[] = [];
  switch (node.type) {
    case "rect": {
      lines.push(`(function(){
  var r = ${parent}.pathItems.rectangle(${topY(art.height, node.y)}, ${x}, ${node.width}, ${node.height});
  r.name = ${JSON.stringify(node.name)};
  ${node.fill ? `r.filled = true; r.fillColor = ${rgbJs(node.fill)};` : "r.filled = false;"}
  ${node.stroke ? `r.stroked = true; r.strokeColor = ${rgbJs(node.stroke)}; r.strokeWidth = ${node.strokeWidth};` : "r.stroked = false;"}
})();`);
      break;
    }
    case "ellipse": {
      lines.push(`(function(){
  var e = ${parent}.pathItems.ellipse(${topY(art.height, node.y)}, ${x}, ${node.width}, ${node.height});
  e.name = ${JSON.stringify(node.name)};
  ${node.fill ? `e.filled = true; e.fillColor = ${rgbJs(node.fill)};` : "e.filled = false;"}
  e.stroked = false;
})();`);
      break;
    }
    case "text": {
      lines.push(`(function(){
  var t = ${parent}.textFrames.areaText(
    ${parent}.pathItems.rectangle(${topY(art.height, node.y)}, ${x}, ${node.width}, ${node.height})
  );
  t.name = ${JSON.stringify(node.name)};
  t.contents = ${JSON.stringify(node.text)};
  var tr = t.textRange;
  tr.characterAttributes.size = ${node.fontSize};
  try { tr.characterAttributes.textFont = app.textFonts.getByName(${JSON.stringify(node.fontFamily)}); } catch (e) {}
  tr.characterAttributes.fillColor = ${rgbJs(node.fill)};
  tr.paragraphAttributes.justification = Justification.${node.align === "center" ? "CENTER" : node.align === "right" ? "RIGHT" : "LEFT"};
})();`);
      break;
    }
    case "image": {
      lines.push(`(function(){
  try {
    var f = new File(${JSON.stringify(node.path)});
    if (!f.exists) { throw new Error("missing image " + ${JSON.stringify(node.path)}); }
    var item = ${parent}.placedItems.add();
    item.file = f;
    item.name = ${JSON.stringify(node.name)};
    item.left = ${x};
    item.top = ${topY(art.height, node.y)};
    item.width = ${node.width};
    item.height = ${node.height};
  } catch (e) {
    throw new Error("place_image failed: " + e.message);
  }
})();`);
      break;
    }
    case "path": {
      lines.push(`// path ${JSON.stringify(node.name)} d=${JSON.stringify(node.d)}`);
      break;
    }
    case "group":
    case "clipGroup": {
      const g = `g_${ident(node.id)}`;
      lines.push(`var ${g} = ${parent}.groupItems.add();`);
      lines.push(`${g}.name = ${JSON.stringify(node.name)};`);
      for (const child of node.children) {
        lines.push(...emitNode(art, originX, child, g));
      }
      break;
    }
  }
  return lines;
}

export function artboardDocumentOrigins(doc: DesignDocument): number[] {
  return doc.artboards.map((art, index) => {
    if (Number.isFinite(art.x)) return art.x;
    return doc.artboards.slice(0, index).reduce((acc, a) => acc + a.width + ARTBOARD_GAP, 0);
  });
}

export function compileExtendScript(doc: DesignDocument): string {
  const first = doc.artboards[0];
  const origins = artboardDocumentOrigins(doc);
  const body: string[] = [];
  body.push(`#target illustrator`);
  body.push(`// One Illustrator artboard per format. Coordinates are offset so artwork is NOT stacked on artboard 1.`);
  body.push(`app.userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS;`);
  body.push(
    `var doc = app.documents.add(DocumentColorSpace.${doc.colorMode}, ${first?.width ?? 1080}, ${first?.height ?? 1080});`,
  );
  body.push(`doc.name = ${JSON.stringify(doc.name)};`);

  doc.artboards.forEach((art, index) => {
    const originX = origins[index] ?? 0;
    const rect = `[${originX}, ${art.height}, ${originX + art.width}, 0]`;
    if (index === 0) {
      body.push(`doc.artboards[0].artboardRect = ${rect};`);
      body.push(`doc.artboards[0].name = ${JSON.stringify(art.name)};`);
    } else {
      body.push(`var ab${index} = doc.artboards.add(${rect});`);
      body.push(`ab${index}.name = ${JSON.stringify(art.name)};`);
    }
    body.push(`doc.artboards.setActiveArtboardIndex(${index});`);
    const layerVar = `abLayer_${index}`;
    body.push(`var ${layerVar} = doc.layers.add();`);
    body.push(`${layerVar}.name = ${JSON.stringify(`${String(index + 1).padStart(2, "0")} ${art.name}`)};`);
    for (const layer of art.layers) {
      const g = `grp_${index}_${ident(layer.id)}`;
      body.push(`var ${g} = ${layerVar}.groupItems.add();`);
      body.push(`${g}.name = ${JSON.stringify(layer.name)};`);
      for (const child of layer.children) {
        body.push(...emitNode(art, originX, child, g));
      }
    }
  });

  body.push(`try { doc.layers.getByName("Layer 1").remove(); } catch (e) {}`);
  return body.join("\n");
}

export function writeExtendScript(doc: DesignDocument, filePath: string): string {
  fs.writeFileSync(filePath, compileExtendScript(doc));
  return filePath;
}
