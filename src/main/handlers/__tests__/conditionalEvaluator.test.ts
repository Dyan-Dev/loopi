import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@main/debugLogger", () => ({
  debugLogger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    logOperation: vi.fn(),
  },
}));
vi.mock("electron", () => ({ BrowserWindow: vi.fn() }));
vi.mock("@main/headlessExecutor", () => ({ HeadlessExecutor: vi.fn() }));

import { ConditionalEvaluator } from "../conditionalEvaluator";

describe("ConditionalEvaluator - evaluateVariableConditional", () => {
  let evaluator: ConditionalEvaluator;
  const passthrough = (s?: string) => s || "";

  beforeEach(() => {
    evaluator = new ConditionalEvaluator();
  });

  // ── variableExists ──────────────────────────────────────────────

  describe("variableExists", () => {
    it("should return true when the variable has a value", () => {
      const result = evaluator.evaluateVariableConditional(
        { variableConditionType: "variableExists", variableName: "myVar" },
        passthrough,
        () => "hello"
      );
      expect(result.conditionResult).toBe(true);
    });

    it("should return false when the variable is undefined", () => {
      const result = evaluator.evaluateVariableConditional(
        { variableConditionType: "variableExists", variableName: "myVar" },
        passthrough,
        () => undefined
      );
      expect(result.conditionResult).toBe(false);
    });

    it("should return false when the variable is null", () => {
      const result = evaluator.evaluateVariableConditional(
        { variableConditionType: "variableExists", variableName: "myVar" },
        passthrough,
        () => null
      );
      expect(result.conditionResult).toBe(false);
    });

    it("should return false when the variable is an empty string", () => {
      const result = evaluator.evaluateVariableConditional(
        { variableConditionType: "variableExists", variableName: "myVar" },
        passthrough,
        () => ""
      );
      expect(result.conditionResult).toBe(false);
    });
  });

  // ── variableEquals ──────────────────────────────────────────────

  describe("variableEquals", () => {
    it("should return true when the value matches exactly", () => {
      const result = evaluator.evaluateVariableConditional(
        { variableConditionType: "variableEquals", variableName: "myVar", expectedValue: "hello" },
        passthrough,
        () => "hello"
      );
      expect(result.conditionResult).toBe(true);
    });

    it("should return false when the value does not match", () => {
      const result = evaluator.evaluateVariableConditional(
        { variableConditionType: "variableEquals", variableName: "myVar", expectedValue: "world" },
        passthrough,
        () => "hello"
      );
      expect(result.conditionResult).toBe(false);
    });

    it("should perform case-sensitive comparison", () => {
      const result = evaluator.evaluateVariableConditional(
        { variableConditionType: "variableEquals", variableName: "myVar", expectedValue: "Hello" },
        passthrough,
        () => "hello"
      );
      expect(result.conditionResult).toBe(false);
    });

    it("should return true when both are empty strings", () => {
      const result = evaluator.evaluateVariableConditional(
        { variableConditionType: "variableEquals", variableName: "myVar", expectedValue: "" },
        passthrough,
        () => ""
      );
      expect(result.conditionResult).toBe(true);
    });
  });

  // ── variableContains ────────────────────────────────────────────

  describe("variableContains", () => {
    it("should return true when the substring is present", () => {
      const result = evaluator.evaluateVariableConditional(
        {
          variableConditionType: "variableContains",
          variableName: "myVar",
          expectedValue: "ell",
        },
        passthrough,
        () => "hello"
      );
      expect(result.conditionResult).toBe(true);
    });

    it("should return false when the substring is absent", () => {
      const result = evaluator.evaluateVariableConditional(
        {
          variableConditionType: "variableContains",
          variableName: "myVar",
          expectedValue: "xyz",
        },
        passthrough,
        () => "hello"
      );
      expect(result.conditionResult).toBe(false);
    });

    it("should return true when expectedValue is empty (always matches)", () => {
      const result = evaluator.evaluateVariableConditional(
        {
          variableConditionType: "variableContains",
          variableName: "myVar",
          expectedValue: "",
        },
        passthrough,
        () => "hello"
      );
      expect(result.conditionResult).toBe(true);
    });
  });

  // ── variableGreaterThan / variableLessThan (string) ─────────────

  describe("variableGreaterThan (string comparison)", () => {
    it('should return true when "b" > "a"', () => {
      const result = evaluator.evaluateVariableConditional(
        {
          variableConditionType: "variableGreaterThan",
          variableName: "myVar",
          expectedValue: "a",
        },
        passthrough,
        () => "b"
      );
      expect(result.conditionResult).toBe(true);
    });
  });

  describe("variableLessThan (string comparison)", () => {
    it('should return true when "a" < "b"', () => {
      const result = evaluator.evaluateVariableConditional(
        {
          variableConditionType: "variableLessThan",
          variableName: "myVar",
          expectedValue: "b",
        },
        passthrough,
        () => "a"
      );
      expect(result.conditionResult).toBe(true);
    });
  });

  // ── variableGreaterThan / variableLessThan (numeric) ────────────

  describe("variableGreaterThan (numeric comparison)", () => {
    it("should return true when 10 > 5 with parseAsNumber", () => {
      const result = evaluator.evaluateVariableConditional(
        {
          variableConditionType: "variableGreaterThan",
          variableName: "myVar",
          expectedValue: "5",
          parseAsNumber: true,
        },
        passthrough,
        () => "10"
      );
      expect(result.conditionResult).toBe(true);
    });
  });

  describe("variableLessThan (numeric comparison)", () => {
    it("should return true when 3 < 5 with parseAsNumber", () => {
      const result = evaluator.evaluateVariableConditional(
        {
          variableConditionType: "variableLessThan",
          variableName: "myVar",
          expectedValue: "5",
          parseAsNumber: true,
        },
        passthrough,
        () => "3"
      );
      expect(result.conditionResult).toBe(true);
    });
  });

  // ── Numeric equals ──────────────────────────────────────────────

  describe("variableEquals (numeric)", () => {
    it("should return true when numeric values are equal", () => {
      const result = evaluator.evaluateVariableConditional(
        {
          variableConditionType: "variableEquals",
          variableName: "myVar",
          expectedValue: "42",
          parseAsNumber: true,
        },
        passthrough,
        () => "42"
      );
      expect(result.conditionResult).toBe(true);
    });

    it("should return false when numeric values differ", () => {
      const result = evaluator.evaluateVariableConditional(
        {
          variableConditionType: "variableEquals",
          variableName: "myVar",
          expectedValue: "43",
          parseAsNumber: true,
        },
        passthrough,
        () => "42"
      );
      expect(result.conditionResult).toBe(false);
    });
  });

  // ── Edge cases ──────────────────────────────────────────────────

  describe("edge cases", () => {
    it("should throw when variableConditionType is missing", () => {
      expect(() =>
        evaluator.evaluateVariableConditional({ variableName: "myVar" }, passthrough, () => "value")
      ).toThrow("variableConditionType and variableName are required");
    });

    it("should throw when variableName is missing", () => {
      expect(() =>
        evaluator.evaluateVariableConditional(
          { variableConditionType: "variableEquals" },
          passthrough,
          () => "value"
        )
      ).toThrow("variableConditionType and variableName are required");
    });

    it("should return false when parseAsNumber is true but values are non-numeric", () => {
      const result = evaluator.evaluateVariableConditional(
        {
          variableConditionType: "variableEquals",
          variableName: "myVar",
          expectedValue: "notANumber",
          parseAsNumber: true,
        },
        passthrough,
        () => "alsoNotANumber"
      );
      expect(result.conditionResult).toBe(false);
    });
  });
});
