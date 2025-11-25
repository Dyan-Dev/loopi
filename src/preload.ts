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

contextBridge.exposeInMainWorld("electronAPI", {
  openBrowser: (url: string) => ipcRenderer.invoke("browser:open", url),
  closeBrowser: () => ipcRenderer.invoke("browser:close"),
  navigate: (url: string) => ipcRenderer.invoke("browser:navigate", url),
  runStep: (step: any) => ipcRenderer.invoke("browser:runStep", step),
  runConditional: (condition: any) =>
    ipcRenderer.invoke("browser:runConditional", condition),
  onBrowserClosed: (callback: () => void) =>
    ipcRenderer.on("browser:closed", callback),
  pickSelector: (url: string) => ipcRenderer.invoke("pick-selector", url),
  sendSelector: (selector: any) =>
    ipcRenderer.send("selector-picked", selector),
  cancelSelector: () => ipcRenderer.send("selector-cancel"),
});
