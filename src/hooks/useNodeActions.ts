import type { Dispatch, SetStateAction } from "react";
import { useCallback } from "react";
import { addEdge, Connection } from "reactflow";
import type {
  AutomationStep,
  Edge,
  EdgeData,
  Node,
  NodeData,
  ReactFlowEdge,
  ReactFlowNode,
} from "../types";
import { stepTypes } from "../types";

interface UseNodeActionsArgs {
  nodes: ReactFlowNode[];
  edges: ReactFlowEdge[];
  setNodes: Dispatch<SetStateAction<ReactFlowNode[]>>;
  setEdges: Dispatch<SetStateAction<ReactFlowEdge[]>>;
  setSelectedNodeId: (id: string | null) => void;
}

/**
 * useNodeActions - Manages node and edge operations in the automation builder
 *
 * Provides:
 * - Node creation with type-specific initial values
 * - Node updates and deletion
 * - Edge creation with validation (conditional branching constraints)
 * - Automatic edge routing based on node type
 *
 * Constraints enforced:
 * - Regular nodes: max 1 outgoing edge
 * - Conditional nodes: max 2 outgoing edges ("if" and "else" branches)
 * - Root node (id="1") cannot be deleted
 */
export default function useNodeActions({
  nodes,
  edges,
  setNodes,
  setEdges,
  setSelectedNodeId,
}: UseNodeActionsArgs) {
  const onConnect = useCallback(
    (params: Connection) => {
      if (!params.source || !params.target) return null;

      const sourceNode = nodes.find((n) => n.id === params.source);
      if (!sourceNode) return null;

      let sourceHandle: "if" | "else" | undefined = params.sourceHandle as
        | "if"
        | "else"
        | undefined;

      if (sourceNode.type !== "conditional") {
        const outgoing = edges.filter((e) => e.source === params.source && !e.sourceHandle).length;
        if (outgoing >= 1) {
          alert("Cannot add more than one outgoing edge to a non-conditional node");
          return null;
        }
        sourceHandle = undefined;
      } else {
        if (sourceHandle === "if") {
          const existing = edges.find((e) => e.source === params.source && e.sourceHandle === "if");
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

      const newEdge = {
        id: `e${params.source}-${params.target}-${sourceHandle || "default"}`,
        source: params.source!,
        target: params.target!,
        sourceHandle,
        ...(sourceHandle && {
          data: { label: sourceHandle === "if" ? "if" : "else" },
        }),
      };
      setEdges((eds: ReactFlowEdge[]) => addEdge(newEdge, eds));
      return newEdge;
    },
    [nodes, edges, setEdges]
  );

  const handleNodeAction = useCallback(
    (
      sourceId: string,
      type: AutomationStep["type"] | "conditional" | "update" | "delete",
      updates?: Partial<Node["data"]>
    ) => {
      if (type === "delete") {
        setNodes((nds: ReactFlowNode[]) => {
          return nds.filter((node) => node.id !== sourceId);
        });
        setEdges((eds: ReactFlowEdge[]) =>
          eds.filter((edge) => edge.source !== sourceId && edge.target !== sourceId)
        );
        setSelectedNodeId(null);
        return;
      }

      if (type === "update" && updates) {
        setNodes((nds: ReactFlowNode[]) =>
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

      const newId = Date.now().toString();

      setNodes((currentNodes: ReactFlowNode[]) => {
        const sourceNode = currentNodes.find((n) => n.id === sourceId);

        if (sourceNode) {
          if (sourceNode.type === "conditional") {
            let maxOutgoing = false;
            setEdges((edgesInner: ReactFlowEdge[]) => {
              const outgoingEdges = edgesInner.filter((e) => e.source === sourceId);
              if (outgoingEdges.length >= 2) {
                alert("Cannot add more than two outgoing edges from a conditional node.");
                maxOutgoing = true;
                return edgesInner;
              }
              return edgesInner;
            });
            if (maxOutgoing) return currentNodes;
          } else {
            let maxOutgoing = false;
            setEdges((edgesInner: ReactFlowEdge[]) => {
              const outgoingCount = edgesInner.filter(
                (e) => e.source === sourceId && !e.sourceHandle
              ).length;
              if (outgoingCount >= 1) {
                alert("Cannot add more than one outgoing edge from a non-conditional node.");
                maxOutgoing = true;
                return edgesInner;
              }
              return edgesInner;
            });
            if (maxOutgoing) return currentNodes;
          }
        }

        const newNode: ReactFlowNode = {
          id: newId,
          type: type === "conditional" ? "conditional" : "automationStep",
          data:
            type === "conditional"
              ? {
                  conditionType: "elementExists",
                  selector: "",
                  onAddNode: handleNodeAction,
                  nodeRunning: false,
                }
              : {
                  step: (() => {
                    const label =
                      stepTypes.find((s) => s.value === (type as string))?.label || "Step";
                    switch (type) {
                      case "navigate":
                        return {
                          id: newId,
                          type: "navigate" as const,
                          description: `${label} step`,
                          value: "https://",
                        };
                      case "click":
                        return {
                          id: newId,
                          type: "click" as const,
                          description: `${label} step`,
                          selector: "body",
                        };
                      case "type":
                        return {
                          id: newId,
                          type: "type" as const,
                          description: `${label} step`,
                          selector: "body",
                          value: "",
                        };
                      case "wait":
                        return {
                          id: newId,
                          type: "wait" as const,
                          description: `${label} step`,
                          value: "1",
                        };
                      case "screenshot":
                        return {
                          id: newId,
                          type: "screenshot" as const,
                          description: `${label} step`,
                          savePath: "",
                        };
                      case "selectOption":
                        return {
                          id: newId,
                          type: "selectOption" as const,
                          description: `${label} step`,
                          selector: "",
                          optionValue: "",
                        };
                      case "extract":
                        return {
                          id: newId,
                          type: "extract" as const,
                          description: `${label} step`,
                          selector: "",
                          storeKey: "",
                        };
                      case "apiCall":
                        return {
                          id: newId,
                          type: "apiCall" as const,
                          description: `${label} step`,
                          method: "GET" as const,
                          url: "",
                          headers: {},
                          body: "",
                        };
                      case "scroll":
                        return {
                          id: newId,
                          type: "scroll" as const,
                          description: `${label} step`,
                          scrollType: "toElement" as const,
                          selector: "",
                        };
                      case "fileUpload":
                        return {
                          id: newId,
                          type: "fileUpload" as const,
                          description: `${label} step`,
                          selector: "",
                          filePath: "",
                        };
                      case "hover":
                        return {
                          id: newId,
                          type: "hover" as const,
                          description: `${label} step`,
                          selector: "",
                        };
                      case "setVariable":
                        return {
                          id: newId,
                          type: "setVariable" as const,
                          description: `${label} step`,
                          variableName: "",
                          value: "",
                        };
                      case "modifyVariable":
                        return {
                          id: newId,
                          type: "modifyVariable" as const,
                          description: `${label} step`,
                          variableName: "",
                          operation: "set" as const,
                          value: "",
                        };
                      default:
                        return {
                          id: newId,
                          type: "click" as const,
                          description: `${label} step`,
                          selector: "body",
                        };
                    }
                  })(),
                  onAddNode: handleNodeAction,
                  nodeRunning: false,
                },
          position: {
            x: sourceNode ? sourceNode.position.x : 250,
            y: sourceNode ? sourceNode.position.y + 100 : currentNodes.length * 150 + 50,
          },
        };

        return [...currentNodes, newNode];
      });

      if (type === "conditional") {
        setEdges((eds: ReactFlowEdge[]) =>
          addEdge({ id: `e${sourceId}-${newId}`, source: sourceId, target: newId }, eds)
        );
      } else {
        setNodes((currentNodes: ReactFlowNode[]) => {
          const sourceNode = currentNodes.find((n) => n.id === sourceId);

          if (sourceNode?.type === "conditional") {
            setEdges((currentEdges: ReactFlowEdge[]) => {
              const outgoingEdges = currentEdges.filter((e) => e.source === sourceId);
              if (outgoingEdges.length >= 2) {
                return currentEdges;
              }
              const handle = outgoingEdges.length === 0 ? "if" : "else";
              return addEdge(
                {
                  id: `e${sourceId}-${newId}-${handle}`,
                  source: sourceId,
                  target: newId,
                  sourceHandle: handle,
                  data: { label: handle },
                },
                currentEdges
              );
            });
          } else {
            setEdges((currentEdges: ReactFlowEdge[]) => {
              const outgoingCount = currentEdges.filter(
                (e) => e.source === sourceId && !e.sourceHandle
              ).length;
              if (outgoingCount >= 1) {
                return currentEdges;
              }
              return addEdge(
                { id: `e${sourceId}-${newId}`, source: sourceId, target: newId },
                currentEdges
              );
            });
          }

          return currentNodes;
        });
      }

      setSelectedNodeId(newId);
    },
    [setEdges, setNodes, setSelectedNodeId]
  );

  return { onConnect, handleNodeAction };
}
