import { loadConfig } from "../config.ts";
import { log } from "../lib/logger.ts";

export interface LlmMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function completeJson(messages: LlmMessage[]): Promise<{ used: false; reason: string } | { used: true; text: string }> {
  const config = loadConfig();
  if (!config.llm.openaiKeyPresent && !config.llm.anthropicKeyPresent) {
    return { used: false, reason: "No LLM API key is configured. Heuristic planner remains in control." };
  }
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    return { used: false, reason: "OPENAI_API_KEY is not set. Anthropic direct path is not wired in this iteration." };
  }
  const url = `${config.llm.baseUrl ?? "https://api.openai.com/v1"}/chat/completions`;
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: config.llm.model,
        messages,
        temperature: 0.3,
        response_format: { type: "json_object" },
      }),
    });
    if (!response.ok) {
      log.warn("llm_http_error", { status: response.status });
      return { used: false, reason: `LLM HTTP ${response.status}` };
    }
    const json = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const text = json.choices?.[0]?.message?.content;
    if (!text) return { used: false, reason: "LLM returned empty content." };
    return { used: true, text };
  } catch (error) {
    log.warn("llm_failed", { message: error instanceof Error ? error.message : String(error) });
    return { used: false, reason: "LLM request failed." };
  }
}
