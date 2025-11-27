import { useState, useEffect, useCallback } from "react";
import {
  useNodesState,
  useEdgesState,
  OnSelectionChangeParams,
} from "reactflow";
import "reactflow/dist/style.css";
import type {
  Automation,
  AutomationStep,
  Node,
  Edge,
  NodeData,
  EdgeData,
  ReactFlowNode,
  ReactFlowEdge,
} from "../types";

import AutomationNode from "./automationBuilder/AutomationNode";
import BuilderHeader from "./automationBuilder/BuilderHeader";
import BuilderCanvas from "./automationBuilder/BuilderCanvas";
import useNodeActions from "../hooks/useNodeActions";
import useExecution from "../hooks/useExecution";

const nodeTypes = {
  automationStep: AutomationNode,
  conditional: AutomationNode,
};

interface AutomationBuilderProps {
  automation?: Automation;
  onSave: (automation: Automation) => void;
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
export function AutomationBuilder({
  automation,
  onSave,
  onCancel,
}: AutomationBuilderProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [nodes, setNodes, onNodesChange] = useNodesState<NodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<EdgeData>([]);
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
    currentNodeId,
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

  // Keyboard shortcut: Delete/Backspace removes selected edges
  useEffect(() => {
    const keyHandler = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedEdgeIds.length > 0) {
        e.preventDefault();
        handleDeleteSelectedEdges();
      }
    };
    window.addEventListener('keydown', keyHandler);
    return () => window.removeEventListener('keydown', keyHandler);
  }, [selectedEdgeIds, handleDeleteSelectedEdges]);

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
      // Initialize with a default navigation node
      const defaultNode: ReactFlowNode = {
        id: "1",
        type: "automationStep",
        data: {
          step: {
            id: "1",
            type: "navigate",
            description: "Navigate to URL",
            value: "https://",
          },
          onAddNode: handleNodeAction,
          nodeRunning: false,
        },
        position: { x: 400, y: 50 },
      };
      setNodes([defaultNode]);
    }
  }, [automation, handleNodeAction]);

  /**
   * Serializes current builder state into Automation object
   * Handles schedule type discrimination and credential extraction
   */
  const serializeAutomation = useCallback((): Automation => {
    return {
      id: automation?.id || Date.now().toString(),
      name,
      description,
      nodes: nodes.map(({ id, type, data, position }) => ({
        id,
        type,
        data: {
          // step nodes keep their step object
          step: data.step,
          // conditional node fields
          conditionType: data.conditionType,
          selector: data.selector,
          expectedValue: data.expectedValue,
          // comparison operator (equals/contains/greaterThan/lessThan)
          condition: data.condition,
          // post-processing transform options
          transformType: data.transformType,
          transformPattern: data.transformPattern,
          transformReplace: data.transformReplace,
          transformChars: data.transformChars,
          parseAsNumber: data.parseAsNumber,
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

  const handleSave = () => {
    onSave(serializeAutomation());
  };

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || null;

  const currentAutomationForExport: Automation | undefined = name.trim() 
    ? serializeAutomation() 
    : undefined;

  return (
    <div className="h-screen flex flex-col">
      <BuilderHeader
        name={name}
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
