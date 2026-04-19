export interface ModelValidation {
  valid: boolean;
  reason?: string;
  suggestions?: string[];
}

const ANTHROPIC_BLOCKED = ["claude-haiku", "claude-3-haiku", "claude-instant"];
const ANTHROPIC_SUGGESTIONS = [
  "claude-sonnet-4-5-20250929",
  "claude-sonnet-4-20250514",
  "claude-opus-4-20250514",
];

const OPENAI_BLOCKED = ["gpt-3.5-turbo", "gpt-3.5", "davinci", "babbage", "ada"];
const OPENAI_SUGGESTIONS = ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo"];

const OLLAMA_BLOCKED = [
  "tinyllama",
  "phi-2",
  "phi",
  "gemma:2b",
  "gemma2:2b",
  "stablelm-zephyr",
  "all-minilm",
  "nomic-embed",
  "mxbai-embed",
];
const OLLAMA_SUGGESTIONS = ["llama3", "mistral", "mixtral", "codellama", "qwen2", "deepseek-coder"];

export function validateModelForAgents(provider: string, model: string): ModelValidation {
  const m = model.toLowerCase().trim();

  if (provider === "claude-code") {
    return { valid: true };
  }

  if (provider === "anthropic") {
    if (ANTHROPIC_BLOCKED.some((b) => m.includes(b))) {
      return {
        valid: false,
        reason: `"${model}" is too small for agentic tasks. Agent orchestration requires stronger reasoning.`,
        suggestions: ANTHROPIC_SUGGESTIONS,
      };
    }
    return { valid: true };
  }

  if (provider === "openai") {
    if (OPENAI_BLOCKED.some((b) => m.includes(b))) {
      return {
        valid: false,
        reason: `"${model}" is too small for agentic tasks. Agent orchestration requires stronger reasoning.`,
        suggestions: OPENAI_SUGGESTIONS,
      };
    }
    return { valid: true };
  }

  if (provider === "ollama") {
    if (OLLAMA_BLOCKED.some((b) => m.includes(b))) {
      return {
        valid: false,
        reason: `"${model}" is too small for agentic tasks. Use a model with at least 7B parameters.`,
        suggestions: OLLAMA_SUGGESTIONS,
      };
    }
    return { valid: true };
  }

  return { valid: true };
}
