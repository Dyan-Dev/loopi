import { dialog, ipcMain } from "electron";
import { mkdirSync, writeFileSync } from "fs";
import { dirname } from "path";
import { AutomationExecutor } from "./automationExecutor";
import {
  addCredential,
  deleteCredential,
  getCredential,
  loadCredentials,
  updateCredential,
} from "./credentialsStore";
import { debugLogger } from "./debugLogger";
import { setupDownloadHandler } from "./downloadManager";
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

/**
 * Registers all IPC handlers for communication between renderer and main process
 */
export function registerIPCHandlers(
  windowManager: WindowManager,
  executor: AutomationExecutor,
  picker: SelectorPicker
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
   * Executes an automation step in the browser window
   */
  ipcMain.handle("browser:runStep", async (_event, step) => {
    const browserWindow = windowManager.getBrowserWindow();
    if (!browserWindow) {
      throw new Error("Browser window not available");
    }
    return await executor.executeStep(browserWindow, step);
  });

  /**
   * Initialize executor variable context from renderer
   */
  ipcMain.handle(
    "executor:initVariables",
    async (_event, vars: Record<string, string> | undefined) => {
      executor.initVariables(vars);
      return true;
    }
  );

  /**
   * Return a copy of current executor variables
   */
  ipcMain.handle("executor:getVariables", async () => {
    return executor.getVariables();
  });

  /**
   * Evaluates a conditional node (for loops and branching logic)
   */
  ipcMain.handle("browser:runConditional", async (_event, config) => {
    const browserWindow = windowManager.getBrowserWindow();
    if (!browserWindow) {
      throw new Error("Browser window not available");
    }
    return await executor.evaluateConditional(browserWindow, config);
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

      // Ensure browser window is open and ready
      const browserWindow = await windowManager.ensureBrowserWindow(url, () => {
        mainWindow.webContents.send("browser:closed");
      });

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
        console.error("Main window not available for folder selection dialog");
        return null;
      }
      const result = await dialog.showOpenDialog(mainWindow, {
        properties: ["openDirectory"],
        title: "Select Download Folder",
        buttonLabel: "Select",
      });
      const selectedPath = result.canceled ? null : result.filePaths[0];
      console.log("Folder selection result:", selectedPath);
      return selectedPath;
    } catch (error) {
      console.error("Error in folder selection dialog:", error);
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
}
