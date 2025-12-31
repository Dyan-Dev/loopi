/**
 * Automation Graph Executor
 * Shared execution logic for automation workflows with graph-based flow control
 * Supports conditionals, loops, and both headless and browser-based execution
 */

import type { Edge, Node } from "@app-types/flow";
import { createLogger } from "@utils/logger";
import type { BrowserWindow } from "electron";
import { AutomationExecutor } from "./automationExecutor";
import { HeadlessExecutor } from "./headlessExecutor";

const logger = createLogger("GraphExecutor");

interface ConditionalNodeData {
  // Browser conditional
  browserConditionType?: string;
  selector?: string;
  expectedValue?: string;
  condition?: string;
  transformType?: string;
  transformPattern?: string;
  transformReplace?: string;
  transformChars?: string;
  parseAsNumber?: boolean;
  // Variable conditional
  variableConditionType?: string;
  variableName?: string;
}

interface ExecutionContext {
  nodes: Node[];
  edges: Edge[];
  browserWindow?: BrowserWindow | null;
  executor: AutomationExecutor;
  headless?: boolean;
  onNodeStatus?: (nodeId: string, status: "running" | "success" | "error", error?: string) => void;
}

/**
 * Execute automation workflow using graph traversal
 * Supports loops, conditionals, and both browser and headless modes
 */
export async function executeAutomationGraph(
  context: ExecutionContext
): Promise<{ success: boolean }> {
  const { nodes, edges, browserWindow, executor, headless, onNodeStatus } = context;

  if (!nodes || nodes.length === 0) {
    throw new Error("No nodes to execute");
  }

  // If headless mode with browser steps, use Puppeteer
  const browserSteps = [
    "navigate",
    "click",
    "type",
    "screenshot",
    "extract",
    "scroll",
    "selectOption",
    "fileUpload",
    "hover",
    "browserConditional",
  ];
  const hasBrowserSteps = nodes.some(
    (node: Node) => node.data.step && browserSteps.includes(node.data.step.type)
  );

  if (headless && hasBrowserSteps) {
    return await executeHeadlessGraph({ nodes, edges, onNodeStatus });
  }

  // Non-headless execution with Electron
  return await executeBrowserGraph({ nodes, edges, browserWindow, executor, onNodeStatus });
}

/**
 * Execute workflow using Puppeteer (true headless mode)
 */
async function executeHeadlessGraph({
  nodes,
  edges,
  onNodeStatus,
}: {
  nodes: Node[];
  edges: Edge[];
  onNodeStatus?: (nodeId: string, status: "running" | "success" | "error", error?: string) => void;
}): Promise<{ success: boolean }> {
  const headlessExecutor = new HeadlessExecutor();

  try {
    await headlessExecutor.launch();

    const executeGraph = async (
      nodeId: string,
      visited: Set<string>,
      iterations: { count: number }
    ): Promise<void> => {
      if (iterations.count++ > 10000) throw new Error("Maximum iteration limit reached");
      visited.add(nodeId);
      const node = nodes.find((n: Node) => n.id === nodeId);
      if (!node) return;

      onNodeStatus?.(nodeId, "running");

      try {
        let conditionResult: boolean | undefined;

        if (node.data.step?.type === "browserConditional") {
          if (node.data.step.browserConditionType && node.data.step.selector) {
            const result = await headlessExecutor.evaluateBrowserConditional({
              browserConditionType: node.data.step.browserConditionType,
              selector: node.data.step.selector,
              expectedValue: node.data.step.expectedValue,
              condition: node.data.step.condition,
              transformType: node.data.step.transformType,
              transformPattern: node.data.step.transformPattern,
              transformReplace: node.data.step.transformReplace,
              transformChars: node.data.step.transformChars,
              parseAsNumber: node.data.step.parseAsNumber,
            });
            conditionResult = result.conditionResult;
          } else {
            throw new Error("Browser conditional requires browserConditionType and selector");
          }
        } else if (node.data.step?.type === "variableConditional") {
          const result = headlessExecutor.evaluateVariableConditional(
            node.data as ConditionalNodeData
          );
          conditionResult = result.conditionResult;
        } else if (node.data.step) {
          await headlessExecutor.executeStep(node.data.step);
        }

        onNodeStatus?.(nodeId, "success");

        // Follow edges
        const isConditionalNode =
          node.data.step?.type === "browserConditional" ||
          node.data.step?.type === "variableConditional";
        const nextNodes =
          isConditionalNode && conditionResult !== undefined
            ? edges
                .filter(
                  (e: Edge) =>
                    e.source === nodeId && e.sourceHandle === (conditionResult ? "if" : "else")
                )
                .map((e: Edge) => e.target)
            : edges.filter((e: Edge) => e.source === nodeId).map((e: Edge) => e.target);

        for (const nextNodeId of nextNodes) {
          await executeGraph(nextNodeId, visited, iterations);
        }
      } catch (error) {
        onNodeStatus?.(nodeId, "error", error instanceof Error ? error.message : String(error));
        throw error;
      }
    };

    const { startNodes } = findStartNodes(nodes, edges);
    const visited = new Set<string>();
    const iterations = { count: 0 };

    for (const startNode of startNodes) {
      await executeGraph(startNode.id, visited, iterations);
    }

    await headlessExecutor.close();
    return { success: true };
  } catch (error) {
    await headlessExecutor.close();
    throw error;
  }
}

/**
 * Execute workflow using Electron browser window
 */
async function executeBrowserGraph({
  nodes,
  edges,
  browserWindow,
  executor,
  onNodeStatus,
}: {
  nodes: Node[];
  edges: Edge[];
  browserWindow?: BrowserWindow | null;
  executor: AutomationExecutor;
  onNodeStatus?: (nodeId: string, status: "running" | "success" | "error", error?: string) => void;
}): Promise<{ success: boolean }> {
  const browserSteps = [
    "navigate",
    "click",
    "type",
    "screenshot",
    "extract",
    "scroll",
    "selectOption",
    "fileUpload",
    "hover",
  ];

  const executeGraph = async (
    nodeId: string,
    visited: Set<string>,
    iterations: { count: number }
  ): Promise<void> => {
    if (iterations.count++ > 10000) throw new Error("Maximum iteration limit reached");
    visited.add(nodeId);
    const node = nodes.find((n: Node) => n.id === nodeId);
    if (!node) return;

    onNodeStatus?.(nodeId, "running");

    try {
      let conditionResult: boolean | undefined;

      if (node.data.step?.type === "browserConditional") {
        if (browserWindow && node.data.step.browserConditionType && node.data.step.selector) {
          const result = await executor.evaluateBrowserConditional(browserWindow, {
            browserConditionType: node.data.step.browserConditionType,
            selector: node.data.step.selector,
            expectedValue: node.data.step.expectedValue,
            condition: node.data.step.condition,
            transformType: node.data.step.transformType,
            transformPattern: node.data.step.transformPattern,
            transformReplace: node.data.step.transformReplace,
            transformChars: node.data.step.transformChars,
            parseAsNumber: node.data.step.parseAsNumber,
          });
          conditionResult = result.conditionResult;
        } else {
          throw new Error("Browser window required for browser conditional evaluation");
        }
      } else if (node.data.step?.type === "variableConditional") {
        if (node.data.step.variableConditionType && node.data.step.variableName) {
          const result = executor.evaluateVariableConditional({
            variableConditionType: node.data.step.variableConditionType,
            variableName: node.data.step.variableName,
            expectedValue: node.data.step.expectedValue,
            parseAsNumber: node.data.step.parseAsNumber,
          });
          conditionResult = result.conditionResult;
        } else {
          throw new Error(
            "Variable condition type and variable name required for variable conditional evaluation"
          );
        }
      } else if (node.data.step) {
        const requiresBrowser = browserSteps.includes(node.data.step.type);
        await executor.executeStep(requiresBrowser ? browserWindow : null, node.data.step);
      }

      onNodeStatus?.(nodeId, "success");

      // Follow edges
      const isConditionalNode =
        node.data.step?.type === "browserConditional" ||
        node.data.step?.type === "variableConditional";

      const nextNodes =
        isConditionalNode && conditionResult !== undefined
          ? edges
              .filter(
                (e: Edge) =>
                  e.source === nodeId && e.sourceHandle === (conditionResult ? "if" : "else")
              )
              .map((e: Edge) => e.target)
          : edges.filter((e: Edge) => e.source === nodeId).map((e: Edge) => e.target);

      for (const nextNodeId of nextNodes) {
        await executeGraph(nextNodeId, visited, iterations);
      }
    } catch (error) {
      onNodeStatus?.(nodeId, "error", error instanceof Error ? error.message : String(error));
      throw error;
    }
  };

  const { startNodes } = findStartNodes(nodes, edges);
  const visited = new Set<string>();
  const iterations = { count: 0 };

  for (const startNode of startNodes) {
    await executeGraph(startNode.id, visited, iterations);
  }

  return { success: true };
}

/**
 * Find start nodes using indegree analysis
 */
function findStartNodes(nodes: Node[], edges: Edge[]): { startNodes: Node[] } {
  const nodeIds = new Set(nodes.map((n: Node) => n.id));

  // Filter out edges with invalid source or target nodes
  const validEdges = edges.filter((e: Edge) => {
    const isValid = e.source && e.target && nodeIds.has(e.source) && nodeIds.has(e.target);
    if (!isValid) {
      logger.warn("Ignoring invalid edge", e);
    }
    return isValid;
  });

  const indegree = new Map<string, number>();
  nodes.forEach((n: Node) => indegree.set(n.id, 0));
  validEdges.forEach((e: Edge) => {
    if (e.target && indegree.has(e.target)) {
      indegree.set(e.target, (indegree.get(e.target) || 0) + 1);
    }
  });

  const startNodes = nodes.filter((n: Node) => (indegree.get(n.id) || 0) === 0);

  if (startNodes.length === 0) {
    console.error("Node IDs:", Array.from(nodeIds));
    console.error("Valid edges:", validEdges);
    console.error("Indegrees:", Array.from(indegree.entries()));
    throw new Error("No start nodes found in workflow. All nodes have incoming edges.");
  }

  return { startNodes };
}
