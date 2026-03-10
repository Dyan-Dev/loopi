import { describe, expect, it, vi } from "vitest";

vi.mock("electron", () => ({ BrowserWindow: vi.fn() }));
vi.mock("@main/automationExecutor", () => ({ AutomationExecutor: vi.fn() }));
vi.mock("@main/headlessExecutor", () => ({ HeadlessExecutor: vi.fn() }));
vi.mock("@utils/logger", () => ({
  createLogger: () => ({ debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() }),
}));

import { collectReachableNodes, findStartNodes } from "../graphExecutor";

// ---------- helpers ----------

interface Node {
  id: string;
  type: string;
  data: { step?: { type: string } };
  position: { x: number; y: number };
}

interface Edge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
}

const node = (id: string): Node => ({
  id,
  type: "automationStep",
  data: { step: { type: "navigate" } },
  position: { x: 0, y: 0 },
});

const edge = (source: string, target: string): Edge => ({
  id: `e${source}-${target}`,
  source,
  target,
});

// ---------- collectReachableNodes ----------

describe("collectReachableNodes", () => {
  it("collects all nodes in a linear chain", () => {
    const edges = [edge("A", "B"), edge("B", "C")];
    const result = collectReachableNodes("A", edges, new Set());
    expect(result).toEqual(new Set(["A", "B", "C"]));
  });

  it("stops at boundary nodes", () => {
    const edges = [edge("A", "B"), edge("B", "C")];
    const result = collectReachableNodes("A", edges, new Set(["C"]));
    expect(result).toEqual(new Set(["A", "B"]));
  });

  it("collects all branches from a branching node", () => {
    const edges = [edge("A", "B"), edge("A", "C")];
    const result = collectReachableNodes("A", edges, new Set());
    expect(result).toEqual(new Set(["A", "B", "C"]));
  });

  it("handles cycles without infinite loop", () => {
    const edges = [edge("A", "B"), edge("B", "A")];
    const result = collectReachableNodes("A", edges, new Set());
    expect(result).toEqual(new Set(["A", "B"]));
  });

  it("does not include disconnected nodes", () => {
    const edges = [edge("A", "B")];
    // Node C exists but is not connected to A
    const result = collectReachableNodes("A", edges, new Set());
    expect(result).toEqual(new Set(["A", "B"]));
    expect(result.has("C")).toBe(false);
  });

  it("returns only the start node when there are no edges", () => {
    const result = collectReachableNodes("A", [], new Set());
    expect(result).toEqual(new Set(["A"]));
  });

  it("returns only the start node when it is itself a boundary", () => {
    // The start node is never excluded by boundary check (boundary only blocks targets)
    // but there are no outgoing edges that escape the boundary
    const edges = [edge("A", "B")];
    const result = collectReachableNodes("A", edges, new Set(["B"]));
    expect(result).toEqual(new Set(["A"]));
  });

  it("respects multiple boundary nodes", () => {
    // A -> B -> C, A -> D -> E; boundaries at C and E
    const edges = [edge("A", "B"), edge("B", "C"), edge("A", "D"), edge("D", "E")];
    const result = collectReachableNodes("A", edges, new Set(["C", "E"]));
    expect(result).toEqual(new Set(["A", "B", "D"]));
  });
});

// ---------- findStartNodes ----------

describe("findStartNodes", () => {
  it("finds the single start node in a linear chain", () => {
    const nodes = [node("A"), node("B"), node("C")];
    const edges = [edge("A", "B"), edge("B", "C")];
    const { startNodes } = findStartNodes(nodes as any, edges as any);
    expect(startNodes.map((n) => n.id)).toEqual(["A"]);
  });

  it("finds multiple start nodes", () => {
    const nodes = [node("A"), node("B"), node("C")];
    const edges = [edge("A", "C"), edge("B", "C")];
    const { startNodes } = findStartNodes(nodes as any, edges as any);
    const ids = startNodes.map((n) => n.id).sort();
    expect(ids).toEqual(["A", "B"]);
  });

  it("throws when all nodes have incoming edges", () => {
    const nodes = [node("A"), node("B")];
    const edges = [edge("A", "B"), edge("B", "A")];
    expect(() => findStartNodes(nodes as any, edges as any)).toThrowError(
      "No start nodes found in workflow"
    );
  });

  it("returns the sole node when there are no edges", () => {
    const nodes = [node("A")];
    const { startNodes } = findStartNodes(nodes as any, [] as any);
    expect(startNodes.map((n) => n.id)).toEqual(["A"]);
  });

  it("ignores edges referencing non-existent nodes", () => {
    const nodes = [node("A"), node("B")];
    // edge from X (doesn't exist) to B — should be ignored, so B has indegree 0
    const edges = [edge("X", "B"), edge("A", "B")];
    // X->B is invalid (X not in nodes), A->B is valid => only A is start
    const { startNodes } = findStartNodes(nodes as any, edges as any);
    expect(startNodes.map((n) => n.id)).toEqual(["A"]);
  });

  it("treats a node with only a self-loop as having incoming edges", () => {
    // A self-loop A->A makes indegree(A) = 1, so A is not a start node.
    // With only one node and a self-loop, there are no start nodes → throws.
    const nodes = [node("A")];
    const edges = [edge("A", "A")];
    expect(() => findStartNodes(nodes as any, edges as any)).toThrowError(
      "No start nodes found in workflow"
    );
  });

  it("identifies start nodes in a diamond graph", () => {
    // A -> B, A -> C, B -> D, C -> D
    const nodes = [node("A"), node("B"), node("C"), node("D")];
    const edges = [edge("A", "B"), edge("A", "C"), edge("B", "D"), edge("C", "D")];
    const { startNodes } = findStartNodes(nodes as any, edges as any);
    expect(startNodes.map((n) => n.id)).toEqual(["A"]);
  });
});
