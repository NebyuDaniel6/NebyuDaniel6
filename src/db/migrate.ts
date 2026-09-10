import { getDb } from "./client.ts";
import { SCHEMA_SQL } from "./schema.ts";

export function migrate(): void {
  getDb().exec(SCHEMA_SQL);
}
