import type { Edge as FlowEdge, Node as FlowNode } from "reactflow";
import type { AutomationStep } from "./steps";

/**
 * ReactFlow Graph Types
 *
 * Defines the node and edge structure for the automation workflow graph.
 * Nodes can represent either automation steps or conditional logic.
 */

/** Condition types for branching logic */
export type ConditionType = "elementExists" | "valueMatches";

export interface NodePosition {
  x: number;
  y: number;
}

/**
 * NodeDataBase - Core data structure for graph nodes
 *
 * A node can be either:
 * - An automation step (step is defined)
 * - A conditional node (conditionType, selector, expectedValue are defined)
 */
export interface NodeDataBase {
  // When this node represents a step
  step?: AutomationStep;
  // When this node represents a conditional
  conditionType?: ConditionType;
  selector?: string;
  expectedValue?: string;
  condition?: "equals" | "contains" | "greaterThan" | "lessThan";
  // Optional post-processing for extracted text before evaluation
  transformType?: "none" | "stripCurrency" | "stripNonNumeric" | "regexReplace" | "removeChars";
  transformPattern?: string; // regex pattern when using regexReplace
  transformReplace?: string; // replacement string for regexReplace
  transformChars?: string; // chars to remove when using removeChars
  parseAsNumber?: boolean; // whether to parse both extracted and expected values as numbers
}

export interface Node {
  id: string;
  type: "automationStep" | "conditional";
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
    type: AutomationStep["type"] | "conditional" | "update" | "delete",
    updates?: Partial<NodeDataBase>
  ) => void;
  nodeRunning: boolean;
};

export type ReactFlowNode = FlowNode<NodeData>;
export type ReactFlowEdge = FlowEdge<EdgeData>;
