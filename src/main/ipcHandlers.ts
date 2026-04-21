import type { ExecutionRecord, ExecutionStepRecord } from "@app-types/automation";
import type { Edge, Node } from "@app-types/flow";
import { createLogger } from "@utils/logger";
import axios from "axios";
import { execSync } from "child_process";
import { app, dialog, ipcMain } from "electron";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { dirname, join as joinPath } from "path";
import type { AgentManager } from "./agentManager";
import { validateModelForAgents } from "./agentModelValidator";
import { AutomationExecutor } from "./automationExecutor";
import { ChatStore } from "./chatStore";
import {
  addCredential,
  deleteCredential,
  getCredential,
  loadCredentials,
  updateCredential,
} from "./credentialsStore";
import { debugLogger } from "./debugLogger";
import { DesktopScheduler } from "./desktopScheduler";
import { setupDownloadHandler } from "./downloadManager";
import { ExecutionHistoryStore } from "./executionHistoryStore";
import { executeAutomationGraph } from "./graphExecutor";
import { callLLM } from "./llmClient";
import { SelectorPicker } from "./selectorPicker";
import { loadSettings, saveSettings } from "./settingsStore";
import {
  defaultStorageFolder,
  deleteAutomation,
  initializeExamples,
  listAutomations,
  loadAutomation,
  loadExample,
  saveAutomation,
} from "./treeStore";
import { WindowManager } from "./windowManager";
import { WorkflowGenerator } from "./workflowGenerator";
import { validateWorkflow } from "./workflowValidator";

const logger = createLogger("IPCHandlers");

function buildCopilotPrompt(
  action: "explain" | "suggest" | "fix",
  context: { nodes: unknown[]; edges: unknown[]; selectedNodeId?: string; error?: string }
): string {
  const workflowJson = JSON.stringify({ nodes: context.nodes, edges: context.edges }, null, 2);

  if (action === "explain") {
    return `You are an expert at explaining automation workflows. The user has a visual workflow with these nodes and edges:

${workflowJson}

${context.selectedNodeId ? `The user is asking about node "${context.selectedNodeId}".` : ""}

Provide a clear, concise explanation in plain language. Mention what each step does and how data flows between them. Keep it under 200 words.`;
  }

  if (action === "suggest") {
    return `You are an automation workflow advisor. The user has built this workflow:

${workflowJson}

Suggest 2-3 practical improvements or next steps. For each suggestion, specify the exact step type and configuration. Be specific about selectors, variables, and values. Keep suggestions actionable and concise.`;
  }

  // fix
  return `You are an automation debugging expert. The user's workflow encountered an error:

Workflow:
${workflowJson}

Error: ${context.error}

Identify the likely cause and provide a specific fix. Mention which node is likely failing and what to change. Keep it concise and actionable.`;
}

/**
 * Type for automation execution request from frontend
 */
interface AutomationExecuteRequest {
  nodes: Node[];
  edges: Edge[];
  headless?: boolean;
  automationId?: string;
  automationName?: string;
}

/**
 * Registers all IPC handlers for communication between renderer and main process
 */
export function registerIPCHandlers(
  windowManager: WindowManager,
  executor: AutomationExecutor,
  picker: SelectorPicker,
  scheduler: DesktopScheduler,
  agentManager: AgentManager
): void {
  /**
   * Opens the browser automation window
   */
  ipcMain.handle("browser:open", async (_event, url: string) => {
    const mainWindow = windowManager.getMainWindow();
    await windowManager.ensureBrowserWindow(url, () => {
      mainWindow?.webContents.send("browser:closed");
    });
  });

  /**
   * Closes the browser automation window
   */
  ipcMain.handle("browser:close", () => {
    windowManager.closeBrowserWindow();
    const mainWindow = windowManager.getMainWindow();
    mainWindow?.webContents.send("browser:closed");
  });

  // Cancellation signal for running automations
  let currentCancelSignal: { cancelled: boolean } | null = null;

  /**
   * Cancel the currently running automation
   */
  ipcMain.handle("automation:cancel", async () => {
    if (currentCancelSignal) {
      currentCancelSignal.cancelled = true;
      logger.info("Automation cancellation requested");
      return true;
    }
    return false;
  });

  const historyStore = new ExecutionHistoryStore();

  /**
   * Execute entire automation workflow in backend
   * Handles complete ReactFlow nodes/edges directly, sends node status updates to frontend
   */
  ipcMain.handle("automation:execute", async (event, automation: AutomationExecuteRequest) => {
    const mainWindow = windowManager.getMainWindow();
    const { nodes, edges, headless } = automation;
    const startTime = Date.now();
    const stepRecords: ExecutionStepRecord[] = [];

    try {
      // Extract clean node data (ReactFlow nodes contain extra UI properties)
      const cleanNodes = nodes.map((node) => ({
        id: node.id,
        type: node.type,
        data: {
          step: node.data.step,
          // Variable step fields
          variableName: node.data.variableName,
          value: node.data.value,
          operation: node.data.operation,
        },
        position: node.position,
      })) as Node[];

      const cleanEdges = edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle,
      })) as Edge[];

      // Check if workflow has browser steps
      const browserSteps = [
        "navigate",
        "click",
        "type",
        "screenshot",
        "extract",
        "scroll",
        "selectOption",
        "fileUpload",
        "hover",
        "browserConditional",
      ];
      const hasBrowserSteps = cleanNodes.some(
        (node: Node) =>
          node.type === "automationStep" &&
          node.data.step &&
          browserSteps.includes(node.data.step.type)
      );

      // Open browser if needed (non-headless mode with browser steps)
      if (hasBrowserSteps && !headless) {
        const browserWindow = windowManager.getBrowserWindow();
        if (!browserWindow || browserWindow.isDestroyed()) {
          await windowManager.ensureBrowserWindow("https://google.com");
          await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for browser to initialize
        }
      }

      const browserWindow = hasBrowserSteps && !headless ? windowManager.getBrowserWindow() : null;

      // Create cancellation signal for this execution
      currentCancelSignal = { cancelled: false };
      const cancelSignal = currentCancelSignal;

      // Ensure {{agentDataDir}} always resolves — use a shared scratch folder
      // when running directly (not via an agent). Agent runs create their own
      // executor and set agentDataDir to the agent-specific folder.
      const scratchDir = joinPath(app.getPath("userData"), "scratch");
      if (!existsSync(scratchDir)) mkdirSync(scratchDir, { recursive: true });
      executor.initVariables({ agentDataDir: scratchDir });

      // Execute using shared graph executor
      await executeAutomationGraph({
        nodes: cleanNodes,
        edges: cleanEdges,
        browserWindow,
        executor,
        headless,
        cancelSignal,
        onNodeStatus: (nodeId, status, error) => {
          // Track step records for history
          if (status === "success" || status === "error") {
            const node = cleanNodes.find((n) => n.id === nodeId);
            stepRecords.push({
              nodeId,
              stepType: node?.data?.step?.type || node?.type || "unknown",
              status: status as "success" | "error",
              error,
              timestamp: new Date().toISOString(),
            });
          }
          mainWindow?.webContents.send("node:status", {
            nodeId,
            status,
            ...(error && { error }),
          });
        },
      });

      currentCancelSignal = null;

      // Save execution history
      const record: ExecutionRecord = {
        id: `exec_${Date.now()}`,
        automationId:
          (automation as AutomationExecuteRequest & { automationId?: string }).automationId ||
          "unknown",
        automationName:
          (automation as AutomationExecuteRequest & { automationName?: string }).automationName ||
          "Untitled",
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime,
        success: true,
        stepCount: stepRecords.length,
        steps: stepRecords,
      };
      try {
        historyStore.save(record);
      } catch (e) {
        logger.error("Failed to save execution history", e);
      }

      return { success: true, variables: executor.getVariables() };
    } catch (error) {
      currentCancelSignal = null;
      const message = error instanceof Error ? error.message : String(error);
      const cancelled = message === "Execution cancelled";

      // Save failed/cancelled execution history
      const record: ExecutionRecord = {
        id: `exec_${Date.now()}`,
        automationId:
          (automation as AutomationExecuteRequest & { automationId?: string }).automationId ||
          "unknown",
        automationName:
          (automation as AutomationExecuteRequest & { automationName?: string }).automationName ||
          "Untitled",
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime,
        success: false,
        cancelled,
        error: message,
        stepCount: stepRecords.length,
        steps: stepRecords,
      };
      try {
        historyStore.save(record);
      } catch (e) {
        logger.error("Failed to save execution history", e);
      }

      return { success: false, error: message, cancelled };
    }
  });

  /**
   * Return a copy of current executor variables
   */
  ipcMain.handle("executor:getVariables", async () => {
    return executor.getVariables();
  });

  /**
   * Lists all stored automations from storage
   */
  ipcMain.handle("loopi:listTrees", async (_event) => {
    return listAutomations(defaultStorageFolder);
  });

  /**
   * Loads a stored automation from storage
   */
  ipcMain.handle("loopi:loadTree", async (_event) => {
    return loadAutomation(undefined, defaultStorageFolder);
  });

  /**
   * Saves an automation to storage
   */
  ipcMain.handle("loopi:saveTree", async (_event, config) => {
    return saveAutomation(config, defaultStorageFolder);
  });

  /**
   * Loads all automations from storage
   */
  ipcMain.handle("loopi:loadTrees", async (_event, config) => {
    return loadAutomation(config, defaultStorageFolder);
  });

  /**
   * Delete automation from storage
   */
  ipcMain.handle("loopi:deleteTree", async (_event, automationId: string) => {
    return deleteAutomation(automationId, defaultStorageFolder);
  });

  /**
   * Load example automation from app's examples storage folder
   */
  ipcMain.handle("loopi:loadExample", async (_event, fileName: string) => {
    return loadExample(fileName);
  });

  /**
   * Initiates element selector picking mode
   */
  ipcMain.handle(
    "pick-selector",
    async (
      _event,
      url: string,
      options?: { strategy?: "css" | "xpath" | "dataAttr" | "id" | "aria"; dataAttrKeys?: string[] }
    ) => {
      const mainWindow = windowManager.getMainWindow();
      if (!mainWindow) {
        throw new Error("Main window not available");
      }

      // If browser is already open, load the URL into it; otherwise ensure a new browser window
      let browserWindow = windowManager.getBrowserWindow();
      if (browserWindow) {
        try {
          await browserWindow.webContents.loadURL(url);
        } catch (err) {
          logger.warn("Failed to load URL in existing browser window", err);
        }
      } else {
        browserWindow = await windowManager.ensureBrowserWindow(url, () => {
          mainWindow.webContents.send("browser:closed");
        });
      }

      picker.injectNavigationBar(browserWindow);
      browserWindow.focus();

      return await picker.pickSelector(browserWindow, options);
    }
  );

  /**
   * Initialize examples storage from source files
   */
  ipcMain.handle("loopi:initExamples", async () => {
    initializeExamples();
    return true;
  });

  /**
   * Load app settings from Electron storage
   */
  ipcMain.handle("loopi:loadSettings", async () => {
    return loadSettings();
  });

  /**
   * Save app settings to Electron storage
   */
  ipcMain.handle("loopi:saveSettings", async (_event, settings: unknown) => {
    const result = saveSettings(settings as Parameters<typeof saveSettings>[0]);

    // Re-setup download handler with new settings
    setupDownloadHandler();

    return result;
  });

  /**
   * Open folder selection dialog
   */
  ipcMain.handle("dialog:selectFolder", async (_event) => {
    try {
      const mainWindow = windowManager.getMainWindow();
      if (!mainWindow) {
        logger.error("Main window not available for folder selection dialog");
        return null;
      }
      const result = await dialog.showOpenDialog(mainWindow, {
        properties: ["openDirectory"],
        title: "Select Download Folder",
        buttonLabel: "Select",
      });
      const selectedPath = result.canceled ? null : result.filePaths[0];
      logger.debug("Folder selection result", { selectedPath });
      return selectedPath;
    } catch (error) {
      logger.error("Error in folder selection dialog", error);
      return null;
    }
  });

  /**
   * Debug Mode: Get all logs
   */
  ipcMain.handle("debug:getLogs", async () => {
    return debugLogger.getLogs();
  });

  /**
   * Debug Mode: Clear all logs
   */
  ipcMain.handle("debug:clearLogs", async () => {
    debugLogger.clearLogs();
    return true;
  });

  /**
   * Debug Mode: Export logs as JSON
   */
  ipcMain.handle("debug:exportLogs", async () => {
    return debugLogger.exportLogs();
  });

  /**
   * Debug Mode: Get logs statistics
   */
  ipcMain.handle("debug:getStatistics", async () => {
    return debugLogger.getStatistics();
  });

  /**
   * Debug Mode: Set debug mode enabled/disabled
   */
  ipcMain.handle("debug:setDebugMode", async (_event, enabled: boolean) => {
    debugLogger.setEnabled(enabled);
    if (enabled) {
      debugLogger.info("Debug Mode", "Debug mode enabled by user");
    }
    return true;
  });

  /**
   * Save file to specified path (used for exporting logs)
   */
  ipcMain.handle("file:save", async (_event, data: { filePath: string; content: string }) => {
    try {
      const { filePath, content } = data;
      // Create directory if it doesn't exist
      mkdirSync(dirname(filePath), { recursive: true });
      // Write file
      writeFileSync(filePath, content, "utf-8");
      return true;
    } catch (error) {
      console.error("Failed to save file:", error);
      return false;
    }
  });

  /**
   * Credentials: Load all credentials
   */
  ipcMain.handle("credentials:list", async () => {
    return loadCredentials();
  });

  /**
   * Credentials: Get single credential by ID
   */
  ipcMain.handle("credentials:get", async (_event, id: string) => {
    return getCredential(id);
  });

  /**
   * Credentials: Add new credential
   */
  ipcMain.handle("credentials:add", async (_event, credential) => {
    return addCredential(credential);
  });

  /**
   * Credentials: Update credential
   */
  ipcMain.handle("credentials:update", async (_event, id: string, updates) => {
    return updateCredential(id, updates);
  });

  /**
   * Credentials: Delete credential
   */
  ipcMain.handle("credentials:delete", async (_event, id: string) => {
    return deleteCredential(id);
  });

  /**
   * Schedules: List all schedules
   */
  ipcMain.handle("schedules:list", async () => {
    const { ScheduleStore } = await import("./scheduleStore");
    const store = new ScheduleStore();
    return store.list();
  });

  /**
   * Schedules: Save a schedule
   */
  ipcMain.handle("schedules:save", async (_event, schedule) => {
    const { ScheduleStore } = await import("./scheduleStore");
    const store = new ScheduleStore();
    store.save(schedule);

    // Reload and reactivate all schedules
    await scheduler.loadAndActivateSchedules();

    return schedule.id;
  });

  /**
   * Schedules: Delete a schedule
   */
  ipcMain.handle("schedules:delete", async (_event, scheduleId: string) => {
    const { ScheduleStore } = await import("./scheduleStore");
    const store = new ScheduleStore();

    // Unschedule from the scheduler BEFORE deleting
    scheduler.unscheduleAutomation(scheduleId);

    // Delete from storage
    const result = store.delete(scheduleId);

    return result;
  });

  /**
   * Schedules: Update a schedule
   */
  ipcMain.handle("schedules:update", async (_event, scheduleId: string, updates) => {
    const { ScheduleStore } = await import("./scheduleStore");
    const store = new ScheduleStore();
    const result = store.update(scheduleId, updates);

    // Reload and reactivate all schedules
    await scheduler.loadAndActivateSchedules();

    return result;
  });

  /**
   * Schedules: Get schedules for a workflow
   */
  ipcMain.handle("schedules:getByWorkflow", async (_event, workflowId: string) => {
    const { ScheduleStore } = await import("./scheduleStore");
    const store = new ScheduleStore();
    return store.getByWorkflow(workflowId);
  });

  /**
   * AI: Detect available API keys from environment variables
   */
  ipcMain.handle("ai:detectEnvKeys", async () => {
    const anthropicKey = process.env.ANTHROPIC_API_KEY || "";
    // Claude Code OAuth tokens (sk-ant-oat*) can't be used for direct API calls
    const isUsableAnthropicKey = !!anthropicKey && !anthropicKey.startsWith("sk-ant-oat");

    // Check if claude CLI is installed
    let hasClaudeCli = false;
    try {
      execSync("which claude", { stdio: "ignore", timeout: 3000 });
      hasClaudeCli = true;
    } catch {
      // not installed
    }

    const keys: Record<string, boolean> = {
      anthropic: isUsableAnthropicKey,
      anthropicOAuth: !!anthropicKey && anthropicKey.startsWith("sk-ant-oat"),
      openai: !!process.env.OPENAI_API_KEY,
      claudeCode: hasClaudeCli,
    };
    return keys;
  });

  /**
   * AI Chat: Send messages to the configured LLM provider
   */
  ipcMain.handle(
    "ai:chat",
    async (
      _event,
      params: {
        messages: Array<{ role: "user" | "assistant" | "system"; content: string }>;
        provider: "openai" | "anthropic" | "ollama" | "claude-code";
        credentialId?: string;
        apiKey?: string;
        model?: string;
        baseUrl?: string;
      }
    ) => {
      return callLLM(params);
    }
  );

  /**
   * AI: Generate workflow from natural language description
   */
  ipcMain.handle("ai:generateWorkflow", async (_event, params) => {
    try {
      const generator = new WorkflowGenerator();
      const result = await generator.generate(params);
      return { success: true, data: result };
    } catch (error) {
      logger.error("AI workflow generation failed", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  });

  /**
   * AI Copilot: Explain or suggest based on workflow context
   */
  ipcMain.handle(
    "ai:copilot",
    async (
      _event,
      params: {
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
      }
    ) => {
      try {
        const apiKey =
          params.credentialId || params.apiKey
            ? await (async () => {
                if (params.credentialId) {
                  const { getCredential: getCred } = await import("./credentialsStore");
                  const cred = await getCred(params.credentialId!);
                  if (!cred) throw new Error("Credential not found");
                  return (
                    cred.data.apiKey ||
                    cred.data.key ||
                    cred.data.token ||
                    cred.data.accessToken ||
                    ""
                  );
                }
                return params.apiKey || "";
              })()
            : "";

        const systemPrompt = buildCopilotPrompt(params.action, params.context);

        let userPrompt: string;
        if (params.action === "explain") {
          userPrompt = params.context.selectedNodeId
            ? `Explain what node "${params.context.selectedNodeId}" does in this workflow and how it fits in the overall flow.`
            : "Explain what this entire workflow does, step by step.";
        } else if (params.action === "suggest") {
          userPrompt =
            "Based on this workflow, suggest what steps to add next. Be specific with step types and configurations.";
        } else {
          userPrompt = `The workflow encountered this error: "${params.context.error}". Explain the likely cause and how to fix it.`;
        }

        // Use the same AI call infrastructure
        const callParams = {
          prompt: userPrompt,
          provider: params.provider,
          apiKey: apiKey,
          model: params.model,
          baseUrl: params.baseUrl,
        };

        let response: string;
        if (params.provider === "openai") {
          const baseUrl = callParams.baseUrl || "https://api.openai.com/v1";
          const model = callParams.model || "gpt-4o-mini";
          const res = await axios.post(
            `${baseUrl}/chat/completions`,
            {
              model,
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt },
              ],
              temperature: 0.3,
              max_tokens: 1024,
            },
            {
              headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
              timeout: 30000,
            }
          );
          response = res.data.choices[0]?.message?.content || "";
        } else if (params.provider === "anthropic") {
          const baseUrl = callParams.baseUrl || "https://api.anthropic.com";
          const model = callParams.model || "claude-sonnet-4-5-20250929";
          const isOAuth = apiKey.startsWith("sk-ant-oat");
          const authHdrs: Record<string, string> = isOAuth
            ? { Authorization: `Bearer ${apiKey}` }
            : { "x-api-key": apiKey };
          const res = await axios.post(
            `${baseUrl}/v1/messages`,
            {
              model,
              system: systemPrompt,
              messages: [{ role: "user", content: userPrompt }],
              max_tokens: 1024,
              temperature: 0.3,
            },
            {
              headers: {
                ...authHdrs,
                "Content-Type": "application/json",
              },
              timeout: 30000,
            }
          );
          const content = res.data.content;
          response = Array.isArray(content) && content.length > 0 ? content[0].text || "" : "";
        } else {
          const baseUrl = callParams.baseUrl || "http://localhost:11434";
          const model = callParams.model || "mistral";
          const res = await axios.post(
            `${baseUrl}/api/chat`,
            {
              model,
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt },
              ],
              stream: false,
            },
            { timeout: 60000 }
          );
          response = res.data.message?.content || "";
        }

        return { success: true, response };
      } catch (error) {
        logger.error("AI copilot failed", error);
        return {
          success: false,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    }
  );

  /**
   * Execution History: Get all history records
   */
  ipcMain.handle("history:getAll", async () => {
    return historyStore.getAll();
  });

  /**
   * Execution History: Get records for a specific automation
   */
  ipcMain.handle("history:getByAutomation", async (_event, automationId: string) => {
    return historyStore.getByAutomation(automationId);
  });

  /**
   * Execution History: Delete a single record
   */
  ipcMain.handle("history:deleteRecord", async (_event, automationId: string, recordId: string) => {
    return historyStore.deleteRecord(automationId, recordId);
  });

  /**
   * Execution History: Delete all records for an automation
   */
  ipcMain.handle("history:deleteByAutomation", async (_event, automationId: string) => {
    return historyStore.deleteByAutomation(automationId);
  });

  /**
   * Execution History: Clear all history
   */
  ipcMain.handle("history:clearAll", async () => {
    historyStore.clearAll();
    return true;
  });

  /**
   * Workflow Validation
   */
  ipcMain.handle(
    "workflow:validate",
    async (_event, data: { nodes: unknown[]; edges: unknown[] }) => {
      return validateWorkflow(
        data.nodes as Parameters<typeof validateWorkflow>[0],
        data.edges as Parameters<typeof validateWorkflow>[1]
      );
    }
  );

  // ─── Agent System ──────────────────────────────────────────────

  ipcMain.handle("agents:list", async () => {
    return agentManager.listAgents();
  });

  ipcMain.handle("agents:get", async (_event, id: string) => {
    return agentManager.getAgent(id);
  });

  ipcMain.handle("agents:create", async (_event, config: unknown) => {
    return agentManager.createAgent(config as Parameters<typeof agentManager.createAgent>[0]);
  });

  ipcMain.handle("agents:update", async (_event, id: string, updates: unknown) => {
    return agentManager.updateAgent(id, updates as Record<string, unknown>);
  });

  ipcMain.handle("agents:delete", async (_event, id: string) => {
    return agentManager.deleteAgent(id);
  });

  ipcMain.handle("agents:start", async (_event, id: string) => {
    return agentManager.startAgent(id);
  });

  ipcMain.handle("agents:stop", async (_event, id: string) => {
    return agentManager.stopAgent(id);
  });

  ipcMain.handle("agents:getLogs", async (_event, id: string) => {
    return agentManager.getAgentLogs(id);
  });

  ipcMain.handle("agents:addWorkflow", async (_event, agentId: string, workflowId: string) => {
    return agentManager.addWorkflow(agentId, workflowId);
  });

  ipcMain.handle("agents:removeWorkflow", async (_event, agentId: string, workflowId: string) => {
    return agentManager.removeWorkflow(agentId, workflowId);
  });

  ipcMain.handle("agents:getReflections", async (_event, id: string) => {
    return agentManager.getAgentReflections(id);
  });

  ipcMain.handle("agents:validateModel", async (_event, provider: string, model: string) => {
    return validateModelForAgents(provider, model);
  });

  ipcMain.handle("agents:getInstructions", async (_event, id: string) => {
    return agentManager.getInstructions(id);
  });

  ipcMain.handle("agents:saveInstructions", async (_event, id: string, content: string) => {
    return agentManager.saveInstructions(id, content);
  });

  ipcMain.handle("agents:listFiles", async (_event, id: string) => {
    return agentManager.listFiles(id);
  });

  ipcMain.handle("agents:readFile", async (_event, id: string, filename: string) => {
    return agentManager.readFile(id, filename);
  });

  ipcMain.handle(
    "agents:writeFile",
    async (_event, id: string, filename: string, content: string) => {
      return agentManager.writeFile(id, filename, content);
    }
  );

  ipcMain.handle("agents:deleteFile", async (_event, id: string, filename: string) => {
    return agentManager.deleteFile(id, filename);
  });

  ipcMain.handle("agents:getDir", async (_event, id: string) => {
    return agentManager.getAgentDir(id);
  });

  // ─── System command execution from chat ───
  ipcMain.handle(
    "system:exec",
    async (_event, params: { command: string; cwd?: string; timeout?: number }) => {
      const { exec: execCmd } = await import("child_process");
      const timeout = Math.min(Math.max(1000, params.timeout || 30000), 300000);
      return new Promise((resolve) => {
        execCmd(
          params.command,
          { cwd: params.cwd, timeout, shell: "/bin/bash" },
          (error, stdout, stderr) => {
            const exitCode = error ? ((error as unknown as { code?: number }).code ?? 1) : 0;
            resolve({
              success: !error,
              stdout: stdout?.toString() || "",
              stderr: stderr?.toString() || "",
              exitCode,
            });
          }
        );
      });
    }
  );

  // ─── Chat persistence ───
  const chatStore = new ChatStore();

  ipcMain.handle(
    "chat:save",
    async (_event, messages: unknown[], provider?: string, model?: string) => {
      chatStore.save(
        messages as Array<{
          id: string;
          role: "user" | "assistant";
          content: string;
          timestamp: string;
        }>,
        provider,
        model
      );
      return true;
    }
  );

  ipcMain.handle("chat:load", async () => {
    return chatStore.load();
  });

  ipcMain.handle("chat:clear", async () => {
    chatStore.clear();
    return true;
  });
}
