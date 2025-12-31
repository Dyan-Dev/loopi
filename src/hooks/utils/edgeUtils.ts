import type { ReactFlowEdge, ReactFlowNode } from "@app-types";
import type { Connection } from "reactflow";
import { addEdge } from "reactflow";

/**
 * Validates and creates a new edge based on node type and constraints.
 * Returns the new edge object if valid, otherwise returns null.
 */
export function validateAndCreateEdge({
  params,
  nodes,
  edges,
  setEdges,
}: {
  params: Connection;
  nodes: ReactFlowNode[];
  edges: ReactFlowEdge[];
  setEdges: (updater: (eds: ReactFlowEdge[]) => ReactFlowEdge[]) => void;
}): ReactFlowEdge | null {
  if (!params.source || !params.target) return null;

  const sourceNode = nodes.find((n) => n.id === params.source);
  if (!sourceNode) return null;

  let sourceHandle: "if" | "else" | undefined = params.sourceHandle as "if" | "else" | undefined;

  const isConditionalNode =
    sourceNode.type === "browserConditional" || sourceNode.type === "variableConditional";
  if (!isConditionalNode) {
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
      const existing = edges.find((e) => e.source === params.source && e.sourceHandle === "else");
      if (existing) {
        alert("The 'else' branch is already connected");
        return null;
      }
    } else {
      const ifExisting = edges.find((e) => e.source === params.source && e.sourceHandle === "if");
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
}
