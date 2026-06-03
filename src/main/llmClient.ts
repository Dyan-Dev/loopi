import { claudeCodeWorker } from "@main/claudeCodeWorker";
import { getCredential } from "@main/credentialsStore";
import { createLogger } from "@utils/logger";
import axios from "axios";

const logger = createLogger("LLMClient");

export interface LLMParams {
  messages: Array<{ role: "user" | "assistant" | "system"; content: string }>;
  provider: "openai" | "anthropic" | "ollama" | "claude-code";
  credentialId?: string;
  apiKey?: string;
  model?: string;
  baseUrl?: string;
  sessionId?: string;
}

export interface LLMResult {
  success: boolean;
  response?: string;
  error?: string;
}

export async function callLLM(params: LLMParams): Promise<LLMResult> {
  try {
    let apiKey = "";
    if (params.credentialId) {
      const cred = await getCredential(params.credentialId);
      if (!cred) throw new Error("Credential not found");
      apiKey = cred.data.apiKey || cred.data.key || cred.data.token || cred.data.accessToken || "";
    } else if (params.apiKey) {
      apiKey = params.apiKey;
    } else {
      if (params.provider === "anthropic") {
        apiKey = process.env.ANTHROPIC_API_KEY || "";
      } else if (params.provider === "openai") {
        apiKey = process.env.OPENAI_API_KEY || "";
      }
    }

    let response: string;

    if (params.provider === "openai") {
      const baseUrl = (params.baseUrl || "https://api.openai.com/v1").replace(/\/+$/, "");
      const model = params.model || "gpt-4o-mini";
      const res = await axios.post(
        `${baseUrl}/chat/completions`,
        {
          model,
          messages: params.messages,
          temperature: 0.7,
          max_tokens: 2048,
        },
        {
          headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
          timeout: 60000,
        }
      );
      response = res.data.choices[0]?.message?.content || "";
    } else if (params.provider === "anthropic") {
      const baseUrl = (params.baseUrl || "https://api.anthropic.com").replace(/\/+$/, "");
      const model = params.model || "claude-sonnet-4-5-20250929";
      const systemMsgs = params.messages.filter((m) => m.role === "system");
      const nonSystemMsgs = params.messages.filter((m) => m.role !== "system");
      const isOAuthToken = apiKey.startsWith("sk-ant-oat");
      const authHeaders: Record<string, string> = isOAuthToken
        ? { Authorization: `Bearer ${apiKey}` }
        : { "x-api-key": apiKey };
      const res = await axios.post(
        `${baseUrl}/v1/messages`,
        {
          model,
          ...(systemMsgs.length > 0 ? { system: systemMsgs.map((m) => m.content).join("\n") } : {}),
          messages: nonSystemMsgs,
          max_tokens: 2048,
          temperature: 0.7,
        },
        {
          headers: {
            ...authHeaders,
            "anthropic-version": "2023-06-01",
            "Content-Type": "application/json",
          },
          timeout: 60000,
        }
      );
      const content = res.data.content;
      response = Array.isArray(content) && content.length > 0 ? content[0].text || "" : "";
    } else if (params.provider === "claude-code") {
      const sessionId = params.sessionId ?? `app-auto-${Date.now()}`;
      response = await claudeCodeWorker.send(sessionId, params.messages);
    } else {
      // Ollama
      const baseUrl = (params.baseUrl || "http://localhost:11434").replace(/\/+$/, "");
      const model = params.model || "mistral";
      const res = await axios.post(
        `${baseUrl}/api/chat`,
        { model, messages: params.messages, stream: false },
        { timeout: 120000 }
      );
      response = res.data.message?.content || "";
    }

    return { success: true, response };
  } catch (error) {
    logger.error("LLM call failed", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
