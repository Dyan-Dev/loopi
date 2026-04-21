import type { AppSettings, Credential } from "@app-types/globals";
import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select";
import {
  AlertCircle,
  ArrowUp,
  Bot,
  Loader2,
  MessageSquare,
  Plug,
  RotateCcw,
  Workflow,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

type Provider = "openai" | "anthropic" | "ollama" | "claude-code";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ProviderConfig {
  provider: Provider;
  model: string;
  apiKey?: string;
  credentialId?: string;
  baseUrl?: string;
}

const PROVIDER_DEFAULTS: Record<Provider, { model: string; baseUrl: string; label: string }> = {
  openai: { model: "gpt-4o-mini", baseUrl: "https://api.openai.com/v1", label: "OpenAI" },
  anthropic: {
    model: "claude-sonnet-4-5-20250929",
    baseUrl: "https://api.anthropic.com",
    label: "Anthropic",
  },
  ollama: { model: "mistral", baseUrl: "http://localhost:11434", label: "Ollama (Local)" },
  "claude-code": { model: "claude", baseUrl: "", label: "Claude Code" },
};

const SYSTEM_PROMPT = `You are Loopi, a helpful AI assistant integrated into the Loopi automation platform.
Loopi is a visual browser & desktop automation tool with full desktop control (mouse, keyboard, CLI, browser).
You can help users with: building automation workflows, understanding step types, debugging issues, writing scripts, and general questions.

## Creating Workflows
You can create automation workflows directly. Include a JSON block:

\`\`\`workflow-create
{
  "name": "Workflow Name",
  "description": "What this workflow does",
  "steps": [
    { "type": "navigate", "value": "https://example.com", "description": "Go to site" },
    { "type": "extract", "selector": "h1", "storeKey": "title", "description": "Extract title" }
  ]
}
\`\`\`

Available step types: navigate, click, type, wait, screenshot, extract, scroll, selectOption, hover, fileUpload, setVariable, modifyVariable, browserConditional, variableConditional, forEach, apiCall, aiOpenAI, aiAnthropic, aiOllama, jsonParse, jsonStringify, mathOperation, stringOperation, dateTime, filterArray, mapArray, codeExecute, systemCommand, desktopControl, and all integration steps (discord, twitter, slack, telegram, github, notion, sendgrid, stripe, postgres, googleSheets, etc.).

### EXACT field names per step type — use these or the step will fail:
- **apiCall**: { "type": "apiCall", "url": "...", "method": "GET", "storeKey": "result", "description": "..." }
  ⚠️ apiCall stores the variable as \`{ data: <body>, status: <number>, headers: <obj> }\`. The actual response body lives at \`.data\`. So when extracting fields with jsonParse from an apiCall variable, the path MUST start with \`data.\` (e.g. "data.hits", "data.items[0].title"). A path like just "hits" returns undefined and the next step will fail.
- **systemCommand**: { "type": "systemCommand", "command": "...", "storeKey": "output", "description": "..." } — LOCAL shell only (open app, notify-send, mkdir, touch/cat/echo to file)
- **jsonParse**: { "type": "jsonParse", "sourceVariable": "varName", "path": "data.items[0].title", "storeKey": "parsed", "description": "..." } — \`sourceVariable\` is the plain variable NAME (no \`{{}}\`). When sourceVariable came from apiCall, ALWAYS prefix path with \`data.\`.
- **setVariable**: { "type": "setVariable", "variableName": "foo", "value": "bar", "description": "..." } — field is \`variableName\` NOT \`key\` or \`name\`
- **modifyVariable**: { "type": "modifyVariable", "variableName": "foo", "operation": "set"|"increment"|"decrement"|"append", "value": "...", "description": "..." }
- **stringOperation**: { "type": "stringOperation", "operation": "uppercase"|"lowercase"|"trim"|"replace"|"split"|"includes"|"length"|..., "value": "...", "param1": "...", "param2": "...", "storeKey": "result", "description": "..." } — the source string is \`value\` NOT \`input\`
- **forEach**: { "type": "forEach", "arrayVariable": "items", "itemVariable": "currentItem", "indexVariable": "loopIndex", "description": "..." } — fields are \`arrayVariable\`/\`itemVariable\`/\`indexVariable\`. NEVER \`items\`, \`itemVar\`, \`item\`, \`array\`, \`list\`.
- **variableConditional**: { "type": "variableConditional", "variableConditionType": "variableEquals"|"variableContains"|"variableGreaterThan"|"variableLessThan"|"variableExists", "variableName": "foo", "expectedValue": "bar", "description": "..." } — fields are \`variableName\`/\`expectedValue\`, NOT \`variable\`/\`operator\`/\`value\`.
- **browserConditional**: { "type": "browserConditional", "browserConditionType": "elementExists"|"valueMatches", "selector": "css", "expectedValue": "...", "condition": "equals"|"contains"|"greaterThan"|"lessThan", "description": "..." }
- **codeExecute**: ONLY simple JS expressions in a SANDBOXED env — NO require(), NO Node.js APIs, NO fetch. Use apiCall/systemCommand instead.

### 🚨 CRITICAL — forEach and variableConditional body structure:
Loopi uses a FLAT steps array. Loopi does NOT support nested \`steps: [...]\` arrays inside forEach or variableConditional. Any object like \`{ "type": "forEach", "steps": [...] }\` or \`{ "type": "variableConditional", "steps": [...] }\` is WRONG and the nested steps will be dropped.

The forEach/variableConditional body is expressed as SUBSEQUENT steps at the same array level that reference the loop/conditional variables (\`{{currentItem}}\`, \`{{loopIndex}}\`, etc.). Loopi wires them based on order — simply place body steps AFTER the forEach/conditional node in the flat list.

Correct flat layout example:
\`\`\`
"steps": [
  { "type": "apiCall", "url": "...", "storeKey": "stories", "description": "Fetch" },
  { "type": "forEach", "arrayVariable": "stories", "itemVariable": "story", "description": "Loop stories" },
  { "type": "jsonParse", "sourceVariable": "story", "path": "title", "storeKey": "title", "description": "Title" },
  { "type": "variableConditional", "variableConditionType": "variableExists", "variableName": "title", "description": "If title present" },
  { "type": "systemCommand", "command": "notify-send \"{{title}}\"", "description": "Notify" }
]
\`\`\`
Do NOT wrap the body steps inside a \`steps: [...]\` property of the forEach/conditional node.

### 📦 JSON-level quoting (CRITICAL — invalid JSON means the workflow is silently dropped):
Workflow-create and agent-create blocks MUST be strict, parseable JSON. The most common mistake is un-escaped double quotes inside a JSON string value. Remember:
- Every \`"\` that appears *inside* a JSON string value must be written as \`\\"\`.
- This applies to shell commands: the literal shell command \`notify-send "Title" "{{body}}"\` inside a JSON "command" field must be written as: \`"command": "notify-send \\"Title\\" \\"{{body}}\\""\`.
- NEVER write \`"command": "notify-send "Title" "{{body}}""\` — that's four quotes in a row that terminate the JSON string early and break parsing.
- If unsure, mentally escape every inner \`"\` as \`\\"\` before emitting the block.

### 🛡️ Shell-safety in systemCommand (CRITICAL — aborts workflows silently if violated):
Variable substitutions ({{var}}) often contain characters that break shell quoting: apostrophes (\`'\`), backticks, \`$\`, newlines, ampersands, non-Latin scripts (Telugu, Hindi, Arabic). A single apostrophe inside a single-quoted shell string breaks the command, the step throws, and the whole run aborts — which is why "only one notification across many runs" is usually this bug.

**RULES — apply every time you write a systemCommand that contains {{var}}:**
1. **NEVER wrap {{var}} in single quotes.** \`'{{title}}'\` WILL break on any apostrophe in the title.
2. **Always use DOUBLE quotes** around \`{{var}}\` substitutions: \`"{{title}}"\`.
3. For \`notify-send\`, pass title and body as separate double-quoted args: \`notify-send "News" "{{title}}"\`.
4. For appending to files, prefer \`printf '%s\\n' "{{title}}" >> "{{agentDataDir}}/seen.txt"\` over \`echo '{{title}}' >> ...\`. \`printf %s\` is literal and won't re-interpret escape sequences.
5. Single-quoted LITERALS (no {{var}}) are fine: \`'Hello'\` or \`'తెలుగు వార్తలు'\`.

### 🚫 BANNED inside systemCommand — these MUST be separate Loopi steps:
- **curl / wget / http / httpie** → FORBIDDEN. Use an \`apiCall\` step instead. HTTP requests NEVER go in systemCommand.
- **jq / grep on JSON / sed on JSON / python -c "import json..."** → FORBIDDEN. Use a \`jsonParse\` step instead. JSON extraction NEVER goes in systemCommand.
- **python3 / python / node / bash running a script file** → FORBIDDEN. Build the logic as multiple Loopi steps.
- **pip install / npm install / apt install (as workflow logic)** → FORBIDDEN. Workflows must not install anything.
- **Long one-liners chained with &&** that do fetch-then-parse → FORBIDDEN. Each phase (fetch, parse, act) MUST be its own Loopi step.

**If a workflow uses curl, wget, jq, or a python/bash one-liner to fetch/parse data, it is WRONG and must be rewritten as discrete apiCall + jsonParse + systemCommand steps. No exceptions.**

### Decomposition rule — how to decide step types:
- Fetching anything from the internet → \`apiCall\` step.
- Reading a field out of a JSON variable → \`jsonParse\` step.
- Storing/transforming values → \`setVariable\` / \`stringOperation\` / \`mathOperation\` steps.
- Looping → \`forEach\`. Conditionals → \`variableConditional\`.
- Running anything locally (notify-send, xdg-open, touch, echo >> file) → \`systemCommand\`.

### CRITICAL WORKFLOW DESIGN RULES:
1. **NEVER create external scripts** (Python, Bash, etc.) and call them via systemCommand. All logic MUST be built using Loopi's native step types.
2. **NEVER write files to \`~\`, \`~/.config/\`, \`/tmp\`, or anywhere else on the filesystem as part of workflow logic.** When an agent workflow needs to persist data between runs (dedup tracking, caches, state), use the per-agent folder exposed as \`{{agentDataDir}}\`. Loopi injects this variable at runtime — the folder is created per-agent and visible to the user in the agent detail UI.
3. **For uniqueness/dedup tracking inside agent workflows**: Use \`{{agentDataDir}}/<filename>\` — e.g. \`{{agentDataDir}}/seen-ids.txt\`. NEVER use \`~/.config/loopi\` or any hand-rolled path.
4. **For desktop notifications**: Use systemCommand with notify-send directly — e.g. { "type": "systemCommand", "command": "notify-send \"Title\" \"{{body}}\"" }. Double quotes around \`{{var}}\`, not single.
5. **Workflows MUST be self-contained** — every step uses Loopi's built-in step types. No external dependencies, no pip install, no script files.

### Agent working directory — \`{{agentDataDir}}\`:
When a workflow runs under an agent, Loopi automatically sets the variable \`agentDataDir\` to an agent-specific folder. Use it like this:
- Read/append a dedup file: \`{ "type": "systemCommand", "command": "touch \"{{agentDataDir}}/seen.txt\" && cat \"{{agentDataDir}}/seen.txt\"", "storeKey": "seen" }\`
- Append to it: \`{ "type": "systemCommand", "command": "printf '%s\\n' \"{{newId}}\" >> \"{{agentDataDir}}/seen.txt\"" }\`
The user can open the agent detail view to inspect and edit these files. **Never hardcode** \`~/.config/loopi\` or similar — always use \`{{agentDataDir}}\`.

### Example — Fetch unique tech news and notify (CORRECT — uses native steps):
\`\`\`
{ "type": "apiCall", "url": "https://hn.algolia.com/api/v1/search_by_date?tags=story&numericFilters=points>20", "method": "GET", "storeKey": "hnData", "description": "Fetch recent HN stories" },
{ "type": "jsonParse", "sourceVariable": "hnData", "path": "data.hits[0].title", "storeKey": "newsTitle", "description": "Extract first story title (data. prefix because apiCall wraps response)" },
{ "type": "jsonParse", "sourceVariable": "hnData", "path": "data.hits[0].url", "storeKey": "newsUrl", "description": "Extract first story URL" },
{ "type": "systemCommand", "command": "notify-send -i info \"Tech News\" \"{{newsTitle}} — {{newsUrl}}\"", "description": "Send desktop notification" }
\`\`\`

### Example — WRONG approaches (DO NOT do any of these):
\`\`\`
{ "type": "systemCommand", "command": "curl -s https://api.example.com/data" }           ← WRONG: use apiCall
{ "type": "systemCommand", "command": "curl ... | jq -r .hits[0].title" }                 ← WRONG: use apiCall + jsonParse
{ "type": "systemCommand", "command": "RESPONSE=$(curl ...) && TITLE=$(echo $RESPONSE | jq ...) && notify-send ..." } ← WRONG: 3+ separate Loopi steps
{ "type": "systemCommand", "command": "python3 ~/.some-script.py" }                       ← WRONG: external script dependency
{ "type": "codeExecute", "code": "require('https').get(...)" }                            ← WRONG: require not allowed in sandbox
{ "type": "systemCommand", "command": "pip3 install requests" }                           ← WRONG: external dependency install
{ "type": "forEach", "items": "{{stories}}", "itemVar": "story", "steps": [ ... ] }       ← WRONG: field names are arrayVariable/itemVariable and NO nested steps
{ "type": "variableConditional", "variable": "foo", "operator": "notEquals", "steps": [...] } ← WRONG: use variableConditionType/variableName/expectedValue; NO nested steps
{ "type": "setVariable", "key": "x", "value": "y" }                                        ← WRONG: field is variableName not key
{ "type": "stringOperation", "operation": "trim", "input": "  hi  " }                      ← WRONG: field is value not input
\`\`\`

## Creating Agents
Agents are goal-driven: you give them a clear outcome to achieve plus a list of workflows that move toward that goal.
After every run the reflection engine decides whether progress was made and may auto-patch the workflow graph.

**CRITICAL RULE: When creating an agent, you MUST create workflow-create blocks FIRST for each workflow the agent will run, THEN create the agent-create block. The agent-create block lists workflows by "workflowNames" (matching each workflow's "name" field). Never invent workflowIds — the system resolves names to IDs at creation time.**

Example — creating a goal-driven agent with its workflows:

\`\`\`workflow-create
{
  "name": "Scrape Headlines",
  "description": "Navigate to news site and extract headlines",
  "steps": [
    { "type": "navigate", "value": "https://news.example.com", "description": "Go to news site" },
    { "type": "extract", "selector": "h2.headline", "storeKey": "headlines", "description": "Extract headlines" }
  ]
}
\`\`\`

\`\`\`workflow-create
{
  "name": "Send News Notification",
  "description": "Send desktop notification with news summary",
  "steps": [
    { "type": "systemCommand", "command": "notify-send \"News Update\" \"{{headlines}}\"", "description": "Send notification" }
  ]
}
\`\`\`

\`\`\`agent-create
{
  "name": "News Monitor",
  "role": "News aggregator",
  "description": "Scrapes headlines and notifies user",
  "goal": "Every 30 minutes, fetch the latest news headlines and send the user exactly one desktop notification summarising the new stories.",
  "capabilities": ["browser", "desktop", "ai", "workflows"],
  "workflowNames": ["Scrape Headlines", "Send News Notification"],
  "schedule": { "type": "interval", "intervalMinutes": 30 }
}
\`\`\`

Schedule types: interval ({ "type": "interval", "intervalMinutes": N }), cron ({ "type": "cron", "expression": "..." }), once ({ "type": "once", "datetime": "..." }), or omit for manual.

For desktop notifications, use a systemCommand step with notify-send or a dedicated notification workflow.

## Running Commands & Workflows Directly
You can execute system commands and run workflows directly from chat. This is how you DO things — not just plan them.

### Run a shell command on the user's PC:
\`\`\`loopi-action
{ "action": "run-command", "command": "sudo apt install -y xdotool", "description": "Install xdotool for keyboard simulation" }
\`\`\`

### Run a workflow by name:
\`\`\`loopi-action
{ "action": "run-workflow", "name": "Workflow Name Here" }
\`\`\`

### Run multiple commands sequentially:
\`\`\`loopi-action
{ "action": "run-command", "command": "pip3 install pyautogui", "description": "Install pyautogui" }
\`\`\`
\`\`\`loopi-action
{ "action": "run-command", "command": "python3 -c 'import pyautogui; print(pyautogui.size())'", "description": "Check screen size" }
\`\`\`

**CRITICAL: You have FULL access to the user's PC.** You can install packages, run scripts, open browsers, control the desktop — ANYTHING via run-command. When the user asks you to do something, DO IT using run-command blocks. NEVER say "I can't run commands" or ask the user to run commands themselves. You ARE the automation tool.

## Managing Agents & Workflows
You can delete agents and workflows, or list them. Use action blocks:

\`\`\`loopi-action
{ "action": "delete-agent", "name": "Agent Name Here" }
\`\`\`

\`\`\`loopi-action
{ "action": "delete-workflow", "name": "Workflow Name Here" }
\`\`\`

\`\`\`loopi-action
{ "action": "list-agents" }
\`\`\`

\`\`\`loopi-action
{ "action": "list-workflows" }
\`\`\`

When the user asks to delete an agent or workflow, ALWAYS include the loopi-action block — just saying "deleted" does nothing. You can include multiple action blocks in one response.

## Guidelines
- For simple questions, just answer directly
- **When the user asks you to DO something (run, install, play, open, execute), use run-command action blocks. You have full system access.**
- When creating an agent, ALWAYS create the workflows it needs FIRST in the same response
- Every agent task should have a workflowName pointing to a workflow you created above it
- When deleting, ALWAYS use loopi-action blocks — never just say you deleted something
- After creating a workflow, you can immediately run it with a run-workflow action block
- You can chain multiple run-command blocks to do complex multi-step tasks
- Be concise and helpful`;

export function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [config, setConfig] = useState<ProviderConfig | null>(null);
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [envKeys, setEnvKeys] = useState<Record<string, boolean>>({});
  const [isDetecting, setIsDetecting] = useState(true);
  const [chatLoaded, setChatLoaded] = useState(false);

  // Setup form state
  const [setupProvider, setSetupProvider] = useState<Provider>("anthropic");
  const [setupModel, setSetupModel] = useState("");
  const [setupApiKey, setSetupApiKey] = useState("");
  const [setupCredentialId, setSetupCredentialId] = useState("");
  const [setupBaseUrl, setSetupBaseUrl] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Persist messages whenever they change
  const persistMessages = useCallback(
    (msgs: ChatMessage[]) => {
      if (!chatLoaded) return;
      const serialized = msgs.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        timestamp: m.timestamp.toISOString(),
      }));
      window.electronAPI?.chat?.save(serialized, config?.provider, config?.model).catch(() => {
        /* ignore */
      });
    },
    [chatLoaded, config]
  );

  useEffect(() => {
    if (chatLoaded && messages.length > 0) {
      persistMessages(messages);
    }
  }, [messages, persistMessages, chatLoaded]);

  useEffect(() => {
    const init = async () => {
      setIsDetecting(true);

      // 1. Detect env keys (like Claude Code)
      let detected: Record<string, boolean> = {};
      try {
        detected = (await window.electronAPI?.ai.detectEnvKeys()) ?? {};
        setEnvKeys(detected);
      } catch {
        // ignore
      }

      // 2. Load saved settings
      try {
        const settings: AppSettings | undefined = await window.electronAPI?.settings.load();
        if (settings?.aiProvider) {
          setSetupProvider(settings.aiProvider);
          if (settings.aiModel) setSetupModel(settings.aiModel);
          if (settings.aiApiKey) setSetupApiKey(settings.aiApiKey);
          if (settings.aiCredentialId) setSetupCredentialId(settings.aiCredentialId);
          if (settings.ollamaBaseUrl) setSetupBaseUrl(settings.ollamaBaseUrl);
        }
      } catch {
        // ignore
      }

      // 3. Load credentials
      try {
        const creds = await window.electronAPI?.credentials.list();
        if (creds) {
          setCredentials(
            creds.filter(
              (c) =>
                c.type === "openai" ||
                c.type === "anthropic" ||
                c.type === "apiKey" ||
                c.type === "custom"
            )
          );
        }
      } catch {
        // ignore
      }

      // 4. Load saved chat history
      let hasHistory = false;
      try {
        const session = await window.electronAPI?.chat?.load();
        if (session?.messages?.length) {
          setMessages(
            session.messages.map((m) => ({
              ...m,
              timestamp: new Date(m.timestamp),
            }))
          );
          hasHistory = true;
        }
      } catch {
        // ignore
      }

      // 5. Auto-connect: prefer Claude Code CLI > Anthropic API key > OpenAI
      let autoConnected = false;
      if (detected.claudeCode) {
        setConfig({ provider: "claude-code", model: "claude" });
        setIsConnected(true);
        autoConnected = true;
      } else if (detected.anthropic) {
        setConfig({ provider: "anthropic", model: "claude-sonnet-4-5-20250929" });
        setIsConnected(true);
        autoConnected = true;
      } else if (detected.openai) {
        setConfig({ provider: "openai", model: "gpt-4o-mini" });
        setIsConnected(true);
        autoConnected = true;
      }

      setChatLoaded(true);

      // 6. Add greeting if first time connecting with no history
      if (autoConnected && !hasHistory) {
        const greeting: ChatMessage = {
          id: "greeting",
          role: "assistant",
          content:
            "Hey! I'm **Loopi**, your automation assistant. I can help you with:\n\n" +
            "- **Build workflows** — browser automation, API calls, desktop control, and 80+ integrations\n" +
            "- **Create agents** — AI-powered agents that run tasks on a schedule\n" +
            "- **Debug & explain** — understand existing workflows or fix issues\n\n" +
            "Just tell me what you want to automate and I'll get it done!",
          timestamp: new Date(),
        };
        setMessages([greeting]);
      }

      setIsDetecting(false);
    };

    init();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleConnect = () => {
    const provider = setupProvider;
    const defaults = PROVIDER_DEFAULTS[provider];
    const hasEnvKey = envKeys[provider];

    if (
      provider !== "ollama" &&
      provider !== "claude-code" &&
      !setupApiKey &&
      !setupCredentialId &&
      !hasEnvKey
    ) {
      setError("API key or credential is required for " + defaults.label);
      return;
    }

    setConfig({
      provider,
      model: setupModel || defaults.model,
      apiKey: setupApiKey || undefined,
      credentialId: setupCredentialId === "manual" ? undefined : setupCredentialId || undefined,
      baseUrl: setupBaseUrl || undefined,
    });
    setIsConnected(true);
    setError(null);

    // Greet on first manual connect if no history
    if (messages.length === 0) {
      setMessages([
        {
          id: "greeting",
          role: "assistant",
          content:
            "Hey! I'm **Loopi**, your automation assistant. I can help you with:\n\n" +
            "- **Build workflows** — browser automation, API calls, desktop control, and 80+ integrations\n" +
            "- **Create agents** — AI-powered agents that run tasks on a schedule\n" +
            "- **Debug & explain** — understand existing workflows or fix issues\n\n" +
            "Just tell me what you want to automate and I'll get it done!",
          timestamp: new Date(),
        },
      ]);
    }
  };

  const handleDisconnect = () => {
    // Persist current messages before disconnecting so they survive reconnect
    if (messages.length > 0) {
      persistMessages(messages);
    }
    setIsConnected(false);
    setConfig(null);
    setError(null);
    // Don't clear messages — they'll be available on reconnect
  };

  const handleResetChat = () => {
    setMessages([]);
    window.electronAPI?.chat?.clear().catch(() => {
      /* ignore */
    });
    toast.success("Chat history cleared");
  };

  const handleSend = async () => {
    if (!input.trim() || !config || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      const apiMessages = [
        { role: "system" as const, content: SYSTEM_PROMPT },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
        { role: "user" as const, content: userMessage.content },
      ];

      const result = await window.electronAPI!.ai.chat({
        messages: apiMessages,
        provider: config.provider,
        apiKey: config.apiKey,
        credentialId: config.credentialId,
        model: config.model,
        baseUrl: config.baseUrl,
      });

      if (result.success && result.response) {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: result.response,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);

        // Track created workflow IDs so agents can reference them
        const createdWorkflowIds: Record<string, string> = {};

        // Parse workflow-create blocks from response
        const workflowBlocks = result.response.match(/```workflow-create\s*([\s\S]*?)```/g);
        if (workflowBlocks) {
          for (const block of workflowBlocks) {
            try {
              const jsonStr = block
                .replace(/```workflow-create\s*/, "")
                .replace(/```$/, "")
                .trim();
              const wfConfig = JSON.parse(jsonStr);
              if (wfConfig.name && wfConfig.steps?.length) {
                const flattenSteps = (
                  arr: Array<Record<string, unknown>>
                ): Array<Record<string, unknown>> => {
                  const out: Array<Record<string, unknown>> = [];
                  for (const s of arr) {
                    const { steps: nested, ...rest } = s as Record<string, unknown> & {
                      steps?: unknown;
                    };
                    if (rest.type === "forEach" && !rest.arrayVariable) {
                      if (typeof rest.items === "string") rest.arrayVariable = rest.items;
                      if (typeof rest.array === "string" && !rest.arrayVariable)
                        rest.arrayVariable = rest.array;
                      if (typeof rest.list === "string" && !rest.arrayVariable)
                        rest.arrayVariable = rest.list;
                      if (typeof rest.arrayVariable === "string") {
                        rest.arrayVariable = (rest.arrayVariable as string).replace(
                          /^\{\{|\}\}$/g,
                          ""
                        );
                      }
                    }
                    if (rest.type === "forEach" && !rest.itemVariable) {
                      if (typeof rest.itemVar === "string") rest.itemVariable = rest.itemVar;
                      else if (typeof rest.item === "string") rest.itemVariable = rest.item;
                    }
                    if (rest.type === "variableConditional") {
                      if (!rest.variableName && typeof rest.variable === "string") {
                        rest.variableName = (rest.variable as string).replace(/^\{\{|\}\}$/g, "");
                      }
                      if (!rest.variableConditionType && typeof rest.operator === "string") {
                        const op = rest.operator as string;
                        const map: Record<string, string> = {
                          equals: "variableEquals",
                          notEquals: "variableEquals",
                          contains: "variableContains",
                          greaterThan: "variableGreaterThan",
                          lessThan: "variableLessThan",
                          exists: "variableExists",
                        };
                        rest.variableConditionType = map[op] || "variableEquals";
                      }
                    }
                    if (
                      rest.type === "setVariable" &&
                      !rest.variableName &&
                      typeof rest.key === "string"
                    ) {
                      rest.variableName = rest.key;
                    }
                    if (
                      rest.type === "stringOperation" &&
                      !rest.value &&
                      typeof rest.input === "string"
                    ) {
                      rest.value = rest.input;
                    }
                    if (
                      rest.type === "jsonParse" ||
                      rest.type === "jsonStringify" ||
                      rest.type === "filterArray" ||
                      rest.type === "mapArray" ||
                      rest.type === "codeExecute"
                    ) {
                      const strip = (s: string) => s.replace(/^\{\{|\}\}$/g, "");
                      if (!rest.sourceVariable && typeof rest.input === "string") {
                        rest.sourceVariable = strip(rest.input);
                      } else if (typeof rest.sourceVariable === "string") {
                        rest.sourceVariable = strip(rest.sourceVariable);
                      }
                      delete rest.input;
                    }
                    out.push(rest);
                    if (Array.isArray(nested)) {
                      out.push(...flattenSteps(nested as Array<Record<string, unknown>>));
                    }
                  }
                  return out;
                };
                wfConfig.steps = flattenSteps(wfConfig.steps as Array<Record<string, unknown>>);
                // Build nodes and edges from steps
                const nodes = wfConfig.steps.map((step: Record<string, unknown>, i: number) => ({
                  id: String(i + 1),
                  type:
                    step.type === "browserConditional" ||
                    step.type === "variableConditional" ||
                    step.type === "forEach"
                      ? step.type
                      : "automationStep",
                  data: { step: { ...step, id: String(i + 1) } },
                  position: { x: 250, y: i * 120 + 50 },
                }));
                const edges = nodes
                  .slice(0, -1)
                  .map((n: { data: { step: Record<string, unknown> } }, i: number) => {
                    const srcType = n.data.step.type;
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

                const automation = {
                  id: Date.now().toString(),
                  name: wfConfig.name,
                  description: wfConfig.description || "",
                  nodes,
                  edges,
                  steps: wfConfig.steps.map((s: Record<string, unknown>, i: number) => ({
                    ...s,
                    id: String(i + 1),
                  })),
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  enabled: true,
                };

                const savedId = await window.electronAPI?.tree.save(automation);
                if (savedId) {
                  createdWorkflowIds[wfConfig.name] = automation.id;
                  toast.success(`Workflow "${wfConfig.name}" created! View it in the Dashboard.`);
                }
              }
            } catch (parseErr) {
              console.error("Failed to parse workflow-create block:", parseErr, block);
              toast.error(
                `Couldn't parse workflow JSON (${parseErr instanceof Error ? parseErr.message : "invalid JSON"}). The agent will have no workflow linked — ask Loopi to retry.`
              );
            }
          }
        }

        // Parse agent-create blocks from response
        const agentBlocks = result.response.match(/```agent-create\s*([\s\S]*?)```/g);
        if (agentBlocks) {
          for (const block of agentBlocks) {
            try {
              const jsonStr = block
                .replace(/```agent-create\s*/, "")
                .replace(/```$/, "")
                .trim();
              const agentConfig = JSON.parse(jsonStr);
              if (agentConfig.name && agentConfig.role) {
                const goal: string =
                  typeof agentConfig.goal === "string" && agentConfig.goal.trim().length > 0
                    ? agentConfig.goal.trim()
                    : typeof agentConfig.description === "string"
                      ? agentConfig.description
                      : "";

                const workflowIds: string[] = [];
                const normaliseName = (s: string) => s.trim().toLowerCase();
                const createdByNormalised = new Map<string, string>();
                for (const [n, id] of Object.entries(createdWorkflowIds)) {
                  createdByNormalised.set(normaliseName(n), id);
                }

                const rawNames: string[] = Array.isArray(agentConfig.workflowNames)
                  ? agentConfig.workflowNames
                  : [];
                // Legacy compat: {tasks: [{workflowName: "..."}]}
                if (rawNames.length === 0 && Array.isArray(agentConfig.tasks)) {
                  for (const t of agentConfig.tasks as Array<Record<string, unknown>>) {
                    if (typeof t.workflowName === "string") rawNames.push(t.workflowName);
                  }
                }

                for (const name of rawNames) {
                  if (typeof name !== "string") continue;
                  const matched = createdByNormalised.get(normaliseName(name));
                  if (matched && !workflowIds.includes(matched)) workflowIds.push(matched);
                }
                if (Array.isArray(agentConfig.workflowIds)) {
                  for (const id of agentConfig.workflowIds) {
                    if (typeof id === "string" && !workflowIds.includes(id)) workflowIds.push(id);
                  }
                }

                // Fallback: if the LLM referenced workflows by name but none matched (or didn't
                // reference any at all while clearly creating workflows this turn), link every
                // workflow created in this response so the agent isn't orphaned.
                if (workflowIds.length === 0 && Object.keys(createdWorkflowIds).length > 0) {
                  for (const id of Object.values(createdWorkflowIds)) {
                    if (!workflowIds.includes(id)) workflowIds.push(id);
                  }
                }

                const agent = await window.electronAPI?.agents.create({
                  name: agentConfig.name,
                  role: agentConfig.role,
                  description: agentConfig.description || "",
                  goal,
                  workflowIds,
                  capabilities: agentConfig.capabilities || ["ai", "workflows"],
                  model: config
                    ? {
                        provider: config.provider,
                        model: config.model,
                        credentialId: config.credentialId,
                        baseUrl: config.baseUrl,
                      }
                    : { provider: "claude-code", model: "claude" },
                  schedule: agentConfig.schedule,
                  credentialIds: [],
                  createdBy: "loopi",
                });
                if (agent) {
                  toast.success(`Agent "${agent.name}" created! View it in the Agents tab.`);
                }
              }
            } catch (parseErr) {
              console.error("Failed to parse agent-create block:", parseErr);
              toast.error(
                `Couldn't parse agent JSON (${parseErr instanceof Error ? parseErr.message : "invalid JSON"}). Ask Loopi to retry.`
              );
            }
          }
        }

        // Parse loopi-action blocks (delete, list, etc.)
        const actionBlocks = result.response.match(/```loopi-action\s*([\s\S]*?)```/g);
        if (actionBlocks) {
          for (const block of actionBlocks) {
            try {
              const jsonStr = block
                .replace(/```loopi-action\s*/, "")
                .replace(/```$/, "")
                .trim();
              const action = JSON.parse(jsonStr);

              if (action.action === "delete-agent" && action.name) {
                const agents = await window.electronAPI?.agents.list();
                const match = agents?.find(
                  (a: { name: string }) => a.name.toLowerCase() === action.name.toLowerCase()
                );
                if (match) {
                  await window.electronAPI?.agents.delete(match.id);
                  toast.success(`Agent "${match.name}" deleted`);
                } else {
                  toast.error(`Agent "${action.name}" not found`);
                }
              } else if (action.action === "delete-workflow" && action.name) {
                const workflows = await window.electronAPI?.tree.list();
                const match = workflows?.find(
                  (w: { name: string }) => w.name.toLowerCase() === action.name.toLowerCase()
                );
                if (match) {
                  await window.electronAPI?.tree.delete(match.id);
                  toast.success(`Workflow "${match.name}" deleted`);
                } else {
                  toast.error(`Workflow "${action.name}" not found`);
                }
              } else if (action.action === "run-command" && action.command) {
                toast.info(`Running: ${action.description || action.command}`);
                try {
                  const cmdResult = await window.electronAPI?.system.exec({
                    command: action.command,
                    timeout: action.timeout || 60000,
                  });
                  if (cmdResult?.success || cmdResult?.exitCode === 0) {
                    const output = cmdResult.stdout?.trim();
                    toast.success(`Command completed${output ? `: ${output.slice(0, 100)}` : ""}`);
                    // Add command output as a follow-up assistant message
                    if (output) {
                      const cmdMsg: ChatMessage = {
                        id: `cmd-${Date.now()}`,
                        role: "assistant",
                        content: `**Command output** (\`${action.command.slice(0, 60)}\`):\n\`\`\`\n${output.slice(0, 2000)}\n\`\`\``,
                        timestamp: new Date(),
                      };
                      setMessages((prev) => [...prev, cmdMsg]);
                    }
                  } else {
                    const errOutput = cmdResult?.stderr?.trim() || "Command failed";
                    toast.error(`Command failed: ${errOutput.slice(0, 100)}`);
                    const errMsg: ChatMessage = {
                      id: `cmd-err-${Date.now()}`,
                      role: "assistant",
                      content: `**Command failed** (\`${action.command.slice(0, 60)}\`):\n\`\`\`\n${errOutput.slice(0, 2000)}\n\`\`\``,
                      timestamp: new Date(),
                    };
                    setMessages((prev) => [...prev, errMsg]);
                  }
                } catch (cmdErr) {
                  toast.error(
                    `Failed to execute: ${cmdErr instanceof Error ? cmdErr.message : String(cmdErr)}`
                  );
                }
              } else if (action.action === "run-workflow" && action.name) {
                const workflows = await window.electronAPI?.tree.list();
                const match = workflows?.find(
                  (w: { name: string }) => w.name.toLowerCase() === action.name.toLowerCase()
                );
                if (match && match.nodes && match.edges) {
                  toast.info(`Running workflow "${match.name}"...`);
                  try {
                    const execResult = await window.electronAPI?.executeAutomation({
                      nodes: match.nodes as unknown[],
                      edges: match.edges as unknown[],
                      headless: true,
                      automationId: match.id,
                      automationName: match.name,
                    });
                    if (execResult?.success) {
                      toast.success(`Workflow "${match.name}" completed!`);
                    } else {
                      toast.error(`Workflow failed: ${execResult?.error || "Unknown error"}`);
                    }
                  } catch (wfErr) {
                    toast.error(
                      `Workflow execution failed: ${wfErr instanceof Error ? wfErr.message : String(wfErr)}`
                    );
                  }
                } else {
                  toast.error(`Workflow "${action.name}" not found`);
                }
              } else if (action.action === "list-agents") {
                const agents = await window.electronAPI?.agents.list();
                const list =
                  agents
                    ?.map((a: { name: string; status: string }) => `${a.name} (${a.status})`)
                    .join(", ") || "No agents";
                toast.info(`Agents: ${list}`);
              } else if (action.action === "list-workflows") {
                const workflows = await window.electronAPI?.tree.list();
                const list =
                  workflows?.map((w: { name: string }) => w.name).join(", ") || "No workflows";
                toast.info(`Workflows: ${list}`);
              }
            } catch (actionErr) {
              console.error("Failed to parse loopi-action block:", actionErr);
            }
          }
        }
      } else {
        setError(result.error || "Failed to get response");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const renderMarkdown = (text: string): React.ReactNode[] => {
    const result: React.ReactNode[] = [];
    const lines = text.split("\n");
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      // Code blocks (non-agent/workflow)
      if (
        line.startsWith("```") &&
        !line.startsWith("```agent-create") &&
        !line.startsWith("```workflow-create")
      ) {
        const codeLines: string[] = [];
        i++;
        while (i < lines.length && !lines[i].startsWith("```")) {
          codeLines.push(lines[i]);
          i++;
        }
        i++; // skip closing ```
        result.push(
          <pre
            key={result.length}
            className="my-1.5 p-2 rounded bg-black/10 dark:bg-white/10 overflow-x-auto text-xs font-mono"
          >
            <code>{codeLines.join("\n")}</code>
          </pre>
        );
        continue;
      }

      // Headers
      const h3Match = line.match(/^### (.+)/);
      if (h3Match) {
        result.push(
          <h4 key={result.length} className="font-semibold text-sm mt-2 mb-1">
            {renderInline(h3Match[1])}
          </h4>
        );
        i++;
        continue;
      }
      const h2Match = line.match(/^## (.+)/);
      if (h2Match) {
        result.push(
          <h3 key={result.length} className="font-bold text-sm mt-2 mb-1">
            {renderInline(h2Match[1])}
          </h3>
        );
        i++;
        continue;
      }

      // Unordered list items
      if (line.match(/^[-*] /)) {
        const items: string[] = [];
        while (i < lines.length && lines[i].match(/^[-*] /)) {
          items.push(lines[i].replace(/^[-*] /, ""));
          i++;
        }
        result.push(
          <ul key={result.length} className="list-disc pl-4 my-1 space-y-0.5">
            {items.map((item, j) => (
              <li key={j} className="text-sm">
                {renderInline(item)}
              </li>
            ))}
          </ul>
        );
        continue;
      }

      // Ordered list items
      if (line.match(/^\d+\. /)) {
        const items: string[] = [];
        while (i < lines.length && lines[i].match(/^\d+\. /)) {
          items.push(lines[i].replace(/^\d+\. /, ""));
          i++;
        }
        result.push(
          <ol key={result.length} className="list-decimal pl-4 my-1 space-y-0.5">
            {items.map((item, j) => (
              <li key={j} className="text-sm">
                {renderInline(item)}
              </li>
            ))}
          </ol>
        );
        continue;
      }

      // Empty lines
      if (!line.trim()) {
        i++;
        continue;
      }

      // Regular paragraph
      result.push(
        <p key={result.length} className="text-sm mb-1">
          {renderInline(line)}
        </p>
      );
      i++;
    }

    return result;
  };

  const renderInline = (text: string): React.ReactNode => {
    // Process inline markdown: bold, italic, code, links
    const parts: React.ReactNode[] = [];
    // Match: **bold**, *italic*, `code`, [text](url)
    const regex = /(\*\*(.+?)\*\*)|(\*(.+?)\*)|(`(.+?)`)|(\[(.+?)\]\((.+?)\))/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }
      if (match[2]) {
        parts.push(<strong key={parts.length}>{match[2]}</strong>);
      } else if (match[4]) {
        parts.push(<em key={parts.length}>{match[4]}</em>);
      } else if (match[6]) {
        parts.push(
          <code
            key={parts.length}
            className="px-1 py-0.5 rounded bg-black/10 dark:bg-white/10 text-xs font-mono"
          >
            {match[6]}
          </code>
        );
      } else if (match[8] && match[9]) {
        parts.push(
          <a
            key={parts.length}
            href={match[9]}
            className="underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {match[8]}
          </a>
        );
      }
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }
    return parts.length === 1 ? parts[0] : <>{parts}</>;
  };

  const renderMessageContent = (content: string) => {
    // Split content by agent-create, workflow-create, and loopi-action blocks
    const parts = content.split(/(```(?:agent-create|workflow-create|loopi-action)[\s\S]*?```)/g);
    return (
      <>
        {parts.map((part, i) => {
          // Agent block
          const agentMatch = part.match(/```agent-create\s*([\s\S]*?)```/);
          if (agentMatch) {
            try {
              const agentData = JSON.parse(agentMatch[1].trim());
              return (
                <div key={i} className="my-2 p-3 rounded-lg border border-primary/20 bg-primary/5">
                  <div className="flex items-center gap-2 mb-1">
                    <Bot className="h-4 w-4 text-primary" />
                    <span className="font-semibold text-xs">Agent Created</span>
                  </div>
                  <p className="font-medium text-sm">{agentData.name}</p>
                  <p className="text-xs text-muted-foreground">{agentData.role}</p>
                  {typeof agentData.goal === "string" && agentData.goal.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      Goal: {agentData.goal}
                    </p>
                  )}
                  {Array.isArray(agentData.workflowNames) && agentData.workflowNames.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {agentData.workflowNames.length} workflow
                      {agentData.workflowNames.length !== 1 ? "s" : ""} assigned
                    </p>
                  )}
                  {agentData.schedule && agentData.schedule.type !== "manual" && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
                      Scheduled:{" "}
                      {agentData.schedule.type === "interval"
                        ? `every ${agentData.schedule.intervalMinutes}m`
                        : agentData.schedule.type === "cron"
                          ? agentData.schedule.expression
                          : `once at ${agentData.schedule.datetime}`}
                    </p>
                  )}
                </div>
              );
            } catch {
              return <div key={i}>{renderMarkdown(part)}</div>;
            }
          }

          // Workflow block
          const wfMatch = part.match(/```workflow-create\s*([\s\S]*?)```/);
          if (wfMatch) {
            try {
              const wfData = JSON.parse(wfMatch[1].trim());
              return (
                <div
                  key={i}
                  className="my-2 p-3 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Workflow className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="font-semibold text-xs text-blue-700 dark:text-blue-300">
                      Workflow Created
                    </span>
                  </div>
                  <p className="font-medium text-sm">{wfData.name}</p>
                  {wfData.description && (
                    <p className="text-xs text-muted-foreground">{wfData.description}</p>
                  )}
                  {wfData.steps?.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {wfData.steps.length} step{wfData.steps.length !== 1 ? "s" : ""}
                    </p>
                  )}
                </div>
              );
            } catch {
              return <div key={i}>{renderMarkdown(part)}</div>;
            }
          }

          // Action block (delete, list)
          const actionMatch = part.match(/```loopi-action\s*([\s\S]*?)```/);
          if (actionMatch) {
            try {
              const actionData = JSON.parse(actionMatch[1].trim());
              const actionLabels: Record<string, { icon: string; label: string; color: string }> = {
                "delete-agent": {
                  icon: "🗑",
                  label: `Deleted agent: ${actionData.name}`,
                  color: "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950",
                },
                "delete-workflow": {
                  icon: "🗑",
                  label: `Deleted workflow: ${actionData.name}`,
                  color: "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950",
                },
                "list-agents": {
                  icon: "📋",
                  label: "Listed all agents",
                  color: "border-muted bg-muted/30",
                },
                "list-workflows": {
                  icon: "📋",
                  label: "Listed all workflows",
                  color: "border-muted bg-muted/30",
                },
                "run-command": {
                  icon: "⚡",
                  label: `Running: ${actionData.description || actionData.command}`,
                  color: "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950",
                },
                "run-workflow": {
                  icon: "▶",
                  label: `Running workflow: ${actionData.name}`,
                  color: "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950",
                },
              };
              const info = actionLabels[actionData.action] || {
                icon: "⚡",
                label: actionData.action,
                color: "border-muted bg-muted/30",
              };
              return (
                <div key={i} className={`my-2 p-2.5 rounded-lg border text-xs ${info.color}`}>
                  <span>
                    {info.icon} {info.label}
                  </span>
                </div>
              );
            } catch {
              return <div key={i}>{renderMarkdown(part)}</div>;
            }
          }

          return part.trim() ? <div key={i}>{renderMarkdown(part)}</div> : null;
        })}
      </>
    );
  };

  if (isDetecting) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Detecting AI providers...</p>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Card className="w-full max-w-lg p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <MessageSquare className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h2 className="text-2xl font-bold">Chat with Loopi</h2>
            <p className="text-muted-foreground text-sm">
              Connect to an AI provider to start chatting. You can ask questions, get help with
              automations, or assign tasks to Loopi.
            </p>
          </div>

          {/* Quick connect options */}
          {(envKeys.claudeCode || envKeys.anthropic || envKeys.openai) && (
            <div className="rounded-lg border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950 p-4 space-y-3">
              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                Quick connect
              </p>
              <div className="flex flex-wrap gap-2">
                {envKeys.claudeCode && (
                  <Button
                    size="sm"
                    onClick={() => {
                      setConfig({ provider: "claude-code", model: "claude" });
                      setIsConnected(true);
                    }}
                  >
                    Connect via Claude Code
                  </Button>
                )}
                {envKeys.anthropic && (
                  <Button
                    size="sm"
                    variant={envKeys.claudeCode ? "outline" : "default"}
                    onClick={() => {
                      setConfig({ provider: "anthropic", model: "claude-sonnet-4-5-20250929" });
                      setIsConnected(true);
                    }}
                  >
                    Anthropic API Key
                  </Button>
                )}
                {envKeys.openai && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setConfig({ provider: "openai", model: "gpt-4o-mini" });
                      setIsConnected(true);
                    }}
                  >
                    OpenAI API Key
                  </Button>
                )}
              </div>
            </div>
          )}

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or configure manually</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Provider</Label>
              <Select
                value={setupProvider}
                onValueChange={(v: Provider) => {
                  setSetupProvider(v);
                  setSetupModel("");
                  setSetupApiKey("");
                  setSetupCredentialId("");
                  setSetupBaseUrl("");
                  setError(null);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="claude-code">Claude Code (CLI)</SelectItem>
                  <SelectItem value="anthropic">Anthropic (API Key)</SelectItem>
                  <SelectItem value="openai">OpenAI</SelectItem>
                  <SelectItem value="ollama">Ollama (Local)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Model</Label>
              <Input
                value={setupModel}
                onChange={(e) => setSetupModel(e.target.value)}
                placeholder={PROVIDER_DEFAULTS[setupProvider].model}
              />
            </div>

            {setupProvider === "claude-code" && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950 p-3">
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Uses the <span className="font-mono font-medium">claude</span> CLI with your
                  existing login session. No API key needed.
                </p>
              </div>
            )}

            {setupProvider !== "ollama" && setupProvider !== "claude-code" && (
              <>
                {envKeys[setupProvider] && (
                  <div className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                    <Plug className="h-3 w-3" />
                    Environment variable detected — key is optional
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Credential</Label>
                  <Select
                    value={setupCredentialId}
                    onValueChange={(v) => {
                      setSetupCredentialId(v);
                      if (v) setSetupApiKey("");
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a saved credential" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">Enter key manually</SelectItem>
                      {credentials.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name} ({c.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {(!setupCredentialId || setupCredentialId === "manual") && (
                  <div className="space-y-2">
                    <Label>API Key</Label>
                    <Input
                      type="password"
                      value={setupApiKey}
                      onChange={(e) => setSetupApiKey(e.target.value)}
                      placeholder={setupProvider === "anthropic" ? "sk-ant-..." : "sk-..."}
                    />
                  </div>
                )}
              </>
            )}

            {setupProvider === "ollama" && (
              <div className="space-y-2">
                <Label>Base URL</Label>
                <Input
                  value={setupBaseUrl}
                  onChange={(e) => setSetupBaseUrl(e.target.value)}
                  placeholder="http://localhost:11434"
                />
                <p className="text-xs text-muted-foreground">
                  Make sure Ollama is running locally. No API key needed.
                </p>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <Button onClick={handleConnect} className="w-full" size="lg">
              <Plug className="h-4 w-4 mr-2" />
              Connect
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Chat header */}
      <div className="flex items-center justify-between border-b border-border px-6 py-3">
        <div className="flex items-center gap-3">
          <MessageSquare className="h-5 w-5 text-primary" />
          <div>
            <h2 className="font-semibold text-sm">Loopi Chat</h2>
            <p className="text-xs text-muted-foreground">
              Connected to {PROVIDER_DEFAULTS[config!.provider].label} &middot; {config!.model}
              {!config!.apiKey && !config!.credentialId && config!.provider !== "ollama" && (
                <span className="text-green-600 dark:text-green-400 ml-1">(via env key)</span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={handleResetChat} title="Clear chat history">
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleDisconnect}>
            <X className="h-4 w-4 mr-1" />
            Disconnect
          </Button>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-3 max-w-md">
              <MessageSquare className="h-12 w-12 text-muted-foreground/30 mx-auto" />
              <h3 className="text-lg font-medium text-muted-foreground">Start a conversation</h3>
              <p className="text-sm text-muted-foreground/70">
                Ask Loopi anything about automations, get help debugging workflows, or request
                assistance with building new ones.
              </p>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground"
              }`}
            >
              {renderMessageContent(msg.content)}
              <p
                className={`text-[10px] mt-1 ${
                  msg.role === "user" ? "text-primary-foreground/60" : "text-muted-foreground"
                }`}
              >
                {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-2xl px-4 py-3">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          </div>
        )}

        {error && messages.length > 0 && (
          <div className="flex justify-center">
            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-border px-6 py-4">
        <div className="flex items-center gap-2 max-w-4xl mx-auto">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message Loopi..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button onClick={handleSend} disabled={!input.trim() || isLoading} size="icon">
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowUp className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
