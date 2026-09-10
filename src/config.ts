export interface AppConfig {
  dataDir: string;
  port: number;
  llm: {
    openaiKeyPresent: boolean;
    anthropicKeyPresent: boolean;
    baseUrl: string | null;
    model: string;
  };
  computerControlAllowed: boolean;
  illustratorPath: string | null;
  autoApproveDirection: boolean;
  autoApproveFinal: boolean;
}

function present(name: string): boolean {
  const v = process.env[name];
  return typeof v === "string" && v.length > 0;
}

export function loadConfig(): AppConfig {
  return {
    dataDir: process.env.CREATIVE_AGENT_DATA_DIR ?? "./data",
    port: Number(process.env.CREATIVE_AGENT_PORT ?? 8787),
    llm: {
      openaiKeyPresent: present("OPENAI_API_KEY"),
      anthropicKeyPresent: present("ANTHROPIC_API_KEY"),
      baseUrl: process.env.OPENAI_BASE_URL ?? null,
      model: process.env.CREATIVE_AGENT_LLM_MODEL ?? "gpt-4.1",
    },
    computerControlAllowed: process.env.CREATIVE_AGENT_ALLOW_COMPUTER_CONTROL === "1",
    illustratorPath: process.env.ILLUSTRATOR_PATH ?? null,
    autoApproveDirection: process.env.CREATIVE_AGENT_AUTO_APPROVE_DIRECTION === "1",
    autoApproveFinal: process.env.CREATIVE_AGENT_AUTO_APPROVE_FINAL === "1",
  };
}

export function llmAvailable(config = loadConfig()): boolean {
  return config.llm.openaiKeyPresent || config.llm.anthropicKeyPresent;
}
