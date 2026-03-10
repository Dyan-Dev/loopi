import type { ReactFlowEdge, ReactFlowNode } from "@app-types";
import type { Dispatch, SetStateAction } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

export interface ExecutionResult {
  success: boolean;
  error?: string;
  cancelled?: boolean;
  variables?: Record<string, unknown>;
}

interface UseExecutionArgs {
  nodes: ReactFlowNode[];
  edges: ReactFlowEdge[];
  setNodes: Dispatch<SetStateAction<ReactFlowNode[]>>;
  automationId?: string;
  automationName?: string;
}

/**
 * useExecution - Manages browser automation execution state and graph traversal
 *
 * Handles:
 * - Browser window lifecycle (open/close)
 * - Automation execution state (running/paused/stopped)
 * - Graph-based flow execution with conditional branching
 * - Node-by-node step execution with visual feedback
 * - Proper cancellation via IPC signal to backend
 */
export default function useExecution({
  nodes,
  edges,
  setNodes,
  automationId,
  automationName,
}: UseExecutionArgs) {
  const [isBrowserOpen, setIsBrowserOpen] = useState(false);
  const [isAutomationRunning, setIsAutomationRunning] = useState(false);
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<ExecutionResult | null>(null);

  useEffect(() => {
    const handleBrowserClosed = () => {
      setIsBrowserOpen(false);
      setIsAutomationRunning(false);
      setCurrentNodeId(null);
    };

    const handleNodeStatus = ({
      nodeId,
      status,
      error,
    }: {
      nodeId: string;
      status: string;
      error?: string;
    }) => {
      setCurrentNodeId(nodeId);
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                nodeRunning: status === "running",
                nodeStatus: status as "idle" | "running" | "success" | "error",
                nodeError: error,
              },
            };
          }
          return node;
        })
      );
    };

    window.electronAPI?.onBrowserClosed(handleBrowserClosed);
    window.electronAPI?.onNodeStatus(handleNodeStatus);

    return () => {
      try {
        window.electronAPI?.removeBrowserClosed?.();
      } catch (_e) {
        // ignore
      }
    };
  }, [setNodes]);

  const openBrowser = useCallback(async (url?: string) => {
    try {
      await window.electronAPI?.openBrowser(url || "https://google.com");
      setIsBrowserOpen(true);
    } catch (err) {
      console.error("Failed to open browser", err);
    }
  }, []);

  const closeBrowser = useCallback(async () => {
    try {
      await window.electronAPI?.closeBrowser();
      setIsBrowserOpen(false);
      setIsAutomationRunning(false);
      setCurrentNodeId(null);
    } catch (err) {
      console.error("Failed to close browser", err);
    }
  }, []);

  const runAutomation = useCallback(
    async (headless: boolean = false): Promise<ExecutionResult | null> => {
      if (nodes.length === 0) {
        const result: ExecutionResult = { success: false, error: "No nodes to execute" };
        setLastResult(result);
        return result;
      }

      setIsAutomationRunning(true);
      setLastResult(null);

      // Reset all node statuses before execution
      setNodes((nds) =>
        nds.map((node) => ({
          ...node,
          data: {
            ...node.data,
            nodeRunning: false,
            nodeStatus: "idle" as const,
          },
        }))
      );

      try {
        const serializedNodes = nodes.map((node) => ({
          id: node.id,
          type: node.type,
          position: node.position,
          data: {
            step: node.data.step,
            variableName: node.data.variableName,
            value: node.data.value,
            operation: node.data.operation,
            nodeRunning: node.data.nodeRunning,
          },
        }));

        const serializedEdges = edges.map((edge) => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          sourceHandle: edge.sourceHandle,
          data: edge.data,
        }));

        const apiResult = await window.electronAPI?.executeAutomation({
          nodes: serializedNodes,
          edges: serializedEdges,
          headless,
          automationId,
          automationName,
        } as Parameters<NonNullable<typeof window.electronAPI>["executeAutomation"]>[0]);

        const result: ExecutionResult = {
          success: apiResult?.success ?? false,
          error: apiResult?.error,
          cancelled: apiResult?.cancelled,
          variables: apiResult?.variables,
        };

        setLastResult(result);
        return result;
      } catch (error) {
        const result: ExecutionResult = {
          success: false,
          error: error instanceof Error ? error.message : "Execution failed",
        };
        setLastResult(result);
        return result;
      } finally {
        setIsAutomationRunning(false);
        setCurrentNodeId(null);
      }
    },
    [nodes, edges]
  );

  const stopAutomation = useCallback(async () => {
    try {
      await window.electronAPI?.cancelAutomation();
    } catch (err) {
      console.error("Failed to cancel automation", err);
    }
    setIsAutomationRunning(false);
    setCurrentNodeId(null);
  }, []);

  return {
    isBrowserOpen,
    isAutomationRunning,
    currentNodeId,
    lastResult,
    openBrowser,
    closeBrowser,
    runAutomation,
    stopAutomation,
  };
}
