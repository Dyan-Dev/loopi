/**
 * Handles variable storage, retrieval, and substitution
 * Supports dot notation for nested properties and array indexing
 */
export class VariableManager {
  private variables: Record<string, unknown> = {};

  /**
   * Initialize executor variable context
   */
  initVariables(vars?: Record<string, unknown>) {
    this.variables = { ...(vars || {}) };
  }

  /**
   * Expose a shallow copy of current variables (for logging / IPC)
   */
  getVariables(): Record<string, unknown> {
    return this.variables;
  }

  /**
   * Get a variable value, supporting dot notation and array indexing
   * e.g., "userinfo.name" → nested property
   * e.g., "users[0]" → first array element
   * e.g., "users[0].name" → property of array element
   */
  getVariableValue(path: string): unknown {
    // Parse path into tokens: handles both . and [index] syntax
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

    // Navigate through tokens
    if (tokens.length === 0) return "";

    let value: unknown = this.variables[String(tokens[0])];

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
   * Auto-detect and convert variable value to appropriate type
   */
  parseValue(input: string): unknown {
    // Try JSON parse first (objects, arrays, null)
    try {
      const parsed = JSON.parse(input);
      return parsed;
    } catch {
      // Not JSON, try other types
    }

    // Boolean conversion
    if (input === "true") return true;
    if (input === "false") return false;

    // Number conversion
    if (!isNaN(Number(input)) && input !== "") {
      return Number(input);
    }

    // Default to string
    return input;
  }

  /**
   * Replace {{varName}} and {{varName.property}} tokens in a string with current variable values.
   * Supports dot notation for nested property access and array indexing.
   * Variables are automatically typed based on their value.
   * Examples: {{var}}, {{var.prop}}, {{array[0]}}, {{array[0].name}}
   */
  substituteVariables(input?: string): string {
    if (!input) return "";
    // Match {{varName}}, {{varName.property}}, {{array[0]}}, etc.
    return input.replace(/\{\{\s*([a-zA-Z0-9_[\].]+)\s*\}\}/g, (_, path) => {
      const value = this.getVariableValue(path);
      if (value === null || value === undefined) return "";
      if (typeof value === "object") return JSON.stringify(value);
      return String(value);
    });
  }

  /**
   * Set a variable value
   */
  setVariable(key: string, value: unknown) {
    this.variables[key] = value;
  }
}
