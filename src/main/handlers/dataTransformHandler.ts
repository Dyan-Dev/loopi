import { debugLogger } from "@main/debugLogger";

/**
 * Handles data transformation steps: JSON parse/stringify, math, string ops,
 * date/time, filter, map, and code execution.
 */
export class DataTransformHandler {
  // ── JSON Parse ──────────────────────────────────────────────────────
  executeJsonParse(
    step: { sourceVariable: string; storeKey?: string },
    substituteVariables: (input?: string) => string,
    variables: Record<string, unknown>
  ): unknown {
    const varName = substituteVariables(step.sourceVariable);
    const raw = this.resolveVariable(varName, variables);
    if (raw === undefined) {
      throw new Error(`Variable "${varName}" not found`);
    }
    const str = typeof raw === "string" ? raw : JSON.stringify(raw);
    const parsed = JSON.parse(str);
    if (step.storeKey) variables[step.storeKey] = parsed;
    debugLogger.debug("JSON Parse", `Parsed variable "${varName}"`, { storeKey: step.storeKey });
    return parsed;
  }

  // ── JSON Stringify ──────────────────────────────────────────────────
  executeJsonStringify(
    step: { sourceVariable: string; pretty?: boolean; storeKey?: string },
    substituteVariables: (input?: string) => string,
    variables: Record<string, unknown>
  ): string {
    const varName = substituteVariables(step.sourceVariable);
    const raw = this.resolveVariable(varName, variables);
    if (raw === undefined) {
      throw new Error(`Variable "${varName}" not found`);
    }
    const result = step.pretty ? JSON.stringify(raw, null, 2) : JSON.stringify(raw);
    if (step.storeKey) variables[step.storeKey] = result;
    debugLogger.debug("JSON Stringify", `Stringified variable "${varName}"`, {
      storeKey: step.storeKey,
    });
    return result;
  }

  // ── Math Operation ──────────────────────────────────────────────────
  executeMathOperation(
    step: { operation: string; valueA: string; valueB?: string; storeKey?: string },
    substituteVariables: (input?: string) => string,
    variables: Record<string, unknown>
  ): number {
    const a = Number(substituteVariables(step.valueA));
    const b = step.valueB !== undefined ? Number(substituteVariables(step.valueB)) : 0;

    if (Number.isNaN(a)) throw new Error(`Math: valueA "${step.valueA}" is not a number`);

    let result: number;
    switch (step.operation) {
      case "add":
        result = a + b;
        break;
      case "subtract":
        result = a - b;
        break;
      case "multiply":
        result = a * b;
        break;
      case "divide":
        if (b === 0) throw new Error("Math: division by zero");
        result = a / b;
        break;
      case "modulo":
        if (b === 0) throw new Error("Math: modulo by zero");
        result = a % b;
        break;
      case "power":
        result = a ** b;
        break;
      case "abs":
        result = Math.abs(a);
        break;
      case "round":
        result = Math.round(a);
        break;
      case "floor":
        result = Math.floor(a);
        break;
      case "ceil":
        result = Math.ceil(a);
        break;
      case "min":
        result = Math.min(a, b);
        break;
      case "max":
        result = Math.max(a, b);
        break;
      case "random":
        result = Math.random() * (b > 0 ? b : 1);
        break;
      default:
        throw new Error(`Unknown math operation: ${step.operation}`);
    }

    if (step.storeKey) variables[step.storeKey] = result;
    debugLogger.debug("Math", `${step.operation}(${a}, ${b}) = ${result}`);
    return result;
  }

  // ── String Operation ────────────────────────────────────────────────
  executeStringOperation(
    step: { operation: string; value: string; param1?: string; param2?: string; storeKey?: string },
    substituteVariables: (input?: string) => string,
    variables: Record<string, unknown>
  ): unknown {
    const val = substituteVariables(step.value);
    const p1 = step.param1 ? substituteVariables(step.param1) : "";
    const p2 = step.param2 ? substituteVariables(step.param2) : "";

    let result: unknown;
    switch (step.operation) {
      case "uppercase":
        result = val.toUpperCase();
        break;
      case "lowercase":
        result = val.toLowerCase();
        break;
      case "trim":
        result = val.trim();
        break;
      case "replace":
        result = val.replaceAll(p1, p2);
        break;
      case "split":
        result = val.split(p1 || ",");
        break;
      case "join": {
        // value should be a variable name containing an array
        const arr = this.resolveVariable(val, variables);
        if (!Array.isArray(arr)) throw new Error(`String join: "${val}" is not an array`);
        result = arr.join(p1 || ",");
        break;
      }
      case "substring":
        result = val.substring(Number(p1) || 0, p2 ? Number(p2) : undefined);
        break;
      case "length":
        result = val.length;
        break;
      case "includes":
        result = val.includes(p1);
        break;
      case "startsWith":
        result = val.startsWith(p1);
        break;
      case "endsWith":
        result = val.endsWith(p1);
        break;
      case "padStart":
        result = val.padStart(Number(p1) || 0, p2 || " ");
        break;
      case "padEnd":
        result = val.padEnd(Number(p1) || 0, p2 || " ");
        break;
      case "repeat":
        result = val.repeat(Number(p1) || 1);
        break;
      case "reverse":
        result = val.split("").reverse().join("");
        break;
      default:
        throw new Error(`Unknown string operation: ${step.operation}`);
    }

    if (step.storeKey) variables[step.storeKey] = result;
    debugLogger.debug(
      "String",
      `${step.operation} on "${val.substring(0, 50)}..." => stored as ${step.storeKey}`
    );
    return result;
  }

  // ── Date/Time Operation ─────────────────────────────────────────────
  executeDateTime(
    step: {
      operation: string;
      value?: string;
      format?: string;
      amount?: number;
      unit?: string;
      storeKey?: string;
    },
    substituteVariables: (input?: string) => string,
    variables: Record<string, unknown>
  ): unknown {
    const val = step.value ? substituteVariables(step.value) : "";

    let result: unknown;
    switch (step.operation) {
      case "now":
        result = new Date().toISOString();
        break;
      case "timestamp":
        result = Date.now();
        break;
      case "parse": {
        const d = new Date(val);
        if (Number.isNaN(d.getTime())) throw new Error(`DateTime: invalid date "${val}"`);
        result = d.toISOString();
        break;
      }
      case "format": {
        const d = val ? new Date(val) : new Date();
        if (Number.isNaN(d.getTime())) throw new Error(`DateTime: invalid date "${val}"`);
        const fmt = step.format || "iso";
        if (fmt === "iso") result = d.toISOString();
        else if (fmt === "locale") result = d.toLocaleString();
        else if (fmt === "date") result = d.toLocaleDateString();
        else if (fmt === "time") result = d.toLocaleTimeString();
        else if (fmt === "unix") result = Math.floor(d.getTime() / 1000);
        else if (fmt === "unixMs") result = d.getTime();
        else result = d.toISOString();
        break;
      }
      case "add":
      case "subtract": {
        const d = val ? new Date(val) : new Date();
        if (Number.isNaN(d.getTime())) throw new Error(`DateTime: invalid date "${val}"`);
        const amount = step.amount || 0;
        const multiplier = step.operation === "subtract" ? -1 : 1;
        const ms = this.unitToMs(step.unit || "days", amount * multiplier);
        d.setTime(d.getTime() + ms);
        result = d.toISOString();
        break;
      }
      case "diff": {
        const d1 = new Date(val);
        const d2 = step.format ? new Date(substituteVariables(step.format)) : new Date();
        if (Number.isNaN(d1.getTime()) || Number.isNaN(d2.getTime())) {
          throw new Error("DateTime diff: invalid dates");
        }
        const diffMs = d2.getTime() - d1.getTime();
        result = this.msToUnit(step.unit || "days", diffMs);
        break;
      }
      case "dayOfWeek": {
        const d = val ? new Date(val) : new Date();
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        result = days[d.getDay()];
        break;
      }
      case "startOf": {
        const d = val ? new Date(val) : new Date();
        const u = step.unit || "days";
        if (u === "days") d.setHours(0, 0, 0, 0);
        else if (u === "hours") d.setMinutes(0, 0, 0);
        else if (u === "months") {
          d.setDate(1);
          d.setHours(0, 0, 0, 0);
        } else if (u === "years") {
          d.setMonth(0, 1);
          d.setHours(0, 0, 0, 0);
        }
        result = d.toISOString();
        break;
      }
      case "endOf": {
        const d = val ? new Date(val) : new Date();
        const u = step.unit || "days";
        if (u === "days") d.setHours(23, 59, 59, 999);
        else if (u === "hours") d.setMinutes(59, 59, 999);
        else if (u === "months") {
          d.setMonth(d.getMonth() + 1, 0);
          d.setHours(23, 59, 59, 999);
        } else if (u === "years") {
          d.setMonth(11, 31);
          d.setHours(23, 59, 59, 999);
        }
        result = d.toISOString();
        break;
      }
      default:
        throw new Error(`Unknown dateTime operation: ${step.operation}`);
    }

    if (step.storeKey) variables[step.storeKey] = result;
    debugLogger.debug("DateTime", `${step.operation} => ${String(result).substring(0, 50)}`);
    return result;
  }

  private unitToMs(unit: string, amount: number): number {
    switch (unit) {
      case "milliseconds":
        return amount;
      case "seconds":
        return amount * 1000;
      case "minutes":
        return amount * 60_000;
      case "hours":
        return amount * 3_600_000;
      case "days":
        return amount * 86_400_000;
      case "weeks":
        return amount * 604_800_000;
      case "months":
        return amount * 2_592_000_000; // ~30 days
      case "years":
        return amount * 31_536_000_000; // ~365 days
      default:
        return amount * 86_400_000;
    }
  }

  private msToUnit(unit: string, ms: number): number {
    switch (unit) {
      case "milliseconds":
        return ms;
      case "seconds":
        return ms / 1000;
      case "minutes":
        return ms / 60_000;
      case "hours":
        return ms / 3_600_000;
      case "days":
        return ms / 86_400_000;
      case "weeks":
        return ms / 604_800_000;
      case "months":
        return ms / 2_592_000_000;
      case "years":
        return ms / 31_536_000_000;
      default:
        return ms / 86_400_000;
    }
  }

  // ── Filter Array ────────────────────────────────────────────────────
  executeFilterArray(
    step: {
      sourceVariable: string;
      condition: string;
      field?: string;
      compareValue?: string;
      storeKey?: string;
    },
    substituteVariables: (input?: string) => string,
    variables: Record<string, unknown>
  ): unknown[] {
    const varName = substituteVariables(step.sourceVariable);
    const arr = this.resolveVariable(varName, variables);
    if (!Array.isArray(arr)) throw new Error(`Filter: variable "${varName}" is not an array`);

    const compareVal = step.compareValue ? substituteVariables(step.compareValue) : "";

    const result = arr.filter((item) => {
      const val = step.field ? this.getNestedValue(item, step.field) : item;
      return this.evaluateCondition(val, step.condition, compareVal);
    });

    if (step.storeKey) variables[step.storeKey] = result;
    debugLogger.debug("Filter", `Filtered "${varName}": ${arr.length} → ${result.length} items`);
    return result;
  }

  // ── Map Array ───────────────────────────────────────────────────────
  executeMapArray(
    step: { sourceVariable: string; expression: string; storeKey?: string },
    substituteVariables: (input?: string) => string,
    variables: Record<string, unknown>
  ): unknown[] {
    const varName = substituteVariables(step.sourceVariable);
    const arr = this.resolveVariable(varName, variables);
    if (!Array.isArray(arr)) throw new Error(`Map: variable "${varName}" is not an array`);

    const expr = substituteVariables(step.expression);

    const result = arr.map((item, index) => {
      // If expression is a field name, extract it
      if (!expr.includes("item") && !expr.includes("index") && !expr.includes("return")) {
        return this.getNestedValue(item, expr);
      }
      // Evaluate as JS expression with item and index in scope
      return this.safeEval(expr, { item, index, ...variables });
    });

    if (step.storeKey) variables[step.storeKey] = result;
    debugLogger.debug("Map", `Mapped "${varName}": ${arr.length} items`);
    return result;
  }

  // ── Code Execute ────────────────────────────────────────────────────
  executeCode(
    step: { code: string; storeKey?: string },
    substituteVariables: (input?: string) => string,
    variables: Record<string, unknown>
  ): unknown {
    const code = substituteVariables(step.code);
    const result = this.safeEval(code, variables);
    if (step.storeKey) variables[step.storeKey] = result;
    debugLogger.debug("Code", `Executed code, result type: ${typeof result}`);
    return result;
  }

  // ── Helpers ─────────────────────────────────────────────────────────

  /**
   * Resolve a variable by name, supporting dot-notation paths like "apiResponse.data"
   * and bracket notation like "apiResponse['data']" or "items[0]".
   */
  private resolveVariable(varName: string, variables: Record<string, unknown>): unknown {
    // Direct match first (fast path)
    if (varName in variables) return variables[varName];

    // Normalize bracket notation: apiResponse['data'] → apiResponse.data, items[0] → items.0
    const normalized = varName.replace(/\[['"]?([^'"\]]*)['"]?\]/g, ".$1");
    const parts = normalized.split(".");
    if (parts.length <= 1) return undefined;

    let current: unknown = variables[parts[0]];
    for (let i = 1; i < parts.length; i++) {
      if (current === null || current === undefined) return undefined;
      if (Array.isArray(current)) {
        const idx = Number(parts[i]);
        current = Number.isNaN(idx) ? undefined : current[idx];
      } else if (typeof current === "object") {
        current = (current as Record<string, unknown>)[parts[i]];
      } else {
        return undefined;
      }
    }
    return current;
  }

  private getNestedValue(obj: unknown, path: string): unknown {
    if (obj === null || obj === undefined) return undefined;
    const parts = path.split(".");
    let current: unknown = obj;
    for (const part of parts) {
      if (current === null || current === undefined) return undefined;
      if (typeof current === "object") {
        current = (current as Record<string, unknown>)[part];
      } else {
        return undefined;
      }
    }
    return current;
  }

  private evaluateCondition(val: unknown, condition: string, compareValue: string): boolean {
    const strVal = val !== null && val !== undefined ? String(val) : "";
    switch (condition) {
      case "equals":
        return strVal === compareValue;
      case "notEquals":
        return strVal !== compareValue;
      case "contains":
        return strVal.includes(compareValue);
      case "greaterThan":
        return Number(val) > Number(compareValue);
      case "lessThan":
        return Number(val) < Number(compareValue);
      case "truthy":
        return !!val;
      case "falsy":
        return !val;
      case "exists":
        return val !== undefined && val !== null;
      default:
        return false;
    }
  }

  /**
   * Safe eval: only allows access to provided variables and basic JS built-ins.
   * Does NOT allow require, import, process, or other Node APIs.
   */
  private safeEval(code: string, vars: Record<string, unknown>): unknown {
    const forbidden = [
      "require",
      "import",
      "process",
      "child_process",
      "fs",
      "eval",
      "Function",
      "__dirname",
      "__filename",
    ];
    for (const f of forbidden) {
      if (code.includes(f)) {
        throw new Error(`Code execution: "${f}" is not allowed`);
      }
    }

    const keys = Object.keys(vars);
    const values = Object.values(vars);

    // Wrap in a function that returns the expression result
    const wrappedCode = code.includes("return") ? code : `return (${code})`;

    try {
      const fn = new Function(
        ...keys,
        "Math",
        "Date",
        "JSON",
        "Number",
        "String",
        "Boolean",
        "Array",
        "Object",
        "parseInt",
        "parseFloat",
        "isNaN",
        "isFinite",
        wrappedCode
      );
      return fn(
        ...values,
        Math,
        Date,
        JSON,
        Number,
        String,
        Boolean,
        Array,
        Object,
        parseInt,
        parseFloat,
        isNaN,
        isFinite
      );
    } catch (error) {
      throw new Error(
        `Code execution failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}
