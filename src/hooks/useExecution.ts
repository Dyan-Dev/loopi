import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactFlowNode, ReactFlowEdge } from "../types";

interface UseExecutionArgs {
  nodes: ReactFlowNode[];
  edges: ReactFlowEdge[];
  setNodes: (updater: any) => void;
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
    if ((window as any).electronAPI) {
      (window as any).electronAPI.onBrowserClosed(handleBrowserClosed);
    }
    return () => {
      if ((window as any).electronAPI && (window as any).electronAPI.removeBrowserClosed) {
        try {
          (window as any).electronAPI.removeBrowserClosed();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  const openBrowser = useCallback(async (url?: string) => {
    try {
      await (window as any).electronAPI.openBrowser(url || "https://google.com");
      setIsBrowserOpen(true);
    } catch (err) {
      console.error("Failed to open browser", err);
    }
  }, []);

  const closeBrowser = useCallback(async () => {
    try {
      await (window as any).electronAPI.closeBrowser();
      setIsBrowserOpen(false);
      setIsAutomationRunning(false);
      setCurrentNodeId(null);
    } catch (err) {
      console.error("Failed to close browser", err);
    }
  }, []);

  const executeNode = useCallback(
    async (node: ReactFlowNode) => {
      setCurrentNodeId(node.id);
      setNodes((nds: ReactFlowNode[]) =>
        nds.map((n) => (n.id === node.id ? { ...n, data: { ...n.data, nodeRunning: true } } : n))
      );
      await new Promise((resolve) => setTimeout(resolve, 500));
      if (node.type === "automationStep" && node.data.step) {
        return await (window as any).electronAPI.runStep(node.data.step);
      } else if (node.type === "conditional") {
        let startIndex = node.data.startIndex || 1;
        let increment = node.data.increment || 1;
        const maxIterations = node.data.maxIterations || 100;

        const conditionParams = {
          conditionType: node.data.conditionType,
          selector: node.data.selector,
          expectedValue: node.data.expectedValue,
          nodeId: node.id,
          maxIterations,
          increment,
          startIndex,
        };

        const { conditionResult, currentIndex: usedIndex, effectiveSelector } = await (window as any).electronAPI.runConditional(conditionParams);

        return {
          conditionResult,
          isLoop: node.data.conditionType === "loopUntilFalse",
          usedIndex,
        };
      }
    },
    [setNodes]
  );

  const runAutomation = useCallback(async () => {
    if (nodes.length === 0) {
      alert("No nodes to execute");
      return;
    }

    if (!isBrowserOpen) {
      await openBrowser();
    }

    setIsAutomationRunning(true);
    setCurrentNodeId(null);

    try {
      const visited = new Set<string>();
      const executeGraph = async (nodeId: string) => {
        if (stopGraphExecutionRef.current) return;
        visited.add(nodeId);

        const node = nodes.find((n) => n.id === nodeId) as ReactFlowNode | undefined;
        if (!node) return;

        const result = await executeNode(node);
        setNodes((nds: ReactFlowNode[]) =>
          nds.map((n) => (n.id === node.id ? { ...n, data: { ...n.data, nodeRunning: false } } : n))
        );
        let nextNodes: string[] = [];

        if (node.type === "conditional" && result?.conditionResult !== undefined) {
          const branch = result.conditionResult ? "if" : "else";
          nextNodes = edges.filter((e) => e.source === nodeId && e.sourceHandle === branch).map((e) => e.target);
        } else {
          nextNodes = edges.filter((e) => e.source === nodeId).map((e) => e.target);
        }

        for (const nextNodeId of nextNodes) {
          await executeGraph(nextNodeId);
        }
      };

      await executeGraph("1");
      alert("Automation completed successfully!");
    } catch (error) {
      console.error("Automation failed:", error);
      alert("Automation failed. Check console for details.");
    } finally {
      setIsAutomationRunning(false);
      setCurrentNodeId(null);
      stopGraphExecutionRef.current = false;
    }
  }, [nodes, edges, executeNode, openBrowser, setNodes, isBrowserOpen]);

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
