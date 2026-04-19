export type AgentStatus = "idle" | "running" | "completed" | "failed" | "paused";

export type AgentCapability =
  | "browser"
  | "api"
  | "desktop"
  | "ai"
  | "workflows"
  | "credentials"
  | "filesystem";

export interface AgentTask {
  id: string;
  description: string;
  status: "pending" | "running" | "completed" | "failed";
  workflowId?: string;
  result?: string;
  error?: string;
  startedAt?: string;
  completedAt?: string;
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
  taskId?: string;
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
  tasks: AgentTask[];
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
