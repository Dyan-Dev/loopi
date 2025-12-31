import type { AutomationStep, ReactFlowEdge, ReactFlowNode } from "@app-types";
import type { NodeDataBase } from "@app-types/flow";

/**
 * Handles node update and deletion logic.
 */
export interface UpdateOrDeleteNodeArgs {
  sourceId: string;
  type: AutomationStep["type"] | "update" | "delete";
  updates?: Partial<NodeDataBase>;
  setNodes: (updater: (nds: ReactFlowNode[]) => ReactFlowNode[]) => void;
  setEdges: (updater: (eds: ReactFlowEdge[]) => ReactFlowEdge[]) => void;
  setSelectedNodeId: (id: string | null) => void;
  handleNodeAction: (
    sourceId: string,
    type: AutomationStep["type"] | "update" | "delete",
    updates?: Partial<NodeDataBase>
  ) => void;
}

export function updateOrDeleteNode(args: UpdateOrDeleteNodeArgs) {
  const { sourceId, type, updates, setNodes, setEdges, setSelectedNodeId, handleNodeAction } = args;
  if (type === "delete") {
    setNodes((nds: ReactFlowNode[]) => nds.filter((node) => node.id !== sourceId));
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
}
