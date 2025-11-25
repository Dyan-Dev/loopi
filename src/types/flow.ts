import type { Node as FlowNode, Edge as FlowEdge } from "reactflow";
import type { AutomationStep } from "./steps";

/**
 * ReactFlow Graph Types
 * 
 * Defines the node and edge structure for the automation workflow graph.
 * Nodes can represent either automation steps or conditional logic.
 */

/** Condition types for branching logic */
export type ConditionType = "elementExists" | "valueMatches" | "loopUntilFalse";

export interface NodePosition { x: number; y: number }

/**
 * NodeDataBase - Core data structure for graph nodes
 * 
 * A node can be either:
 * - An automation step (step is defined)
 * - A conditional node (conditionType, selector, expectedValue are defined)
 */export interface NodeDataBase {
  // When this node represents a step
  step?: AutomationStep;
  // When this node represents a conditional
  conditionType?: ConditionType;
  selector?: string;
  expectedValue?: string;
  startIndex?: number; // default 1
  increment?: number; // default 1
  maxIterations?: number; // optional safeguard
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
