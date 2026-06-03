import { createLogger } from "@utils/logger";
import { execSync, spawn } from "child_process";
import { existsSync } from "fs";
import http from "http";

const logger = createLogger("ClaudeCodeWorker");

const WORKER_PORT_BASE = 19544;
const CLAUDE_CLI_TIMEOUT_MS = 600_000;
const CONNECT_TIMEOUT_MS = 5_000;
const MAX_BACKOFF_MS = 30_000;

interface Session {
  claudeSessionId: string;
  lastUsedAt: number;
}

class ClaudeCodeWorker {
  private server: http.Server | null = null;
  private port: number | null = null;
  private sessions = new Map<string, Session>();
  private claudePath: string | null = null;
  private startPromise: Promise<void> | null = null;
  private backoffMs = 1_000;

  private resolveClaudePath(): string {
    if (this.claudePath) return this.claudePath;

    const isWindows = process.platform === "win32";
    let claudePath = isWindows ? "claude.cmd" : "claude";

    try {
      const whichCmd = isWindows ? "where claude" : "which claude";
      claudePath = execSync(whichCmd, { encoding: "utf-8" }).trim().split(/\r?\n/)[0];
    } catch {
      const candidates = isWindows
        ? [
            `${process.env.APPDATA}\\npm\\claude.cmd`,
            `${process.env.APPDATA}\\npm\\claude`,
            `${process.env.LOCALAPPDATA}\\npm\\claude.cmd`,
          ]
        : [
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

    this.claudePath = claudePath;
    return claudePath;
  }

  private makeEnv(): NodeJS.ProcessEnv {
    const env = { ...process.env };
    delete env.ANTHROPIC_API_KEY;
    if (process.platform !== "win32" && !env.PATH?.includes(".local/bin")) {
      env.PATH = `${process.env.HOME}/.local/bin:${env.PATH}`;
    }
    return env;
  }

  private runClaude(
    extraArgs: string[],
    prompt: string
  ): Promise<{ text: string; claudeSessionId: string }> {
    const claudePath = this.resolveClaudePath();
    const env = this.makeEnv();

    return new Promise((resolve, reject) => {
      let timedOut = false;
      const proc = spawn(claudePath, [...extraArgs, "--output-format", "json", "-p"], {
        stdio: ["pipe", "pipe", "pipe"],
        env,
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
          logger.error("claude CLI timed out", { timeoutMs: CLAUDE_CLI_TIMEOUT_MS });
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
          return;
        }
        try {
          const parsed = JSON.parse(stdout.trim()) as {
            result?: string;
            session_id?: string;
          };
          resolve({
            text: String(parsed.result ?? ""),
            claudeSessionId: String(parsed.session_id ?? ""),
          });
        } catch {
          resolve({ text: stdout.trim(), claudeSessionId: "" });
        }
      });

      proc.stdin.write(prompt);
      proc.stdin.end();
    });
  }

  private async processChat(
    appSessionId: string,
    messages: Array<{ role: string; content: string }>
  ): Promise<string> {
    const session = this.sessions.get(appSessionId);
    const systemMsgs = messages.filter((m) => m.role === "system");
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUser) throw new Error("No user message in request");

    let args: string[];
    let prompt: string;

    if (session?.claudeSessionId) {
      // Existing session — only send the new user message; claude CLI owns the history
      args = ["--resume", session.claudeSessionId];
      prompt = lastUser.content;
    } else {
      // First turn — include system prompt so claude is primed correctly
      args = [];
      const parts: string[] = [];
      if (systemMsgs.length > 0) {
        parts.push(systemMsgs.map((m) => m.content).join("\n"));
      }
      parts.push(lastUser.content);
      prompt = parts.join("\n\n");
    }

    const { text, claudeSessionId } = await this.runClaude(args, prompt);

    if (claudeSessionId) {
      this.sessions.set(appSessionId, { claudeSessionId, lastUsedAt: Date.now() });
    }

    return text;
  }

  private readBody(req: http.IncomingMessage): Promise<string> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      req.on("data", (c: Buffer) => chunks.push(c));
      req.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
      req.on("error", reject);
    });
  }

  private handleRequest = async (
    req: http.IncomingMessage,
    res: http.ServerResponse
  ): Promise<void> => {
    const sendJson = (status: number, data: unknown) => {
      res.writeHead(status, { "Content-Type": "application/json" });
      res.end(JSON.stringify(data));
    };

    const url = req.url ?? "/";
    const method = req.method ?? "GET";

    if (url === "/health" && method === "GET") {
      sendJson(200, { ok: true, sessions: this.sessions.size });
      return;
    }

    if (url === "/chat" && method === "POST") {
      try {
        const body = await this.readBody(req);
        const { sessionId, messages } = JSON.parse(body) as {
          sessionId: string;
          messages: Array<{ role: string; content: string }>;
        };
        if (!sessionId || !Array.isArray(messages)) {
          sendJson(400, { error: "Missing sessionId or messages" });
          return;
        }
        const text = await this.processChat(sessionId, messages);
        sendJson(200, { response: text });
      } catch (err) {
        logger.error("Worker chat error", err);
        sendJson(500, { error: err instanceof Error ? err.message : String(err) });
      }
      return;
    }

    sendJson(404, { error: "Not found" });
  };

  private startServer(): Promise<void> {
    if (this.startPromise) return this.startPromise;

    this.startPromise = new Promise<void>((resolve, reject) => {
      const tryPort = (port: number) => {
        const srv = http.createServer(this.handleRequest);

        srv.listen(port, "127.0.0.1", () => {
          this.server = srv;
          this.port = port;
          this.backoffMs = 1_000;
          logger.info(`Claude Code Worker listening on 127.0.0.1:${port}`);
          resolve();
        });

        srv.on("error", (err: NodeJS.ErrnoException) => {
          if (err.code === "EADDRINUSE") {
            tryPort(port + 1);
          } else {
            this.startPromise = null;
            reject(err);
          }
        });
      };

      tryPort(WORKER_PORT_BASE);
    });

    return this.startPromise;
  }

  private isHealthy(): Promise<boolean> {
    if (!this.port) return Promise.resolve(false);
    return new Promise<boolean>((resolve) => {
      const req = http.request(
        { hostname: "127.0.0.1", port: this.port!, path: "/health", method: "GET" },
        (res) => {
          res.resume();
          resolve(res.statusCode === 200);
        }
      );
      req.on("error", () => resolve(false));
      req.setTimeout(CONNECT_TIMEOUT_MS, () => {
        req.destroy();
        resolve(false);
      });
      req.end();
    });
  }

  private async ensureRunning(): Promise<void> {
    if (this.server && this.port) {
      const ok = await this.isHealthy();
      if (ok) return;
      // Server has died — reset state and restart with exponential backoff
      this.server = null;
      this.port = null;
      this.startPromise = null;
      await new Promise<void>((r) => setTimeout(r, this.backoffMs));
      this.backoffMs = Math.min(this.backoffMs * 2, MAX_BACKOFF_MS);
    }
    await this.startServer();
  }

  async send(
    sessionId: string,
    messages: Array<{ role: string; content: string }>
  ): Promise<string> {
    await this.ensureRunning();

    const port = this.port!;
    const body = JSON.stringify({ sessionId, messages });

    return new Promise<string>((resolve, reject) => {
      const req = http.request(
        {
          hostname: "127.0.0.1",
          port,
          path: "/chat",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(body),
          },
        },
        (res) => {
          let data = "";
          res.on("data", (c: Buffer) => (data += c.toString()));
          res.on("end", () => {
            try {
              const parsed = JSON.parse(data) as { response?: string; error?: string };
              if (parsed.error) reject(new Error(parsed.error));
              else resolve(parsed.response ?? "");
            } catch (e) {
              reject(e);
            }
          });
        }
      );

      req.on("error", reject);
      req.setTimeout(CLAUDE_CLI_TIMEOUT_MS + CONNECT_TIMEOUT_MS, () => {
        req.destroy(new Error("Worker request timed out"));
      });
      req.write(body);
      req.end();
    });
  }

  stop(): void {
    if (this.server) {
      this.server.close();
      this.server = null;
      this.port = null;
      this.startPromise = null;
    }
    this.sessions.clear();
    logger.info("Claude Code Worker stopped");
  }
}

export const claudeCodeWorker = new ClaudeCodeWorker();
