import type { Edge, Node } from "./flow";
import type { AutomationStep } from "./steps";

export type ScheduleType =
  | { type: "manual" } // No schedule, manual execution only
  | { type: "interval"; intervalMinutes: number } // Run every X minutes
  | { type: "cron"; expression: string } // Cron expression (e.g., "0 9 * * *")
  | { type: "once"; datetime: string }; // Run once at specific datetime (ISO string)

export interface Automation {
  id: string;
  name: string;
  description: string;
  nodes: Node[];
  edges: Edge[];
  variables?: Record<string, unknown>;
  steps: AutomationStep[];
  schedule?: ScheduleType;
  enabled?: boolean; // Whether the schedule is active
  headless?: boolean; // Whether to run browser in background (no visible window)
}

export interface StoredAutomation extends Automation {
  updatedAt: string;
}

export interface ExecutionStepRecord {
  nodeId: string;
  stepType: string;
  status: "success" | "error";
  error?: string;
  timestamp: string;
}

export interface ExecutionRecord {
  id: string;
  automationId: string;
  automationName: string;
  timestamp: string;
  duration: number;
  success: boolean;
  cancelled?: boolean;
  error?: string;
  stepCount: number;
  steps: ExecutionStepRecord[];
}
