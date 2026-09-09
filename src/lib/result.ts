export type Result<T, E = AgentError> =
  | { ok: true; value: T }
  | { ok: false; error: E };

export interface AgentError {
  code: string;
  message: string;
  retryable: boolean;
  details?: Record<string, unknown>;
}

export function ok<T>(value: T): Result<T> {
  return { ok: true, value };
}

export function err(code: string, message: string, extra?: Partial<AgentError>): Result<never> {
  return {
    ok: false,
    error: {
      code,
      message,
      retryable: extra?.retryable ?? false,
      details: extra?.details,
    },
  };
}

export function isOk<T>(r: Result<T>): r is { ok: true; value: T } {
  return r.ok;
}
