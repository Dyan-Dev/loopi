/**
 * Variable Management Utilities
 * Handles variable storage, retrieval, and substitution for automation execution
 */

/**
 * Parse a variable path supporting dot notation and array indexing
 * Examples:
 * - "user.name" → nested property
 * - "users[0]" → first array element
 * - "users[0].name" → property of array element
 */
export function parseVariablePath(path: string): (string | number)[] {
  const tokens: (string | number)[] = [];
  let current = "";
  let i = 0;

  while (i < path.length) {
    const char = path[i];

    if (char === ".") {
      if (current) tokens.push(current);
      current = "";
      i++;
    } else if (char === "[") {
      // Handle array index [0], [1], etc.
      if (current) tokens.push(current);
      current = "";
      i++;
      let indexStr = "";
      while (i < path.length && path[i] !== "]") {
        indexStr += path[i];
        i++;
      }
      if (path[i] === "]") i++; // Skip closing ]
      const index = parseInt(indexStr, 10);
      if (!isNaN(index)) tokens.push(index);
    } else {
      current += char;
      i++;
    }
  }

  if (current) tokens.push(current);
  return tokens;
}

/**
 * Get nested value from object using parsed path tokens
 */
export function getNestedValue(obj: Record<string, unknown>, tokens: (string | number)[]): unknown {
  if (tokens.length === 0) return "";

  let value: unknown = obj[String(tokens[0])];

  for (let i = 1; i < tokens.length; i++) {
    if (value === null || value === undefined) return "";

    const token = tokens[i];

    if (typeof token === "number") {
      // Array indexing
      if (Array.isArray(value)) {
        value = value[token];
      } else {
        return "";
      }
    } else {
      // Property access
      if (typeof value === "object") {
        value = (value as Record<string, unknown>)[token];
      } else {
        return "";
      }
    }
  }

  return value;
}

/**
 * Auto-type a value based on its string representation
 * - "42" → number 42
 * - "true"/"false" → boolean
 * - JSON objects/arrays → parsed
 * - else → string
 */
export function autoTypeValue(input: unknown): unknown {
  if (typeof input !== "string") return input;

  const trimmed = input.trim();

  // Boolean
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;

  // Number
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
    const num = Number(trimmed);
    if (!isNaN(num)) return num;
  }

  // JSON
  if (
    (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
    (trimmed.startsWith("[") && trimmed.endsWith("]"))
  ) {
    try {
      return JSON.parse(trimmed);
    } catch {
      // Not valid JSON, return as string
    }
  }

  return input;
}

/**
 * Substitute variable placeholders in a string
 * Supports {{varname}} and {{nested.var}} syntax
 */
export function substituteVariables(
  input: string | undefined,
  variables: Record<string, unknown>
): string {
  if (!input) return "";

  return input.replace(/\{\{([^}]+)\}\}/g, (_, varName: string) => {
    const trimmedName = varName.trim();
    const tokens = parseVariablePath(trimmedName);
    const value = getNestedValue(variables, tokens);
    return value !== undefined && value !== null ? String(value) : "";
  });
}

/**
 * Variable Manager class for automation execution
 */
export class VariableManager {
  private variables: Record<string, unknown> = {};

  /**
   * Initialize variables with optional starting values
   */
  init(vars?: Record<string, unknown>): void {
    this.variables = { ...(vars || {}) };
  }

  /**
   * Get all variables (shallow copy)
   */
  getAll(): Record<string, unknown> {
    return { ...this.variables };
  }

  /**
   * Get a variable value with path support
   */
  get(path: string): unknown {
    const tokens = parseVariablePath(path);
    return getNestedValue(this.variables, tokens);
  }

  /**
   * Set a variable value with auto-typing
   */
  set(key: string, value: unknown): void {
    this.variables[key] = autoTypeValue(value);
  }

  /**
   * Set a variable to a raw value without auto-typing
   */
  setRaw(key: string, value: unknown): void {
    this.variables[key] = value;
  }

  /**
   * Check if a variable exists
   */
  has(key: string): boolean {
    return key in this.variables;
  }

  /**
   * Delete a variable
   */
  delete(key: string): boolean {
    if (this.has(key)) {
      delete this.variables[key];
      return true;
    }
    return false;
  }

  /**
   * Substitute variables in a string
   */
  substitute(input: string | undefined): string {
    return substituteVariables(input, this.variables);
  }

  /**
   * Clear all variables
   */
  clear(): void {
    this.variables = {};
  }
}
