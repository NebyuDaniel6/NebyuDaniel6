export type ConnectorHealth = {
  available: boolean;
  backend: string;
  application: string;
  version: string | null;
  message: string;
  capabilities: string[];
};

export interface ConnectorOperation {
  name: string;
  input: Record<string, unknown>;
}

export interface ConnectorResult {
  ok: boolean;
  operation: string;
  backend: string;
  data?: Record<string, unknown>;
  error?: { code: string; message: string; retryable: boolean };
}

export interface ApplicationConnector {
  id: string;
  application: string;
  health(): ConnectorHealth;
  execute(op: ConnectorOperation): Promise<ConnectorResult> | ConnectorResult;
}

const connectors = new Map<string, ApplicationConnector>();

export function registerConnector(connector: ApplicationConnector): void {
  connectors.set(connector.id, connector);
}

export function getConnector(id: string): ApplicationConnector | undefined {
  return connectors.get(id);
}

export function listConnectors(): ApplicationConnector[] {
  return [...connectors.values()];
}
