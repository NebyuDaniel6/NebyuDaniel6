import fs from "node:fs";
import type { Artboard, DesignDocument, RgbColor, SceneNode } from "../types.ts";
import { colorToCss } from "../types.ts";

function esc(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function fillAttr(c: RgbColor | null): string {
  return c ? `fill="${colorToCss(c)}"` : `fill="none"`;
}

function strokeAttr(c: RgbColor | null, width: number): string {
  if (!c || width <= 0) return `stroke="none"`;
  return `stroke="${colorToCss(c)}" stroke-width="${width}"`;
}

function embedImage(filePath: string): string {
  if (!fs.existsSync(filePath)) return "";
  const bytes = fs.readFileSync(filePath);
  const ext = filePath.toLowerCase();
  const mime = ext.endsWith(".svg")
    ? "image/svg+xml"
    : ext.endsWith(".jpg") || ext.endsWith(".jpeg")
      ? "image/jpeg"
      : "image/png";
  return `data:${mime};base64,${bytes.toString("base64")}`;
}

function nodeSvg(node: SceneNode): string {
  if (!node.visible) return "";
  switch (node.type) {
    case "rect":
      return `<rect id="${esc(node.id)}" data-name="${esc(node.name)}" x="${node.x}" y="${node.y}" width="${node.width}" height="${node.height}" rx="${node.radius}" ${fillAttr(node.fill)} ${strokeAttr(node.stroke, node.strokeWidth)} />`;
    case "ellipse":
      return `<ellipse id="${esc(node.id)}" data-name="${esc(node.name)}" cx="${node.x + node.width / 2}" cy="${node.y + node.height / 2}" rx="${node.width / 2}" ry="${node.height / 2}" ${fillAttr(node.fill)} ${strokeAttr(node.stroke, node.strokeWidth)} />`;
    case "path":
      return `<path id="${esc(node.id)}" data-name="${esc(node.name)}" d="${esc(node.d)}" ${fillAttr(node.fill)} ${strokeAttr(node.stroke, node.strokeWidth)} />`;
    case "text": {
      const lines = node.text.split("\n");
      const anchor = node.align === "center" ? "middle" : node.align === "right" ? "end" : "start";
      const x = node.align === "center" ? node.x + node.width / 2 : node.align === "right" ? node.x + node.width : node.x;
      const tspans = lines
        .map((line, i) => {
          const y = node.y + node.fontSize + i * node.lineHeight;
          return `<tspan x="${x}" y="${y}">${esc(line)}</tspan>`;
        })
        .join("");
      return `<text id="${esc(node.id)}" data-name="${esc(node.name)}" data-role="${node.role}" x="${x}" font-family="${esc(node.fontFamily)}" font-weight="${node.fontWeight}" font-size="${node.fontSize}" fill="${colorToCss(node.fill)}" text-anchor="${anchor}" letter-spacing="${node.letterSpacing}">${tspans}</text>`;
    }
    case "image": {
      const href = embedImage(node.path);
      if (!href) {
        return `<!-- missing image ${esc(node.path)} -->`;
      }
      return `<image id="${esc(node.id)}" data-name="${esc(node.name)}" href="${href}" x="${node.x}" y="${node.y}" width="${node.width}" height="${node.height}" preserveAspectRatio="${node.fit === "cover" ? "xMidYMid slice" : "xMidYMid meet"}" />`;
    }
    case "group":
      return `<g id="${esc(node.id)}" data-name="${esc(node.name)}">${node.children.map(nodeSvg).join("")}</g>`;
    case "clipGroup": {
      const clipId = `${node.id}_clip`;
      return `<clipPath id="${clipId}">${nodeSvg(node.clip)}</clipPath><g id="${esc(node.id)}" data-name="${esc(node.name)}" clip-path="url(#${clipId})">${node.children.map(nodeSvg).join("")}</g>`;
    }
    default:
      return "";
  }
}

export function artboardToSvg(art: Artboard): string {
  const layers = art.layers
    .filter((l) => l.visible)
    .map(
      (layer) =>
        `<g id="${esc(layer.id)}" data-name="${esc(layer.name)}" data-layer="true">${layer.children.map(nodeSvg).join("")}</g>`,
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${art.width}" height="${art.height}" viewBox="0 0 ${art.width} ${art.height}" role="img">
  <title>${esc(art.name)}</title>
  <rect id="artboard-ground" width="${art.width}" height="${art.height}" fill="${colorToCss(art.background)}" />
  ${layers}
</svg>
`;
}

export function writeArtboardSvg(art: Artboard, filePath: string): string {
  fs.writeFileSync(filePath, artboardToSvg(art));
  return filePath;
}

export function writeDocumentSvgs(doc: DesignDocument, dir: string): string[] {
  fs.mkdirSync(dir, { recursive: true });
  return doc.artboards.map((art, i) => {
    const file = `${dir}/${String(i + 1).padStart(2, "0")}-${slug(art.name)}.svg`;
    writeArtboardSvg(art, file);
    return file;
  });
}

export function slug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}
