import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock dependencies
vi.mock("@main/debugLogger", () => ({
  debugLogger: {
    debug: vi.fn(),
    error: vi.fn(),
    logOperation: vi.fn(),
  },
}));

import { DataTransformHandler } from "../dataTransformHandler";

describe("DataTransformHandler", () => {
  let handler: DataTransformHandler;
  let variables: Record<string, unknown>;
  const sub = (s?: string) => s ?? "";

  beforeEach(() => {
    handler = new DataTransformHandler();
    variables = {};
  });

  // ── JSON Parse ──────────────────────────────────────────────────
  describe("JSON Parse", () => {
    it("parses a valid JSON string", () => {
      variables.raw = '{"name":"Alice","age":30}';
      const result = handler.executeJsonParse(
        { sourceVariable: "raw", storeKey: "parsed" },
        sub,
        variables
      );
      expect(result).toEqual({ name: "Alice", age: 30 });
      expect(variables.parsed).toEqual({ name: "Alice", age: 30 });
    });

    it("throws on missing variable", () => {
      expect(() => handler.executeJsonParse({ sourceVariable: "missing" }, sub, variables)).toThrow(
        'Variable "missing" not found'
      );
    });

    it("throws on invalid JSON", () => {
      variables.bad = "not json";
      expect(() => handler.executeJsonParse({ sourceVariable: "bad" }, sub, variables)).toThrow();
    });
  });

  // ── JSON Stringify ──────────────────────────────────────────────
  describe("JSON Stringify", () => {
    it("stringifies an object", () => {
      variables.obj = { a: 1, b: [2, 3] };
      const result = handler.executeJsonStringify(
        { sourceVariable: "obj", storeKey: "str" },
        sub,
        variables
      );
      expect(result).toBe('{"a":1,"b":[2,3]}');
      expect(variables.str).toBe('{"a":1,"b":[2,3]}');
    });

    it("pretty prints when requested", () => {
      variables.obj = { a: 1 };
      const result = handler.executeJsonStringify(
        { sourceVariable: "obj", pretty: true, storeKey: "str" },
        sub,
        variables
      );
      expect(result).toContain("\n");
    });
  });

  // ── Math Operation ──────────────────────────────────────────────
  describe("Math Operation", () => {
    it("adds two numbers", () => {
      const result = handler.executeMathOperation(
        { operation: "add", valueA: "10", valueB: "5", storeKey: "sum" },
        sub,
        variables
      );
      expect(result).toBe(15);
      expect(variables.sum).toBe(15);
    });

    it("subtracts", () => {
      expect(
        handler.executeMathOperation(
          { operation: "subtract", valueA: "10", valueB: "3" },
          sub,
          variables
        )
      ).toBe(7);
    });

    it("multiplies", () => {
      expect(
        handler.executeMathOperation(
          { operation: "multiply", valueA: "4", valueB: "7" },
          sub,
          variables
        )
      ).toBe(28);
    });

    it("divides", () => {
      expect(
        handler.executeMathOperation(
          { operation: "divide", valueA: "20", valueB: "4" },
          sub,
          variables
        )
      ).toBe(5);
    });

    it("throws on division by zero", () => {
      expect(() =>
        handler.executeMathOperation(
          { operation: "divide", valueA: "10", valueB: "0" },
          sub,
          variables
        )
      ).toThrow("division by zero");
    });

    it("modulo", () => {
      expect(
        handler.executeMathOperation(
          { operation: "modulo", valueA: "10", valueB: "3" },
          sub,
          variables
        )
      ).toBe(1);
    });

    it("power", () => {
      expect(
        handler.executeMathOperation(
          { operation: "power", valueA: "2", valueB: "10" },
          sub,
          variables
        )
      ).toBe(1024);
    });

    it("abs", () => {
      expect(
        handler.executeMathOperation({ operation: "abs", valueA: "-42" }, sub, variables)
      ).toBe(42);
    });

    it("round", () => {
      expect(
        handler.executeMathOperation({ operation: "round", valueA: "3.7" }, sub, variables)
      ).toBe(4);
    });

    it("floor", () => {
      expect(
        handler.executeMathOperation({ operation: "floor", valueA: "3.9" }, sub, variables)
      ).toBe(3);
    });

    it("ceil", () => {
      expect(
        handler.executeMathOperation({ operation: "ceil", valueA: "3.1" }, sub, variables)
      ).toBe(4);
    });

    it("throws on non-numeric input", () => {
      expect(() =>
        handler.executeMathOperation({ operation: "add", valueA: "abc" }, sub, variables)
      ).toThrow("not a number");
    });
  });

  // ── String Operation ────────────────────────────────────────────
  describe("String Operation", () => {
    it("uppercase", () => {
      expect(
        handler.executeStringOperation(
          { operation: "uppercase", value: "hello", storeKey: "r" },
          sub,
          variables
        )
      ).toBe("HELLO");
    });

    it("lowercase", () => {
      expect(
        handler.executeStringOperation({ operation: "lowercase", value: "HELLO" }, sub, variables)
      ).toBe("hello");
    });

    it("trim", () => {
      expect(
        handler.executeStringOperation({ operation: "trim", value: "  hi  " }, sub, variables)
      ).toBe("hi");
    });

    it("replace", () => {
      expect(
        handler.executeStringOperation(
          { operation: "replace", value: "foo bar foo", param1: "foo", param2: "baz" },
          sub,
          variables
        )
      ).toBe("baz bar baz");
    });

    it("split", () => {
      const result = handler.executeStringOperation(
        { operation: "split", value: "a,b,c", param1: ",", storeKey: "arr" },
        sub,
        variables
      );
      expect(result).toEqual(["a", "b", "c"]);
      expect(variables.arr).toEqual(["a", "b", "c"]);
    });

    it("join", () => {
      variables["a,b,c"] = ["x", "y", "z"];
      expect(
        handler.executeStringOperation(
          { operation: "join", value: "a,b,c", param1: "-" },
          sub,
          variables
        )
      ).toBe("x-y-z");
    });

    it("length", () => {
      expect(
        handler.executeStringOperation({ operation: "length", value: "hello" }, sub, variables)
      ).toBe(5);
    });

    it("includes", () => {
      expect(
        handler.executeStringOperation(
          { operation: "includes", value: "hello world", param1: "world" },
          sub,
          variables
        )
      ).toBe(true);
    });

    it("reverse", () => {
      expect(
        handler.executeStringOperation({ operation: "reverse", value: "abc" }, sub, variables)
      ).toBe("cba");
    });

    it("substring", () => {
      expect(
        handler.executeStringOperation(
          { operation: "substring", value: "hello world", param1: "6", param2: "11" },
          sub,
          variables
        )
      ).toBe("world");
    });
  });

  // ── Date/Time ───────────────────────────────────────────────────
  describe("DateTime", () => {
    it("now returns ISO string", () => {
      const result = handler.executeDateTime(
        { operation: "now", storeKey: "time" },
        sub,
        variables
      );
      expect(typeof result).toBe("string");
      expect(new Date(result as string).getTime()).not.toBeNaN();
    });

    it("timestamp returns number", () => {
      const result = handler.executeDateTime({ operation: "timestamp" }, sub, variables);
      expect(typeof result).toBe("number");
      expect(result).toBeGreaterThan(0);
    });

    it("parse validates date", () => {
      const result = handler.executeDateTime(
        { operation: "parse", value: "2024-06-15" },
        sub,
        variables
      );
      expect(result).toContain("2024-06-15");
    });

    it("parse throws on invalid date", () => {
      expect(() =>
        handler.executeDateTime({ operation: "parse", value: "not-a-date" }, sub, variables)
      ).toThrow("invalid date");
    });

    it("add adds days", () => {
      const result = handler.executeDateTime(
        { operation: "add", value: "2024-01-01T00:00:00.000Z", amount: 1, unit: "days" },
        sub,
        variables
      ) as string;
      expect(result).toContain("2024-01-02");
    });

    it("dayOfWeek returns day name", () => {
      const result = handler.executeDateTime(
        { operation: "dayOfWeek", value: "2024-01-01" }, // Monday
        sub,
        variables
      );
      expect(result).toBe("Monday");
    });
  });

  // ── Filter Array ────────────────────────────────────────────────
  describe("Filter Array", () => {
    it("filters by equals", () => {
      variables.items = [
        { status: "active", name: "A" },
        { status: "inactive", name: "B" },
        { status: "active", name: "C" },
      ];
      const result = handler.executeFilterArray(
        {
          sourceVariable: "items",
          condition: "equals",
          field: "status",
          compareValue: "active",
          storeKey: "filtered",
        },
        sub,
        variables
      );
      expect(result).toHaveLength(2);
      expect(variables.filtered).toHaveLength(2);
    });

    it("filters by truthy", () => {
      variables.items = [0, 1, "", "hello", null, true, false];
      const result = handler.executeFilterArray(
        { sourceVariable: "items", condition: "truthy", storeKey: "filtered" },
        sub,
        variables
      );
      expect(result).toEqual([1, "hello", true]);
    });

    it("filters by greaterThan", () => {
      variables.nums = [1, 5, 10, 15, 20];
      const result = handler.executeFilterArray(
        { sourceVariable: "nums", condition: "greaterThan", compareValue: "10" },
        sub,
        variables
      );
      expect(result).toEqual([15, 20]);
    });

    it("throws on non-array", () => {
      variables.notArr = "hello";
      expect(() =>
        handler.executeFilterArray(
          { sourceVariable: "notArr", condition: "truthy" },
          sub,
          variables
        )
      ).toThrow("not an array");
    });
  });

  // ── Map Array ───────────────────────────────────────────────────
  describe("Map Array", () => {
    it("maps with field extraction", () => {
      variables.users = [{ name: "Alice" }, { name: "Bob" }];
      const result = handler.executeMapArray(
        { sourceVariable: "users", expression: "name", storeKey: "names" },
        sub,
        variables
      );
      expect(result).toEqual(["Alice", "Bob"]);
    });

    it("maps with JS expression", () => {
      variables.nums = [1, 2, 3];
      const result = handler.executeMapArray(
        { sourceVariable: "nums", expression: "item * 2", storeKey: "doubled" },
        sub,
        variables
      );
      expect(result).toEqual([2, 4, 6]);
    });

    it("throws on non-array", () => {
      variables.x = 42;
      expect(() =>
        handler.executeMapArray({ sourceVariable: "x", expression: "item" }, sub, variables)
      ).toThrow("not an array");
    });
  });

  // ── Code Execute ────────────────────────────────────────────────
  describe("Code Execute", () => {
    it("evaluates simple expression", () => {
      const result = handler.executeCode({ code: "2 + 2", storeKey: "r" }, sub, variables);
      expect(result).toBe(4);
      expect(variables.r).toBe(4);
    });

    it("accesses variables", () => {
      variables.price = 19.99;
      variables.tax = 0.08;
      const result = handler.executeCode(
        { code: "Math.round(price * (1 + tax) * 100) / 100" },
        sub,
        variables
      );
      expect(result).toBe(21.59);
    });

    it("blocks require", () => {
      expect(() => handler.executeCode({ code: 'require("fs")' }, sub, variables)).toThrow(
        "not allowed"
      );
    });

    it("blocks process access", () => {
      expect(() => handler.executeCode({ code: "process.exit()" }, sub, variables)).toThrow(
        "not allowed"
      );
    });

    it("can use built-in Math/Date/JSON", () => {
      const result = handler.executeCode({ code: "JSON.stringify({a: Math.PI})" }, sub, variables);
      expect(result).toContain("3.14");
    });
  });
});
