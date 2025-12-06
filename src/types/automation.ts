import type { Edge, Node } from "./flow";
import type { AutomationStep } from "./steps";

export interface Automation {
  id: string;
  name: string;
  description: string;
  nodes: Node[];
  edges: Edge[];
  variables?: Record<string, unknown>;
  steps: AutomationStep[];
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
