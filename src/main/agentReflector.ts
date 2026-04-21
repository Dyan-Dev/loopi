import type { Agent, AgentReflection, ReflectionVerdict } from "@app-types/agent";
import type { Edge, Node } from "@app-types/flow";
import { createLogger } from "@utils/logger";
import { callLLM } from "./llmClient";

const logger = createLogger("AgentReflector");

export interface NodeOutcome {
  nodeId: string;
  stepType: string;
  status: "success" | "error";
  error?: string;
}

export interface RunSnapshot {
  workflowId: string;
  workflowName: string;
  success: boolean;
  nodeOutcomes: NodeOutcome[];
  finalVariables: Record<string, unknown>;
  durationMs: number;
}

export interface WorkflowPatch {
  nodes: Node[];
  edges: Edge[];
}

export interface ReflectionResult {
  verdict: ReflectionVerdict;
  reason: string;
  patch?: WorkflowPatch;
  rawResponse: string;
}

const MAX_VAR_PREVIEW = 500;

function summariseVariables(vars: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(vars)) {
    if (value == null) {
      out[key] = value;
      continue;
    }
    if (typeof value === "string") {
      out[key] = value.length > MAX_VAR_PREVIEW ? `${value.slice(0, MAX_VAR_PREVIEW)}…` : value;
      continue;
    }
    if (Array.isArray(value)) {
      out[key] = {
        __type: "array",
        length: value.length,
        sample: value.slice(0, 3),
      };
      continue;
    }
    if (typeof value === "object") {
      try {
        const json = JSON.stringify(value);
        out[key] =
          json.length > MAX_VAR_PREVIEW
            ? { __type: "object", preview: `${json.slice(0, MAX_VAR_PREVIEW)}…` }
            : value;
      } catch {
        out[key] = "[unserialisable]";
      }
      continue;
    }
    out[key] = value;
  }
  return out;
}

function buildReflectionPrompt(
  agent: Agent,
  workflow: { id: string; name: string; nodes: Node[]; edges: Edge[] },
  snapshot: RunSnapshot
): string {
  const vars = summariseVariables(snapshot.finalVariables);
  return [
    `You are the reflection engine for an autonomous agent named "${agent.name}".`,
    `Its stated goal is:`,
    agent.goal,
    ``,
    `It just ran workflow "${workflow.name}" (id: ${workflow.id}).`,
    `Run success flag: ${snapshot.success}. Duration: ${snapshot.durationMs}ms.`,
    ``,
    `Node outcomes:`,
    JSON.stringify(snapshot.nodeOutcomes, null, 2),
    ``,
    `Final variables snapshot (truncated):`,
    JSON.stringify(vars, null, 2),
    ``,
    `Current workflow graph:`,
    JSON.stringify({ nodes: workflow.nodes, edges: workflow.edges }, null, 2),
    ``,
    `Decide whether this run made progress toward the goal. Respond with EXACTLY one fenced block:`,
    "```agent-reflect",
    `{`,
    `  "verdict": "ok" | "modify" | "fail",`,
    `  "reason": "one-sentence explanation",`,
    `  "patch": { "nodes": [...], "edges": [...] }   // only when verdict is "modify"`,
    `}`,
    "```",
    ``,
    `Rules:`,
    `- "ok" means the workflow is working toward the goal; no change needed.`,
    `- "modify" means the workflow is structurally wrong for the goal — return a full replacement graph in "patch".`,
    `  The patch MUST be a complete valid workflow graph, not a diff. Keep all existing working parts and only change what's necessary.`,
    `- "fail" means the run failed in a way that reflection can't repair (missing credentials, permanent external error, etc.).`,
    `- Do not include any text outside the fenced block.`,
  ].join("\n");
}

function extractJsonBlock(response: string): string | null {
  const fenced = response.match(/```agent-reflect\s*\n([\s\S]*?)```/);
  if (fenced) return fenced[1].trim();
  const fallback = response.match(/```(?:json)?\s*\n([\s\S]*?)```/);
  if (fallback) return fallback[1].trim();
  const trimmed = response.trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) return trimmed;
  return null;
}

function validatePatch(patch: unknown): WorkflowPatch | null {
  if (!patch || typeof patch !== "object") return null;
  const p = patch as { nodes?: unknown; edges?: unknown };
  if (!Array.isArray(p.nodes) || p.nodes.length === 0) return null;
  if (!Array.isArray(p.edges)) return null;
  return { nodes: p.nodes as Node[], edges: p.edges as Edge[] };
}

export async function reflectOnRun(
  agent: Agent,
  workflow: { id: string; name: string; nodes: Node[]; edges: Edge[] },
  snapshot: RunSnapshot
): Promise<ReflectionResult> {
  const prompt = buildReflectionPrompt(agent, workflow, snapshot);
  const llm = await callLLM({
    messages: [
      {
        role: "system",
        content:
          "You are a workflow reflection engine. Reply with a single agent-reflect fenced block only.",
      },
      { role: "user", content: prompt },
    ],
    provider: agent.model.provider,
    model: agent.model.model,
    credentialId: agent.model.credentialId,
    apiKey: agent.model.apiKey,
    baseUrl: agent.model.baseUrl,
  });

  if (!llm.success || !llm.response) {
    return {
      verdict: "fail",
      reason: `Reflection LLM call failed: ${llm.error || "no response"}`,
      rawResponse: llm.error || "",
    };
  }

  const raw = llm.response;
  const json = extractJsonBlock(raw);
  if (!json) {
    logger.warn("Reflection output had no parseable block", { agentId: agent.id });
    return {
      verdict: "ok",
      reason: "Reflection returned no structured verdict; leaving workflow unchanged.",
      rawResponse: raw,
    };
  }

  let parsed: { verdict?: string; reason?: string; patch?: unknown };
  try {
    parsed = JSON.parse(json);
  } catch (err) {
    logger.warn("Reflection JSON parse failed", { agentId: agent.id, err });
    return {
      verdict: "ok",
      reason: "Reflection JSON was invalid; leaving workflow unchanged.",
      rawResponse: raw,
    };
  }

  const verdict: ReflectionVerdict =
    parsed.verdict === "modify" || parsed.verdict === "fail" ? parsed.verdict : "ok";
  const reason =
    typeof parsed.reason === "string" && parsed.reason.length > 0
      ? parsed.reason
      : "No reason provided";

  if (verdict === "modify") {
    const patch = validatePatch(parsed.patch);
    if (!patch) {
      return {
        verdict: "ok",
        reason: `Reflection proposed "modify" but patch was malformed; keeping current workflow. (${reason})`,
        rawResponse: raw,
      };
    }
    return { verdict, reason, patch, rawResponse: raw };
  }

  return { verdict, reason, rawResponse: raw };
}

export function toReflectionRecord(
  snapshot: RunSnapshot,
  result: ReflectionResult,
  patchApplied: boolean,
  rolledBack: boolean
): AgentReflection {
  return {
    timestamp: new Date().toISOString(),
    workflowId: snapshot.workflowId,
    workflowName: snapshot.workflowName,
    verdict: result.verdict,
    reason: result.reason,
    patchApplied,
    rolledBack,
    rawResponse: result.rawResponse?.slice(0, 4000),
  };
}
