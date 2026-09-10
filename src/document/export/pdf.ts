import fs from "node:fs";
import path from "node:path";
import { PDFDocument } from "pdf-lib";
import type { Artboard, DesignDocument } from "../types.ts";
import { exportArtboardRaster } from "./png.ts";

async function embedPngPage(pdf: PDFDocument, art: Artboard, pngPath: string): Promise<void> {
  const pngBytes = fs.readFileSync(pngPath);
  const image = await pdf.embedPng(pngBytes);
  const page = pdf.addPage([art.width, art.height]);
  page.drawImage(image, { x: 0, y: 0, width: art.width, height: art.height });
}

export async function exportDocumentPdf(
  doc: DesignDocument,
  outputPath: string,
  existingPngs?: string[],
): Promise<string> {
  const pdf = await PDFDocument.create();
  const tmpDir = path.join(path.dirname(outputPath), "_pdf_raster");
  fs.mkdirSync(tmpDir, { recursive: true });
  for (const [i, art] of doc.artboards.entries()) {
    const reused = existingPngs?.[i];
    const pngPath =
      reused && fs.existsSync(reused) ? reused : exportArtboardRaster(art, path.join(tmpDir, `${art.id}.png`), "png");
    await embedPngPage(pdf, art, pngPath);
  }
  const bytes = await pdf.save();
  fs.writeFileSync(outputPath, bytes);
  return outputPath;
}
