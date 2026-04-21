# Agents

Agents are autonomous workers that run your workflows on a schedule, reflect on each run against a stated goal, and can self-patch broken workflows.

An agent = **goal + workflows + schedule + model**. Each run, the agent executes its workflows, then the reflection engine decides whether the run made progress. If it didn't, the engine can rewrite the workflow in place.

---

## Creating an Agent

### From the Agents tab
1. Open the **Agents** tab, click **Create Agent**.
2. Fill in:
   - **Name** and **Role** — e.g. `News Notifier` / `News curator`.
   - **Goal** — what success looks like, in one short paragraph. The reflection engine uses this to judge every run.
   - **Workflows** — check one or more existing workflows the agent will execute each tick.
   - **Provider / Model** — see [Model requirements](#model-requirements).
   - **Capabilities** — feature gates the agent is allowed to use (`browser`, `api`, `desktop`, `ai`, `workflows`, `credentials`, `filesystem`).
3. Click **Create Agent**. If the agent has a schedule, it starts running immediately.

### From chat
Ask Loopi in the Chat tab to build an agent. It emits two fenced blocks that the chat parser turns into real artifacts:

- ` ```workflow-create {...}``` ` — one per workflow the agent needs.
- ` ```agent-create {...}``` ` — the agent itself, referencing the workflows by name.

The chat UI creates the workflows first, then the agent, and links them together automatically. If the LLM returns invalid JSON (a common failure mode with unescaped `"` characters), the parse error surfaces as a toast so you can retry.

---

## The Reflection Loop

Every time an agent runs a workflow, the reflection engine is invoked with:

- The agent's `goal`.
- The workflow graph (`nodes` + `edges`).
- Per-node outcomes (`success` / `error` + error message).
- A truncated snapshot of final variables (strings capped at 500 chars, arrays sampled).

It asks the agent's own LLM to return a single fenced block:

````
```agent-reflect
{
  "verdict": "ok" | "modify" | "fail",
  "reason": "one-sentence explanation",
  "patch": { "nodes": [...], "edges": [...] }   // only when verdict is "modify"
}
```
````

### Verdicts

| Verdict | Meaning | Effect |
|---------|---------|--------|
| `ok` | Run made progress; no change needed. | Reflection recorded, workflow left alone. |
| `modify` | Workflow is structurally wrong for the goal. | `patch` is validated and saved as the new workflow. Original is kept for rollback. |
| `fail` | Run failed in a way reflection can't fix (missing credentials, permanent external error). | Reflection recorded, agent status set to `failed`. |

### Safety rails

- If the LLM's output has no parseable block, or JSON is invalid → verdict falls back to `ok`. Bad reflections never break a run.
- A `modify` verdict with a malformed `patch` (missing/empty `nodes`, missing `edges`) is downgraded to `ok`.
- A patch must be a **complete replacement graph**, not a diff. The engine overwrites the stored workflow.
- If `saveAutomation` throws, the previous workflow is restored and the reflection is marked `rolledBack: true`.
- Each agent keeps the last **50** reflections (older ones are dropped).

---

## Model Requirements

Reflection requires real reasoning — small models silently return `ok` or produce unusable patches. The create dialog calls `agents:validateModel` and blocks creation if the model is known to be too small.

| Provider | Blocked | Suggested |
|----------|---------|-----------|
| `anthropic` | `claude-haiku`, `claude-3-haiku`, `claude-instant` | `claude-sonnet-4-5-20250929`, `claude-sonnet-4-20250514`, `claude-opus-4-20250514` |
| `openai` | `gpt-3.5-turbo`, `gpt-3.5`, `davinci`, `babbage`, `ada` | `gpt-4o`, `gpt-4o-mini`, `gpt-4-turbo` |
| `ollama` | `tinyllama`, `phi-2`, `phi`, `gemma:2b`, `gemma2:2b`, `stablelm-zephyr`, embedding-only models | `llama3`, `mistral`, `mixtral`, `codellama`, `qwen2`, `deepseek-coder` (7B+) |
| `claude-code` | — | Always valid (uses the Claude Code CLI). |

Validator source: [src/main/agentModelValidator.ts](../src/main/agentModelValidator.ts).

---

## Scheduling

Agents share the same scheduler as workflows (`DesktopScheduler`), exposed through `scheduleCallback()`. Supported schedule types:

| Type | Field | Example |
|------|-------|---------|
| `manual` | — | Only runs when you click Start. |
| `interval` | `intervalMinutes` | `5` — run every five minutes. |
| `cron` | `expression` | `0 9 * * *` — 9 AM daily. |
| `once` | `datetime` | ISO 8601 timestamp. |

Scheduled agents reactivate automatically on app startup via `loadAndActivateScheduledAgents()`.

---

## Agent Shape

Full `Agent` type (`src/types/agent.ts`):

```ts
{
  id: string;
  name: string;
  role: string;
  description: string;
  status: "idle" | "running" | "failed";
  capabilities: AgentCapability[];
  goal: string;
  workflowIds: string[];
  reflections: AgentReflection[];  // capped at 50
  model: {
    provider: "openai" | "anthropic" | "ollama" | "claude-code";
    model: string;
    credentialId?: string;
    apiKey?: string;
    baseUrl?: string;
  };
  schedule?: {
    type: "manual" | "interval" | "cron" | "once";
    expression?: string;
    intervalMinutes?: number;
    datetime?: string;
  };
  credentialIds: string[];
  createdAt: string;
  updatedAt: string;
  lastRunAt?: string;
  logs: AgentLogEntry[];           // capped at 100
  parentAgentId?: string;
  createdBy: "user" | "loopi";
}
```

---

## IPC Surface

All renderer-side calls live on `window.electronAPI.agents`:

| Method | Purpose |
|--------|---------|
| `list()` | Return all agents. |
| `get(id)` | Return one agent. |
| `create(config)` | Validate model + persist a new agent. |
| `update(id, updates)` | Patch fields on an existing agent. |
| `delete(id)` | Unschedule + remove. |
| `start(id)` / `stop(id)` | Run now / pause. |
| `getLogs(id)` | Fetch capped log entries. |
| `getReflections(id)` | Fetch the reflection history. |
| `addWorkflow(agentId, workflowId)` | Link a workflow. |
| `removeWorkflow(agentId, workflowId)` | Unlink a workflow. |
| `validateModel(provider, model)` | Check before creation. |
| `getInstructions(id)` / `saveInstructions(id, content)` | Per-agent freeform instructions file. |
| `listFiles(id)` / `readFile(id, name)` / `writeFile(id, name, content)` / `deleteFile(id, name)` | Agent-local filesystem scratchpad. |
| `getDir(id)` | Return the agent's storage directory. |

Main-side handlers live in `src/main/ipcHandlers.ts`, the preload bridge in `src/preload.ts`, and the typed contract in `src/types/globals.d.ts`.

---

## Storage

Agents persist as one JSON file per agent under Electron's `userData/agents/` directory (following the `ScheduleStore` pattern). Logs are capped at 100 entries and reflections at 50 before each save.

Source: [src/main/agentStore.ts](../src/main/agentStore.ts).

---

## Extending

- **Add a capability** — edit `AgentCapability` in `src/types/agent.ts`, add it to `CAPABILITIES` in `CreateAgentDialog.tsx`, and gate the relevant call sites in `agentManager.ts`.
- **Change the reflection prompt** — `buildReflectionPrompt()` in `src/main/agentReflector.ts`.
- **Swap out model validation** — `validateModelForAgents()` in `src/main/agentModelValidator.ts`.
- **Add a new schedule type** — extend `AgentSchedule["type"]` and handle it in `DesktopScheduler.scheduleCallback()`.

---

## Related

- [ARCHITECTURE.md](./ARCHITECTURE.md) — overall system design.
- [CREDENTIALS.md](./CREDENTIALS.md) — how agents authenticate to services.
- [STEPS_REFERENCE.md](./STEPS_REFERENCE.md) — the steps workflows (and therefore agents) can use.
