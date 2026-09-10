import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { Resvg } from "@resvg/resvg-js";
import { artboardToSvg } from "./svg.ts";
import { resolveFont } from "../fonts.ts";
import { walkNodes, type Artboard } from "../types.ts";

const PREVIEW_MAX_EDGE = 1400;

export function previewScale(art: Artboard): number {
  const long = Math.max(art.width, art.height);
  return long > PREVIEW_MAX_EDGE ? PREVIEW_MAX_EDGE / long : 1;
}

function fontFilesFor(art: Artboard): string[] {
  const files = new Set<string>();
  const add = (family: string, weight: number) => {
    try {
      files.add(resolveFont(family, weight).file);
    } catch {
      /* host may not have this face; resvg still renders fallback */
    }
  };
  add("Inter", 400);
  add("Inter", 700);
  for (const layer of art.layers) {
    walkNodes(layer.children, (n) => {
      if (n.type === "text") add(n.fontFamily, n.fontWeight);
    });
  }
  return [...files];
}

export function rasterizeSvg(svg: string, outputPath: string, format: "png" | "jpeg" = "png", art?: Artboard): string {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  const pngBytes = renderPng(svg, art);
  if (format === "png") {
    fs.writeFileSync(outputPath, pngBytes);
    return outputPath;
  }
  const tmp = outputPath.replace(/\.jpe?g$/i, ".png");
  fs.writeFileSync(tmp, pngBytes);
  try {
    execFileSync("ffmpeg", ["-y", "-i", tmp, "-q:v", "2", outputPath], { stdio: "ignore", timeout: 15_000 });
    return outputPath;
  } catch (error) {
    throw new Error(`JPEG export failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function renderPng(svg: string, art?: Artboard): Buffer {
  const scale = art ? previewScale(art) : 1;
  const fontFiles = art ? fontFilesFor(art) : [];
  const resvg = new Resvg(svg, {
    fitTo: scale < 1 && art ? { mode: "width", value: Math.max(1, Math.round(art.width * scale)) } : { mode: "original" },
    font: {
      loadSystemFonts: false,
      fontFiles,
      defaultFontFamily: "Inter",
    },
  });
  return Buffer.from(resvg.render().asPng());
}

export function exportArtboardRaster(art: Artboard, outputPath: string, format: "png" | "jpeg" = "png"): string {
  return rasterizeSvg(artboardToSvg(art), outputPath, format, art);
}
