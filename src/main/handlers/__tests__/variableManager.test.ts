import { beforeEach, describe, expect, it } from "vitest";
import { VariableManager } from "../variableManager";

describe("VariableManager", () => {
  // ─── getVariableValue ──────────────────────────────────────────────
  describe("getVariableValue", () => {
    let vm: VariableManager;

    beforeEach(() => {
      vm = new VariableManager();
      vm.initVariables({
        name: "Alice",
        user: { name: "Bob", age: 30, address: { city: "NYC", zip: "10001" } },
        items: ["apple", "banana", "cherry"],
        users: [
          { name: "Carol", scores: [10, 20] },
          { name: "Dave", scores: [30, 40] },
        ],
        empty: null,
      });
    });

    it("should return a simple top-level value", () => {
      expect(vm.getVariableValue("name")).toBe("Alice");
    });

    it("should resolve dot notation (user.name)", () => {
      expect(vm.getVariableValue("user.name")).toBe("Bob");
    });

    it("should resolve array indexing (items[0])", () => {
      expect(vm.getVariableValue("items[0]")).toBe("apple");
      expect(vm.getVariableValue("items[2]")).toBe("cherry");
    });

    it("should resolve combined array index + dot notation (users[0].name)", () => {
      expect(vm.getVariableValue("users[0].name")).toBe("Carol");
      expect(vm.getVariableValue("users[1].name")).toBe("Dave");
    });

    it('should return "" for a missing top-level key', () => {
      expect(vm.getVariableValue("nonexistent")).toBeUndefined();
    });

    it('should return "" when an intermediate is null', () => {
      expect(vm.getVariableValue("empty.something")).toBe("");
    });

    it("should resolve deeply nested paths", () => {
      expect(vm.getVariableValue("user.address.city")).toBe("NYC");
      expect(vm.getVariableValue("user.address.zip")).toBe("10001");
    });

    it("should resolve nested array inside object (users[0].scores[1])", () => {
      expect(vm.getVariableValue("users[0].scores[1]")).toBe(20);
      expect(vm.getVariableValue("users[1].scores[0]")).toBe(30);
    });
  });

  // ─── parseValue ────────────────────────────────────────────────────
  describe("parseValue", () => {
    let vm: VariableManager;

    beforeEach(() => {
      vm = new VariableManager();
    });

    it('should parse "42" as a number', () => {
      expect(vm.parseValue("42")).toBe(42);
    });

    it('should parse "true" as boolean true', () => {
      expect(vm.parseValue("true")).toBe(true);
    });

    it('should parse "false" as boolean false', () => {
      expect(vm.parseValue("false")).toBe(false);
    });

    it("should parse a JSON object string into an object", () => {
      const result = vm.parseValue('{"a":1}');
      expect(result).toEqual({ a: 1 });
    });

    it("should parse a JSON array string into an array", () => {
      const result = vm.parseValue("[1,2]");
      expect(result).toEqual([1, 2]);
    });

    it('should keep "hello" as a plain string', () => {
      expect(vm.parseValue("hello")).toBe("hello");
    });

    it("should keep an empty string as an empty string", () => {
      expect(vm.parseValue("")).toBe("");
    });
  });

  // ─── substituteVariables ───────────────────────────────────────────
  describe("substituteVariables", () => {
    let vm: VariableManager;

    beforeEach(() => {
      vm = new VariableManager();
      vm.initVariables({
        greeting: "Hello",
        target: "World",
        user: { name: "Eve", role: "admin" },
        items: ["first", "second"],
        users: [{ name: "Frank" }],
        count: 5,
        obj: { a: 1, b: 2 },
      });
    });

    it("should substitute a single {{var}}", () => {
      expect(vm.substituteVariables("{{greeting}}")).toBe("Hello");
    });

    it("should substitute multiple variables in one string", () => {
      expect(vm.substituteVariables("{{greeting}} {{target}}")).toBe("Hello World");
    });

    it("should substitute dot notation variables", () => {
      expect(vm.substituteVariables("Hi {{user.name}}")).toBe("Hi Eve");
    });

    it("should substitute array-indexed variables", () => {
      expect(vm.substituteVariables("{{items[0]}}")).toBe("first");
    });

    it('should replace a missing variable with ""', () => {
      expect(vm.substituteVariables("{{missing}}")).toBe("");
    });

    it("should JSON.stringify object values", () => {
      expect(vm.substituteVariables("data: {{obj}}")).toBe('data: {"a":1,"b":2}');
    });

    it('should return "" when input is null or undefined', () => {
      expect(vm.substituteVariables(null as unknown as string)).toBe("");
      expect(vm.substituteVariables(undefined)).toBe("");
    });

    it("should substitute nested array+dot paths ({{users[0].name}})", () => {
      expect(vm.substituteVariables("Name: {{users[0].name}}")).toBe("Name: Frank");
    });

    it("should pass through a string with no templates", () => {
      expect(vm.substituteVariables("no templates here")).toBe("no templates here");
    });

    it("should handle whitespace inside templates {{ var }}", () => {
      expect(vm.substituteVariables("{{ greeting }}")).toBe("Hello");
    });

    it("should handle mixed text and multiple templates", () => {
      expect(vm.substituteVariables("Say {{greeting}} to {{user.name}} ({{count}})")).toBe(
        "Say Hello to Eve (5)"
      );
    });

    it('should return "" for an empty string input', () => {
      expect(vm.substituteVariables("")).toBe("");
    });
  });

  // ─── setVariable ──────────────────────────────────────────────────
  describe("setVariable", () => {
    let vm: VariableManager;

    beforeEach(() => {
      vm = new VariableManager();
      vm.initVariables({});
    });

    it("should set a new variable and overwrite an existing one", () => {
      vm.setVariable("x", 1);
      expect(vm.getVariableValue("x")).toBe(1);

      vm.setVariable("x", 2);
      expect(vm.getVariableValue("x")).toBe(2);
    });

    it("should store objects, arrays, and null", () => {
      vm.setVariable("obj", { key: "val" });
      expect(vm.getVariableValue("obj")).toEqual({ key: "val" });

      vm.setVariable("arr", [1, 2, 3]);
      expect(vm.getVariableValue("arr")).toEqual([1, 2, 3]);

      vm.setVariable("nil", null);
      expect(vm.getVariableValue("nil")).toBeNull();
    });

    it("should allow get after set for nested access", () => {
      vm.setVariable("person", { first: "Grace", last: "Hopper" });
      expect(vm.getVariableValue("person.first")).toBe("Grace");
      expect(vm.getVariableValue("person.last")).toBe("Hopper");
    });

    it("should allow set and substituteVariables roundtrip", () => {
      vm.setVariable("lang", "TypeScript");
      expect(vm.substituteVariables("I love {{lang}}")).toBe("I love TypeScript");
    });
  });
});
