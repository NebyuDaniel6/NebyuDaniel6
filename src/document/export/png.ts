import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { Resvg } from "@resvg/resvg-js";
import { artboardToSvg } from "./svg.ts";
import type { Artboard } from "../types.ts";

export function rasterizeSvg(svg: string, outputPath: string, format: "png" | "jpeg" = "png"): string {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  const pngBytes = renderPng(svg);
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

function renderPng(svg: string): Buffer {
  try {
    const resvg = new Resvg(svg, {
      fitTo: { mode: "original" },
      font: { loadSystemFonts: true },
    });
    return Buffer.from(resvg.render().asPng());
  } catch (error) {
    const tmpSvg = path.join(path.dirname(outputPathFallback()), `fallback-${Date.now()}.svg`);
    fs.mkdirSync(path.dirname(tmpSvg), { recursive: true });
    fs.writeFileSync(tmpSvg, svg);
    const pngPath = tmpSvg.replace(/\.svg$/, ".png");
    rasterizeWithChrome(svg, pngPath, error);
    return fs.readFileSync(pngPath);
  }
}

function outputPathFallback(): string {
  return path.join(process.env.CREATIVE_AGENT_DATA_DIR ?? "/tmp", "raster-fallback.png");
}

function rasterizeWithChrome(svg: string, outputPath: string, cause: unknown): string {
  const chrome = ["/usr/local/bin/google-chrome", "/usr/bin/google-chrome"].find((p) => fs.existsSync(p));
  if (!chrome) {
    throw new Error(`PNG export failed (${String(cause)}) and google-chrome is not available.`);
  }
  const dir = path.dirname(outputPath);
  const svgPath = path.join(dir, `${path.basename(outputPath)}.tmp.svg`);
  fs.writeFileSync(svgPath, svg);
  const pngPath = outputPath.replace(/\.jpe?g$/i, ".png");
  execFileSync(chrome, [
    "--headless=new",
    "--disable-gpu",
    `--screenshot=${pngPath}`,
    svgPath,
  ], { timeout: 30_000 });
  if (!fs.existsSync(pngPath)) {
    throw new Error(`Chrome screenshot did not produce ${pngPath}`);
  }
  if (pngPath !== outputPath) fs.copyFileSync(pngPath, outputPath);
  return outputPath;
}

export function exportArtboardRaster(art: Artboard, outputPath: string, format: "png" | "jpeg" = "png"): string {
  return rasterizeSvg(artboardToSvg(art), outputPath, format);
}
