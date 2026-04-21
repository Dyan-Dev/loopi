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

import { Automation } from "@app-types";
import { contextBridge, ipcRenderer } from "electron";

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
  cancelAutomation: () => ipcRenderer.invoke("automation:cancel"),
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
  ai: {
    detectEnvKeys: () => ipcRenderer.invoke("ai:detectEnvKeys") as Promise<Record<string, boolean>>,
    chat: (params: {
      messages: Array<{ role: "user" | "assistant" | "system"; content: string }>;
      provider: "openai" | "anthropic" | "ollama" | "claude-code";
      credentialId?: string;
      apiKey?: string;
      model?: string;
      baseUrl?: string;
    }) => ipcRenderer.invoke("ai:chat", params),
    generateWorkflow: (params: {
      prompt: string;
      provider: "openai" | "anthropic" | "ollama";
      credentialId?: string;
      apiKey?: string;
      model?: string;
      baseUrl?: string;
    }) => ipcRenderer.invoke("ai:generateWorkflow", params),
    copilot: (params: {
      action: "explain" | "suggest" | "fix";
      context: {
        nodes: unknown[];
        edges: unknown[];
        selectedNodeId?: string;
        error?: string;
      };
      provider: "openai" | "anthropic" | "ollama";
      credentialId?: string;
      apiKey?: string;
      model?: string;
      baseUrl?: string;
    }) => ipcRenderer.invoke("ai:copilot", params),
  },
  validateWorkflow: (data: { nodes: unknown[]; edges: unknown[] }) =>
    ipcRenderer.invoke("workflow:validate", data),
  history: {
    getAll: () => ipcRenderer.invoke("history:getAll"),
    getByAutomation: (automationId: string) =>
      ipcRenderer.invoke("history:getByAutomation", automationId),
    deleteRecord: (automationId: string, recordId: string) =>
      ipcRenderer.invoke("history:deleteRecord", automationId, recordId),
    deleteByAutomation: (automationId: string) =>
      ipcRenderer.invoke("history:deleteByAutomation", automationId),
    clearAll: () => ipcRenderer.invoke("history:clearAll"),
  },
  system: {
    exec: (params: { command: string; cwd?: string; timeout?: number }) =>
      ipcRenderer.invoke("system:exec", params),
  },
  chat: {
    save: (messages: unknown[], provider?: string, model?: string) =>
      ipcRenderer.invoke("chat:save", messages, provider, model),
    load: () => ipcRenderer.invoke("chat:load"),
    clear: () => ipcRenderer.invoke("chat:clear"),
  },
  agents: {
    list: () => ipcRenderer.invoke("agents:list"),
    get: (id: string) => ipcRenderer.invoke("agents:get", id),
    create: (config: unknown) => ipcRenderer.invoke("agents:create", config),
    update: (id: string, updates: unknown) => ipcRenderer.invoke("agents:update", id, updates),
    delete: (id: string) => ipcRenderer.invoke("agents:delete", id),
    start: (id: string) => ipcRenderer.invoke("agents:start", id),
    stop: (id: string) => ipcRenderer.invoke("agents:stop", id),
    getLogs: (id: string) => ipcRenderer.invoke("agents:getLogs", id),
    addWorkflow: (agentId: string, workflowId: string) =>
      ipcRenderer.invoke("agents:addWorkflow", agentId, workflowId),
    removeWorkflow: (agentId: string, workflowId: string) =>
      ipcRenderer.invoke("agents:removeWorkflow", agentId, workflowId),
    getReflections: (id: string) => ipcRenderer.invoke("agents:getReflections", id),
    validateModel: (provider: string, model: string) =>
      ipcRenderer.invoke("agents:validateModel", provider, model),
    getInstructions: (id: string) => ipcRenderer.invoke("agents:getInstructions", id),
    saveInstructions: (id: string, content: string) =>
      ipcRenderer.invoke("agents:saveInstructions", id, content),
    listFiles: (id: string) => ipcRenderer.invoke("agents:listFiles", id),
    readFile: (id: string, filename: string) => ipcRenderer.invoke("agents:readFile", id, filename),
    writeFile: (id: string, filename: string, content: string) =>
      ipcRenderer.invoke("agents:writeFile", id, filename, content),
    deleteFile: (id: string, filename: string) =>
      ipcRenderer.invoke("agents:deleteFile", id, filename),
    getDir: (id: string) => ipcRenderer.invoke("agents:getDir", id),
  },
});
