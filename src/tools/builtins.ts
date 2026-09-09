import { registerAssetTools } from "./builtins/asset.ts";
import { registerBrandTools } from "./builtins/brand.ts";
import { registerComputerTools } from "./builtins/computer.ts";
import { registerFilesystemTools } from "./builtins/filesystem.ts";
import { registerIllustratorTools } from "./builtins/illustrator.ts";

let registered = false;

export function registerBuiltinTools(): void {
  if (registered) return;
  registerFilesystemTools();
  registerBrandTools();
  registerAssetTools();
  registerComputerTools();
  registerIllustratorTools();
  registered = true;
}
