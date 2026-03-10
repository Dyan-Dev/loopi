/**
 * Pre-Execution Workflow Validator
 * Pure function, zero Electron deps. Validates workflow structure before execution.
 */

export interface ValidatorNode {
  id: string;
  type: string;
  data: {
    step?: {
      type: string;
      value?: string;
      arrayVariable?: string;
      variableName?: string;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
  position?: { x: number; y: number };
}

export interface ValidatorEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate a workflow before execution.
 * Returns errors (block execution) and warnings (informational).
 */
export function validateWorkflow(nodes: ValidatorNode[], edges: ValidatorEdge[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Empty workflow
  if (!nodes || nodes.length === 0) {
    errors.push("Workflow is empty: no nodes found.");
    return { valid: false, errors, warnings };
  }

  // 2. Duplicate node IDs
  const nodeIds = new Set<string>();
  for (const node of nodes) {
    if (nodeIds.has(node.id)) {
      errors.push(`Duplicate node ID: "${node.id}".`);
    }
    nodeIds.add(node.id);
  }

  // 3. Edges referencing non-existent nodes
  for (const edge of edges) {
    if (!nodeIds.has(edge.source)) {
      errors.push(`Edge "${edge.id}" references non-existent source node "${edge.source}".`);
    }
    if (!nodeIds.has(edge.target)) {
      errors.push(`Edge "${edge.id}" references non-existent target node "${edge.target}".`);
    }
  }

  // 4. Circular reference detection via DFS coloring
  // Exclude forEach "loop" edges (they are intentional back-edges)
  const forwardEdges = edges.filter(
    (e) => !(e.sourceHandle === "loop" && isForEachNode(nodes, e.source))
  );

  const adj = new Map<string, string[]>();
  for (const node of nodes) {
    adj.set(node.id, []);
  }
  for (const edge of forwardEdges) {
    if (adj.has(edge.source)) {
      adj.get(edge.source)!.push(edge.target);
    }
  }

  const WHITE = 0;
  const GRAY = 1;
  const BLACK = 2;
  const color = new Map<string, number>();
  for (const node of nodes) {
    color.set(node.id, WHITE);
  }

  let hasCycle = false;
  const dfs = (nodeId: string) => {
    color.set(nodeId, GRAY);
    for (const neighbor of adj.get(nodeId) || []) {
      const c = color.get(neighbor);
      if (c === GRAY) {
        hasCycle = true;
        return;
      }
      if (c === WHITE) {
        dfs(neighbor);
        if (hasCycle) return;
      }
    }
    color.set(nodeId, BLACK);
  };

  for (const node of nodes) {
    if (color.get(node.id) === WHITE) {
      dfs(node.id);
      if (hasCycle) break;
    }
  }

  if (hasCycle) {
    errors.push("Workflow contains a circular reference (cycle detected).");
  }

  // 5. No start nodes
  const incomingNodes = new Set<string>();
  for (const edge of edges) {
    if (nodeIds.has(edge.source) && nodeIds.has(edge.target)) {
      incomingNodes.add(edge.target);
    }
  }
  const startNodes = nodes.filter((n) => !incomingNodes.has(n.id));
  if (startNodes.length === 0) {
    errors.push("No start nodes found: all nodes have incoming edges.");
  }

  // 6. Missing required fields
  for (const node of nodes) {
    const step = node.data?.step;
    if (!step) continue;

    if (step.type === "navigate" && !step.value) {
      warnings.push(`Node "${node.id}": navigate step is missing a URL.`);
    }
    if (step.type === "forEach" && !step.arrayVariable) {
      errors.push(`Node "${node.id}": forEach step is missing arrayVariable.`);
    }
    if ((step.type === "setVariable" || step.type === "modifyVariable") && !step.variableName) {
      warnings.push(`Node "${node.id}": ${step.type} step is missing variableName.`);
    }
  }

  // 7. Conditional nodes without if/else branches
  const conditionalTypes = new Set(["browserConditional", "variableConditional"]);
  for (const node of nodes) {
    const stepType = node.data?.step?.type || node.type;
    if (conditionalTypes.has(stepType)) {
      const outEdges = edges.filter((e) => e.source === node.id);
      const hasIf = outEdges.some((e) => e.sourceHandle === "if");
      const hasElse = outEdges.some((e) => e.sourceHandle === "else");
      if (!hasIf && !hasElse) {
        warnings.push(`Node "${node.id}": conditional node has no if/else branches connected.`);
      } else if (!hasIf) {
        warnings.push(`Node "${node.id}": conditional node is missing "if" branch.`);
      } else if (!hasElse) {
        warnings.push(`Node "${node.id}": conditional node is missing "else" branch.`);
      }
    }
  }

  // 8. ForEach nodes without loop branch
  for (const node of nodes) {
    const stepType = node.data?.step?.type || node.type;
    if (stepType === "forEach") {
      const outEdges = edges.filter((e) => e.source === node.id);
      const hasLoop = outEdges.some((e) => e.sourceHandle === "loop");
      if (!hasLoop) {
        warnings.push(`Node "${node.id}": forEach node has no "loop" branch connected.`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

function isForEachNode(nodes: ValidatorNode[], nodeId: string): boolean {
  const node = nodes.find((n) => n.id === nodeId);
  if (!node) return false;
  return node.type === "forEach" || node.data?.step?.type === "forEach";
}
