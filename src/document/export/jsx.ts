import fs from "node:fs";
import type { DesignDocument, RgbColor, SceneNode } from "../types.ts";

function rgbJs(c: RgbColor): string {
  return `(function(){var c=new RGBColor();c.red=${c.r};c.green=${c.g};c.blue=${c.b};return c;})()`;
}

function yIll(artHeight: number, y: number): string {
  return `${artHeight - y}`;
}

function emitNode(artHeight: number, node: SceneNode, parent: string): string[] {
  if (!node.visible) return [];
  const lines: string[] = [];
  switch (node.type) {
    case "rect": {
      lines.push(`(function(){
  var r = ${parent}.pathItems.rectangle(${yIll(artHeight, node.y)}, ${node.x}, ${node.width}, ${node.height});
  r.name = ${JSON.stringify(node.name)};
  ${node.fill ? `r.filled = true; r.fillColor = ${rgbJs(node.fill)};` : "r.filled = false;"}
  ${node.stroke ? `r.stroked = true; r.strokeColor = ${rgbJs(node.stroke)}; r.strokeWidth = ${node.strokeWidth};` : "r.stroked = false;"}
})();`);
      break;
    }
    case "ellipse": {
      lines.push(`(function(){
  var e = ${parent}.pathItems.ellipse(${yIll(artHeight, node.y)}, ${node.x}, ${node.width}, ${node.height});
  e.name = ${JSON.stringify(node.name)};
  ${node.fill ? `e.filled = true; e.fillColor = ${rgbJs(node.fill)};` : "e.filled = false;"}
  e.stroked = false;
})();`);
      break;
    }
    case "text": {
      lines.push(`(function(){
  var t = ${parent}.textFrames.areaText(
    ${parent}.pathItems.rectangle(${yIll(artHeight, node.y)}, ${node.x}, ${node.width}, ${node.height})
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
    item.left = ${node.x};
    item.top = ${yIll(artHeight, node.y)};
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
      lines.push(`var g_${node.id.replace(/[^a-zA-Z0-9]/g, "_")} = ${parent}.groupItems.add();`);
      lines.push(`g_${node.id.replace(/[^a-zA-Z0-9]/g, "_")}.name = ${JSON.stringify(node.name)};`);
      for (const child of node.children) {
        lines.push(...emitNode(artHeight, node.type === "clipGroup" ? child : child, `g_${node.id.replace(/[^a-zA-Z0-9]/g, "_")}`));
      }
      break;
    }
  }
  return lines;
}

export function compileExtendScript(doc: DesignDocument): string {
  const body: string[] = [];
  body.push(`#target illustrator`);
  body.push(`app.userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS;`);
  body.push(`var doc = app.documents.add(DocumentColorSpace.${doc.colorMode}, ${doc.artboards[0]?.width ?? 1080}, ${doc.artboards[0]?.height ?? 1080});`);
  body.push(`doc.name = ${JSON.stringify(doc.name)};`);

  doc.artboards.forEach((art, index) => {
    if (index === 0) {
      body.push(`doc.artboards[0].name = ${JSON.stringify(art.name)};`);
      body.push(`doc.artboards[0].artboardRect = [0, ${art.height}, ${art.width}, 0];`);
    } else {
      body.push(`doc.artboards.add([${art.x}, ${art.height}, ${art.x + art.width}, 0]);`);
      body.push(`doc.artboards[${index}].name = ${JSON.stringify(art.name)};`);
    }
    body.push(`doc.artboards.setActiveArtboardIndex(${index});`);
    for (const layer of art.layers) {
      body.push(`var layer_${index}_${layer.id.replace(/[^a-zA-Z0-9]/g, "_")} = doc.layers.add();`);
      const lname = `layer_${index}_${layer.id.replace(/[^a-zA-Z0-9]/g, "_")}`;
      body.push(`${lname}.name = ${JSON.stringify(layer.name)};`);
      body.push(`${lname}.visible = ${layer.visible ? "true" : "false"};`);
      for (const child of layer.children) {
        body.push(...emitNode(art.height, child, lname));
      }
    }
  });

  body.push(`// Caller is responsible for save/export.`);
  return body.join("\n");
}

export function writeExtendScript(doc: DesignDocument, filePath: string): string {
  fs.writeFileSync(filePath, compileExtendScript(doc));
  return filePath;
}
