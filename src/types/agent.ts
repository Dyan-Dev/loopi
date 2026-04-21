export type AgentStatus = "idle" | "running" | "failed";

export type AgentCapability =
  | "browser"
  | "api"
  | "desktop"
  | "ai"
  | "workflows"
  | "credentials"
  | "filesystem";

export type ReflectionVerdict = "ok" | "modify" | "fail";

export interface AgentReflection {
  timestamp: string;
  workflowId: string;
  workflowName?: string;
  verdict: ReflectionVerdict;
  reason: string;
  patchApplied?: boolean;
  rolledBack?: boolean;
  rawResponse?: string;
}

export interface AgentModelConfig {
  provider: "openai" | "anthropic" | "ollama" | "claude-code";
  model: string;
  credentialId?: string;
  apiKey?: string;
  baseUrl?: string;
}

export interface AgentLogEntry {
  timestamp: string;
  level: "info" | "warn" | "error";
  message: string;
  workflowId?: string;
}

export interface AgentSchedule {
  type: "manual" | "interval" | "cron" | "once";
  expression?: string;
  intervalMinutes?: number;
  datetime?: string;
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  description: string;
  status: AgentStatus;
  capabilities: AgentCapability[];
  goal: string;
  workflowIds: string[];
  reflections: AgentReflection[];
  model: AgentModelConfig;
  schedule?: AgentSchedule;
  credentialIds: string[];
  createdAt: string;
  updatedAt: string;
  lastRunAt?: string;
  logs: AgentLogEntry[];
  parentAgentId?: string;
  createdBy: "user" | "loopi";
}
