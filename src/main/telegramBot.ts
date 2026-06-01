import { exec } from "child_process";
import TelegramBot from "node-telegram-bot-api";
import type { AgentManager } from "./agentManager";
import { callLLM } from "./llmClient";
import {
  defaultStorageFolder,
  deleteAutomation,
  listAutomations,
  saveAutomation,
} from "./treeStore";

export interface TelegramMessage {
  id: string;
  chatId: number;
  role: "user" | "assistant";
  content: string;
  senderName: string;
  timestamp: string;
}

interface ProviderConfig {
  provider: "openai" | "anthropic" | "ollama" | "claude-code";
  model?: string;
  apiKey?: string;
  credentialId?: string;
  baseUrl?: string;
}

interface BotConfig {
  token: string;
  providerConfig: ProviderConfig;
  agentManager?: AgentManager;
  onMessage: (message: TelegramMessage) => void;
  onEvent: (event: string, data?: unknown) => void;
}

// ─── System prompt ────────────────────────────────────────────────────────────

function buildSystemPrompt(): string {
  const isWindows = process.platform === "win32";
  const shellNote = isWindows
    ? `## Platform: Windows — PowerShell
run-command uses PowerShell. Use PowerShell syntax only.
- ALWAYS write files to $env:TEMP or $env:APPDATA — NEVER to C:\\ (access denied)
- Write a script: \`Set-Content "$env:TEMP\\\\loopi-script.ps1" 'your script'\`
- Run a script: \`powershell -ExecutionPolicy Bypass -File "$env:TEMP\\\\loopi-script.ps1"\`
- Windows notification: \`Add-Type -AssemblyName System.Windows.Forms; $n = New-Object System.Windows.Forms.NotifyIcon; $n.Icon = [System.Drawing.SystemIcons]::Information; $n.Visible = $true; $n.ShowBalloonTip(5000,'Loopi','{{message}}',[System.Windows.Forms.ToolTipIcon]::Info)\`
- Schedule task: \`schtasks /create /tn "TaskName" /tr "powershell -File $env:TEMP\\\\script.ps1" /sc MINUTE /mo 5 /f\`
- Read file: \`Get-Content "$env:TEMP\\\\data.txt"\`
- Delete scheduled task: \`schtasks /delete /tn "TaskName" /f\`
`
    : `## Platform: Linux/macOS — /bin/sh
run-command uses /bin/sh.
- Notifications: \`notify-send "Title" "Body"\` (Linux) or \`osascript -e 'display notification "Body" with title "Title"'\` (macOS)
- Schedule: use cron via \`crontab -e\`
`;

  return `You are Loopi AI, accessible via Telegram. You have FULL capabilities — create workflows, run commands, build automations. Users message from their phone but you execute real actions on their computer.

## Creating Workflows
\`\`\`workflow-create
{
  "name": "Workflow Name",
  "description": "What this workflow does",
  "steps": [
    { "type": "apiCall", "url": "https://hacker-news.firebaseio.com/v0/topstories.json", "method": "GET", "storeKey": "stories", "description": "Fetch top story IDs" },
    { "type": "jsonParse", "sourceVariable": "stories", "path": "data[0]", "storeKey": "topId", "description": "Get first ID" }
  ]
}
\`\`\`

Available step types: navigate, click, type, wait, screenshot, extract, scroll, selectOption, hover, fileUpload, setVariable, modifyVariable, browserConditional, variableConditional, forEach, apiCall, aiOpenAI, aiAnthropic, aiOllama, jsonParse, jsonStringify, mathOperation, stringOperation, dateTime, filterArray, mapArray, codeExecute, systemCommand, desktopKeyboard, desktopMouseMove, desktopMouseClick, desktopMouseDrag, desktopMouseScroll, desktopScreenshot, and integrations (discord, twitter, slack, telegram, github, notion, sendgrid, stripe, postgres, googleSheets, etc.).

### Key step fields:
- **apiCall**: { "type": "apiCall", "url": "...", "method": "GET", "storeKey": "result" } — body at \`.data\`, jsonParse paths must start with \`data.\`
- **systemCommand**: { "type": "systemCommand", "command": "...", "storeKey": "output" }
- **jsonParse**: { "type": "jsonParse", "sourceVariable": "varName", "path": "data.items[0].title", "storeKey": "parsed" }
- **setVariable**: { "type": "setVariable", "variableName": "foo", "value": "bar" }
- **forEach**: { "type": "forEach", "arrayVariable": "items", "itemVariable": "currentItem", "indexVariable": "loopIndex" }
- **variableConditional**: { "type": "variableConditional", "variableConditionType": "variableEquals"|"variableContains"|"variableExists", "variableName": "foo", "expectedValue": "bar" }

CRITICAL: Flat steps array only — no nested \`steps:[]\` inside forEach/conditional. Place body steps AFTER in the same flat list.

BANNED in systemCommand: curl, wget, jq, python scripts — use apiCall + jsonParse steps instead.

## Creating Agents
\`\`\`agent-create
{
  "name": "Agent Name",
  "role": "What the agent does",
  "description": "Longer description",
  "goal": "Primary goal of this agent",
  "capabilities": ["ai", "workflows"],
  "workflowNames": ["Workflow Name"],
  "schedule": { "type": "interval", "intervalMinutes": 5 }
}
\`\`\`

## Running Commands
\`\`\`loopi-action
{ "action": "run-command", "command": "echo hello", "description": "Show message" }
\`\`\`

## Managing Workflows
\`\`\`loopi-action
{ "action": "list-workflows" }
\`\`\`
\`\`\`loopi-action
{ "action": "delete-workflow", "name": "Workflow Name" }
\`\`\`

${shellNote}
## Rules
- BUILD things when asked — emit the actual workflow-create or run-command blocks
- Keep explanatory text short — the user is on mobile
- Use agent-create for recurring/scheduled tasks (much more reliable than schtasks for Loopi tasks)
- After creating things, confirm briefly what was built`;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function flattenSteps(arr: Array<Record<string, unknown>>): Array<Record<string, unknown>> {
  const out: Array<Record<string, unknown>> = [];
  for (const s of arr) {
    const { steps: nested, ...rest } = s as Record<string, unknown> & { steps?: unknown };
    if (rest.type === "forEach" && !rest.arrayVariable) {
      if (typeof rest.items === "string") rest.arrayVariable = rest.items;
      if (typeof rest.array === "string" && !rest.arrayVariable) rest.arrayVariable = rest.array;
      if (typeof rest.list === "string" && !rest.arrayVariable) rest.arrayVariable = rest.list;
      if (typeof rest.arrayVariable === "string")
        rest.arrayVariable = (rest.arrayVariable as string).replace(/^\{\{|\}\}$/g, "");
    }
    if (rest.type === "forEach" && !rest.itemVariable) {
      if (typeof rest.itemVar === "string") rest.itemVariable = rest.itemVar;
      else if (typeof rest.item === "string") rest.itemVariable = rest.item;
    }
    if (rest.type === "setVariable" && !rest.variableName && typeof rest.key === "string")
      rest.variableName = rest.key;
    out.push(rest);
    if (Array.isArray(nested)) out.push(...flattenSteps(nested as Array<Record<string, unknown>>));
  }
  return out;
}

function stepsToAutomation(wfConfig: Record<string, unknown>) {
  const steps = flattenSteps(wfConfig.steps as Array<Record<string, unknown>>);
  const CONDITIONAL_TYPES = new Set(["browserConditional", "variableConditional", "forEach"]);

  const nodes = steps.map((step, i) => ({
    id: String(i + 1),
    type: CONDITIONAL_TYPES.has(step.type as string) ? step.type : "automationStep",
    data: { step: { ...step, id: String(i + 1) } },
    position: { x: 250, y: i * 120 + 50 },
  }));

  const edges = nodes.slice(0, -1).map((n, i) => {
    const srcType = (n.data.step as Record<string, unknown>).type as string;
    let sourceHandle: string | undefined;
    if (srcType === "forEach") sourceHandle = "loop";
    else if (srcType === "browserConditional" || srcType === "variableConditional")
      sourceHandle = "if";
    return {
      id: `e${i + 1}-${i + 2}`,
      source: String(i + 1),
      target: String(i + 2),
      ...(sourceHandle ? { sourceHandle } : {}),
    };
  });

  return {
    id: Date.now().toString(),
    name: wfConfig.name as string,
    description: (wfConfig.description as string) || "",
    nodes,
    edges,
    steps: steps.map((s, i) => ({ ...s, id: String(i + 1) })),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    enabled: true,
  };
}

function runCommand(command: string): Promise<string> {
  return new Promise((resolve) => {
    const shell = process.platform === "win32" ? "powershell.exe" : "/bin/sh";
    exec(command, { timeout: 30000, shell }, (_err, stdout, stderr) => {
      const out = stdout?.trim();
      const err = stderr?.trim();
      if (out) resolve(out.slice(0, 600));
      else if (err) resolve(`Error: ${err.slice(0, 400)}`);
      else resolve("Done.");
    });
  });
}

function stripBlocks(text: string): string {
  return text
    .replace(/```(?:workflow-create|agent-create|loopi-action)[\s\S]*?```/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// ─── Block executor ───────────────────────────────────────────────────────────

async function executeBlocks(
  response: string,
  send: (text: string) => Promise<void>,
  agentManager: AgentManager | undefined,
  providerConfig: ProviderConfig,
  onEvent: (event: string, data?: unknown) => void
): Promise<void> {
  const createdWorkflowIds: Record<string, string> = {};

  // 1. workflow-create blocks
  const workflowBlocks = response.match(/```workflow-create\s*([\s\S]*?)```/g) ?? [];
  for (const block of workflowBlocks) {
    try {
      const json = block
        .replace(/```workflow-create\s*/, "")
        .replace(/```$/, "")
        .trim();
      const wfConfig = JSON.parse(json);
      if (wfConfig.name && Array.isArray(wfConfig.steps) && wfConfig.steps.length > 0) {
        const automation = stepsToAutomation(wfConfig);
        saveAutomation(
          automation as unknown as Parameters<typeof saveAutomation>[0],
          defaultStorageFolder
        );
        createdWorkflowIds[wfConfig.name] = automation.id;
        onEvent("telegram:workflowSaved");
        await send(`✅ Workflow "${wfConfig.name}" created (${wfConfig.steps.length} steps).`);
      }
    } catch (e) {
      await send(`❌ Workflow creation failed: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  // 2. agent-create blocks
  if (agentManager) {
    const agentBlocks = response.match(/```agent-create\s*([\s\S]*?)```/g) ?? [];
    for (const block of agentBlocks) {
      try {
        const json = block
          .replace(/```agent-create\s*/, "")
          .replace(/```$/, "")
          .trim();
        const agentConfig = JSON.parse(json);
        if (agentConfig.name && agentConfig.role) {
          const goal: string =
            typeof agentConfig.goal === "string" && agentConfig.goal.trim()
              ? agentConfig.goal.trim()
              : typeof agentConfig.description === "string"
                ? agentConfig.description
                : "";

          // Resolve workflow IDs by name
          const workflowIds: string[] = [];
          if (Array.isArray(agentConfig.workflowNames)) {
            for (const name of agentConfig.workflowNames) {
              if (createdWorkflowIds[name]) {
                workflowIds.push(createdWorkflowIds[name]);
              } else {
                const all = listAutomations(defaultStorageFolder);
                const match = all.find(
                  (w) => w.name.toLowerCase() === (name as string).toLowerCase()
                );
                if (match) workflowIds.push(match.id);
              }
            }
          }

          const agent = await agentManager.createAgent({
            name: agentConfig.name,
            role: agentConfig.role,
            description: agentConfig.description || "",
            goal,
            capabilities: agentConfig.capabilities || ["ai", "workflows"],
            model: {
              provider: providerConfig.provider,
              model: providerConfig.model || "claude",
              credentialId: providerConfig.credentialId,
              baseUrl: providerConfig.baseUrl,
            },
            workflowIds,
            schedule: agentConfig.schedule,
            credentialIds: [],
            createdBy: "loopi",
          });
          onEvent("telegram:agentCreated");
          await send(`✅ Agent "${agent.name}" created.`);
        }
      } catch (e) {
        await send(`❌ Agent creation failed: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  }

  // 3. loopi-action blocks
  const actionBlocks = response.match(/```loopi-action\s*([\s\S]*?)```/g) ?? [];
  for (const block of actionBlocks) {
    try {
      const json = block
        .replace(/```loopi-action\s*/, "")
        .replace(/```$/, "")
        .trim();
      const action = JSON.parse(json);

      if (action.action === "run-command" && action.command) {
        const output = await runCommand(action.command as string);
        await send(`🖥️ ${action.description || action.command}\n\`\`\`\n${output}\n\`\`\``);
      } else if (action.action === "list-workflows") {
        const workflows = listAutomations(defaultStorageFolder);
        const list = workflows.map((w) => `• ${w.name}`).join("\n") || "No workflows yet.";
        await send(`📋 Workflows:\n${list}`);
      } else if (action.action === "delete-workflow" && action.name) {
        const workflows = listAutomations(defaultStorageFolder);
        const match = workflows.find(
          (w) => w.name.toLowerCase() === (action.name as string).toLowerCase()
        );
        if (match) {
          deleteAutomation(match.id, defaultStorageFolder);
          await send(`🗑️ Deleted workflow "${match.name}".`);
        } else {
          await send(`❌ Workflow "${action.name}" not found.`);
        }
      }
    } catch (e) {
      await send(`❌ Action failed: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
}

// ─── Bot service ──────────────────────────────────────────────────────────────

class TelegramBotService {
  private bot: TelegramBot | null = null;
  private chatHistories = new Map<number, Array<{ role: string; content: string }>>();
  private botUsername: string | null = null;
  private config: BotConfig | null = null;

  async connect(
    config: BotConfig
  ): Promise<{ success: boolean; username?: string; error?: string }> {
    try {
      if (this.bot) await this.disconnect();

      this.config = config;
      this.bot = new TelegramBot(config.token, { polling: true });

      const me = await this.bot.getMe();
      this.botUsername = me.username ?? null;

      this.bot.on("message", async (msg) => {
        if (!msg.text || !this.config) return;

        const chatId = msg.chat.id;
        const senderName = msg.from?.first_name || msg.from?.username || "User";
        const text = msg.text;

        // Push user message to renderer
        this.config.onMessage({
          id: `tg-${Date.now()}-user`,
          chatId,
          role: "user",
          content: text,
          senderName,
          timestamp: new Date().toISOString(),
        });

        if (!this.chatHistories.has(chatId)) this.chatHistories.set(chatId, []);
        const history = this.chatHistories.get(chatId)!;
        history.push({ role: "user", content: text });

        const send = async (message: string) => {
          await this.bot!.sendMessage(chatId, message, { parse_mode: "Markdown" }).catch(() =>
            this.bot!.sendMessage(chatId, message)
          );
        };

        try {
          const result = await callLLM({
            messages: [
              { role: "system", content: buildSystemPrompt() },
              ...(history as Array<{ role: "user" | "assistant" | "system"; content: string }>),
            ],
            provider: this.config.providerConfig.provider,
            model: this.config.providerConfig.model,
            apiKey: this.config.providerConfig.apiKey,
            credentialId: this.config.providerConfig.credentialId,
            baseUrl: this.config.providerConfig.baseUrl,
          });

          if (result.success && result.response) {
            history.push({ role: "assistant", content: result.response });

            // Send readable text to Telegram (code blocks stripped)
            const visibleText = stripBlocks(result.response);
            if (visibleText) await send(visibleText);

            // Execute workflow-create / agent-create / loopi-action blocks
            await executeBlocks(
              result.response,
              send,
              this.config.agentManager,
              this.config.providerConfig,
              this.config.onEvent
            );

            // Push full response to renderer (Telegram tab)
            this.config.onMessage({
              id: `tg-${Date.now()}-assistant`,
              chatId,
              role: "assistant",
              content: result.response,
              senderName: "Loopi",
              timestamp: new Date().toISOString(),
            });
          }
        } catch (err) {
          console.error("[TelegramBot] Error:", err);
          await send("Sorry, something went wrong. Please try again.");
        }
      });

      this.bot.on("polling_error", (err) => {
        console.error("[TelegramBot] Polling error:", err.message);
      });

      return { success: true, username: this.botUsername ?? undefined };
    } catch (err) {
      this.bot = null;
      this.config = null;
      return { success: false, error: err instanceof Error ? err.message : String(err) };
    }
  }

  async disconnect(): Promise<void> {
    if (this.bot) {
      try {
        await this.bot.stopPolling();
      } catch {
        // ignore
      }
      this.bot = null;
      this.botUsername = null;
      this.chatHistories.clear();
      this.config = null;
    }
  }

  getStatus(): { connected: boolean; username?: string } {
    return { connected: this.bot !== null, username: this.botUsername ?? undefined };
  }
}

export const telegramBotService = new TelegramBotService();
