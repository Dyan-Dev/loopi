import type { ConditionalResult, ReactFlowEdge, ReactFlowNode } from "@app-types";
import type { Dispatch, SetStateAction } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

interface UseExecutionArgs {
  nodes: ReactFlowNode[];
  edges: ReactFlowEdge[];
  setNodes: Dispatch<SetStateAction<ReactFlowNode[]>>;
}

/**
 * useExecution - Manages browser automation execution state and graph traversal
 *
 * Handles:
 * - Browser window lifecycle (open/close)
 * - Automation execution state (running/paused/stopped)
 * - Graph-based flow execution with conditional branching
 * - Node-by-node step execution with visual feedback
 *
 * @param nodes - ReactFlow nodes representing automation steps
 * @param edges - ReactFlow edges defining execution order
 * @param setNodes - Function to update node state (for visual feedback)
 */
export default function useExecution({ nodes, edges, setNodes }: UseExecutionArgs) {
  const [isBrowserOpen, setIsBrowserOpen] = useState(false);
  const [isAutomationRunning, setIsAutomationRunning] = useState(false);
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
  const stopGraphExecutionRef = useRef(false);

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

    // register callbacks if available
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
    async (headless: boolean = false) => {
      if (nodes.length === 0) {
        alert("No nodes to execute");
        return;
      }

      setIsAutomationRunning(true);
      stopGraphExecutionRef.current = false;

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
        // Serialize nodes and edges to remove non-cloneable properties (like functions)
        const serializedNodes = nodes.map((node) => ({
          id: node.id,
          type: node.type,
          position: node.position,
          data: {
            step: node.data.step,
            // Variable fields
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

        const result = await window.electronAPI?.executeAutomation({
          nodes: serializedNodes,
          edges: serializedEdges,
          headless,
        });

        if (result?.success) {
          alert("Automation completed successfully!");
        } else {
          alert(`Automation failed: ${result?.error || "Unknown error"}`);
        }
      } catch (error) {
        console.error("Automation failed:", error);
        alert("Automation failed. Check console for details.");
      } finally {
        setIsAutomationRunning(false);
        setCurrentNodeId(null);
      }
    },
    [nodes, edges]
  );

  const pauseAutomation = useCallback(() => {
    setIsAutomationRunning(false);
  }, []);

  const stopAutomation = useCallback(() => {
    stopGraphExecutionRef.current = true;
    setIsAutomationRunning(false);
    setCurrentNodeId(null);
  }, []);

  return {
    isBrowserOpen,
    isAutomationRunning,
    currentNodeId,
    openBrowser,
    closeBrowser,
    runAutomation,
    pauseAutomation,
    stopAutomation,
  };
}
