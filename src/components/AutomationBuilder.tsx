import { useState, useEffect, useCallback } from "react";
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  MiniMap,
  Node as FlowNode,
  Edge as FlowEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  OnSelectionChangeParams,
} from "reactflow";
import "reactflow/dist/style.css";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  ArrowLeft,
  Save,
  Play,
  Plus,
  Trash2,
  Globe,
  Mouse,
  Type,
  Clock,
  Camera,
  Download,
  Pause,
  Square,
  Settings,
} from "lucide-react";
import type {
  Automation,
  AutomationStep,
  Credential,
  Node,
  Edge,
} from "../app";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { set } from "react-hook-form/dist";

// Define types to bridge reactflow and custom Node/Edge
type NodeData = Node["data"] & {
  onAddNode: (
    sourceId: string,
    type: AutomationStep["type"] | "conditional" | "update" | "delete",
    updates?: Partial<Node["data"]>
  ) => void;
};
type ReactFlowNode = FlowNode<NodeData, Node["type"]>;
type ReactFlowEdge = FlowEdge;

const stepTypes = [
  {
    value: "navigate",
    label: "Navigate",
    icon: Globe,
    description: "Go to a URL",
  },
  {
    value: "click",
    label: "Click",
    icon: Mouse,
    description: "Click an element",
  },
  { value: "type", label: "Type", icon: Type, description: "Enter text" },
  {
    value: "wait",
    label: "Wait",
    icon: Clock,
    description: "Wait for a duration",
  },
  {
    value: "screenshot",
    label: "Screenshot",
    icon: Camera,
    description: "Take a screenshot",
  },
];

// Extracted component for node details panel
const NodeDetails = ({
  node,
  onUpdate,
}: {
  node: ReactFlowNode;
  onUpdate: (
    sourceId: string,
    type: "update" | "delete",
    updates?: Partial<Node["data"]>
  ) => void;
}) => {
  const { data, id } = node;
  const isConditional = !data.step;

  return (
    <Card className="w-80 max-h-[80vh] overflow-y-auto">
      <CardHeader className="p-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium capitalize">
            {data.step ? data.step.type : "Conditional"}
          </span>
          {id !== "1" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onUpdate(id, "delete");
              }}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-3 space-y-4">
        {data.step ? (
          <>
            <div className="space-y-2">
              <Label className="text-xs">Description</Label>
              <Input
                value={data.step.description || ""}
                onChange={(e) => {
                  onUpdate(id, "update", {
                    step: { ...data.step, description: e.target.value },
                  });
                }}
                className="text-xs"
                placeholder="Step description"
              />
            </div>
            {data.step.type === "navigate" && (
              <div className="space-y-2">
                <Label className="text-xs">URL</Label>
                <Input
                  value={data.step.value || ""}
                  placeholder="https://google.com"
                  onChange={(e) => {
                    onUpdate(id, "update", {
                      step: { ...data.step, value: e.target.value },
                    });
                  }}
                  className="text-xs"
                />
              </div>
            )}
            {(data.step.type === "click" ||
              data.step.type === "type" ||
              data.step.type === "extractWithLogic") && (
              <div className="space-y-2">
                <Label className="text-xs">CSS Selector</Label>
                <Input
                  value={data.step.selector || ""}
                  placeholder="CSS Selector"
                  onChange={(e) => {
                    onUpdate(id, "update", {
                      step: { ...data.step, selector: e.target.value },
                    });
                  }}
                  className="text-xs"
                />
              </div>
            )}
            {data.step.type === "type" && (
              <div className="space-y-2">
                <Label className="text-xs">Text to Type</Label>
                <Input
                  value={data.step.value || ""}
                  placeholder="Text to type"
                  onChange={(e) => {
                    onUpdate(id, "update", {
                      step: { ...data.step, value: e.target.value },
                    });
                  }}
                  className="text-xs"
                />
              </div>
            )}
            {data.step.type === "wait" && (
              <div className="space-y-2">
                <Label className="text-xs">Duration (seconds)</Label>
                <Input
                  type="number"
                  value={data.step.value || "1"}
                  placeholder="Milliseconds to wait"
                  onChange={(e) => {
                    onUpdate(id, "update", {
                      step: { ...data.step, value: e.target.value },
                    });
                  }}
                  className="text-xs"
                />
              </div>
            )}
            {data.step.type === "screenshot" && (
              <div className="space-y-2">
                <Label className="text-xs">Filename</Label>
                <Input
                  type="text"
                  value={data.step.value || ""}
                  placeholder="filename"
                  onChange={(e) => {
                    onUpdate(id, "update", {
                      step: { ...data.step, value: e.target.value },
                    });
                  }}
                  className="text-xs"
                />
              </div>
            )}
          </>
        ) : (
          <>
            <div className="space-y-2">
              <Label className="text-xs">Condition Type</Label>
              <Select
                value={data.conditionType || "elementExists"}
                onValueChange={(value) => {
                  onUpdate(id, "update", {
                    conditionType: value as any,
                  });
                }}
              >
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="elementExists">Element Exists</SelectItem>
                  <SelectItem value="valueMatches">Value Matches</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Selector</Label>
              <Input
                value={data.selector || ""}
                onChange={(e) => {
                  onUpdate(id, "update", {
                    selector: e.target.value,
                  });
                }}
                placeholder="CSS Selector"
                className="text-xs"
              />
            </div>
            {data.conditionType === "valueMatches" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs">Condition</Label>
                  <Select
                    value={data.condition || "equals"}
                    onValueChange={(value) => {
                      onUpdate(id, "update", {
                        condition: value as any,
                      });
                    }}
                  >
                    <SelectTrigger className="text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="equals">Equals</SelectItem>
                      <SelectItem value="contains">Contains</SelectItem>
                      <SelectItem value="greaterThan">Greater Than</SelectItem>
                      <SelectItem value="lessThan">Less Than</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Expected Value</Label>
                  <Input
                    value={data.expectedValue || ""}
                    onChange={(e) => {
                      onUpdate(id, "update", {
                        expectedValue: e.target.value,
                      });
                    }}
                    placeholder="Expected value"
                    className="text-xs"
                  />
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

// Extracted component for node addition popup
const AddStepPopup = ({
  onAdd,
}: {
  onAdd: (type: AutomationStep["type"] | "conditional") => void;
}) => {
  return (
    <Card className="w-48">
      <CardHeader className="p-3">
        <h3 className="text-sm font-medium">Add Next Step</h3>
      </CardHeader>
      <CardContent className="p-3 space-y-1">
        {stepTypes.map((stepType) => (
          <Button
            key={stepType.value}
            variant="ghost"
            className="w-full text-left justify-start text-xs py-1 px-2"
            onClick={() => {
              onAdd(stepType.value as AutomationStep["type"]);
            }}
          >
            <stepType.icon className="h-4 w-4 mr-2" />
            {stepType.label}
          </Button>
        ))}
        <Button
          variant="ghost"
          className="w-full text-left justify-start text-xs py-1 px-2"
          onClick={() => {
            onAdd("conditional");
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Conditional
        </Button>
      </CardContent>
    </Card>
  );
};

// Simplified AutomationNode to be small and circular, with selection highlighting
// Removed in-node inputs, add menu, and delete button (moved to details panel)
const AutomationNode = (props: ReactFlowNode) => {
  const { id, data, selected = false } = props;
  const isConditional = !data.step;

  return (
    <div className="relative">
      {id !== "1" && <Handle type="target" position={Position.Top} style={{ top: -4 }} />}
      <div
        className={`w-16 h-16 rounded-full flex items-center justify-center border-2 shadow-sm text-xs font-medium capitalize text-center cursor-pointer
          ${selected ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white"}`}
      >
        {data.step ? data.step.type : "Conditional"}
      </div>
      {isConditional ? (
        <>
          <Handle
            type="source"
            position={Position.Bottom}
            id="if"
            style={{ left: 8, bottom: -5 }}
          />
          <Handle
            type="source"
            position={Position.Bottom}
            id="else"
            style={{ right: 8, bottom: -5 }}
          />
        </>
      ) : (
        <Handle
          type="source"
          position={Position.Bottom}
          id="default"
          style={{ left: "50%", bottom: -5, transform: "translateX(-50%)" }}
        />
      )}
    </div>
  );
};

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
  const [edges, setEdges, onEdgesChange] = useEdgesState<ReactFlowEdge[]>([]);
  // State for tracking selected node
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [schedule, setSchedule] = useState({
    type: "manual" as "interval" | "fixed" | "manual",
    interval: 30,
    unit: "minutes" as "minutes" | "hours" | "days",
    value: "09:00",
  });
  const [isBrowserOpen, setIsBrowserOpen] = useState(false);
  const [isAutomationRunning, setIsAutomationRunning] = useState(false);
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);

  // Enhanced onConnect with connection restrictions and labels for "if"/"else"
  const onConnect = useCallback(
    (params: Connection) => {
      if (!params.source || !params.target) return null;

      const sourceNode = nodes.find((n) => n.id === params.source);
      if (!sourceNode) return null;

      let sourceHandle: "if" | "else" | undefined = params.sourceHandle as "if" | "else" | undefined;

      if (sourceNode.type !== "conditional") {
        // Non-conditional: only one outgoing edge
        const outgoing = edges.filter(
          (e) => e.source === params.source && !e.sourceHandle
        ).length;
        if (outgoing >= 1) {
          alert("Cannot add more than one outgoing edge to a non-conditional node");
          return null;
        }
        sourceHandle = undefined;
      } else {
        // Conditional: up to two specific branches
        if (sourceHandle === "if") {
          const existing = edges.find(
            (e) => e.source === params.source && e.sourceHandle === "if"
          );
          if (existing) {
            alert("The 'if' branch is already connected");
            return null;
          }
        } else if (sourceHandle === "else") {
          const existing = edges.find(
            (e) => e.source === params.source && e.sourceHandle === "else"
          );
          if (existing) {
            alert("The 'else' branch is already connected");
            return null;
          }
        } else {
          // No specific handle: assign to available branch
          const ifExisting = edges.find(
            (e) => e.source === params.source && e.sourceHandle === "if"
          );
          const elseExisting = edges.find(
            (e) => e.source === params.source && e.sourceHandle === "else"
          );
          if (ifExisting && elseExisting) {
            alert("Both 'if' and 'else' branches are already connected");
            return null;
          }
          sourceHandle = ifExisting ? "else" : "if";
        }
      }

      const newEdge: ReactFlowEdge = {
        id: `e${params.source}-${params.target}-${sourceHandle || "default"}`,
        source: params.source!,
        target: params.target!,
        sourceHandle,
        data: {
          label: sourceHandle === "if" ? "if" : sourceHandle === "else" ? "else" : undefined,
        },
      };
      setEdges((eds) => addEdge(newEdge, eds));
      return newEdge;
    },
    [nodes, edges, setEdges]
  );

  // Updated handleNodeAction to use "if"/"else", add restrictions for programmatic adds, select new node after add, deselect on delete
  const handleNodeAction = useCallback(
    (
      sourceId: string,
      type: AutomationStep["type"] | "conditional" | "update" | "delete",
      updates?: Partial<Node["data"]>
    ) => {
      if (type === "delete") {
        if (sourceId === "1") return;
        setNodes((nds) => {
          return nds.filter((node) => node.id !== sourceId);
        });
        setEdges((eds) =>
          eds.filter(
            (edge) => edge.source !== sourceId && edge.target !== sourceId
          )
        );
        setSelectedNodeId(null); // Deselect on delete
        return;
      }

      if (type === "update" && updates) {
        setNodes((nds) =>
          nds.map((node) =>
            node.id === sourceId
              ? {
                  ...node,
                  data: {
                    ...node.data,
                    ...updates,
                    onAddNode: handleNodeAction,
                  },
                }
              : node
          )
        );
        return;
      }

      // For adding new nodes, compute newId first
      const newId = Date.now().toString();

      // Add new node
      setNodes((currentNodes) => {
        const sourceNode = currentNodes.find((n) => n.id === sourceId);
        console.log("currentNodes", currentNodes);
        const newNode: ReactFlowNode = {
          id: newId,
          type: type === "conditional" ? "conditional" : "automationStep",
          data:
            type === "conditional"
              ? {
                  conditionType: "elementExists",
                  selector: "",
                  onAddNode: handleNodeAction,
                }
              : {
                  step: {
                    id: newId,
                    type: type as AutomationStep["type"],
                    description: `${
                      stepTypes.find((s) => s.value === type)?.label || "Step"
                    } step`,
                    selector: type === "navigate" ? "" : "body",
                    value: type === "navigate" ? "https://" : "",
                  },
                  onAddNode: handleNodeAction,
                },
          position: {
            x: sourceNode ? sourceNode.position.x : 250,
            y: sourceNode
              ? sourceNode.position.y + 300
              : currentNodes.length * 150 + 50,
          },
        };

        return [...currentNodes, newNode];
      });

      // Add edge with restrictions
      if (type === "conditional") {
        // When adding conditional node, connect with default (from source perspective)
        setEdges((eds) => [
          ...eds,
          { id: `e${sourceId}-${newId}`, source: sourceId, target: newId },
        ]);
      } else {
        setNodes((currentNodes) => {
          const sourceNode = currentNodes.find((n) => n.id === sourceId);
          console.log("sourceNode", sourceNode);

          if (sourceNode?.type === "conditional") {
            setEdges((currentEdges) => {
              const outgoingEdges = currentEdges.filter(
                (e) => e.source === sourceId
              );

              if (outgoingEdges.length >= 2) {
                alert(
                  "Cannot add more than two outgoing edges from a conditional node"
                );
                return currentEdges; // Return unchanged
              }

              const handle = outgoingEdges.length === 0 ? "if" : "else";
              return [
                ...currentEdges,
                {
                  id: `e${sourceId}-${newId}-${handle}`,
                  source: sourceId,
                  target: newId,
                  sourceHandle: handle,
                  data: { label: handle }, // Add label for edge
                },
              ];
            });
          } else {
            // Non-conditional: check restriction before adding
            setEdges((currentEdges) => {
              const outgoingCount = currentEdges.filter(
                (e) => e.source === sourceId && !e.sourceHandle
              ).length;
              if (outgoingCount >= 1) {
                alert(
                  "Cannot add more than one outgoing edge from a non-conditional node"
                );
                return currentEdges;
              }
              return [
                ...currentEdges,
                { id: `e${sourceId}-${newId}`, source: sourceId, target: newId },
              ];
            });
          }

          return currentNodes; // Return unchanged since we're just reading
        });
      }

      // Select the newly added node
      setSelectedNodeId(newId);
    },
    [setNodes, setEdges, setSelectedNodeId]
  );

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
          data: { ...node.data, onAddNode: handleNodeAction },
        })) as ReactFlowNode[]
      );
      setEdges(automation.edges as ReactFlowEdge[]);
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
        },
        position: { x: 250, y: 50 },
      };
      setNodes(() => [defaultNode]);
    }
  }, [automation, handleNodeAction]);

  useEffect(() => {
    const handleBrowserClosed = () => {
      setIsBrowserOpen(false);
      setIsAutomationRunning(false);
      setCurrentNodeId(null);
    };
    if ((window as any).electronAPI) {
      (window as any).electronAPI.onBrowserClosed(handleBrowserClosed);
    }
  }, []);

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
      edges: edges as Edge[],
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

  const openBrowser = async () => {
    try {
      await (window as any).electronAPI.openBrowser("https://google.com");
      setIsBrowserOpen(true);
    } catch (err) {
      console.error("Failed to open browser", err);
    }
  };

  const closeBrowser = async () => {
    try {
      await (window as any).electronAPI.closeBrowser();
      setIsBrowserOpen(false);
      setIsAutomationRunning(false);
      setCurrentNodeId(null);
    } catch (err) {
      console.error("Failed to close browser", err);
    }
  };

  const executeNode = async (node: ReactFlowNode) => {
    setCurrentNodeId(node.id);
    if (node.type === "automationStep" && node.data.step) {
      return await (window as any).electronAPI.runStep(node.data.step);
    } else if (node.type === "conditional") {
      const conditionResult = await (window as any).electronAPI.runConditional({
        conditionType: node.data.conditionType,
        selector: node.data.selector,
        expectedValue: node.data.expectedValue,
      });
      console.log("Condition result:", conditionResult);
      return { conditionResult };
    }
  };

  const runAutomation = async () => {
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
        if (visited.has(nodeId)) return;
        visited.add(nodeId);

        const node = nodes.find((n) => n.id === nodeId) as
          | ReactFlowNode
          | undefined;
        if (!node) return;

        const result = await executeNode(node);
        let nextNodes: string[] = [];

        console.log("Execution result:", result);

        if (
          node.type === "conditional" &&
          result.conditionResult !== undefined
        ) {
          const branch = result.conditionResult ? "if" : "else";
          console.log("Taking branch:", branch);
          console.log("Node ID:", nodeId);
          console.log("Edges:", edges);
          nextNodes = edges
            .filter((e) => e.source === nodeId && e.sourceHandle === branch)
            .map((e) => e.target);
          console.log("Next nodes:", nextNodes);
        } else {
          nextNodes = edges
            .filter((e) => e.source === nodeId)
            .map((e) => e.target);
          console.log("else Next nodes:", nextNodes);
        }

        for (const nextNodeId of nextNodes) {
          await executeGraph(nextNodeId);
        }
      };

      await executeGraph("1"); // Start with the default navigation node
      alert("Automation completed successfully!");
    } catch (error) {
      console.error("Automation failed:", error);
      alert("Automation failed. Check console for details.");
    } finally {
      setIsAutomationRunning(false);
      setCurrentNodeId(null);
    }
  };

  const pauseAutomation = () => {
    setIsAutomationRunning(false);
  };

  const stopAutomation = () => {
    setIsAutomationRunning(false);
    setCurrentNodeId(null);
  };

  // Get selected node for panels
  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || null;

  return (
    <div className="h-screen flex flex-col">
      <header className="border-b border-border bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onCancel}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-xl font-semibold">
                {automation ? "Edit Automation" : "Create Automation"}
              </h1>
              <p className="text-sm text-muted-foreground">
                Design and test your browser automation
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Automation Settings</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Automation Name</Label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter automation name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe what this automation does"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Schedule</Label>
                    <Select
                      value={schedule.type}
                      onValueChange={(value) =>
                        setSchedule((prev) => ({
                          ...prev,
                          type: value as typeof schedule.type,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manual">Manual only</SelectItem>
                        <SelectItem value="interval">
                          Repeat interval
                        </SelectItem>
                        <SelectItem value="fixed">Fixed time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {schedule.type === "interval" && (
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={schedule.interval}
                        onChange={(e) =>
                          setSchedule((prev) => ({
                            ...prev,
                            interval: parseInt(e.target.value) || 1,
                          }))
                        }
                        className="flex-1"
                        min="1"
                      />
                      <Select
                        value={schedule.unit}
                        onValueChange={(value) =>
                          setSchedule((prev) => ({
                            ...prev,
                            unit: value as typeof schedule.unit,
                          }))
                        }
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="minutes">min</SelectItem>
                          <SelectItem value="hours">hrs</SelectItem>
                          <SelectItem value="days">days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {schedule.type === "fixed" && (
                    <Input
                      type="time"
                      value={schedule.value}
                      onChange={(e) =>
                        setSchedule((prev) => ({
                          ...prev,
                          value: e.target.value,
                        }))
                      }
                    />
                  )}
                </div>
              </DialogContent>
            </Dialog>
            {!isBrowserOpen ? (
              <Button variant="outline" onClick={openBrowser}>
                <Globe className="h-4 w-4 mr-2" />
                Open Browser
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={closeBrowser}>
                  <Square className="h-4 w-4 mr-2" />
                  Close Browser
                </Button>
                {!isAutomationRunning ? (
                  <Button
                    variant="default"
                    onClick={runAutomation}
                    disabled={nodes.length === 0}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Run Automation
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" onClick={pauseAutomation}>
                      <Pause className="h-4 w-4 mr-2" />
                      Pause
                    </Button>
                    <Button variant="destructive" onClick={stopAutomation}>
                      <Square className="h-4 w-4 mr-2" />
                      Stop
                    </Button>
                  </>
                )}
              </>
            )}
            <Button onClick={handleSave} disabled={!name.trim()}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </div>
      </header>
      {/* Added relative positioning for absolute panels within canvas */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onSelectionChange={handleSelectionChange} // For tracking selection
          nodeTypes={nodeTypes}
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
        {/* Node addition popup on left */}
        {selectedNodeId && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 z-50">
            <AddStepPopup
              onAdd={(stepType) => handleNodeAction(selectedNodeId, stepType)}
            />
          </div>
        )}
        {/* Node details panel on top-right */}
        {selectedNodeId && selectedNode && (
          <div className="absolute top-4 right-4 z-50 w-80">
            <NodeDetails node={selectedNode} onUpdate={handleNodeAction} />
          </div>
        )}
      </div>
    </div>
  );
}