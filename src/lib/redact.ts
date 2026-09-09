const SECRET_KEY = /(?:api[_-]?key|secret|token|password|passwd|authorization|credential|private[_-]?key)/i;

export function redactValue(name: string, value: string): string {
  if (SECRET_KEY.test(name)) return "[redacted]";
  if (/^sk-[a-zA-Z0-9]{8,}/.test(value)) return "[redacted]";
  if (/^ghp_/.test(value) || /^github_pat_/.test(value)) return "[redacted]";
  return value;
}

export function redactRecord(input: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) {
    if (typeof value === "string") out[key] = redactValue(key, value);
    else if (value && typeof value === "object" && !Array.isArray(value)) {
      out[key] = redactRecord(value as Record<string, unknown>);
    } else {
      out[key] = value;
    }
  }
  return out;
}

export function redactText(text: string): string {
  return text
    .replace(/sk-[a-zA-Z0-9]{10,}/g, "[redacted]")
    .replace(/ghp_[a-zA-Z0-9]{10,}/g, "[redacted]")
    .replace(/(api[_-]?key|secret|token|password)\s*[:=]\s*\S+/gi, "$1=[redacted]");
}
