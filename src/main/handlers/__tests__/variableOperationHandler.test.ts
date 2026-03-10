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

import { VariableOperationHandler } from "../variableOperationHandler";

const parseValue = (input: string): unknown => {
  if (input === "true") return true;
  if (input === "false") return false;
  if (!isNaN(Number(input)) && input !== "") return Number(input);
  try {
    return JSON.parse(input);
  } catch {
    return input;
  }
};

describe("VariableOperationHandler", () => {
  let handler: VariableOperationHandler;
  let variables: Record<string, unknown>;
  const substituteVariables = (s?: string) => s || "";

  beforeEach(() => {
    handler = new VariableOperationHandler();
    variables = {};
  });

  describe("executeSetVariable", () => {
    it("sets a string value in the variables object", () => {
      handler.executeSetVariable(
        { variableName: "greeting", value: "hello" },
        substituteVariables,
        parseValue,
        variables
      );

      expect(variables["greeting"]).toBe("hello");
    });

    it("calls substituteVariables on the value before setting", () => {
      const mockSubstitute = vi.fn((s?: string) => {
        if (s === "{{x}}") return "replaced";
        return s || "";
      });

      handler.executeSetVariable(
        { variableName: "myVar", value: "{{x}}" },
        mockSubstitute,
        parseValue,
        variables
      );

      expect(mockSubstitute).toHaveBeenCalledWith("{{x}}");
      expect(variables["myVar"]).toBe("replaced");
    });

    it("uses parseValue to convert '42' to number 42", () => {
      handler.executeSetVariable(
        { variableName: "count", value: "42" },
        substituteVariables,
        parseValue,
        variables
      );

      expect(variables["count"]).toBe(42);
    });

    it("returns the set value", () => {
      const result = handler.executeSetVariable(
        { variableName: "name", value: "alice" },
        substituteVariables,
        parseValue,
        variables
      );

      expect(result).toBe("alice");
    });
  });

  describe("executeModifyVariable", () => {
    it("operation 'set': sets value like setVariable", () => {
      handler.executeModifyVariable(
        { variableName: "color", operation: "set", value: "blue" },
        substituteVariables,
        parseValue,
        variables
      );

      expect(variables["color"]).toBe("blue");
    });

    it("operation 'increment': increments a numeric variable by value", () => {
      variables["counter"] = 5;

      const result = handler.executeModifyVariable(
        { variableName: "counter", operation: "increment", value: "3" },
        substituteVariables,
        parseValue,
        variables
      );

      expect(variables["counter"]).toBe(8);
      expect(result).toBe(8);
    });

    it("operation 'increment': treats non-existent variable as 0", () => {
      const result = handler.executeModifyVariable(
        { variableName: "newCounter", operation: "increment", value: "5" },
        substituteVariables,
        parseValue,
        variables
      );

      expect(variables["newCounter"]).toBe(5);
      expect(result).toBe(5);
    });

    it("operation 'decrement': decrements a numeric variable", () => {
      variables["score"] = 20;

      const result = handler.executeModifyVariable(
        { variableName: "score", operation: "decrement", value: "5" },
        substituteVariables,
        parseValue,
        variables
      );

      expect(variables["score"]).toBe(15);
      expect(result).toBe(15);
    });

    it("operation 'decrement': from 10 by 3 gives 7", () => {
      variables["val"] = 10;

      const result = handler.executeModifyVariable(
        { variableName: "val", operation: "decrement", value: "3" },
        substituteVariables,
        parseValue,
        variables
      );

      expect(variables["val"]).toBe(7);
      expect(result).toBe(7);
    });

    it("operation 'append': appends string to existing value", () => {
      variables["text"] = "hello";

      const result = handler.executeModifyVariable(
        { variableName: "text", operation: "append", value: " world" },
        substituteVariables,
        parseValue,
        variables
      );

      expect(variables["text"]).toBe("hello world");
      expect(result).toBe("hello world");
    });

    it("operation 'append': non-existent variable results in just the appended value", () => {
      const result = handler.executeModifyVariable(
        { variableName: "missing", operation: "append", value: "first" },
        substituteVariables,
        parseValue,
        variables
      );

      expect(variables["missing"]).toBe("first");
      expect(result).toBe("first");
    });

    it("operation 'increment': defaults to incrementing by 1 when step value is '1'", () => {
      variables["idx"] = 0;

      const result = handler.executeModifyVariable(
        { variableName: "idx", operation: "increment", value: "1" },
        substituteVariables,
        parseValue,
        variables
      );

      expect(variables["idx"]).toBe(1);
      expect(result).toBe(1);
    });
  });
});
