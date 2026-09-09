export type ColorMode = "RGB" | "CMYK";
export type Units = "px" | "mm" | "in";

export interface RgbColor {
  r: number;
  g: number;
  b: number;
  a?: number;
}

export interface DesignDocument {
  id: string;
  name: string;
  units: Units;
  colorMode: ColorMode;
  artboards: Artboard[];
}

export interface Artboard {
  id: string;
  name: string;
  width: number;
  height: number;
  x: number;
  y: number;
  background: RgbColor;
  layers: Layer[];
}

export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  children: SceneNode[];
}

export type SceneNode =
  | GroupNode
  | TextNode
  | RectNode
  | EllipseNode
  | PathNode
  | ImageNode
  | ClipGroupNode;

export interface NodeBase {
  id: string;
  name: string;
  x: number;
  y: number;
  visible: boolean;
}

export interface GroupNode extends NodeBase {
  type: "group";
  children: SceneNode[];
}

export interface TextNode extends NodeBase {
  type: "text";
  text: string;
  fontFamily: string;
  fontWeight: number;
  fontStyle: "normal" | "italic";
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
  fill: RgbColor;
  width: number;
  height: number;
  align: "left" | "center" | "right";
  role: "kicker" | "headline" | "subhead" | "body" | "cta" | "label";
}

export interface RectNode extends NodeBase {
  type: "rect";
  width: number;
  height: number;
  fill: RgbColor | null;
  stroke: RgbColor | null;
  strokeWidth: number;
  radius: number;
}

export interface EllipseNode extends NodeBase {
  type: "ellipse";
  width: number;
  height: number;
  fill: RgbColor | null;
  stroke: RgbColor | null;
  strokeWidth: number;
}

export interface PathNode extends NodeBase {
  type: "path";
  d: string;
  fill: RgbColor | null;
  stroke: RgbColor | null;
  strokeWidth: number;
}

export interface ImageNode extends NodeBase {
  type: "image";
  path: string;
  width: number;
  height: number;
  fit: "contain" | "cover";
}

export interface ClipGroupNode extends NodeBase {
  type: "clipGroup";
  clip: RectNode | EllipseNode | PathNode;
  children: SceneNode[];
}

export function rgb(r: number, g: number, b: number, a = 1): RgbColor {
  return { r, g, b, a };
}

export function colorToCss(c: RgbColor): string {
  const a = c.a ?? 1;
  if (a < 1) return `rgba(${c.r},${c.g},${c.b},${a})`;
  return `rgb(${c.r},${c.g},${c.b})`;
}

export function hexToRgb(hex: string): RgbColor {
  const h = hex.replace("#", "").trim();
  const full = h.length === 3 ? h.split("").map((ch) => ch + ch).join("") : h;
  const n = parseInt(full.slice(0, 6), 16);
  return rgb((n >> 16) & 255, (n >> 8) & 255, n & 255);
}

export function walkNodes(nodes: SceneNode[], visit: (n: SceneNode) => void): void {
  for (const n of nodes) {
    visit(n);
    if (n.type === "group" || n.type === "clipGroup") walkNodes(n.children, visit);
  }
}

export function allTextNodes(doc: DesignDocument): TextNode[] {
  const out: TextNode[] = [];
  for (const art of doc.artboards) {
    for (const layer of art.layers) {
      walkNodes(layer.children, (n) => {
        if (n.type === "text") out.push(n);
      });
    }
  }
  return out;
}

export function allImages(doc: DesignDocument): ImageNode[] {
  const out: ImageNode[] = [];
  for (const art of doc.artboards) {
    for (const layer of art.layers) {
      walkNodes(layer.children, (n) => {
        if (n.type === "image") out.push(n);
      });
    }
  }
  return out;
}
