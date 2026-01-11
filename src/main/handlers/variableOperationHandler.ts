import { debugLogger } from "@main/debugLogger";

/**
 * Handles variable modification operations (setVariable, modifyVariable)
 */
export class VariableOperationHandler {
  /**
   * Execute setVariable step
   */
  executeSetVariable(
    step: {
      variableName: string;
      value: string;
    },
    substituteVariables: (input?: string) => string,
    parseValue: (input: string) => unknown,
    variables: Record<string, unknown>
  ): unknown {
    const varName = step.variableName;
    const rawValue = substituteVariables(step.value);
    const value = parseValue(rawValue);
    variables[varName] = value;
    debugLogger.debug("Set Variable", `Variable '${varName}' set`, { value });
    return value;
  }

  /**
   * Execute modifyVariable step
   */
  executeModifyVariable(
    step: {
      variableName: string;
      operation: string;
      value: string;
    },
    substituteVariables: (input?: string) => string,
    parseValue: (input: string) => unknown,
    variables: Record<string, unknown>
  ): unknown {
    const name = step.variableName;
    const raw = substituteVariables(step.value);
    const op = step.operation;
    const current = variables[name];
    let result: unknown;

    if (op === "set") {
      const value = parseValue(raw);
      variables[name] = value;
      debugLogger.debug("Modify Variable", `Variable '${name}' modified (set)`, { value });
      result = value;
    } else if (op === "increment") {
      const num = typeof current === "number" ? current : parseFloat(String(current) || "0");
      const by = parseFloat(raw || "1");
      const res = num + by;
      variables[name] = res;
      debugLogger.debug("Modify Variable", `Variable '${name}' incremented`, {
        from: num,
        by,
        to: res,
      });
      result = res;
    } else if (op === "decrement") {
      const num = typeof current === "number" ? current : parseFloat(String(current) || "0");
      const by = parseFloat(raw || "1");
      const res = num - by;
      variables[name] = res;
      debugLogger.debug("Modify Variable", `Variable '${name}' decremented`, {
        from: num,
        by,
        to: res,
      });
      result = res;
    } else if (op === "append") {
      const res = String(current || "") + raw;
      variables[name] = res;
      debugLogger.debug("Modify Variable", `Variable '${name}' appended`, { result: res });
      result = res;
    }

    return result;
  }
}
