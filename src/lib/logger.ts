import { redactText } from "./redact.ts";

export type LogLevel = "debug" | "info" | "warn" | "error";

function write(level: LogLevel, message: string, extra?: Record<string, unknown>): void {
  const line = {
    ts: new Date().toISOString(),
    level,
    message: redactText(message),
    ...(extra ? { extra } : {}),
  };
  const sink = level === "error" ? console.error : console.log;
  sink(JSON.stringify(line));
}

export const log = {
  debug: (message: string, extra?: Record<string, unknown>) => write("debug", message, extra),
  info: (message: string, extra?: Record<string, unknown>) => write("info", message, extra),
  warn: (message: string, extra?: Record<string, unknown>) => write("warn", message, extra),
  error: (message: string, extra?: Record<string, unknown>) => write("error", message, extra),
};
