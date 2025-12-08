import { Automation, StoredAutomation } from "./automation";
import { AutomationStep } from "./steps";

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
  tree: {
    list: () => Promise<Array<StoredAutomation> | []>;
    load: () => Promise<StoredAutomation | null>;
    save: (automation: StoredAutomation) => Promise<string>;
  };
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
    automation?: { variables?: Record<string, string> };
  }
}

export {};
