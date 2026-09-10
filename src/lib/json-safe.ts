export function jsonSafe(value: unknown, depth = 0, seen = new WeakSet<object>()): unknown {
  if (depth > 6) return "[truncated]";
  if (value == null) return value;
  const t = typeof value;
  if (t === "string" || t === "boolean") return value;
  if (t === "number") return Number.isFinite(value) ? value : null;
  if (t === "bigint") return Number(value);
  if (Array.isArray(value)) return value.slice(0, 50).map((v) => jsonSafe(v, depth + 1, seen));
  if (t === "object") {
    if (seen.has(value as object)) return "[circular]";
    seen.add(value as object);
    const proto = Object.getPrototypeOf(value);
    if (proto !== Object.prototype && proto !== null) return String(value);
    const out: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
      if (key === "document" || key === "bytes" || key === "photoBase64") continue;
      out[key] = jsonSafe(nested, depth + 1, seen);
    }
    return out;
  }
  return undefined;
}

export function stringifySafe(value: unknown): string {
  return JSON.stringify(jsonSafe(value));
}
