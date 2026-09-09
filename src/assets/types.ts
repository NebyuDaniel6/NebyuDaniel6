export type AssetKind =
  | "image"
  | "logo"
  | "svg"
  | "png"
  | "jpg"
  | "pdf"
  | "font"
  | "template"
  | "reference"
  | "generated"
  | "deliverable";

export interface AssetRecord {
  id: string;
  orgId: string;
  brandId?: string;
  kind: AssetKind;
  filename: string;
  mime: string;
  path: string;
  description: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}
