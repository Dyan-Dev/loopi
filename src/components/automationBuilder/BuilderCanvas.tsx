import React from "react";
import ReactFlow, { Background, Controls, MiniMap, Connection, OnSelectionChangeParams } from "reactflow";
import "reactflow/dist/style.css";
import AddStepPopup from "./AddStepPopup";
import { NodeDetails } from "./nodeDetails";

interface BuilderCanvasProps {
  nodes: any[];
  edges: any[];
  onNodesChange: any;
  onEdgesChange: any;
  onConnect: (c: Connection) => any;
  handleSelectionChange: (p: OnSelectionChangeParams) => void;
  nodeTypes: any;
  selectedNodeId: string | null;
  selectedNode: any | null;
  handleNodeAction: (sourceId: string, type: any, updates?: any) => void;
  setBrowserOpen: (arg?: boolean | string) => void;
  selectedEdgeIds: string[];
  onDeleteSelectedEdges: () => void;
}

/**
 * BuilderCanvas - Main ReactFlow canvas for visual automation editing
 * 
 * Renders:
 * - Interactive node graph with drag-and-drop
 * - Background grid and minimap for navigation
 * - AddStepPopup for adding new nodes
 * - NodeDetails panel for editing selected node
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
}) => {
  return (
    <div className="flex-1 relative">
      <ReactFlow
        nodes={nodes}
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

      {selectedNodeId && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 z-50">
          <AddStepPopup onAdd={(stepType: any) => handleNodeAction(selectedNodeId, stepType)} />
        </div>
      )}

      {selectedNodeId && selectedNode && (
        <div className="absolute top-4 right-4 z-50 w-80">
          <NodeDetails node={selectedNode} onUpdate={handleNodeAction} setBrowserOpen={setBrowserOpen} recentUrl={
            nodes
              .filter((n) => n.data?.step?.type === "navigate")
              .map((n) => n.data?.step?.value)
              .filter(Boolean)
              .pop() || "https://"
          } />
        </div>
      )}

      {selectedEdgeIds.length > 0 && (
        <div className="absolute top-4 left-4 z-50 flex flex-col gap-2 bg-card border border-border rounded-md p-2 shadow-sm">
          <span className="text-xs text-muted-foreground">{selectedEdgeIds.length} edge{selectedEdgeIds.length > 1 ? 's' : ''} selected</span>
          <button
            type="button"
            onClick={onDeleteSelectedEdges}
            className="text-xs bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded"
            title="Delete selected edge(s) (Del/Backspace)"
          >
            Delete Edge{selectedEdgeIds.length > 1 ? 's' : ''}
          </button>
        </div>
      )}
    </div>
  );
};

export default BuilderCanvas;
