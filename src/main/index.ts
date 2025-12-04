import { app, BrowserWindow } from "electron";
import squirrelStartup from "electron-squirrel-startup";
import { AutomationExecutor } from "./automationExecutor";
import { registerIPCHandlers } from "./ipcHandlers";
import { SelectorPicker } from "./selectorPicker";
import { WindowManager } from "./windowManager";

/**
 * Main process entry point
 * Manages application lifecycle and coordinates core services
 */

// Fix for Linux sandbox issues
if (process.platform === "linux") {
  app.commandLine.appendSwitch("no-sandbox");
  app.commandLine.appendSwitch("disable-gpu");
}

// Handle auto-update installation on Windows (electron-squirrel-startup)
if (squirrelStartup) {
  app.quit();
}

// Initialize core services
const windowManager = new WindowManager();
const executor = new AutomationExecutor();
const picker = new SelectorPicker();

// Register all IPC communication handlers
registerIPCHandlers(windowManager, executor, picker);

/**
 * Application ready - create main window
 */
app.on("ready", () => {
  const mainWindow = windowManager.createMainWindow();

  // Close browser window when main window is closed
  mainWindow.on("close", () => {
    windowManager.closeBrowserWindow();
  });
});

/**
 * Clean up before quitting to prevent "Object has been destroyed" errors
 */
app.on("before-quit", () => {
  windowManager.cleanup();
});

/**
 * Quit when all windows are closed (except on macOS)
 */
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

/**
 * Re-create window when dock icon is clicked (macOS)
 */
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    windowManager.createMainWindow();
  }
});
