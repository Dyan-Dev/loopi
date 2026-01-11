import type { StepAIAnthropic, StepAIOllama, StepAIOpenAI } from "@app-types/steps";
import { getCredential } from "@main/credentialsStore";
import { debugLogger } from "@main/debugLogger";
import axios from "axios";

/**
 * Handles all AI-related automation steps (OpenAI, Anthropic, Ollama)
 */
export class AiStepHandler {
  /**
   * Execute OpenAI API call
   * Deterministic defaults: temperature 0, maxTokens 256, no streaming or tools.
   */
  async executeAiOpenAI(
    step: StepAIOpenAI,
    substituteVariables: (input?: string) => string
  ): Promise<string> {
    const prompt = substituteVariables(step.prompt || "").trim();
    const systemPrompt = substituteVariables(step.systemPrompt || "").trim();
    const model = substituteVariables(step.model || "").trim();
    const temperature = Math.max(0, Math.min(1, Number(step.temperature ?? 0)));
    const maxTokens = Math.min(Math.max(1, Math.floor(Number(step.maxTokens ?? 256))), 4096);
    const topPValue =
      step.topP === undefined ? undefined : Math.max(0, Math.min(1, Number(step.topP)));
    const timeoutMs = Math.min(Math.max(1000, Number(step.timeoutMs ?? 20000)), 120000);

    if (!prompt) throw new Error("OpenAI step requires a prompt");
    if (!model) throw new Error("OpenAI step requires a model");

    const baseUrl = this.normalizeBaseUrl(
      substituteVariables(step.baseUrl || ""),
      "https://api.openai.com/v1"
    );
    const apiKey = await this.resolveOpenAIApiKey(step, substituteVariables);
    if (!apiKey) {
      throw new Error("API key is required for OpenAI");
    }

    debugLogger.debug("AI OpenAI", "Preparing request", {
      model,
      baseUrl,
      promptLength: prompt.length,
      hasSystemPrompt: !!systemPrompt,
      temperature,
      maxTokens,
      topP: topPValue,
    });

    const systemMessage = systemPrompt ? [{ role: "system", content: systemPrompt }] : [];
    const userMessage = { role: "user", content: prompt };

    const url = `${baseUrl}/chat/completions`;
    const payload: Record<string, unknown> = {
      model,
      messages: [...systemMessage, userMessage],
      temperature,
      max_tokens: maxTokens,
      n: 1,
      stream: false,
    };
    if (topPValue !== undefined) payload.top_p = topPValue;

    const response = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      timeout: timeoutMs,
    });

    const content = response.data?.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("OpenAI returned an empty response");
    }
    return typeof content === "string" ? content.trim() : JSON.stringify(content);
  }

  /**
   * Execute Anthropic (Claude) API call
   * Deterministic defaults: temperature 0, maxTokens 256, no streaming or tools.
   */
  async executeAiAnthropic(
    step: StepAIAnthropic,
    substituteVariables: (input?: string) => string
  ): Promise<string> {
    const prompt = substituteVariables(step.prompt || "").trim();
    const systemPrompt = substituteVariables(step.systemPrompt || "").trim();
    const model = substituteVariables(step.model || "").trim();
    const temperature = Math.max(0, Math.min(1, Number(step.temperature ?? 0)));
    const maxTokens = Math.min(Math.max(1, Math.floor(Number(step.maxTokens ?? 256))), 4096);
    const topPValue =
      step.topP === undefined ? undefined : Math.max(0, Math.min(1, Number(step.topP)));
    const timeoutMs = Math.min(Math.max(1000, Number(step.timeoutMs ?? 20000)), 120000);

    if (!prompt) throw new Error("Anthropic step requires a prompt");
    if (!model) throw new Error("Anthropic step requires a model");

    const baseUrl = this.normalizeBaseUrl(
      substituteVariables(step.baseUrl || ""),
      "https://api.anthropic.com"
    );
    const apiKey = await this.resolveAnthropicApiKey(step, substituteVariables);
    if (!apiKey) {
      throw new Error("API key is required for Anthropic");
    }

    debugLogger.debug("AI Anthropic", "Preparing request", {
      model,
      baseUrl,
      promptLength: prompt.length,
      hasSystemPrompt: !!systemPrompt,
      temperature,
      maxTokens,
      topP: topPValue,
    });

    const userMessage = { role: "user", content: prompt };

    const url = `${baseUrl}/v1/messages`;
    const payload: Record<string, unknown> = {
      model,
      max_tokens: maxTokens,
      temperature,
      messages: [userMessage],
      stream: false,
    };
    if (systemPrompt) payload.system = systemPrompt;
    if (topPValue !== undefined) payload.top_p = topPValue;

    const response = await axios.post(url, payload, {
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      timeout: timeoutMs,
    });

    const content = response.data?.content?.[0]?.text || response.data?.content?.[0]?.content;
    if (!content) {
      throw new Error("Anthropic returned an empty response");
    }
    return String(content).trim();
  }

  /**
   * Execute Ollama (local LLM) API call
   * Deterministic defaults: temperature 0, maxTokens 256, no streaming or tools.
   */
  async executeAiOllama(
    step: StepAIOllama,
    substituteVariables: (input?: string) => string
  ): Promise<string> {
    const prompt = substituteVariables(step.prompt || "").trim();
    const systemPrompt = substituteVariables(step.systemPrompt || "").trim();
    const model = substituteVariables(step.model || "").trim();
    const temperature = Math.max(0, Math.min(1, Number(step.temperature ?? 0)));
    const maxTokens = Math.min(Math.max(1, Math.floor(Number(step.maxTokens ?? 256))), 4096);
    const topPValue =
      step.topP === undefined ? undefined : Math.max(0, Math.min(1, Number(step.topP)));
    const timeoutMs = Math.min(Math.max(1000, Number(step.timeoutMs ?? 20000)), 120000);

    if (!prompt) throw new Error("Ollama step requires a prompt");
    if (!model) throw new Error("Ollama step requires a model");

    const baseUrl = this.normalizeBaseUrl(
      substituteVariables(step.baseUrl || ""),
      "http://localhost:11434"
    );

    debugLogger.debug("AI Ollama", "Preparing request", {
      model,
      baseUrl,
      promptLength: prompt.length,
      hasSystemPrompt: !!systemPrompt,
      temperature,
      maxTokens,
      topP: topPValue,
    });

    const systemMessage = systemPrompt ? [{ role: "system", content: systemPrompt }] : [];
    const userMessage = { role: "user", content: prompt };

    const url = `${baseUrl}/api/chat`;
    const payload: Record<string, unknown> = {
      model,
      messages: [...systemMessage, userMessage],
      stream: false,
      options: {
        temperature,
        top_p: topPValue,
        num_predict: maxTokens,
      },
    };

    const response = await axios.post(url, payload, {
      timeout: timeoutMs,
      headers: { "Content-Type": "application/json" },
    });

    const content = response.data?.message?.content || response.data?.response;
    if (!content) {
      throw new Error("Ollama returned an empty response");
    }
    return String(content).trim();
  }

  private normalizeBaseUrl(baseUrl: string, fallback: string): string {
    const value = baseUrl?.trim() || fallback;
    return value.replace(/\/+$/, "");
  }

  private async resolveOpenAIApiKey(
    step: StepAIOpenAI,
    substituteVariables: (input?: string) => string
  ): Promise<string | null> {
    if (step.credentialId) {
      const credential = await getCredential(step.credentialId);
      if (!credential) throw new Error("OpenAI credential not found");
      const fromStore =
        credential.data.apiKey ||
        credential.data.key ||
        credential.data.token ||
        credential.data.accessToken;
      if (fromStore) return substituteVariables(fromStore);
      throw new Error("OpenAI credential is missing an API key value");
    }

    if (step.apiKey) {
      return substituteVariables(step.apiKey);
    }

    return null;
  }

  private async resolveAnthropicApiKey(
    step: StepAIAnthropic,
    substituteVariables: (input?: string) => string
  ): Promise<string | null> {
    if (step.credentialId) {
      const credential = await getCredential(step.credentialId);
      if (!credential) throw new Error("Anthropic credential not found");
      const fromStore =
        credential.data.apiKey ||
        credential.data.key ||
        credential.data.token ||
        credential.data.accessToken;
      if (fromStore) return substituteVariables(fromStore);
      throw new Error("Anthropic credential is missing an API key value");
    }

    if (step.apiKey) {
      return substituteVariables(step.apiKey);
    }

    return null;
  }
}
