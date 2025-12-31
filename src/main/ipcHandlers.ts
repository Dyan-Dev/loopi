import { dialog, ipcMain } from "electron";
import { mkdirSync, writeFileSync } from "fs";
import { dirname } from "path";
import type { Edge, Node } from "../types/flow";
import { createLogger } from "../utils/logger";
import { AutomationExecutor } from "./automationExecutor";
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
import { executeAutomationGraph } from "./graphExecutor";
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

const logger = createLogger("IPCHandlers");

/**
 * Type for automation execution request from frontend
 */
interface AutomationExecuteRequest {
  nodes: Node[];
  edges: Edge[];
  headless?: boolean;
}

/**
 * Registers all IPC handlers for communication between renderer and main process
 */
export function registerIPCHandlers(
  windowManager: WindowManager,
  executor: AutomationExecutor,
  picker: SelectorPicker,
  scheduler: DesktopScheduler
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

  /**
   * Execute entire automation workflow in backend
   * Handles complete ReactFlow nodes/edges directly, sends node status updates to frontend
   */
  ipcMain.handle("automation:execute", async (event, automation: AutomationExecuteRequest) => {
    const mainWindow = windowManager.getMainWindow();
    const { nodes, edges, headless } = automation;

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

      // Execute using shared graph executor
      await executeAutomationGraph({
        nodes: cleanNodes,
        edges: cleanEdges,
        browserWindow,
        executor,
        headless,
        onNodeStatus: (nodeId, status, error) => {
          mainWindow?.webContents.send("node:status", {
            nodeId,
            status,
            ...(error && { error }),
          });
        },
      });

      return { success: true, variables: executor.getVariables() };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : String(error) };
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
}
