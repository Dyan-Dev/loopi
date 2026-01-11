import type { AutomationStep } from "@app-types/steps";
import { debugLogger } from "@main/debugLogger";
import { HeadlessExecutor } from "@main/headlessExecutor";
import { BrowserWindow } from "electron";
import fs from "fs";

/**
 * Handles browser-related automation steps
 */
export class BrowserStepHandler {
  /**
   * Execute navigate step
   */
  async executeNavigate(
    browserWindow: BrowserWindow | null,
    headless: boolean,
    headlessExecutor: HeadlessExecutor | null | undefined,
    step: { type: string; value: string },
    substituteVariables: (input?: string) => string
  ): Promise<unknown> {
    if (headless) {
      if (!headlessExecutor) throw new Error("Headless executor not initialized");
      await headlessExecutor.executeStep(step as AutomationStep, substituteVariables);
    } else {
      const url = substituteVariables(step.value);
      if (!browserWindow?.webContents) throw new Error("Browser window required for navigate step");
      debugLogger.debug("Navigate", `Loading URL: ${url}`);
      await browserWindow.webContents.loadURL(url);
    }
    return undefined;
  }

  /**
   * Execute click step
   */
  async executeClick(
    browserWindow: BrowserWindow | null,
    headless: boolean,
    headlessExecutor: HeadlessExecutor | null | undefined,
    step: { type: string; selector: string },
    substituteVariables: (input?: string) => string
  ): Promise<unknown> {
    const clickSelector = substituteVariables(step.selector);
    if (headless) {
      if (!headlessExecutor) throw new Error("Headless executor not initialized");
      await headlessExecutor.executeStep(step as AutomationStep, substituteVariables);
    } else {
      if (!browserWindow?.webContents) throw new Error("Browser window required for click step");
      debugLogger.debug("Click", `Clicking element with selector: ${clickSelector}`);
      await browserWindow.webContents.executeJavaScript(`
        (() => {
          const sel = ${JSON.stringify(clickSelector)};
          let el = null;
          try { el = document.querySelector(sel); } catch(e) {}
          if (!el) {
            try { const r = document.evaluate(sel, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null); el = r.singleNodeValue; } catch(e2) {}
          }
          if (el) el.click();
        })();
      `);
    }
    return undefined;
  }

  /**
   * Execute type step
   */
  async executeType(
    browserWindow: BrowserWindow | null,
    headless: boolean,
    headlessExecutor: HeadlessExecutor | null | undefined,
    step: { type: string; selector: string; value: string },
    substituteVariables: (input?: string) => string
  ): Promise<unknown> {
    if (headless) {
      if (!headlessExecutor) throw new Error("Headless executor not initialized");
      await headlessExecutor.executeStep(step as AutomationStep, substituteVariables);
    } else {
      if (!browserWindow?.webContents) throw new Error("Browser window required for type step");
      const typeSelector = substituteVariables(step.selector);
      const typeValue = substituteVariables(step.value);
      debugLogger.debug("Type", `Typing into selector: ${typeSelector}`, { value: typeValue });
      await browserWindow.webContents.executeJavaScript(`
        (() => {
          const sel = ${JSON.stringify(typeSelector)};
          let el = null;
          try { el = document.querySelector(sel); } catch(e) {}
          if (!el) {
            try { const r = document.evaluate(sel, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null); el = r.singleNodeValue; } catch(e2) {}
          }
          if (el) {
            el.focus();
            el.value = ${JSON.stringify(typeValue)};
            el.dispatchEvent(new Event('input', { bubbles: true }));
          }
        })();
      `);
    }
    return undefined;
  }

  /**
   * Execute wait step
   */
  async executeWait(
    browserWindow: BrowserWindow | null,
    headless: boolean,
    headlessExecutor: HeadlessExecutor | null | undefined,
    step: { type: string; value: string },
    substituteVariables: (input?: string) => string
  ): Promise<unknown> {
    if (headless) {
      if (!headlessExecutor) throw new Error("Headless executor not initialized");
      await headlessExecutor.executeStep(step as AutomationStep, substituteVariables);
    } else {
      const waitStr = substituteVariables(step.value);
      const ms = parseInt(waitStr) * 1000;
      debugLogger.debug("Wait", `Waiting for ${waitStr} seconds`);
      await new Promise((resolve) => {
        setTimeout(resolve, isNaN(ms) ? 0 : ms);
      });
    }
    return undefined;
  }

  /**
   * Execute screenshot step
   */
  async executeScreenshot(
    browserWindow: BrowserWindow | null,
    headless: boolean,
    headlessExecutor: HeadlessExecutor | null | undefined,
    step: { type: string; savePath?: string },
    substituteVariables: (input?: string) => string
  ): Promise<unknown> {
    if (headless) {
      if (!headlessExecutor) throw new Error("Headless executor not initialized");
      await headlessExecutor.executeStep(step as AutomationStep, substituteVariables);
    } else {
      if (!browserWindow?.webContents)
        throw new Error("Browser window required for screenshot step");
      debugLogger.debug("Screenshot", "Capturing page screenshot");
      const img = await browserWindow.webContents.capturePage();
      const timestamp = new Date().toISOString().replace(/[-:.]/g, "").slice(0, 15);
      const savePath = step.savePath || `screenshot_${timestamp}.png`;
      await fs.promises.writeFile(savePath, img.toPNG());
      debugLogger.info("Screenshot", `Screenshot saved to: ${savePath}`);
      return img.toPNG().toString("base64");
    }
  }

  /**
   * Execute scroll step
   */
  async executeScroll(
    browserWindow: BrowserWindow | null,
    headless: boolean,
    headlessExecutor: HeadlessExecutor | null | undefined,
    step: { type: string; scrollType?: string; selector?: string; scrollAmount?: number },
    substituteVariables: (input?: string) => string
  ): Promise<unknown> {
    if (headless) {
      if (!headlessExecutor) throw new Error("Headless executor not initialized");
      await headlessExecutor.executeStep(step as AutomationStep, substituteVariables);
    } else {
      if (!browserWindow?.webContents) throw new Error("Browser window required for scroll step");
      if (step.scrollType === "toElement") {
        const scrollSelector = substituteVariables(step.selector || "");
        debugLogger.debug("Scroll", `Scrolling to element: ${scrollSelector}`);
        await browserWindow.webContents.executeJavaScript(`
          (() => {
            const sel = ${JSON.stringify(scrollSelector)};
            let el = null;
            try { el = document.querySelector(sel); } catch(e) {}
            if (!el) {
              try { const r = document.evaluate(sel, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null); el = r.singleNodeValue; } catch(e2) {}
            }
            if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
          })();
        `);
      } else if (step.scrollType === "byAmount") {
        debugLogger.debug("Scroll", `Scrolling by ${step.scrollAmount} pixels`);
        await browserWindow.webContents.executeJavaScript(
          `window.scrollBy(0, ${step.scrollAmount || 0});`
        );
      }
    }
    return undefined;
  }

  /**
   * Execute fileUpload step
   */
  async executeFileUpload(
    browserWindow: BrowserWindow | null,
    headless: boolean,
    headlessExecutor: HeadlessExecutor | null | undefined,
    step: { type: string; selector: string; filePath: string },
    substituteVariables: (input?: string) => string
  ): Promise<unknown> {
    if (headless) {
      if (!headlessExecutor) throw new Error("Headless executor not initialized");
      await headlessExecutor.executeStep(step as AutomationStep, substituteVariables);
    } else {
      if (!browserWindow?.webContents)
        throw new Error("Browser window required for fileUpload step");
      const fuSelector = substituteVariables(step.selector);
      const fuFilePath = substituteVariables(step.filePath);
      debugLogger.debug("File Upload", `Uploading file to: ${fuSelector}`, {
        filePath: fuFilePath,
      });
      await browserWindow.webContents.executeJavaScript(`
        (() => {
          const sel = ${JSON.stringify(fuSelector)};
          let input = null;
          try { input = document.querySelector(sel); } catch(e) {}
          if (!input) {
            try { const r = document.evaluate(sel, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null); input = r.singleNodeValue; } catch(e2) {}
          }
          if (input) {
            const file = new File([""], ${JSON.stringify(fuFilePath)}, { type: "text/plain" });
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            input.files = dataTransfer.files;
            input.dispatchEvent(new Event('change', { bubbles: true }));
          }
        })();
      `);
    }
    return undefined;
  }

  /**
   * Execute hover step
   */
  async executeHover(
    browserWindow: BrowserWindow | null,
    headless: boolean,
    headlessExecutor: HeadlessExecutor | null | undefined,
    step: { type: string; selector: string },
    substituteVariables: (input?: string) => string
  ): Promise<unknown> {
    if (headless) {
      if (!headlessExecutor) throw new Error("Headless executor not initialized");
      await headlessExecutor.executeStep(step as AutomationStep, substituteVariables);
    } else {
      if (!browserWindow?.webContents) throw new Error("Browser window required for hover step");
      const hoverSelector = substituteVariables(step.selector);
      debugLogger.debug("Hover", `Hovering over element: ${hoverSelector}`);
      await browserWindow.webContents.executeJavaScript(`
        (() => {
          const sel = ${JSON.stringify(hoverSelector)};
          let el = null;
          try { el = document.querySelector(sel); } catch(e) {}
          if (!el) {
            try { const r = document.evaluate(sel, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null); el = r.singleNodeValue; } catch(e2) {}
          }
          if (el) {
            const event = new MouseEvent('mouseover', { bubbles: true });
            el.dispatchEvent(event);
          }
        })();
      `);
    }
    return undefined;
  }

  /**
   * Execute selectOption step
   */
  async executeSelectOption(
    browserWindow: BrowserWindow | null,
    headless: boolean,
    headlessExecutor: HeadlessExecutor | null | undefined,
    step: { type: string; selector: string; optionValue?: string; optionIndex?: number },
    substituteVariables: (input?: string) => string
  ): Promise<unknown> {
    if (headless) {
      if (!headlessExecutor) throw new Error("Headless executor not initialized");
      await headlessExecutor.executeStep(step as AutomationStep, substituteVariables);
    } else {
      if (!browserWindow?.webContents)
        throw new Error("Browser window required for selectOption step");
      const selectSelector = substituteVariables(step.selector);
      const optionValue = substituteVariables(step.optionValue || "");
      debugLogger.debug("Select Option", `Selecting option in: ${selectSelector}`, { optionValue });
      await browserWindow.webContents.executeJavaScript(`
        (() => {
          const sel = ${JSON.stringify(selectSelector)};
          let select = null;
          try { select = document.querySelector(sel); } catch(e) {}
          if (!select) {
            try { const r = document.evaluate(sel, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null); select = r.singleNodeValue; } catch(e2) {}
          }
          if (select) {
            ${step.optionValue ? `select.value = ${JSON.stringify(optionValue)};` : `select.selectedIndex = ${step.optionIndex || 0};`}
            select.dispatchEvent(new Event('change', { bubbles: true }));
          }
        })();
      `);
    }
    return undefined;
  }

  /**
   * Execute extract step
   */
  async executeExtract(
    browserWindow: BrowserWindow | null,
    headless: boolean,
    headlessExecutor: HeadlessExecutor | null | undefined,
    step: { type: string; selector: string; storeKey?: string },
    substituteVariables: (input?: string) => string,
    variables: Record<string, unknown>
  ): Promise<unknown> {
    if (headless) {
      if (!headlessExecutor) throw new Error("Headless executor not initialized");
      await headlessExecutor.executeStep(step as AutomationStep, substituteVariables, variables);
    } else {
      if (!browserWindow?.webContents) throw new Error("Browser window required for extract step");
      const extractSelector = substituteVariables(step.selector);
      debugLogger.debug("Extract", `Extracting text from selector: ${extractSelector}`);
      const extracted = await browserWindow.webContents.executeJavaScript(`
        (() => {
          const sel = ${JSON.stringify(extractSelector)};
          let el = null;
          try { el = document.querySelector(sel); } catch(e) {}
          if (!el) {
            try { const r = document.evaluate(sel, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null); el = r.singleNodeValue; } catch(e2) {}
          }
          return el?.innerText || "";
        })();
      `);
      if (step.storeKey) {
        variables[step.storeKey] = extracted;
        debugLogger.debug("Extract", `Stored extracted value in variable: ${step.storeKey}`, {
          value: extracted,
        });
      }
      return extracted;
    }
  }
}
