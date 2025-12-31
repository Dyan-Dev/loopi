/**
 * Preload Script - Secure IPC Bridge
 *
 * Exposes a limited, sandboxed API to the renderer process via contextBridge.
 * This provides secure communication between renderer and main process while
 * maintaining contextIsolation for security.
 *
 * API Surface:
 * - Browser lifecycle: openBrowser, closeBrowser, navigate
 * - Automation execution: runStep, runConditional
 * - Element picking: pickSelector, sendSelector, cancelSelector
 * - Event listening: onBrowserClosed
 *
 * See: https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
 */
import { contextBridge, ipcRenderer } from "electron";
import { Automation } from "./types";

contextBridge.exposeInMainWorld("electronAPI", {
  openBrowser: (url: string) => ipcRenderer.invoke("browser:open", url),
  closeBrowser: () => ipcRenderer.invoke("browser:close"),
  navigate: (url: string) => ipcRenderer.invoke("browser:navigate", url),
  tree: {
    save: (automation: Automation) => ipcRenderer.invoke("loopi:saveTree", automation),
    load: () => ipcRenderer.invoke("loopi:loadTree"),
    list: () => ipcRenderer.invoke("loopi:listTrees"),
    loadExample: (fileName: string) => ipcRenderer.invoke("loopi:loadExample", fileName),
    delete: (automationId: string) => ipcRenderer.invoke("loopi:deleteTree", automationId),
  },
  settings: {
    load: () => ipcRenderer.invoke("loopi:loadSettings"),
    save: (settings: unknown) => ipcRenderer.invoke("loopi:saveSettings", settings),
  },
  credentials: {
    list: () => ipcRenderer.invoke("credentials:list"),
    get: (id: string) => ipcRenderer.invoke("credentials:get", id),
    add: (credential: unknown) => ipcRenderer.invoke("credentials:add", credential),
    update: (id: string, updates: unknown) => ipcRenderer.invoke("credentials:update", id, updates),
    delete: (id: string) => ipcRenderer.invoke("credentials:delete", id),
  },
  debug: {
    getLogs: () => ipcRenderer.invoke("debug:getLogs"),
    clearLogs: () => ipcRenderer.invoke("debug:clearLogs"),
    exportLogs: () => ipcRenderer.invoke("debug:exportLogs"),
    getStatistics: () => ipcRenderer.invoke("debug:getStatistics"),
    setDebugMode: (enabled: boolean) => ipcRenderer.invoke("debug:setDebugMode", enabled),
  },
  schedules: {
    list: () => ipcRenderer.invoke("schedules:list"),
    save: (schedule: unknown) => ipcRenderer.invoke("schedules:save", schedule),
    delete: (scheduleId: string) => ipcRenderer.invoke("schedules:delete", scheduleId),
    update: (scheduleId: string, updates: unknown) =>
      ipcRenderer.invoke("schedules:update", scheduleId, updates),
    getByWorkflow: (workflowId: string) =>
      ipcRenderer.invoke("schedules:getByWorkflow", workflowId),
  },
  saveFile: (data: { filePath: string; content: string }) => ipcRenderer.invoke("file:save", data),
  selectFolder: () => ipcRenderer.invoke("dialog:selectFolder"),
  executeAutomation: (automation: Automation & { headless?: boolean }) =>
    ipcRenderer.invoke("automation:execute", automation),
  onNodeStatus: (callback: (data: { nodeId: string; status: string; error?: string }) => void) =>
    ipcRenderer.on("node:status", (_event, data) => callback(data)),
  getVariables: () => ipcRenderer.invoke("executor:getVariables"),
  onBrowserClosed: (callback: () => void) => ipcRenderer.on("browser:closed", callback),
  pickSelector: (
    url: string,
    options?: { strategy?: "css" | "xpath" | "dataAttr" | "id" | "aria"; dataAttrKeys?: string[] }
  ) => ipcRenderer.invoke("pick-selector", url, options),
  sendSelector: (selector: string) => ipcRenderer.send("selector-picked", selector),
  cancelSelector: () => ipcRenderer.send("selector-cancel"),
});
