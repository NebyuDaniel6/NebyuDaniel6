import { illustratorConnector } from "./illustrator/connector.ts";
import { registerConnector } from "./types.ts";

export function registerDefaultConnectors(): void {
  registerConnector(illustratorConnector());
}
