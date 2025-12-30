import { app, BrowserWindow } from "electron";
import squirrelStartup from "electron-squirrel-startup";
import { AutomationExecutor } from "./automationExecutor";
import { DesktopScheduler } from "./desktopScheduler";
import { setupDownloadHandler } from "./downloadManager";
import { registerIPCHandlers } from "./ipcHandlers";
import { SelectorPicker } from "./selectorPicker";
import { initializeExamples } from "./treeStore";
import { WindowManager } from "./windowManager";

/**
 * Main process entry point
 * Manages application lifecycle and coordinates core services
 */

// Fix for Linux sandbox issues
if (process.platform === "linux") {
  app.commandLine.appendSwitch("no-sandbox");
  app.commandLine.appendSwitch("disable-gpu");
  app.commandLine.appendSwitch("disable-dev-shm-usage");
}

// Handle auto-update installation on Windows (electron-squirrel-startup)
if (squirrelStartup) {
  app.quit();
}

// Initialize core services
const windowManager = new WindowManager();
const executor = new AutomationExecutor();
const picker = new SelectorPicker();
const scheduler = new DesktopScheduler();

// Give scheduler access to window manager
scheduler.setWindowManager(windowManager);

// Register all IPC communication handlers
registerIPCHandlers(windowManager, executor, picker, scheduler);

/**
 * Application ready - create main window
 */
app.on("ready", async () => {
  await new Promise((resolve) => setTimeout(resolve, 100));
  setupDownloadHandler();
  initializeExamples();

  const mainWindow = windowManager.createMainWindow();

  // Load and activate schedules
  scheduler.loadAndActivateSchedules().catch((error) => {
    console.error("Failed to load schedules:", error);
  });

  // Close browser window when main window is closed
  mainWindow.on("close", () => {
    windowManager.closeBrowserWindow();
  });
});

/**
 * Clean up before quitting to prevent "Object has been destroyed" errors
 */
app.on("before-quit", () => {
  scheduler.cleanup();
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
