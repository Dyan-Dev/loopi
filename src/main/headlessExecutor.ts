/**
 * Headless Executor - True headless browser automation using Puppeteer
 * Used for server deployments where Electron's offscreen mode isn't sufficient
 */

import type { AutomationStep } from "@app-types/steps";
import { createLogger } from "@utils/logger";
import type { Browser, Page } from "puppeteer";
import { debugLogger } from "./debugLogger";

const logger = createLogger("HeadlessExecutor");

export class HeadlessExecutor {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private puppeteer: typeof import("puppeteer") | null = null;

  /**
   * Lazy load Puppeteer
   */
  private async loadPuppeteer() {
    if (!this.puppeteer) {
      this.puppeteer = await import("puppeteer");
    }
    return this.puppeteer;
  }

  /**
   * Launch headless browser
   */
  async launch(): Promise<void> {
    const puppeteer = await this.loadPuppeteer();

    this.browser = await puppeteer.launch({
      headless: true, // True headless mode
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
      ],
    });

    this.page = await this.browser.newPage();
    await this.page.setViewport({ width: 1920, height: 1080 });

    logger.info("Launched Puppeteer headless browser");
  }

  /**
   * Close headless browser
   */
  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
      logger.info("Closed Puppeteer headless browser");
    }
  }

  /**
   * Execute automation step using Puppeteer
   */
  async executeStep(
    step: AutomationStep,
    substituteVariables: (input?: string) => string,
    variables?: Record<string, unknown>
  ): Promise<unknown> {
    if (!this.page) {
      throw new Error("Headless browser not launched. Call launch() first.");
    }

    const startTime = performance.now();
    let result: unknown;

    try {
      switch (step.type) {
        case "navigate": {
          const url = substituteVariables(step.value);
          debugLogger.debug("Navigate", `Loading URL: ${url}`);
          await this.page.goto(url, { waitUntil: "networkidle2" });
          result = undefined;
          break;
        }

        case "click": {
          const selector = substituteVariables(step.selector);
          debugLogger.debug("Click", `Clicking element: ${selector}`);
          await this.page.waitForSelector(selector, { timeout: 10000 });
          await this.page.click(selector);
          result = undefined;
          break;
        }

        case "type": {
          const selector = substituteVariables(step.selector);
          const value = substituteVariables(step.value);
          debugLogger.debug("Type", `Typing into ${selector}`);
          await this.page.waitForSelector(selector, { timeout: 10000 });
          await this.page.type(selector, value);
          result = undefined;
          break;
        }

        case "extract": {
          const selector = substituteVariables(step.selector);
          debugLogger.debug("Extract", `Extracting text from: ${selector}`);

          const extracted = await this.page.evaluate((sel) => {
            const element = document.querySelector(sel);
            return element ? element.textContent?.trim() : null;
          }, selector);

          if (step.storeKey) {
            variables![step.storeKey] = extracted;
            debugLogger.debug("Variable", `Set ${step.storeKey} = ${extracted}`);
          }

          result = extracted;
          break;
        }

        case "wait": {
          const seconds = parseInt(substituteVariables(step.value)) || 0;
          debugLogger.debug("Wait", `Waiting for ${seconds} seconds`);
          await new Promise((resolve) => setTimeout(resolve, seconds * 1000));
          result = undefined;
          break;
        }

        case "scroll": {
          if (step.scrollType === "toElement") {
            const selector = substituteVariables(step.selector || "");
            debugLogger.debug("Scroll", `Scrolling to element: ${selector}`);
            await this.page.evaluate((sel) => {
              const element = document.querySelector(sel);
              element?.scrollIntoView({ behavior: "smooth", block: "center" });
            }, selector);
          } else {
            const amount = parseInt(String(step.scrollAmount || 0));
            debugLogger.debug("Scroll", `Scrolling by ${amount}px`);
            await this.page.evaluate((amt) => {
              window.scrollBy(0, amt);
            }, amount);
          }
          result = undefined;
          break;
        }

        case "screenshot": {
          debugLogger.debug("Screenshot", "Capturing page screenshot");
          const timestamp = new Date().toISOString().replace(/[-:.]/g, "").slice(0, 15);
          const filename = `screenshot_${timestamp}.png`;
          await this.page.screenshot({ path: filename, fullPage: true });
          debugLogger.info("Screenshot", `Screenshot saved to: ${filename}`);
          result = filename;
          break;
        }

        case "selectOption": {
          const selector = substituteVariables(step.selector);
          const value = substituteVariables(step.optionValue);
          debugLogger.debug("Select Option", `Selecting option in: ${selector}`);
          await this.page.select(selector, value);
          result = undefined;
          break;
        }

        case "hover": {
          const selector = substituteVariables(step.selector);
          debugLogger.debug("Hover", `Hovering over element: ${selector}`);
          await this.page.waitForSelector(selector, { timeout: 10000 });
          await this.page.hover(selector);
          result = undefined;
          break;
        }

        default:
          throw new Error(
            `Unsupported step type for headless execution: ${(step as AutomationStep).type}`
          );
      }

      const duration = performance.now() - startTime;
      debugLogger.info(
        "Step Execution",
        `${step.type} step completed successfully (${duration.toFixed(2)}ms)`
      );

      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      debugLogger.error(
        "Step Execution",
        `${step.type} step failed: ${errorMessage} (${duration.toFixed(2)}ms)`
      );
      throw error;
    }
  }

  /**
   * Evaluate browser conditional using Puppeteer page
   */
  async evaluateBrowserConditional(config: {
    browserConditionType?: string;
    selector?: string;
    expectedValue?: string;
    condition?: string;
    transformType?: string;
    transformPattern?: string;
    transformReplace?: string;
    transformChars?: string;
    parseAsNumber?: boolean;
  }): Promise<{
    conditionResult: boolean;
    effectiveSelector?: string | null;
  }> {
    if (!this.page) {
      throw new Error("Browser page not available");
    }

    const { browserConditionType, selector, expectedValue } = config;
    if (!browserConditionType || !selector) {
      throw new Error("browserConditionType and selector are required");
    }

    const startTime = performance.now();

    debugLogger.debug("BrowserConditional", `Evaluating ${browserConditionType} condition`, {
      selector,
      expectedValue,
    });

    const runtimeSelector = selector;

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
      conditionResult = await this.page.evaluate((sel: string) => {
        let el: Element | null = null;
        try {
          el = document.querySelector(sel);
        } catch (_e) {
          /* ignore */
        }
        if (!el) {
          try {
            const r = document.evaluate(
              sel,
              document,
              null,
              XPathResult.FIRST_ORDERED_NODE_TYPE,
              null
            );
            el = r.singleNodeValue as Element | null;
          } catch (_e2) {
            /* ignore */
          }
        }
        return !!el;
      }, runtimeSelector);

      debugLogger.debug(
        "BrowserConditional",
        `Element ${conditionResult ? "found" : "not found"}`,
        {
          selector: runtimeSelector,
        }
      );
    } else if (browserConditionType === "valueMatches") {
      const rawValue: string = await this.page.evaluate((sel: string) => {
        let el: Element | null = null;
        try {
          el = document.querySelector(sel);
        } catch (_e) {
          /* ignore */
        }
        if (!el) {
          try {
            const r = document.evaluate(
              sel,
              document,
              null,
              XPathResult.FIRST_ORDERED_NODE_TYPE,
              null
            );
            el = r.singleNodeValue as Element | null;
          } catch (_e2) {
            /* ignore */
          }
        }
        return (el as HTMLElement)?.innerText || "";
      }, runtimeSelector);

      const transformed = applyTransform(rawValue);
      const expected = expectedValue;
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
