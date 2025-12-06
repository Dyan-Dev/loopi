import axios from "axios";
import { BrowserWindow } from "electron";
import fs from "fs";
import { AutomationStep } from "../types/steps";

/**
 * Handles execution of automation steps in the browser window
 */
export class AutomationExecutor {
  /** Unified variable storage - automatically typed by input
   * Variables are automatically typed based on input:
   * "42" → number, "true" → boolean, objects/arrays stay as-is, else string
   */
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
    return { ...this.variables };
  }

  /**
   * Get a variable value, supporting dot notation and array indexing
   * e.g., "userinfo.name" → nested property
   * e.g., "users[0]" → first array element
   * e.g., "users[0].name" → property of array element
   */
  private getVariableValue(path: string): unknown {
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
  private parseValue(input: string): unknown {
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
  private substituteVariables(input?: string): string {
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
   * Executes a single automation step
   * @param browserWindow - The browser window to execute the step in
   * @param step - The step configuration object
   */
  async executeStep(browserWindow: BrowserWindow, step: AutomationStep): Promise<unknown> {
    const wc = browserWindow.webContents;

    switch (step.type) {
      case "navigate":
        await wc.loadURL(this.substituteVariables(step.value));
        break;

      case "click": {
        const clickSelector = this.substituteVariables(step.selector);
        await wc.executeJavaScript(
          `document.querySelector(${JSON.stringify(clickSelector)})?.click();`
        );
        break;
      }

      case "type": {
        const typeSelector = this.substituteVariables(step.selector);
        const typeValue = this.substituteVariables(step.value);
        await wc.executeJavaScript(`
          (() => {
            const el = document.querySelector("${typeSelector}");
            if (el) {
              el.focus();
              el.value = ${JSON.stringify(typeValue)};
              el.dispatchEvent(new Event('input', { bubbles: true }));
            }
          })();
        `);
        break;
      }

      case "wait": {
        await new Promise((resolve) => {
          const waitStr = this.substituteVariables(step.value);
          const ms = parseInt(waitStr) * 1000;
          setTimeout(resolve, isNaN(ms) ? 0 : ms);
        });
        break;
      }

      case "screenshot": {
        const img = await wc.capturePage();
        const timestamp = new Date().toISOString().replace(/[-:.]/g, "").slice(0, 15);
        const savePath = step.savePath || `screenshot_${timestamp}.png`;
        await fs.promises.writeFile(savePath, img.toPNG());
        return img.toPNG().toString("base64");
      }

      case "extract": {
        const extractSelector = this.substituteVariables(step.selector);
        const extracted = await wc.executeJavaScript(
          `document.querySelector(${JSON.stringify(extractSelector)})?.innerText || "";`
        );
        if (step.storeKey) {
          this.variables[step.storeKey] = extracted;
        }
        return extracted;
      }

      case "extractWithLogic": {
        const logicSelector = this.substituteVariables(step.selector);
        const extractedValue = await wc.executeJavaScript(
          `document.querySelector(${JSON.stringify(logicSelector)})?.innerText || "";`
        );
        let conditionMet = false;

        // Debug logs removed to avoid noisy output in production

        switch (step.condition) {
          case "equals":
            conditionMet = extractedValue === step.expectedValue;
            break;
          case "contains":
            conditionMet = extractedValue.includes(step.expectedValue);
            break;
          case "greaterThan":
            conditionMet = parseFloat(extractedValue) > parseFloat(step.expectedValue);
            break;
          case "lessThan":
            conditionMet = parseFloat(extractedValue) < parseFloat(step.expectedValue);
            break;
        }

        return { value: extractedValue, conditionMet };
      }

      case "apiCall": {
        try {
          const url = this.substituteVariables(step.url);
          const method = step.method || "GET";
          const rawBody = step.body ? this.substituteVariables(step.body) : undefined;
          let data: unknown = undefined;
          if (rawBody) {
            try {
              data = JSON.parse(rawBody);
            } catch {
              data = rawBody;
            }
          }
          const headers: Record<string, string> = {};
          if (step.headers) {
            for (const [k, v] of Object.entries(step.headers as Record<string, unknown>)) {
              headers[k] = this.substituteVariables(String(v));
            }
          }
          const response = await axios({ method, url, data, headers });
          const dataOut = response.data;
          if (step.storeKey) {
            this.variables[step.storeKey] = dataOut;
          }
          return dataOut;
        } catch (error) {
          console.error("API call failed:", error);
          throw error;
        }
      }

      case "scroll": {
        if (step.scrollType === "toElement") {
          const scrollSelector = this.substituteVariables(step.selector || "");
          await wc.executeJavaScript(`
            (() => {
              const el = document.querySelector(${JSON.stringify(scrollSelector)});
              if (el) el.scrollIntoView({ behavior: "smooth" });
            })();
          `);
        } else if (step.scrollType === "byAmount") {
          await wc.executeJavaScript(`window.scrollBy(0, ${step.scrollAmount || 0});`);
        }
        break;
      }

      case "selectOption": {
        const selectSelector = this.substituteVariables(step.selector);
        const optionValue = this.substituteVariables(step.optionValue);
        await wc.executeJavaScript(`
          (() => {
            const select = document.querySelector(${JSON.stringify(selectSelector)});
            if (select) {
              ${step.optionValue ? `select.value = ${JSON.stringify(optionValue)};` : `select.selectedIndex = ${step.optionIndex || 0};`}
              select.dispatchEvent(new Event('change', { bubbles: true }));
            }
          })();
        `);
        break;
      }

      case "fileUpload": {
        const fuSelector = this.substituteVariables(step.selector);
        const fuFilePath = this.substituteVariables(step.filePath);
        await wc.executeJavaScript(`
          (() => {
            const input = document.querySelector(${JSON.stringify(fuSelector)});
            if (input) {
              const file = new File([""], ${JSON.stringify(fuFilePath)}, { type: "text/plain" });
              const dataTransfer = new DataTransfer();
              dataTransfer.items.add(file);
              input.files = dataTransfer.files;
              input.dispatchEvent(new Event('change', { bubbles: true }));
            }
          })();
        `);
        break;
      }

      case "hover": {
        const hoverSelector = this.substituteVariables(step.selector);
        await wc.executeJavaScript(`
          (() => {
            const el = document.querySelector(${JSON.stringify(hoverSelector)});
            if (el) {
              const event = new MouseEvent('mouseover', { bubbles: true });
              el.dispatchEvent(event);
            }
          })();
        `);
        break;
      }

      case "setVariable": {
        const varName = step.variableName;
        const rawValue = this.substituteVariables(step.value);
        const value = this.parseValue(rawValue);
        this.variables[varName] = value;
        return value;
      }

      case "modifyVariable": {
        const name = step.variableName;
        const raw = this.substituteVariables(step.value);
        const op = step.operation;
        const current = this.variables[name];

        if (op === "set") {
          const value = this.parseValue(raw);
          this.variables[name] = value;
          return value;
        } else if (op === "increment") {
          const num = typeof current === "number" ? current : parseFloat(String(current) || "0");
          const by = parseFloat(raw || "1");
          const res = num + by;
          this.variables[name] = res;
          return res;
        } else if (op === "decrement") {
          const num = typeof current === "number" ? current : parseFloat(String(current) || "0");
          const by = parseFloat(raw || "1");
          const res = num - by;
          this.variables[name] = res;
          return res;
        } else if (op === "append") {
          const res = String(current || "") + raw;
          this.variables[name] = res;
          return res;
        }
        break;
      }
    }
  }

  /**
   * Evaluates a conditional node (elementExists or valueMatches)
   */
  async evaluateConditional(
    browserWindow: BrowserWindow,
    config: {
      conditionType: string;
      selector: string;
      expectedValue?: string;
      nodeId?: string;
      condition?: string;
      transformType?: string;
      transformPattern?: string;
      transformReplace?: string;
      transformChars?: string;
      parseAsNumber?: boolean;
    }
  ): Promise<{
    conditionResult: boolean;
    effectiveSelector?: string | null;
  }> {
    const wc = browserWindow.webContents;
    const { conditionType, selector, expectedValue } = config;

    const runtimeSelector = this.substituteVariables(selector);

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
          // invalid regex — leave original
        }
      }
      return s;
    };

    let conditionResult = false;

    if (conditionType === "elementExists") {
      conditionResult = await wc.executeJavaScript(
        `!!document.querySelector(${JSON.stringify(runtimeSelector)});`
      );
    } else if (conditionType === "valueMatches") {
      const rawValue: string = await wc.executeJavaScript(
        `document.querySelector(${JSON.stringify(runtimeSelector)})?.innerText || "";`
      );
      const transformed = applyTransform(rawValue);
      const expected = this.substituteVariables(expectedValue || "");
      const op = config.condition || "equals";

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

    return { conditionResult, effectiveSelector: runtimeSelector };
  }
}
