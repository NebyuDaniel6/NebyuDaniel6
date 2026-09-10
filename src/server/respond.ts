import type { Context } from "hono";
import { stringifySafe } from "../lib/json-safe.ts";
import { recordLastError } from "../lib/last-error.ts";
import { STUDIO_VERSION } from "./payload.ts";

const JSON_HEADERS = { "content-type": "application/json; charset=utf-8" };

export function respondJson(_c: Context, data: unknown, status = 200): Response {
  try {
    const payload =
      data && typeof data === "object" && !Array.isArray(data)
        ? { version: STUDIO_VERSION, ...(data as Record<string, unknown>) }
        : { version: STUDIO_VERSION, value: data };
    return new Response(stringifySafe(payload), { status, headers: JSON_HEADERS });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    recordLastError(`json ${_c.req.path}: ${message}`);
    return new Response(JSON.stringify({ error: `Could not encode response: ${message}`, version: STUDIO_VERSION }), {
      status: 500,
      headers: JSON_HEADERS,
    });
  }
}

export function respondError(c: Context, source: string, err: unknown, status = 500): Response {
  const message = err instanceof Error ? err.message : String(err);
  recordLastError(`${source}: ${message}`);
  return respondJson(c, { error: message }, status);
}
