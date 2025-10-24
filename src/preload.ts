// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
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
  pickSelector: (url: string) => ipcRenderer.invoke('pick-selector', url),
  sendSelector: (selector: any) => ipcRenderer.send('selector-picked', selector),
  cancelSelector: () => ipcRenderer.send('selector-cancel'),
});
