/**
 * Automation Graph Executor
 * Shared execution logic for automation workflows with graph-based flow control
 * Supports conditionals, forEach loops, and both headless and browser-based execution
 */

import type { Edge, Node } from "@app-types/flow";
import { createLogger } from "@utils/logger";
import type { BrowserWindow } from "electron";
import { AutomationExecutor } from "./automationExecutor";
import { HeadlessExecutor } from "./headlessExecutor";
import { type ValidatorNode, validateWorkflow } from "./workflowValidator";

const logger = createLogger("GraphExecutor");

/** Default per-step timeout in milliseconds (2 minutes) */
const STEP_TIMEOUT_MS = 120_000;

interface ExecutionContext {
  nodes: Node[];
  edges: Edge[];
  browserWindow?: BrowserWindow | null;
  executor: AutomationExecutor;
  headless?: boolean;
  headlessExecutor?: HeadlessExecutor | null;
  onNodeStatus?: (nodeId: string, status: "running" | "success" | "error", error?: string) => void;
  cancelSignal?: { cancelled: boolean };
  /** Per-step timeout in ms (default: 120000) */
  stepTimeout?: number;
}

/**
 * Execute a step with a timeout. If the step takes longer than the timeout,
 * an error is thrown with a descriptive message.
 */
async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  stepType: string,
  nodeId: string
): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeoutPromise = new Promise<never>((_resolve, reject) => {
    timer = setTimeout(
      () =>
        reject(
          new Error(
            `Step "${stepType}" on node "${nodeId}" timed out after ${(timeoutMs / 1000).toFixed(0)}s`
          )
        ),
      timeoutMs
    );
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timer!);
  }
}

/**
 * Collect all node IDs reachable from a start node via BFS, stopping at boundary nodes.
 * Used to identify the "loop body" of a forEach node.
 */
export function collectReachableNodes(
  startNodeId: string,
  edges: Edge[],
  boundaryNodeIds: Set<string>
): Set<string> {
  const reachable = new Set<string>();
  const queue = [startNodeId];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (reachable.has(current)) continue;
    reachable.add(current);

    // Follow all outgoing edges, but don't cross back into the boundary
    for (const edge of edges) {
      if (
        edge.source === current &&
        !boundaryNodeIds.has(edge.target) &&
        !reachable.has(edge.target)
      ) {
        queue.push(edge.target);
      }
    }
  }

  return reachable;
}

/**
 * Execute automation workflow using graph traversal
 * Supports loops, conditionals, and both browser and headless modes
 */
export async function executeAutomationGraph(
  context: ExecutionContext
): Promise<{ success: boolean }> {
  const { nodes, edges, browserWindow, executor, headless, onNodeStatus, cancelSignal } = context;

  if (!nodes || nodes.length === 0) {
    throw new Error("No nodes to execute");
  }

  // Pre-execution validation safety net
  const validation = validateWorkflow(nodes as unknown as ValidatorNode[], edges);
  if (!validation.valid) {
    throw new Error(`Workflow validation failed: ${validation.errors.join("; ")}`);
  }
  if (validation.warnings.length > 0) {
    for (const warning of validation.warnings) {
      logger.warn(`Validation warning: ${warning}`);
    }
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

  // Only initialize headless executor if needed
  let headlessExecutor: HeadlessExecutor | null = null;
  try {
    if (headless && hasBrowserSteps) {
      logger.info("Initializing Puppeteer headless browser for browser automation");
      headlessExecutor = new HeadlessExecutor();
      await headlessExecutor.launch();
    }

    return await executeBrowserGraph({
      nodes,
      edges,
      browserWindow,
      executor,
      onNodeStatus,
      headless,
      headlessExecutor,
      cancelSignal,
    });
  } catch (error) {
    // Clean up headless executor on error
    if (headlessExecutor) {
      await headlessExecutor.close();
    }
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
  headless,
  headlessExecutor,
  cancelSignal,
}: {
  nodes: Node[];
  edges: Edge[];
  browserWindow?: BrowserWindow | null;
  executor: AutomationExecutor;
  onNodeStatus?: (nodeId: string, status: "running" | "success" | "error", error?: string) => void;
  headless: boolean;
  headlessExecutor?: HeadlessExecutor | null;
  cancelSignal?: { cancelled: boolean };
}): Promise<{ success: boolean }> {
  const executeGraph = async (
    nodeId: string,
    visited: Set<string>,
    iterations: { count: number }
  ): Promise<void> => {
    if (cancelSignal?.cancelled) {
      logger.info("Execution cancelled by user");
      throw new Error("Execution cancelled");
    }
    if (iterations.count++ > 10000) throw new Error("Maximum iteration limit reached");
    visited.add(nodeId);
    const node = nodes.find((n: Node) => n.id === nodeId);
    if (!node) return;

    onNodeStatus?.(nodeId, "running");

    try {
      let conditionResult: boolean | undefined;

      // Handle forEach loop nodes
      if (node.data.step?.type === "forEach") {
        const step = node.data.step;
        const arrayValue = executor.getVariableValue(step.arrayVariable);

        // Find "loop" and "done" edges
        const loopEdges = edges.filter(
          (e: Edge) => e.source === nodeId && e.sourceHandle === "loop"
        );
        const doneEdges = edges.filter(
          (e: Edge) => e.source === nodeId && e.sourceHandle === "done"
        );

        if (!Array.isArray(arrayValue)) {
          logger.warn(
            `ForEach: variable "${step.arrayVariable}" is not an array, skipping to done`
          );
          onNodeStatus?.(nodeId, "success");

          // Skip to done edges
          for (const doneEdge of doneEdges) {
            await executeGraph(doneEdge.target, visited, iterations);
          }
          return;
        }

        if (arrayValue.length === 0 || loopEdges.length === 0) {
          onNodeStatus?.(nodeId, "success");

          // Empty array or no loop edge: skip to done
          for (const doneEdge of doneEdges) {
            await executeGraph(doneEdge.target, visited, iterations);
          }
          return;
        }

        // Collect loop body nodes (reachable from loop edge targets, not crossing done targets)
        const doneTargets = new Set(doneEdges.map((e) => e.target));
        // Also include the forEach node itself as a boundary to avoid re-entering it
        doneTargets.add(nodeId);

        const loopBodyNodeIds = new Set<string>();
        for (const loopEdge of loopEdges) {
          const reachable = collectReachableNodes(loopEdge.target, edges, doneTargets);
          for (const id of reachable) {
            loopBodyNodeIds.add(id);
          }
        }

        // Iterate over the array
        for (let i = 0; i < arrayValue.length; i++) {
          executor.setVariable(step.itemVariable || "currentItem", arrayValue[i]);
          executor.setVariable(step.indexVariable || "loopIndex", i);

          // Clear visited status for loop body nodes so they re-execute
          for (const bodyNodeId of loopBodyNodeIds) {
            visited.delete(bodyNodeId);
          }

          // Execute from loop edge targets
          for (const loopEdge of loopEdges) {
            await executeGraph(loopEdge.target, visited, iterations);
          }
        }

        onNodeStatus?.(nodeId, "success");

        // After all iterations, follow done edges
        for (const doneEdge of doneEdges) {
          await executeGraph(doneEdge.target, visited, iterations);
        }
        return;
      }

      if (node.data.step?.type === "browserConditional") {
        if (node.data.step.browserConditionType && node.data.step.selector) {
          const result = await executor.evaluateBrowserConditional(
            browserWindow,
            headless,
            headlessExecutor,
            {
              browserConditionType: node.data.step.browserConditionType,
              selector: node.data.step.selector,
              expectedValue: node.data.step.expectedValue,
              condition: node.data.step.condition,
              transformType: node.data.step.transformType,
              transformPattern: node.data.step.transformPattern,
              transformReplace: node.data.step.transformReplace,
              transformChars: node.data.step.transformChars,
              parseAsNumber: node.data.step.parseAsNumber,
            }
          );
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
        await withTimeout(
          executor.executeStep(browserWindow, headless, headlessExecutor, node.data.step),
          STEP_TIMEOUT_MS,
          node.data.step.type,
          nodeId
        );
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

  try {
    const { startNodes } = findStartNodes(nodes, edges);
    const visited = new Set<string>();
    const iterations = { count: 0 };

    for (const startNode of startNodes) {
      await executeGraph(startNode.id, visited, iterations);
    }

    return { success: true };
  } finally {
    // Clean up headless executor
    if (headlessExecutor) {
      await headlessExecutor.close();
      logger.info("Closed Puppeteer headless browser");
    }
  }
}

/**
 * Find start nodes using indegree analysis
 */
export function findStartNodes(nodes: Node[], edges: Edge[]): { startNodes: Node[] } {
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
