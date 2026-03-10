import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@utils/logger", () => ({
  createLogger: () => ({ debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() }),
}));
vi.mock("@main/credentialsStore", () => ({
  getCredential: vi.fn(),
}));

import { WorkflowGenerator } from "../workflowGenerator";

function makeRaw(obj: Record<string, unknown>): string {
  return JSON.stringify(obj);
}

function makeWorkflow(
  overrides: Partial<{
    name: string;
    description: string;
    nodes: unknown[];
    edges: unknown[];
  }> = {}
): Record<string, unknown> {
  return {
    name: overrides.name ?? "Test Workflow",
    description: overrides.description ?? "A test",
    nodes: overrides.nodes ?? [],
    edges: overrides.edges ?? [],
  };
}

function makeNode(
  id: string,
  stepType: string,
  extras: Record<string, unknown> = {},
  position = { x: 100, y: 100 }
): unknown {
  return {
    id,
    type: "automationStep",
    data: {
      step: { id, type: stepType, description: `${stepType} step`, ...extras },
    },
    position,
  };
}

function makeEdge(source: string, target: string, extra: Record<string, unknown> = {}): unknown {
  return {
    id: `e${source}-${target}`,
    source,
    target,
    ...extra,
  };
}

describe("WorkflowGenerator", () => {
  let generator: WorkflowGenerator;

  beforeEach(() => {
    generator = new WorkflowGenerator();
  });

  // ─── 1. JSON Parsing ───────────────────────────────────────────────

  describe("JSON parsing", () => {
    it("should parse valid JSON correctly", () => {
      const raw = makeRaw(makeWorkflow({ name: "My Flow", description: "desc" }));
      const result = generator.parseAndValidate(raw);

      expect(result.name).toBe("My Flow");
      expect(result.description).toBe("desc");
      expect(result.nodes).toEqual([]);
      expect(result.edges).toEqual([]);
    });

    it("should strip markdown ```json fences", () => {
      const inner = makeRaw(makeWorkflow({ name: "Fenced" }));
      const raw = "```json\n" + inner + "\n```";
      const result = generator.parseAndValidate(raw);

      expect(result.name).toBe("Fenced");
    });

    it("should strip markdown ``` fences without json lang tag", () => {
      const inner = makeRaw(makeWorkflow({ name: "Plain Fence" }));
      const raw = "```\n" + inner + "\n```";
      const result = generator.parseAndValidate(raw);

      expect(result.name).toBe("Plain Fence");
    });

    it("should throw a descriptive error for invalid JSON", () => {
      expect(() => generator.parseAndValidate("not json at all")).toThrow(
        "AI returned invalid JSON. Please try again with a clearer description."
      );
    });
  });

  // ─── 2. Node Validation ────────────────────────────────────────────

  describe("node validation", () => {
    it("should keep nodes with valid step types", () => {
      const raw = makeRaw(
        makeWorkflow({
          nodes: [makeNode("1", "navigate", { value: "https://example.com" })],
        })
      );
      const result = generator.parseAndValidate(raw);

      expect(result.nodes).toHaveLength(1);
      expect(result.nodes[0].id).toBe("1");
    });

    it("should filter out nodes with unknown step types", () => {
      const raw = makeRaw(
        makeWorkflow({
          nodes: [makeNode("1", "navigate"), makeNode("2", "unknownStepType")],
        })
      );
      const result = generator.parseAndValidate(raw);

      expect(result.nodes).toHaveLength(1);
      expect(result.nodes[0].id).toBe("1");
    });

    it("should filter out nodes missing id", () => {
      const raw = makeRaw(
        makeWorkflow({
          nodes: [
            {
              type: "automationStep",
              data: { step: { type: "navigate" } },
              position: { x: 0, y: 0 },
            },
            makeNode("2", "click"),
          ],
        })
      );
      const result = generator.parseAndValidate(raw);

      expect(result.nodes).toHaveLength(1);
      expect(result.nodes[0].id).toBe("2");
    });

    it("should filter out nodes missing data.step.type", () => {
      const raw = makeRaw(
        makeWorkflow({
          nodes: [
            { id: "1", type: "automationStep", data: { step: {} }, position: { x: 100, y: 100 } },
            makeNode("2", "click"),
          ],
        })
      );
      const result = generator.parseAndValidate(raw);

      expect(result.nodes).toHaveLength(1);
      expect(result.nodes[0].id).toBe("2");
    });

    it("should sync step.id to node.id", () => {
      const raw = makeRaw(
        makeWorkflow({
          nodes: [
            {
              id: "node-42",
              type: "automationStep",
              data: { step: { id: "wrong-id", type: "navigate", description: "Go" } },
              position: { x: 100, y: 100 },
            },
          ],
        })
      );
      const result = generator.parseAndValidate(raw);

      expect(result.nodes[0].data.step.id).toBe("node-42");
    });

    it("should add a default description if step is missing one", () => {
      const raw = makeRaw(
        makeWorkflow({
          nodes: [
            {
              id: "1",
              type: "automationStep",
              data: { step: { id: "1", type: "click", selector: "#btn" } },
              position: { x: 100, y: 100 },
            },
          ],
        })
      );
      const result = generator.parseAndValidate(raw);

      expect(result.nodes[0].data.step.description).toBe("click step");
    });
  });

  // ─── 3. Node Type Correction ───────────────────────────────────────

  describe("node type correction", () => {
    it("should correct node.type to 'browserConditional' for browserConditional steps", () => {
      const raw = makeRaw(
        makeWorkflow({
          nodes: [
            makeNode("1", "browserConditional", {
              browserConditionType: "elementExists",
              selector: "#el",
            }),
          ],
        })
      );
      const result = generator.parseAndValidate(raw);

      expect(result.nodes[0].type).toBe("browserConditional");
    });

    it("should correct node.type to 'variableConditional' for variableConditional steps", () => {
      const raw = makeRaw(
        makeWorkflow({
          nodes: [
            makeNode("1", "variableConditional", {
              variableConditionType: "variableEquals",
              variableName: "x",
            }),
          ],
        })
      );
      const result = generator.parseAndValidate(raw);

      expect(result.nodes[0].type).toBe("variableConditional");
    });

    it("should correct node.type to 'forEach' for forEach steps", () => {
      const raw = makeRaw(
        makeWorkflow({
          nodes: [makeNode("1", "forEach", { arrayVariable: "items", itemVariable: "item" })],
        })
      );
      const result = generator.parseAndValidate(raw);

      expect(result.nodes[0].type).toBe("forEach");
    });

    it("should set node.type to 'automationStep' for regular steps like navigate", () => {
      const raw = makeRaw(
        makeWorkflow({
          nodes: [
            {
              id: "1",
              type: "wrongType",
              data: {
                step: {
                  id: "1",
                  type: "navigate",
                  description: "Go",
                  value: "https://example.com",
                },
              },
              position: { x: 100, y: 100 },
            },
          ],
        })
      );
      const result = generator.parseAndValidate(raw);

      expect(result.nodes[0].type).toBe("automationStep");
    });
  });

  // ─── 4. Edge Validation ────────────────────────────────────────────

  describe("edge validation", () => {
    it("should keep valid edges", () => {
      const raw = makeRaw(
        makeWorkflow({
          nodes: [makeNode("1", "navigate"), makeNode("2", "click")],
          edges: [makeEdge("1", "2")],
        })
      );
      const result = generator.parseAndValidate(raw);

      expect(result.edges).toHaveLength(1);
      expect(result.edges[0].source).toBe("1");
      expect(result.edges[0].target).toBe("2");
    });

    it("should filter out edges with missing source or target", () => {
      const raw = makeRaw(
        makeWorkflow({
          nodes: [makeNode("1", "navigate")],
          edges: [{ id: "e1", source: "1" }, { id: "e2", target: "1" }, { id: "e3" }],
        })
      );
      const result = generator.parseAndValidate(raw);

      expect(result.edges).toHaveLength(0);
    });

    it("should filter out edges referencing non-existent nodes", () => {
      const raw = makeRaw(
        makeWorkflow({
          nodes: [makeNode("1", "navigate")],
          edges: [makeEdge("1", "999"), makeEdge("888", "1")],
        })
      );
      const result = generator.parseAndValidate(raw);

      expect(result.edges).toHaveLength(0);
    });

    it("should auto-generate edge id when missing", () => {
      const raw = makeRaw(
        makeWorkflow({
          nodes: [makeNode("1", "navigate"), makeNode("2", "click")],
          edges: [{ source: "1", target: "2" }],
        })
      );
      const result = generator.parseAndValidate(raw);

      expect(result.edges).toHaveLength(1);
      expect(result.edges[0].id).toBe("e1-2-default");
    });
  });

  // ─── 5. autoLayout ────────────────────────────────────────────────

  describe("autoLayout", () => {
    const Y_GAP = 120;
    const X_GAP = 200;

    it("should space a linear chain vertically with Y_GAP", () => {
      const raw = makeRaw(
        makeWorkflow({
          nodes: [
            makeNode("1", "navigate", {}, { x: 0, y: 0 }),
            makeNode("2", "click", {}, { x: 0, y: 0 }),
            makeNode("3", "type", {}, { x: 0, y: 0 }),
          ],
          edges: [makeEdge("1", "2"), makeEdge("2", "3")],
        })
      );
      const result = generator.parseAndValidate(raw);

      // Levels: 1 -> level 0, 2 -> level 1, 3 -> level 2
      expect(result.nodes[0].position.y).toBe(0 * Y_GAP + 50);
      expect(result.nodes[1].position.y).toBe(1 * Y_GAP + 50);
      expect(result.nodes[2].position.y).toBe(2 * Y_GAP + 50);
      // All on same X since only one node per level
      expect(result.nodes[0].position.x).toBe(250);
      expect(result.nodes[1].position.x).toBe(250);
      expect(result.nodes[2].position.x).toBe(250);
    });

    it("should space branching nodes horizontally with X_GAP", () => {
      // Node 1 branches to 2 and 3
      const raw = makeRaw(
        makeWorkflow({
          nodes: [
            makeNode("1", "browserConditional", {}, { x: 0, y: 0 }),
            makeNode("2", "click", {}, { x: 0, y: 0 }),
            makeNode("3", "navigate", {}, { x: 0, y: 0 }),
          ],
          edges: [
            { id: "e1-2", source: "1", target: "2", sourceHandle: "if" },
            { id: "e1-3", source: "1", target: "3", sourceHandle: "else" },
          ],
        })
      );
      const result = generator.parseAndValidate(raw);

      // Level 0: node 1, Level 1: nodes 2 and 3
      const level1Nodes = result.nodes.filter((n) => n.id === "2" || n.id === "3");
      // Two nodes at same level => they should differ by X_GAP
      const xs = level1Nodes.map((n) => n.position.x).sort((a, b) => a - b);
      expect(xs[1] - xs[0]).toBe(X_GAP);
    });

    it("should position a single node correctly", () => {
      const raw = makeRaw(
        makeWorkflow({
          nodes: [makeNode("1", "navigate", {}, { x: 0, y: 0 })],
        })
      );
      const result = generator.parseAndValidate(raw);

      // Level 0, single node: startX = 250 - 0 = 250, y = 0 * 120 + 50 = 50
      expect(result.nodes[0].position.x).toBe(250);
      expect(result.nodes[0].position.y).toBe(50);
    });

    it("should trigger layout when all positions are (0, 0)", () => {
      const raw = makeRaw(
        makeWorkflow({
          nodes: [
            makeNode("1", "navigate", {}, { x: 0, y: 0 }),
            makeNode("2", "click", {}, { x: 0, y: 0 }),
          ],
          edges: [makeEdge("1", "2")],
        })
      );
      const result = generator.parseAndValidate(raw);

      // Layout was triggered, so positions should not be (0,0)
      expect(result.nodes[0].position).not.toEqual({ x: 0, y: 0 });
      expect(result.nodes[1].position).not.toEqual({ x: 0, y: 0 });
    });

    it("should not trigger layout when positions are already set", () => {
      const raw = makeRaw(
        makeWorkflow({
          nodes: [
            makeNode("1", "navigate", {}, { x: 10, y: 20 }),
            makeNode("2", "click", {}, { x: 30, y: 40 }),
          ],
          edges: [makeEdge("1", "2")],
        })
      );
      const result = generator.parseAndValidate(raw);

      // Positions should remain as originally set
      expect(result.nodes[0].position).toEqual({ x: 10, y: 20 });
      expect(result.nodes[1].position).toEqual({ x: 30, y: 40 });
    });
  });

  // ─── 6. Auto-fix missing edges ────────────────────────────────────

  describe("autoFixMissingEdges", () => {
    it("should auto-connect nodes sequentially when no edges are provided", () => {
      const raw = makeRaw(
        makeWorkflow({
          nodes: [
            makeNode("1", "navigate", { value: "https://a.com" }),
            makeNode("2", "click", { selector: "#btn" }),
            makeNode("3", "extract", { selector: ".title", storeKey: "t" }),
          ],
          edges: [],
        })
      );
      const result = generator.parseAndValidate(raw);

      expect(result.edges).toHaveLength(2);
      expect(result.edges[0].source).toBe("1");
      expect(result.edges[0].target).toBe("2");
      expect(result.edges[1].source).toBe("2");
      expect(result.edges[1].target).toBe("3");
      expect(result.warnings).toContainEqual(expect.stringContaining("Auto-connected"));
    });

    it("should not auto-connect when edges already exist", () => {
      const raw = makeRaw(
        makeWorkflow({
          nodes: [makeNode("1", "navigate"), makeNode("2", "click")],
          edges: [makeEdge("1", "2")],
        })
      );
      const result = generator.parseAndValidate(raw);

      expect(result.edges).toHaveLength(1);
      expect(result.warnings.filter((w) => w.includes("Auto-connected"))).toHaveLength(0);
    });
  });

  // ─── 7. Auto-fix source handles ───────────────────────────────────

  describe("autoFixSourceHandles", () => {
    it("should auto-assign if/else handles to conditional node edges", () => {
      const raw = makeRaw(
        makeWorkflow({
          nodes: [
            makeNode("1", "variableConditional", {
              variableConditionType: "variableEquals",
              variableName: "x",
            }),
            makeNode("2", "navigate"),
            makeNode("3", "click"),
          ],
          edges: [
            // No sourceHandle specified
            makeEdge("1", "2"),
            makeEdge("1", "3"),
          ],
        })
      );
      const result = generator.parseAndValidate(raw);

      const outEdges = result.edges.filter((e) => e.source === "1");
      expect(outEdges.find((e) => e.target === "2")?.sourceHandle).toBe("if");
      expect(outEdges.find((e) => e.target === "3")?.sourceHandle).toBe("else");
    });

    it("should auto-assign loop/done handles to forEach node edges", () => {
      const raw = makeRaw(
        makeWorkflow({
          nodes: [
            makeNode("1", "forEach", { arrayVariable: "items" }),
            makeNode("2", "navigate"),
            makeNode("3", "click"),
          ],
          edges: [makeEdge("1", "2"), makeEdge("1", "3")],
        })
      );
      const result = generator.parseAndValidate(raw);

      const outEdges = result.edges.filter((e) => e.source === "1");
      expect(outEdges.find((e) => e.target === "2")?.sourceHandle).toBe("loop");
      expect(outEdges.find((e) => e.target === "3")?.sourceHandle).toBe("done");
    });
  });

  // ─── 8. Node sanity checks ────────────────────────────────────────

  describe("node sanity checks", () => {
    it("should default forEach arrayVariable to 'items' when missing", () => {
      const raw = makeRaw(
        makeWorkflow({
          nodes: [makeNode("1", "forEach")],
        })
      );
      const result = generator.parseAndValidate(raw);

      expect(result.nodes[0].data.step.arrayVariable).toBe("items");
      expect(result.warnings).toContainEqual(expect.stringContaining("missing arrayVariable"));
    });

    it("should add default itemVariable and indexVariable to forEach", () => {
      const raw = makeRaw(
        makeWorkflow({
          nodes: [makeNode("1", "forEach", { arrayVariable: "urls" })],
        })
      );
      const result = generator.parseAndValidate(raw);

      expect(result.nodes[0].data.step.itemVariable).toBe("currentItem");
      expect(result.nodes[0].data.step.indexVariable).toBe("loopIndex");
    });

    it("should warn when navigate has no URL", () => {
      const raw = makeRaw(
        makeWorkflow({
          nodes: [makeNode("1", "navigate")],
        })
      );
      const result = generator.parseAndValidate(raw);

      expect(result.warnings).toContainEqual(expect.stringContaining("no URL"));
    });

    it("should warn when extract has no selector", () => {
      const raw = makeRaw(
        makeWorkflow({
          nodes: [makeNode("1", "extract", { storeKey: "data" })],
        })
      );
      const result = generator.parseAndValidate(raw);

      expect(result.warnings).toContainEqual(expect.stringContaining("no selector"));
    });

    it("should warn when apiCall has no url", () => {
      const raw = makeRaw(
        makeWorkflow({
          nodes: [makeNode("1", "apiCall", { method: "GET" })],
        })
      );
      const result = generator.parseAndValidate(raw);

      expect(result.warnings).toContainEqual(expect.stringContaining("no url"));
    });
  });
});
