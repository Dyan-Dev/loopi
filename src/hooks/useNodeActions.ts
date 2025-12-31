import type { AutomationStep, Node, ReactFlowEdge, ReactFlowNode } from "@app-types";
import { validateAndCreateEdge } from "@hooks/utils/edgeUtils";
import { updateOrDeleteNode } from "@hooks/utils/nodeActions";
import { createNode } from "@hooks/utils/nodeFactory";
import type { Dispatch, SetStateAction } from "react";
import { useCallback } from "react";
import { addEdge, Connection } from "reactflow";

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
      return validateAndCreateEdge({ params, nodes, edges, setEdges });
    },
    [nodes, edges, setEdges]
  );

  const handleNodeAction = useCallback(
    (
      sourceId: string,
      type: AutomationStep["type"] | "update" | "delete",
      updates?: Partial<Node["data"]>
    ) => {
      // Handle update and delete
      if (type === "delete" || type === "update") {
        updateOrDeleteNode({
          sourceId,
          type,
          updates,
          setNodes,
          setEdges,
          setSelectedNodeId,
          handleNodeAction,
        });
        return;
      }

      // Add new node logic
      const newId = Date.now().toString();
      setNodes((currentNodes: ReactFlowNode[]) => {
        const sourceNode = currentNodes.find((n) => n.id === sourceId);

        // Outgoing edge constraints
        if (sourceNode) {
          const isConditionalNode =
            sourceNode.type === "browserConditional" || sourceNode.type === "variableConditional";
          if (isConditionalNode) {
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

        const newNode = createNode({
          type,
          newId,
          sourceNode,
          handleNodeAction,
          currentNodes,
        });
        return [...currentNodes, newNode];
      });

      // Add edge for new node
      const isConditionalType = type === "browserConditional" || type === "variableConditional";
      if (isConditionalType) {
        setEdges((eds: ReactFlowEdge[]) =>
          addEdge({ id: `e${sourceId}-${newId}`, source: sourceId, target: newId }, eds)
        );
      } else {
        setNodes((currentNodes: ReactFlowNode[]) => {
          const sourceNode = currentNodes.find((n) => n.id === sourceId);
          const isSourceConditional =
            sourceNode?.type === "browserConditional" || sourceNode?.type === "variableConditional";
          if (isSourceConditional) {
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
