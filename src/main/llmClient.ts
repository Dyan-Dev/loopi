import { getCredential } from "@main/credentialsStore";
import { createLogger } from "@utils/logger";
import axios from "axios";
import { execSync } from "child_process";

const logger = createLogger("LLMClient");

export interface LLMParams {
  messages: Array<{ role: "user" | "assistant" | "system"; content: string }>;
  provider: "openai" | "anthropic" | "ollama" | "claude-code";
  credentialId?: string;
  apiKey?: string;
  model?: string;
  baseUrl?: string;
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
      const lastUserMsg = [...params.messages].reverse().find((m) => m.role === "user");
      if (!lastUserMsg) throw new Error("No user message found");

      const systemMsgs = params.messages.filter((m) => m.role === "system");
      const contextParts: string[] = [];
      if (systemMsgs.length > 0) {
        contextParts.push(systemMsgs.map((m) => m.content).join("\n"));
      }
      const recentMsgs = params.messages.filter((m) => m.role !== "system").slice(-10);
      if (recentMsgs.length > 1) {
        const history = recentMsgs
          .slice(0, -1)
          .map((m) => `${m.role === "user" ? "Human" : "Assistant"}: ${m.content}`)
          .join("\n\n");
        contextParts.push("Previous conversation:\n" + history);
      }
      contextParts.push(lastUserMsg.content);
      const fullPrompt = contextParts.join("\n\n");

      const { spawn: spawnProc } = await import("child_process");
      let claudePath = "claude";
      try {
        claudePath = execSync("which claude", { encoding: "utf-8" }).trim();
      } catch {
        const { existsSync } = await import("fs");
        const candidates = [
          `${process.env.HOME}/.local/bin/claude`,
          "/usr/local/bin/claude",
          `${process.env.HOME}/.npm-global/bin/claude`,
        ];
        for (const c of candidates) {
          if (existsSync(c)) {
            claudePath = c;
            break;
          }
        }
      }
      const userShellEnv = { ...process.env };
      delete userShellEnv.ANTHROPIC_API_KEY;
      if (!userShellEnv.PATH?.includes(".local/bin")) {
        userShellEnv.PATH = `${process.env.HOME}/.local/bin:${userShellEnv.PATH}`;
      }

      response = await new Promise<string>((resolve, reject) => {
        const CLAUDE_CLI_TIMEOUT_MS = 600000;
        let timedOut = false;
        const proc = spawnProc(claudePath, ["-p"], {
          stdio: ["pipe", "pipe", "pipe"],
          env: userShellEnv,
        });
        const timer = setTimeout(() => {
          timedOut = true;
          proc.kill("SIGTERM");
        }, CLAUDE_CLI_TIMEOUT_MS);
        let stdout = "";
        let stderr = "";
        proc.stdout.on("data", (d: Buffer) => (stdout += d.toString()));
        proc.stderr.on("data", (d: Buffer) => (stderr += d.toString()));
        proc.on("error", (err) => {
          clearTimeout(timer);
          reject(new Error(err.message));
        });
        proc.on("close", (code) => {
          clearTimeout(timer);
          if (timedOut) {
            logger.error("claude CLI timed out", {
              timeoutMs: CLAUDE_CLI_TIMEOUT_MS,
              stdout,
              stderr,
            });
            reject(
              new Error(
                `Claude CLI did not respond within ${Math.round(CLAUDE_CLI_TIMEOUT_MS / 1000)}s. Try a shorter prompt, or switch providers in Settings.`
              )
            );
            return;
          }
          if (code !== 0) {
            logger.error("claude CLI failed", { code, stdout, stderr });
            reject(new Error(stderr.trim() || stdout.trim() || `claude exited with code ${code}`));
          } else {
            resolve(stdout.trim());
          }
        });
        proc.stdin.write(fullPrompt);
        proc.stdin.end();
      });
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
