export interface TraceSpan {
  name: string;
  startedAt: string;
  endedAt?: string;
  ok: boolean;
  tools: string[];
  detail?: Record<string, unknown>;
}

export interface ExecutionTrace {
  taskId: string;
  plan: string[];
  spans: TraceSpan[];
  toolsUsed: string[];
  result: string;
}

export function startSpan(name: string): TraceSpan {
  return { name, startedAt: new Date().toISOString(), ok: true, tools: [] };
}

export function endSpan(span: TraceSpan, ok: boolean, detail?: Record<string, unknown>): TraceSpan {
  return { ...span, endedAt: new Date().toISOString(), ok, detail };
}
