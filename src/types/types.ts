import { Camera, Clock, Globe, Mouse, Type } from "lucide-react";
import type { Edge as FlowEdge, Node as FlowNode } from "reactflow";

export interface Automation {
  id: string;
  name: string;
  description: string;
  status: "idle" | "running" | "paused";
  nodes: Node[];
  edges: Edge[];
  schedule: {
    type: "interval" | "fixed" | "manual";
    value?: string;
    interval?: number;
    unit?: "minutes" | "hours" | "days";
  };
  lastRun?: {
    timestamp: Date;
    success: boolean;
    duration?: number;
  };
  steps: AutomationStep[];
  linkedCredentials: string[];
}

export interface AutomationStep {
  id: string;
  type:
    | "navigate"
    | "click"
    | "type"
    | "wait"
    | "screenshot"
    | "extract"
    | "extractWithLogic"
    | "repeat"
    | "apiCall"
    | "conditional"
    | "scroll"
    | "selectOption"
    | "fileUpload"
    | "hover";
  description: string;
  selector?: string;
  value?: string;
  credentialId?: string;
  // For extractWithLogic
  condition?: "equals" | "contains" | "greaterThan" | "lessThan";
  expectedValue?: string | number;
  // For repeat
  repeatCount?: number;
  subSteps?: AutomationStep[];
  // For apiCall
  method?: "GET" | "POST";
  url?: string;
  body?: string;
  headers?: Record<string, string>;
  storeKey?: string;
  // For conditional
  conditionType?: "elementExists" | "valueMatches";
  thenSteps?: AutomationStep[];
  elseSteps?: AutomationStep[];
  // For scroll
  scrollType?: "toElement" | "byAmount";
  scrollAmount?: number;
  // For selectOption
  optionValue?: string;
  optionIndex?: number;
  // For fileUpload
  filePath?: string;
  onAddNode?: (
    id: string,
    type:
      | "delete"
      | "conditional"
      | "navigate"
      | "click"
      | "type"
      | "wait"
      | "screenshot"
      | "extract"
      | "extractWithLogic"
      | "repeat"
      | "apiCall"
      | "scroll"
      | "selectOption"
      | "fileUpload"
      | "hover"
      | "update"
  ) => void;
}

export interface Node {
  id: string;
  type: "automationStep" | "conditional";
  data: {
    step?: AutomationStep;
    conditionType?: "elementExists" | "valueMatches";
    selector?: string;
    expectedValue?: string;
    condition?: "equals" | "contains" | "greaterThan" | "lessThan";
  };
  position: { x: number; y: number };
}

export interface Edge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string; // For conditional nodes: "then" or "else"
}

export interface Credential {
  id: string;
  name: string;
  type: "username_password" | "api_key" | "oauth_token" | "custom";
  lastUpdated: Date;
  // In real app, values would be encrypted
  encryptedValues: Record<string, string>;
}

export interface ExecutionLog {
  id: string;
  automationId: string;
  timestamp: Date;
  success: boolean;
  duration: number;
  steps: {
    stepId: string;
    success: boolean;
    error?: string;
    screenshot?: string;
  }[];
}

export type NodeData = Node["data"] & {
  onAddNode: (
    sourceId: string,
    type: AutomationStep["type"] | "conditional" | "update" | "delete",
    updates?: Partial<Node["data"]>
  ) => void;
  nodeRunning: boolean;
};

export type ReactFlowNode = FlowNode<NodeData>;
export type EdgeData = { label?: string };
export type ReactFlowEdge = FlowEdge<EdgeData>;

export const stepTypes = [
  {
    value: "navigate",
    label: "Navigate",
    icon: Globe,
    description: "Go to a URL",
  },
  {
    value: "click",
    label: "Click",
    icon: Mouse,
    description: "Click an element",
  },
  { value: "type", label: "Type", icon: Type, description: "Enter text" },
  {
    value: "wait",
    label: "Wait",
    icon: Clock,
    description: "Wait for a duration",
  },
  {
    value: "screenshot",
    label: "Screenshot",
    icon: Camera,
    description: "Take a screenshot",
  },
];
