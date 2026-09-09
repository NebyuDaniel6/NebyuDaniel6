export type RiskLevel = "low" | "medium" | "high" | "destructive";

export interface ToolPermission {
  name: string;
  description: string;
}

export interface ToolContext {
  taskId?: string;
  orgId?: string;
  brandId?: string;
  confirmDestructive?: boolean;
}

export interface Tool<I, O> {
  name: string;
  description: string;
  application?: string;
  risk: RiskLevel;
  permissions: ToolPermission[];
  inputSchema: unknown;
  outputSchema: unknown;
  execute(input: I, ctx: ToolContext): Promise<O> | O;
}

export interface ToolInvocationRecord {
  name: string;
  ok: boolean;
  risk: RiskLevel;
  input: unknown;
  output: unknown;
}
