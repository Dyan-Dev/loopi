import type { AutomationStep, NodeData, ReactFlowEdge, ReactFlowNode } from "@app-types";
import React, { useMemo } from "react";
import type { NodeTypes } from "reactflow";
import ReactFlow, {
  Background,
  Connection,
  Controls,
  MiniMap,
  OnEdgesChange,
  OnNodesChange,
  OnSelectionChangeParams,
  ReactFlowProvider,
} from "reactflow";
import "reactflow/dist/style.css";
import AddStepPopup from "./AddStepPopup";
import DebugLogsPanel from "./DebugLogsPanel";
import NodeDetails from "./NodeDetails";
import NodeSearch from "./NodeSearch";

interface BuilderCanvasProps {
  nodes: ReactFlowNode[];
  edges: ReactFlowEdge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: (c: Connection) => void;
  handleSelectionChange: (p: OnSelectionChangeParams) => void;
  nodeTypes: NodeTypes | undefined;
  selectedNodeId: string | null;
  selectedNode: ReactFlowNode | null;
  handleNodeAction: (
    sourceId: string,
    type: AutomationStep["type"] | "update" | "delete",
    updates?: Partial<NodeData>
  ) => void;
  setBrowserOpen: (arg?: boolean | string) => void;
  selectedEdgeIds: string[];
  onDeleteSelectedEdges: () => void;
  isDebugEnabled: boolean;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  highlightedNodeId: string | null;
  setHighlightedNodeId: (id: string | null) => void;
  setSelectedNodeId: (id: string | null) => void;
}

/**
 * BuilderCanvas - Main ReactFlow canvas for visual automation editing
 *
 * Renders:
 * - Interactive node graph with drag-and-drop
 * - Background grid and minimap for navigation
 * - AddStepPopup for adding new nodes
 * - NodeDetails panel for editing selected node
 * - Optional DebugLogsPanel for split-screen debugging
 */
export const BuilderCanvas: React.FC<BuilderCanvasProps> = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  handleSelectionChange,
  nodeTypes,
  selectedNodeId,
  selectedNode,
  handleNodeAction,
  setBrowserOpen,
  selectedEdgeIds,
  onDeleteSelectedEdges,
  isDebugEnabled,
  isSearchOpen,
  setIsSearchOpen,
  highlightedNodeId,
  setHighlightedNodeId,
  setSelectedNodeId,
}) => {
  // Apply highlighting styles to nodes
  const nodesWithHighlight = useMemo(() => {
    return nodes.map((node) => ({
      ...node,
      className:
        node.id === highlightedNodeId
          ? "animate-pulse ring-4 ring-blue-500 rounded-full"
          : undefined,
    }));
  }, [nodes, highlightedNodeId]);

  // Handle node selection from search
  const handleNodeSelectFromSearch = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    setHighlightedNodeId(nodeId);
  };
  return (
    <div className="flex-1 flex h-full">
      <ReactFlowProvider>
        {/* Node Search Dialog */}
        <NodeSearch
          nodes={nodes}
          open={isSearchOpen}
          onOpenChange={setIsSearchOpen}
          onNodeSelect={handleNodeSelectFromSearch}
        />

        {/* Left side - ReactFlow canvas */}
        <div className="flex-1 h-full">
          <div className="h-full w-full relative">
            <ReactFlow
              nodes={nodesWithHighlight}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onSelectionChange={handleSelectionChange}
              nodeTypes={nodeTypes}
            >
              <Background />
              <Controls />
              <MiniMap />
            </ReactFlow>

            {/* Show AddStepPopup when canvas is empty or when a node is selected */}
            {(nodes.length === 0 || selectedNodeId) && (
              <div className="absolute left-4 top-1/2 -translate-y-1/2 z-50">
                <AddStepPopup
                  onAdd={(stepType: AutomationStep["type"]) => {
                    if (selectedNodeId) {
                      handleNodeAction(selectedNodeId, stepType);
                    } else {
                      // For empty canvas, create a root node with a unique ID
                      const newNodeId = `node-${Date.now()}`;
                      handleNodeAction(newNodeId, stepType);
                    }
                  }}
                />
              </div>
            )}

            {selectedNodeId && selectedNode && (
              <div className="absolute top-4 right-4 z-50 w-80">
                <NodeDetails
                  node={selectedNode}
                  onUpdate={handleNodeAction}
                  setBrowserOpen={setBrowserOpen}
                  recentUrl={
                    nodes
                      .filter((n) => n.data?.step?.type === "navigate")
                      .map((n) =>
                        n.data?.step?.type === "navigate"
                          ? (n.data.step as { value: string }).value
                          : undefined
                      )
                      .filter(Boolean)
                      .pop() || "https://"
                  }
                />
              </div>
            )}

            {selectedEdgeIds.length > 0 && (
              <div className="absolute top-4 left-4 z-50 flex flex-col gap-2 bg-card border border-border rounded-md p-2 shadow-sm">
                <span className="text-xs text-muted-foreground">
                  {selectedEdgeIds.length} edge{selectedEdgeIds.length > 1 ? "s" : ""} selected
                </span>
                <button
                  type="button"
                  onClick={onDeleteSelectedEdges}
                  className="text-xs bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded"
                  title="Delete selected edge(s) (Del/Backspace)"
                >
                  Delete Edge{selectedEdgeIds.length > 1 ? "s" : ""}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right side - Debug logs panel (conditional) */}
        {isDebugEnabled && (
          <div className="w-1/3 border-l border-border">
            <DebugLogsPanel isDebugEnabled={isDebugEnabled} />
          </div>
        )}
      </ReactFlowProvider>
    </div>
  );
};

export default BuilderCanvas;
