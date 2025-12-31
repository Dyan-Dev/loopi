import { useCallback, useEffect, useState } from "react";
import { OnSelectionChangeParams, useEdgesState, useNodesState } from "reactflow";
import "reactflow/dist/style.css";
import type {
  Automation,
  AutomationStep,
  Edge,
  EdgeData,
  Node,
  NodeData,
  ReactFlowEdge,
  ReactFlowNode,
  StoredAutomation,
} from "@app-types";
import useExecution from "@hooks/useExecution";
import useNodeActions from "@hooks/useNodeActions";
import AutomationNode from "./automationBuilder/AutomationNode";
import BuilderCanvas from "./automationBuilder/BuilderCanvas";
import BuilderHeader from "./automationBuilder/BuilderHeader";

const nodeTypes = {
  automationStep: AutomationNode,
  browserConditional: AutomationNode,
  variableConditional: AutomationNode,
};

interface AutomationBuilderProps {
  automation?: Automation;
  onSave: (automation: StoredAutomation) => void;
  onCancel: () => void;
}

/**
 * AutomationBuilder - Main visual editor for creating and managing browser automations
 *
 * Features:
 * - Drag-and-drop node graph editor using ReactFlow
 * - Real-time automation testing in browser window
 * - Step configuration and conditional branching
 * - Import/export automation workflows
 * - Schedule configuration (manual, interval, fixed time)
 */
export function AutomationBuilder({ automation, onSave, onCancel }: AutomationBuilderProps) {
  const [name, setName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [description, setDescription] = useState("");
  const [nodes, setNodes, onNodesChange] = useNodesState<NodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<EdgeData>([]);
  const [isDebugEnabled, setIsDebugEnabled] = useState(false);
  // State for tracking selected node
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  // State for tracking selected edges for deletion
  const [selectedEdgeIds, setSelectedEdgeIds] = useState<string[]>([]);
  const { onConnect, handleNodeAction } = useNodeActions({
    nodes,
    edges,
    setNodes,
    setEdges,
    setSelectedNodeId,
  });

  const {
    isBrowserOpen,
    isAutomationRunning,
    openBrowser,
    closeBrowser,
    runAutomation,
    pauseAutomation,
    stopAutomation,
  } = useExecution({ nodes, edges, setNodes });

  // Handle selection change (nodes & edges)
  const handleSelectionChange = useCallback(
    ({ nodes: selectedNodes, edges: selectedEdges }: OnSelectionChangeParams) => {
      setSelectedNodeId(selectedNodes[0]?.id || null);
      setSelectedEdgeIds(selectedEdges.map((e) => e.id));
    },
    []
  );

  // Delete selected edges utility
  const handleDeleteSelectedEdges = useCallback(() => {
    if (selectedEdgeIds.length === 0) return;
    setEdges((eds) => eds.filter((e) => !selectedEdgeIds.includes(e.id)));
    setSelectedEdgeIds([]);
  }, [selectedEdgeIds, setEdges]);

  // Sync debug mode with main process
  useEffect(() => {
    window.electronAPI?.debug?.setDebugMode(isDebugEnabled).catch((error) => {
      console.error("Failed to set debug mode:", error);
    });
  }, [isDebugEnabled]);

  // Keyboard shortcut: Delete/Backspace removes selected edges
  useEffect(() => {
    const keyHandler = (e: KeyboardEvent) => {
      // Delete selected edges
      if ((e.key === "Delete" || e.key === "Backspace") && selectedEdgeIds.length > 0) {
        e.preventDefault();
        handleDeleteSelectedEdges();
      }
      // Toggle debug mode with Ctrl+Shift+D
      if (e.ctrlKey && e.shiftKey && e.key === "D") {
        e.preventDefault();
        setIsDebugEnabled(!isDebugEnabled);
      }
    };
    window.addEventListener("keydown", keyHandler);
    return () => window.removeEventListener("keydown", keyHandler);
  }, [selectedEdgeIds, handleDeleteSelectedEdges, isDebugEnabled]);

  useEffect(() => {
    if (automation) {
      setName(automation.name);
      setDescription(automation.description);
      setNodes(
        automation.nodes.map((node) => ({
          ...node,
          data: {
            ...node.data,
            onAddNode: handleNodeAction,
            nodeRunning: false,
          },
        }))
      );
      setEdges(
        automation.edges.map(
          (e): ReactFlowEdge => ({
            ...e,
            data: undefined,
          })
        )
      );
    } else {
      setNodes([]);
      setEdges([]);
    }
  }, [automation, handleNodeAction]);

  /**
   * Serializes current builder state into Automation object
   * Handles schedule type discrimination and credential extraction
   */
  const serializeAutomation = useCallback((): StoredAutomation => {
    return {
      id: automation?.id || Date.now().toString(),
      name,
      description,
      updatedAt: new Date().toLocaleString(),
      nodes: nodes.map(({ id, type, data, position }) => ({
        id,
        type,
        data: {
          // step nodes keep their step object
          step: data.step,
          // variable fields
          variableName: data.variableName,
          value: data.value,
          operation: data.operation,
        },
        position,
      })) as Node[],
      edges: edges.map(({ id, source, target, sourceHandle }) => ({
        id,
        source,
        target,
        sourceHandle,
      })) as Edge[],
      steps: nodes
        .map((node) => node.data.step)
        .filter((step) => step !== undefined) as AutomationStep[],
    };
  }, [automation, name, description, nodes, edges]);

  const handleSave = async () => {
    setIsSaving(true);
    onSave(serializeAutomation());
    setIsSaving(false);
  };

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || null;

  const currentAutomationForExport: StoredAutomation | undefined = name.trim()
    ? serializeAutomation()
    : undefined;

  return (
    <div className="h-screen flex flex-col">
      <BuilderHeader
        name={name}
        isSaving={isSaving}
        setName={setName}
        description={description}
        setDescription={setDescription}
        isBrowserOpen={isBrowserOpen}
        openBrowser={openBrowser}
        closeBrowser={closeBrowser}
        isAutomationRunning={isAutomationRunning}
        runAutomation={runAutomation}
        pauseAutomation={pauseAutomation}
        stopAutomation={stopAutomation}
        handleSave={handleSave}
        onCancel={onCancel}
        nodesLength={nodes.length}
        currentAutomation={currentAutomationForExport}
        isDebugEnabled={isDebugEnabled}
        setIsDebugEnabled={setIsDebugEnabled}
      />

      <BuilderCanvas
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        handleSelectionChange={handleSelectionChange}
        nodeTypes={nodeTypes}
        selectedNodeId={selectedNodeId}
        selectedNode={selectedNode}
        handleNodeAction={handleNodeAction}
        selectedEdgeIds={selectedEdgeIds}
        onDeleteSelectedEdges={handleDeleteSelectedEdges}
        isDebugEnabled={isDebugEnabled}
        setBrowserOpen={(arg?: boolean | string) => {
          if (typeof arg === "string") {
            openBrowser(arg);
          } else if (arg) {
            openBrowser();
          } else {
            closeBrowser();
          }
        }}
      />
    </div>
  );
}
