import type { Edge as FlowEdge, Node as FlowNode } from "reactflow";
import type { AutomationStep } from "./steps";

/**
 * ReactFlow Graph Types
 *
 * Defines the node and edge structure for the automation workflow graph.
 * Nodes can represent either automation steps or conditional logic.
 */

/** Browser condition types (DOM-based) */
export type BrowserConditionType = "elementExists" | "valueMatches";

/** Variable condition types (non-DOM) */
export type VariableConditionType =
  | "variableEquals"
  | "variableContains"
  | "variableGreaterThan"
  | "variableLessThan"
  | "variableExists";

export interface NodePosition {
  x: number;
  y: number;
}

/**
 * NodeDataBase - Core data structure for graph nodes
 *
 * A node can be either:
 * - An automation step (step is defined)
 * - A browser conditional (browserConditionType, selector, expectedValue are defined)
 * - A variable conditional (variableConditionType, variableName are defined)
 */
export interface NodeDataBase {
  step?: AutomationStep;

  // Variable fields (used by setVariable, modifyVariable, and variableConditional nodes)
  variableName?: string;
  value?: string;
  operation?: "set" | "increment" | "decrement" | "append";

  // Visual feedback during execution
  nodeRunning?: boolean;
  nodeStatus?: "idle" | "running" | "success" | "error";
  nodeError?: string;
}

export interface Node {
  id: string;
  type: "automationStep";
  data: NodeDataBase;
  position: NodePosition;
}

export interface Edge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string; // e.g., "then" | "else" for conditional nodes
}

export type EdgeData = { label?: string };

export type NodeData = NodeDataBase & {
  onAddNode: (
    sourceId: string,
    type: AutomationStep["type"] | "update" | "delete",
    updates?: Partial<NodeDataBase>
  ) => void;
  nodeRunning: boolean;
};

export type ReactFlowNode = FlowNode<NodeData>;
export type ReactFlowEdge = FlowEdge<EdgeData>;
