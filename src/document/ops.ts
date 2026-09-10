import type { DesignDocument, Layer, SceneNode, Artboard, RgbColor } from "./types.ts";
import { id } from "../lib/ids.ts";

export function emptyDocument(name: string, colorMode: "RGB" | "CMYK" = "RGB"): DesignDocument {
  return { id: id("doc"), name, units: "px", colorMode, artboards: [] };
}

export function addArtboard(
  doc: DesignDocument,
  input: { name: string; width: number; height: number; background: RgbColor },
): Artboard {
  const art: Artboard = {
    id: id("art"),
    name: input.name,
    width: input.width,
    height: input.height,
    x: doc.artboards.reduce((acc, a) => acc + a.width + 120, 0),
    y: 0,
    background: input.background,
    layers: [],
  };
  doc.artboards.push(art);
  return art;
}

export function addLayer(art: Artboard, name: string): Layer {
  const layer: Layer = { id: id("layer"), name, visible: true, locked: false, children: [] };
  art.layers.push(layer);
  return layer;
}

export function append(layer: Layer, node: SceneNode): SceneNode {
  layer.children.push(node);
  return node;
}

export function inspectDocument(doc: DesignDocument): {
  artboards: number;
  layers: number;
  texts: number;
  images: number;
  namedLayers: string[];
} {
  let layers = 0;
  let texts = 0;
  let images = 0;
  const namedLayers: string[] = [];
  for (const art of doc.artboards) {
    for (const layer of art.layers) {
      layers += 1;
      namedLayers.push(layer.name);
      const walk = (nodes: SceneNode[]) => {
        for (const n of nodes) {
          if (n.type === "text") texts += 1;
          if (n.type === "image") images += 1;
          if (n.type === "group" || n.type === "clipGroup") walk(n.children);
        }
      };
      walk(layer.children);
    }
  }
  return { artboards: doc.artboards.length, layers, texts, images, namedLayers };
}
