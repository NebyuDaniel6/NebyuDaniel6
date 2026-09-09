import fs from "node:fs";
import path from "node:path";
import { PDFDocument } from "pdf-lib";
import type { Artboard, DesignDocument } from "../types.ts";
import { rasterizeSvg } from "./png.ts";
import { artboardToSvg } from "./svg.ts";

async function addRasterPage(pdf: PDFDocument, art: Artboard, tmpDir: string): Promise<void> {
  const pngPath = path.join(tmpDir, `${art.id}.png`);
  rasterizeSvg(artboardToSvg(art), pngPath, "png");
  const pngBytes = fs.readFileSync(pngPath);
  const image = await pdf.embedPng(pngBytes);
  const page = pdf.addPage([art.width, art.height]);
  page.drawImage(image, { x: 0, y: 0, width: art.width, height: art.height });
}

export async function exportDocumentPdf(doc: DesignDocument, outputPath: string): Promise<string> {
  const pdf = await PDFDocument.create();
  const tmpDir = path.join(path.dirname(outputPath), "_pdf_raster");
  fs.mkdirSync(tmpDir, { recursive: true });
  for (const art of doc.artboards) {
    await addRasterPage(pdf, art, tmpDir);
  }
  const bytes = await pdf.save();
  fs.writeFileSync(outputPath, bytes);
  return outputPath;
}
