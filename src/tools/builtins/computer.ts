import { z } from "zod";
import { registerTool } from "../registry.ts";
import { captureScreenshot, clickAt, identifyForegroundApp, sendKey, typeText } from "../../computer/controller.ts";

export function registerComputerTools(): void {
  registerTool({
    name: "computer.identify_application",
    description: "Identify the foreground application without sending input.",
    application: "computer",
    risk: "low",
    permissions: [{ name: "screen.read", description: "Read active window title" }],
    inputSchema: z.object({}),
    outputSchema: z.any(),
    execute() {
      const result = identifyForegroundApp();
      if (!result.ok) throw new Error(result.error.message);
      return result.value;
    },
  });

  registerTool({
    name: "computer.screenshot",
    description: "Capture the current display via ffmpeg x11grab.",
    application: "computer",
    risk: "low",
    permissions: [{ name: "screen.read", description: "Capture screen" }],
    inputSchema: z.object({}),
    outputSchema: z.object({ path: z.string() }),
    execute() {
      const result = captureScreenshot();
      if (!result.ok) throw new Error(result.error.message);
      return result.value;
    },
  });

  registerTool({
    name: "computer.click",
    description: "Click at screen coordinates. Disabled unless computer control is explicitly allowed.",
    application: "computer",
    risk: "high",
    permissions: [{ name: "input.mouse", description: "Send mouse clicks" }],
    inputSchema: z.object({ x: z.number(), y: z.number() }),
    outputSchema: z.object({ ok: z.boolean() }),
    execute(input: { x: number; y: number }) {
      const result = clickAt(input.x, input.y);
      if (!result.ok) throw new Error(result.error.message);
      return { ok: true };
    },
  });

  registerTool({
    name: "computer.type",
    description: "Type text into the focused window. Disabled unless computer control is explicitly allowed.",
    application: "computer",
    risk: "high",
    permissions: [{ name: "input.keyboard", description: "Send keystrokes" }],
    inputSchema: z.object({ text: z.string() }),
    outputSchema: z.object({ ok: z.boolean() }),
    execute(input: { text: string }) {
      const result = typeText(input.text);
      if (!result.ok) throw new Error(result.error.message);
      return { ok: true };
    },
  });

  registerTool({
    name: "computer.key",
    description: "Send a keyboard shortcut (xdotool key syntax).",
    application: "computer",
    risk: "high",
    permissions: [{ name: "input.keyboard", description: "Send shortcuts" }],
    inputSchema: z.object({ key: z.string() }),
    outputSchema: z.object({ ok: z.boolean() }),
    execute(input: { key: string }) {
      const result = sendKey(input.key);
      if (!result.ok) throw new Error(result.error.message);
      return { ok: true };
    },
  });
}
