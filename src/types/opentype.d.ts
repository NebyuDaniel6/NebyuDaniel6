declare module "opentype.js" {
  export interface Font {
    getAdvanceWidth(text: string, fontSize: number): number;
  }
  export function loadSync(path: string): Font;
  const opentype: { loadSync: typeof loadSync; Font: Font };
  export default opentype;
}
