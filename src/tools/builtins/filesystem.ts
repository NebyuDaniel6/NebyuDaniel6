import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import { isInsideDataDir } from "../../lib/paths.ts";
import { registerTool } from "../registry.ts";

const readInput = z.object({ path: z.string() });
const writeInput = z.object({ path: z.string(), contents: z.string() });

export function registerFilesystemTools(): void {
  registerTool({
    name: "filesystem.read",
    description: "Read a UTF-8 file inside the data directory.",
    risk: "low",
    permissions: [{ name: "fs.read", description: "Read files confined to data/" }],
    inputSchema: readInput,
    outputSchema: z.object({ contents: z.string() }),
    execute(input) {
      const parsed = readInput.parse(input);
      const resolved = path.resolve(parsed.path);
      if (!isInsideDataDir(resolved)) {
        throw new Error("filesystem.read is confined to the data directory.");
      }
      return { contents: fs.readFileSync(resolved, "utf8") };
    },
  });

  registerTool({
    name: "filesystem.write",
    description: "Write a UTF-8 file inside the data directory.",
    risk: "medium",
    permissions: [{ name: "fs.write", description: "Write files confined to data/" }],
    inputSchema: writeInput,
    outputSchema: z.object({ path: z.string() }),
    execute(input) {
      const parsed = writeInput.parse(input);
      const resolved = path.resolve(parsed.path);
      if (!isInsideDataDir(resolved)) {
        throw new Error("filesystem.write is confined to the data directory.");
      }
      fs.mkdirSync(path.dirname(resolved), { recursive: true });
      fs.writeFileSync(resolved, parsed.contents);
      return { path: resolved };
    },
  });
}
