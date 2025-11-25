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
  Credential,
  Node,
  Edge,
  NodeData,
  EdgeData,
  ReactFlowNode,
  ReactFlowEdge,
} from "../types/types";

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
  credentials: Credential[];
  onSave: (automation: Automation) => void;
  onCancel: () => void;
}

export function AutomationBuilder({
  automation,
  credentials,
  onSave,
  onCancel,
}: AutomationBuilderProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [nodes, setNodes, onNodesChange] = useNodesState<NodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<EdgeData>([]);
  // State for tracking selected node
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [schedule, setSchedule] = useState({
    type: "manual" as "interval" | "fixed" | "manual",
    interval: 30,
    unit: "minutes" as "minutes" | "hours" | "days",
    value: "09:00",
  });
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

  // Handle selection change
  const handleSelectionChange = useCallback(
    ({ nodes: selectedNodes }: OnSelectionChangeParams) => {
      setSelectedNodeId(selectedNodes[0]?.id || null);
    },
    []
  );

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
      if (automation.schedule.type !== "manual") {
        setSchedule({
          type: automation.schedule.type,
          interval: automation.schedule.interval || 30,
          unit: automation.schedule.unit || "minutes",
          value: automation.schedule.value || "09:00",
        });
      }
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
            selector: "",
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

  const handleSave = () => {
    const automationData: Automation = {
      id: automation?.id || Date.now().toString(),
      name,
      description,
      status: "idle",
      nodes: nodes.map(({ id, type, data, position }) => ({
        id,
        type,
        data: {
          step: data.step,
          conditionType: data.conditionType,
          selector: data.selector,
          expectedValue: data.expectedValue,
          condition: data.condition,
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
      schedule:
        schedule.type === "manual"
          ? { type: "manual" }
          : schedule.type === "fixed"
            ? { type: "fixed", value: schedule.value }
            : {
                type: "interval",
                interval: schedule.interval,
                unit: schedule.unit,
              },
      linkedCredentials: nodes
        .filter((node) => node.data.step?.credentialId)
        .map((node) => node.data.step!.credentialId!)
        .filter((id, index, arr) => arr.indexOf(id) === index),
      lastRun: automation?.lastRun,
    };
    onSave(automationData);
  };

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || null;

  // Get current automation for export
  const currentAutomationForExport: Automation | undefined = name.trim() ? {
    id: automation?.id || Date.now().toString(),
    name,
    description,
    status: "idle",
    nodes: nodes.map(({ id, type, data, position }) => ({
      id,
      type,
      data: {
        step: data.step,
        conditionType: data.conditionType,
        selector: data.selector,
        expectedValue: data.expectedValue,
        condition: data.condition,
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
    schedule:
      schedule.type === "manual"
        ? { type: "manual" }
        : schedule.type === "fixed"
          ? { type: "fixed", value: schedule.value }
          : {
              type: "interval",
              interval: schedule.interval,
              unit: schedule.unit,
            },
    linkedCredentials: nodes
      .filter((node) => node.data.step?.credentialId)
      .map((node) => node.data.step!.credentialId!)
      .filter((id, index, arr) => arr.indexOf(id) === index),
    lastRun: automation?.lastRun,
  } : undefined;

  return (
    <div className="h-screen flex flex-col">
      <BuilderHeader
        name={name}
        setName={setName}
        description={description}
        setDescription={setDescription}
        schedule={schedule}
        setSchedule={setSchedule}
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
