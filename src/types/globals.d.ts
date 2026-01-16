import { Automation, StoredAutomation, ScheduleType } from "./automation";
import { AutomationStep } from "./steps";
import type { LogEntry } from "@main/debugLogger";
import type { ConditionalConfig, ConditionalResult } from "./conditions";

export interface WorkflowSchedule {
  id: string;
  workflowId: string;
  workflowName: string;
  schedule: ScheduleType;
  enabled: boolean;
  headless?: boolean; // Whether to run browser in background
  createdAt: string;
}

export interface Credential {
  id: string;
  name: string;
  type:
    | "twitter"
    | "discord"
    | "slack"
    | "oauth"
    | "apiKey"
    | "basic"
    | "openai"
    | "anthropic"
    | "custom";
  createdAt: string;
  updatedAt: string;
  data: Record<string, string>;
}

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
  executeAutomation: (automation: {
    nodes: unknown[];
    edges: unknown[];
    headless?: boolean;
  }) => Promise<{ success: boolean; error?: string; variables?: Record<string, unknown> }>;
  onNodeStatus: (
    callback: (data: { nodeId: string; status: string; error?: string }) => void
  ) => void;
  getVariables: () => Promise<Record<string, unknown>>;
  onBrowserClosed: (callback: () => void) => void;
  removeBrowserClosed?: () => void;
  pickSelector: (
    url: string,
    options?: {
      strategy?: "css" | "xpath" | "dataAttr" | "id" | "aria";
      dataAttrKeys?: string[];
    }
  ) => Promise<string | null>;
  sendSelector: (selector: string | { selector: string; tagName?: string }) => void;
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
  credentials: {
    list: () => Promise<Credential[]>;
    get: (id: string) => Promise<Credential | null>;
    add: (credential: Omit<Credential, "id" | "createdAt" | "updatedAt">) => Promise<Credential>;
    update: (
      id: string,
      updates: Partial<Omit<Credential, "id" | "createdAt">>
    ) => Promise<boolean>;
    delete: (id: string) => Promise<boolean>;
  };
  debug: {
    getLogs: () => Promise<LogEntry[]>;
    clearLogs: () => Promise<void>;
    exportLogs: () => Promise<string>;
    getStatistics: () => Promise<Record<string, number>>;
    setDebugMode: (enabled: boolean) => Promise<void>;
  };
  schedules: {
    list: () => Promise<WorkflowSchedule[]>;
    save: (schedule: WorkflowSchedule) => Promise<string>;
    delete: (scheduleId: string) => Promise<boolean>;
    update: (scheduleId: string, updates: Partial<WorkflowSchedule>) => Promise<boolean>;
    getByWorkflow: (workflowId: string) => Promise<WorkflowSchedule[]>;
  };
  saveFile: (data: { filePath: string; content: string }) => Promise<boolean>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
    automation?: { variables?: Record<string, unknown> };
  }
}

export {};
