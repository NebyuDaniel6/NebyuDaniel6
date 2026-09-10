import { migrate } from "./db/migrate.ts";
import { registerDefaultConnectors } from "./connectors/registry.ts";
import { registerBuiltinTools } from "./tools/builtins.ts";

let booted = false;

export function boot(): void {
  migrate();
  if (booted) return;
  registerDefaultConnectors();
  registerBuiltinTools();
  booted = true;
}
