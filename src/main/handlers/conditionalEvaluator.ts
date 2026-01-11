import { debugLogger } from "@main/debugLogger";
import { HeadlessExecutor } from "@main/headlessExecutor";
import { BrowserWindow } from "electron";

/**
 * Handles conditional evaluation for flow control
 * Evaluates both browser-based and variable-based conditions
 */
export class ConditionalEvaluator {
  /**
   * Evaluates a browser conditional node (elementExists or valueMatches)
   * These conditions require a browser window and interact with the DOM
   */
  async evaluateBrowserConditional(
    browserWindow: BrowserWindow | undefined,
    headless: boolean,
    headlessExecutor: HeadlessExecutor | null | undefined,
    config: {
      browserConditionType?: string;
      selector?: string;
      expectedValue?: string;
      nodeId?: string;
      condition?: string;
      transformType?: string;
      transformPattern?: string;
      transformReplace?: string;
      transformChars?: string;
      parseAsNumber?: boolean;
    },
    substituteVariables: (input?: string) => string
  ): Promise<{
    conditionResult: boolean;
    effectiveSelector?: string | null;
  }> {
    if (headless) {
      if (!headlessExecutor) throw new Error("Headless executor not initialized");
      return headlessExecutor.evaluateBrowserConditional({
        browserConditionType: config.browserConditionType,
        selector: substituteVariables(config.selector),
        expectedValue: substituteVariables(config.expectedValue),
        condition: config.condition,
        transformType: config.transformType,
        transformPattern: config.transformPattern,
        transformReplace: config.transformReplace,
        transformChars: config.transformChars,
        parseAsNumber: config.parseAsNumber,
      });
    } else {
      const wc = browserWindow?.webContents;
      const { browserConditionType, selector, expectedValue } = config;
      if (!browserConditionType || !selector) {
        throw new Error("browserConditionType and selector are required");
      }
      const startTime = performance.now();

      debugLogger.debug("BrowserConditional", `Evaluating ${browserConditionType} condition`, {
        selector,
        expectedValue,
      });

      const runtimeSelector = substituteVariables(selector);

      const applyTransform = (raw: string) => {
        if (!raw) return raw;
        const t = config.transformType || "none";
        let s = raw;
        if (t === "stripCurrency") {
          s = s.replace(/[$€£,\s]/g, "");
        } else if (t === "stripNonNumeric") {
          s = s.replace(/[^0-9.-]/g, "");
        } else if (t === "removeChars" && config.transformChars) {
          const chars = config.transformChars.split("");
          for (const c of chars) s = s.split(c).join("");
        } else if (t === "regexReplace" && config.transformPattern) {
          try {
            const re = new RegExp(config.transformPattern, "g");
            s = s.replace(re, config.transformReplace ?? "");
          } catch (_e) {
            debugLogger.warn("BrowserConditional", "Invalid regex pattern", {
              pattern: config.transformPattern,
            });
          }
        }
        return s;
      };

      let conditionResult = false;

      if (browserConditionType === "elementExists") {
        const existsResult = await wc?.executeJavaScript(`
        (() => {
          const sel = ${JSON.stringify(runtimeSelector)};
          let el = null;
          try { el = document.querySelector(sel); } catch(e) {}
          if (!el) {
            try { const r = document.evaluate(sel, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null); el = r.singleNodeValue; } catch(e2) {}
          }
          return !!el;
        })();
      `);
        conditionResult = existsResult ?? false;
        debugLogger.debug(
          "BrowserConditional",
          `Element ${conditionResult ? "found" : "not found"}`,
          {
            selector: runtimeSelector,
          }
        );
      } else if (browserConditionType === "valueMatches") {
        const rawValueResult = await wc?.executeJavaScript(`
        (() => {
          const sel = ${JSON.stringify(runtimeSelector)};
          let el = null;
          try { el = document.querySelector(sel); } catch(e) {}
          if (!el) {
            try { const r = document.evaluate(sel, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null); el = r.singleNodeValue; } catch(e2) {}
          }
          return el?.innerText || "";
        })();
      `);
        const rawValue: string = rawValueResult ?? "";
        const transformed = applyTransform(rawValue);
        const expected = substituteVariables(expectedValue || "");
        const op = config.condition || "equals";

        debugLogger.debug("BrowserConditional", "Value matching", {
          rawValue,
          transformed,
          expected,
          operator: op,
        });

        if (config.parseAsNumber) {
          const a = parseFloat(transformed.replace(/[^0-9.-]/g, ""));
          const b = parseFloat(expected.replace(/[^0-9.-]/g, ""));
          conditionResult =
            !isNaN(a) &&
            !isNaN(b) &&
            (op === "greaterThan"
              ? a > b
              : op === "lessThan"
                ? a < b
                : op === "contains"
                  ? transformed.includes(expected)
                  : a === b);
          debugLogger.debug(
            "BrowserConditional",
            `Numeric comparison: ${a} ${op} ${b} = ${conditionResult}`
          );
        } else {
          conditionResult =
            op === "contains"
              ? transformed.includes(expected)
              : op === "greaterThan"
                ? parseFloat(transformed) > parseFloat(expected)
                : op === "lessThan"
                  ? parseFloat(transformed) < parseFloat(expected)
                  : transformed === expected;
        }
      }

      const duration = performance.now() - startTime;
      debugLogger.logOperation(
        "BrowserConditional",
        `Condition evaluated to: ${conditionResult}`,
        duration
      );

      return { conditionResult, effectiveSelector: runtimeSelector };
    }
  }

  /**
   * Evaluates a variable conditional node (variable-based conditions)
   * These conditions do not require a browser window and work with stored variables
   */
  evaluateVariableConditional(
    config: {
      variableConditionType?: string;
      variableName?: string;
      expectedValue?: string;
      parseAsNumber?: boolean;
    },
    substituteVariables: (input?: string) => string,
    getVariableValue: (path: string) => unknown
  ): {
    conditionResult: boolean;
  } {
    const { variableConditionType, variableName, expectedValue } = config;
    if (!variableConditionType || !variableName) {
      throw new Error("variableConditionType and variableName are required");
    }
    const startTime = performance.now();

    debugLogger.debug("VariableConditional", `Evaluating ${variableConditionType} condition`, {
      variableName,
      expectedValue,
    });

    const resolvedVarName = substituteVariables(variableName);
    const variableValue = getVariableValue(resolvedVarName);
    let conditionResult = false;

    if (variableConditionType === "variableExists") {
      conditionResult =
        variableValue !== undefined && variableValue !== null && variableValue !== "";
      debugLogger.debug(
        "VariableConditional",
        `Variable ${conditionResult ? "exists" : "does not exist"}`,
        {
          variableName: resolvedVarName,
          value: variableValue,
        }
      );
    } else {
      const expected = substituteVariables(expectedValue || "");
      const actualStr =
        variableValue === null || variableValue === undefined ? "" : String(variableValue);

      if (config.parseAsNumber) {
        const a = parseFloat(actualStr);
        const b = parseFloat(expected);

        if (isNaN(a) || isNaN(b)) {
          conditionResult = false;
          debugLogger.warn("VariableConditional", "Cannot parse as number", {
            variableValue: actualStr,
            expectedValue: expected,
          });
        } else {
          if (variableConditionType === "variableEquals") {
            conditionResult = a === b;
          } else if (variableConditionType === "variableGreaterThan") {
            conditionResult = a > b;
          } else if (variableConditionType === "variableLessThan") {
            conditionResult = a < b;
          } else if (variableConditionType === "variableContains") {
            // Contains doesn't make sense for numbers, fall back to string
            conditionResult = actualStr.includes(expected);
          }
          debugLogger.debug(
            "VariableConditional",
            `Numeric comparison: ${a} ${variableConditionType} ${b} = ${conditionResult}`
          );
        }
      } else {
        // String comparison
        if (variableConditionType === "variableEquals") {
          conditionResult = actualStr === expected;
        } else if (variableConditionType === "variableContains") {
          conditionResult = actualStr.includes(expected);
        } else if (variableConditionType === "variableGreaterThan") {
          conditionResult = actualStr > expected;
        } else if (variableConditionType === "variableLessThan") {
          conditionResult = actualStr < expected;
        }
        debugLogger.debug(
          "VariableConditional",
          `String comparison: "${actualStr}" ${variableConditionType} "${expected}" = ${conditionResult}`
        );
      }
    }

    const duration = performance.now() - startTime;
    debugLogger.logOperation(
      "VariableConditional",
      `Condition evaluated to: ${conditionResult}`,
      duration
    );

    return { conditionResult };
  }
}
