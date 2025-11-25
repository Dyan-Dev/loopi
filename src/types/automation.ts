import type { AutomationStep } from "./steps";
import type { Node, Edge } from "./flow";

/**
 * Automation Domain Types
 * 
 * Core business logic types for automation workflows, scheduling, and execution.
 */

export type AutomationStatus = "idle" | "running" | "paused";

/**
 * Schedule - Discriminated union for automation scheduling
 * - manual: User-triggered execution only
 * - interval: Repeat every N minutes/hours/days
 * - fixed: Run at specific time each day
 */export type Schedule =
  | { type: "manual" }
  | { type: "fixed"; value: string }
  | { type: "interval"; interval: number; unit: "minutes" | "hours" | "days" };

export interface LastRun {
  timestamp: Date;
  success: boolean;
  duration?: number;
}

export interface Automation {
  id: string;
  name: string;
  description: string;
  status: AutomationStatus;
  nodes: Node[]; // from flow.ts, re-exported via index barrel
  edges: Edge[]; // ditto
  schedule: Schedule;
  lastRun?: LastRun;
  steps: AutomationStep[]; // optional: some UIs may use this list view
  linkedCredentials: string[];
}

export interface Credential {
  id: string;
  name: string;
  type: "username_password" | "api_key" | "oauth_token" | "custom";
  lastUpdated: Date;
  encryptedValues: Record<string, string>;
}

export interface ExecutionLogEntry {
  stepId: string;
  success: boolean;
  error?: string;
  screenshot?: string;
}

export interface ExecutionLog {
  id: string;
  automationId: string;
  timestamp: Date;
  success: boolean;
  duration: number;
  steps: ExecutionLogEntry[];
}
