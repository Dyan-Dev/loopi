import { Automation, StoredAutomation } from "./automation";
import { AutomationStep } from "./steps";

export interface AppSettings {
  theme: "light" | "dark" | "system";
  enableNotifications: boolean;
  downloadPath?: string;
  debugMode?: boolean;
}

export interface ElectronAPI {
  openBrowser: (url: string) => Promise<void>;
  closeBrowser: () => Promise<void>;
  navigate: (url: string) => Promise<void>;
  runStep: (step: AutomationStep) => Promise<unknown>;
  runConditional: (
    condition: unknown
  ) => Promise<{ conditionResult: boolean; effectiveSelector?: string | null } | unknown>;
  initVariables: (vars?: Record<string, string>) => Promise<void>;
  getVariables: () => Promise<Record<string, string>>;
  onBrowserClosed: (callback: () => void) => void;
  removeBrowserClosed?: () => void;
  pickSelector: (url: string) => Promise<string | null>;
  sendSelector: (selector: string) => void;
  cancelSelector: () => void;
  focusMainWindow?: () => void;
  selectFolder: () => Promise<string | null>;
  tree: {
    list: () => Promise<Array<StoredAutomation> | []>;
    load: () => Promise<StoredAutomation | null>;
    save: (automation: StoredAutomation) => Promise<string>;
    delete: (automationId: string) => Promise<boolean>;
    loadExample: (fileName: string) => Promise<StoredAutomation>;
  };
  settings: {
    load: () => Promise<AppSettings>;
    save: (settings: AppSettings) => Promise<boolean>;
  };
  debug: {
    getLogs: () => Promise<unknown[]>;
    clearLogs: () => Promise<void>;
    exportLogs: () => Promise<string>;
    getStatistics: () => Promise<Record<string, number>>;
    setDebugMode: (enabled: boolean) => Promise<void>;
  };
  saveFile: (data: { filePath: string; content: string }) => Promise<boolean>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
    automation?: { variables?: Record<string, string> };
  }
}

export {};
