import { describe, expect, it } from "vitest";
import { validateWorkflow } from "../workflowValidator";

const node = (
  id: string,
  type = "automationStep",
  stepType = "navigate",
  stepExtra: Record<string, unknown> = {}
) => ({
  id,
  type,
  data: { step: { type: stepType, ...stepExtra } },
  position: { x: 0, y: 0 },
});

const edge = (source: string, target: string, sourceHandle?: string) => ({
  id: `e${source}-${target}`,
  source,
  target,
  ...(sourceHandle ? { sourceHandle } : {}),
});

// ---------------------------------------------------------------------------
// Empty / basic
// ---------------------------------------------------------------------------
describe("Empty / basic workflows", () => {
  it("returns an error when nodes array is empty", () => {
    const result = validateWorkflow([], []);
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(expect.stringContaining("Workflow is empty"));
  });

  it("accepts a single node with no edges", () => {
    const result = validateWorkflow([node("1")], []);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("accepts a valid linear workflow", () => {
    const result = validateWorkflow(
      [node("1"), node("2"), node("3")],
      [edge("1", "2"), edge("2", "3")]
    );
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Duplicate IDs
// ---------------------------------------------------------------------------
describe("Duplicate node IDs", () => {
  it("reports an error when two nodes share the same id", () => {
    const result = validateWorkflow([node("dup"), node("dup")], []);
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(expect.stringContaining('Duplicate node ID: "dup"'));
  });

  it("does not report duplicate errors when all ids are unique", () => {
    const result = validateWorkflow(
      [node("a"), node("b"), node("c")],
      [edge("a", "b"), edge("b", "c")]
    );
    expect(result.errors.filter((e) => e.includes("Duplicate"))).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Edge validation
// ---------------------------------------------------------------------------
describe("Edge validation", () => {
  it("reports an error for edge referencing a non-existent source", () => {
    const result = validateWorkflow([node("1")], [edge("ghost", "1")]);
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.stringContaining('non-existent source node "ghost"')
    );
  });

  it("reports an error for edge referencing a non-existent target", () => {
    const result = validateWorkflow([node("1")], [edge("1", "ghost")]);
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.stringContaining('non-existent target node "ghost"')
    );
  });
});

// ---------------------------------------------------------------------------
// Circular reference detection
// ---------------------------------------------------------------------------
describe("Circular reference detection", () => {
  it("detects a simple A->B->A cycle", () => {
    const result = validateWorkflow([node("A"), node("B")], [edge("A", "B"), edge("B", "A")]);
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(expect.stringContaining("circular reference"));
  });

  it("does not flag a linear A->B->C chain as a cycle", () => {
    const result = validateWorkflow(
      [node("A"), node("B"), node("C")],
      [edge("A", "B"), edge("B", "C")]
    );
    expect(result.errors.filter((e) => e.includes("circular"))).toHaveLength(0);
  });

  it("excludes forEach loop edges from cycle detection", () => {
    // forEach node "fe" has a "loop" edge back from child "child" -> this is
    // intentional and should NOT be flagged as a cycle.
    const feNode = node("fe", "forEach", "forEach", { arrayVariable: "items" });
    const childNode = node("child");
    const result = validateWorkflow(
      [feNode, childNode],
      [
        edge("fe", "child", "loop"), // forEach -> child via "loop" handle
        edge("child", "fe"), // child back to forEach (loop-back)
      ]
    );
    // The "loop" edge from the forEach node is excluded, so the only forward
    // edge is child -> fe, and fe has no forward edges, meaning no cycle.
    expect(result.errors.filter((e) => e.includes("circular"))).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// No start nodes
// ---------------------------------------------------------------------------
describe("No start nodes", () => {
  it("reports an error when all nodes have incoming edges (cycle)", () => {
    const result = validateWorkflow([node("A"), node("B")], [edge("A", "B"), edge("B", "A")]);
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(expect.stringContaining("No start nodes found"));
  });

  it("does not report start-node error for a normal workflow", () => {
    const result = validateWorkflow([node("start"), node("end")], [edge("start", "end")]);
    expect(result.errors.filter((e) => e.includes("start nodes"))).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Missing required fields
// ---------------------------------------------------------------------------
describe("Missing required fields", () => {
  it("warns when a navigate step has no value (URL)", () => {
    const result = validateWorkflow([node("n1", "automationStep", "navigate")], []);
    expect(result.warnings).toContainEqual(expect.stringContaining("missing a URL"));
  });

  it("errors when a forEach step has no arrayVariable", () => {
    const feNode = node("fe", "automationStep", "forEach");
    const result = validateWorkflow([feNode], []);
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(expect.stringContaining("missing arrayVariable"));
  });

  it("warns when a setVariable step has no variableName", () => {
    const svNode = node("sv", "automationStep", "setVariable");
    const result = validateWorkflow([svNode], []);
    expect(result.warnings).toContainEqual(expect.stringContaining("missing variableName"));
  });
});

// ---------------------------------------------------------------------------
// Conditional warnings
// ---------------------------------------------------------------------------
describe("Conditional node warnings", () => {
  it("warns when a conditional node has no if/else branches", () => {
    const cond = node("c1", "automationStep", "browserConditional");
    const result = validateWorkflow([cond], []);
    expect(result.warnings).toContainEqual(expect.stringContaining("no if/else branches"));
  });

  it("warns when a conditional node is missing the else branch", () => {
    const cond = node("c1", "automationStep", "variableConditional");
    const target = node("t1");
    const result = validateWorkflow([cond, target], [edge("c1", "t1", "if")]);
    expect(result.warnings).toContainEqual(expect.stringContaining('missing "else" branch'));
  });

  it("does not warn when a conditional node has both if and else branches", () => {
    const cond = node("c1", "automationStep", "browserConditional");
    const ifTarget = node("t1");
    const elseTarget = node("t2");
    const result = validateWorkflow(
      [cond, ifTarget, elseTarget],
      [edge("c1", "t1", "if"), edge("c1", "t2", "else")]
    );
    expect(
      result.warnings.filter((w) => w.includes("c1") && w.includes("conditional"))
    ).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// ForEach warnings
// ---------------------------------------------------------------------------
describe("ForEach node warnings", () => {
  it("warns when a forEach node has no loop branch", () => {
    const feNode = node("fe", "automationStep", "forEach", { arrayVariable: "items" });
    const result = validateWorkflow([feNode], []);
    expect(result.warnings).toContainEqual(expect.stringContaining('no "loop" branch'));
  });

  it("does not warn when a forEach node has a loop branch", () => {
    const feNode = node("fe", "automationStep", "forEach", { arrayVariable: "items" });
    const child = node("child");
    const result = validateWorkflow([feNode, child], [edge("fe", "child", "loop")]);
    expect(result.warnings.filter((w) => w.includes("fe") && w.includes("loop"))).toHaveLength(0);
  });
});
