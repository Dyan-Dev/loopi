import { Automation, ExecutionRecord, StoredAutomation, ScheduleType } from "./automation";
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
    | "telegram"
    | "github"
    | "notion"
    | "sendgrid"
    | "stripe"
    | "postgres"
    | "googleSheets"
    | "airtable"
    | "jira"
    | "hubspot"
    | "twilio"
    | "mailchimp"
    | "zoom"
    | "supabase"
    | "salesforce"
    | "trello"
    | "googleCalendar"
    | "googleDrive"
    | "gmail"
    | "mongodb"
    | "mysql"
    | "redis"
    | "awsS3"
    | "shopify"
    | "asana"
    | "linear"
    | "clickup"
    | "monday"
    | "dropbox"
    | "box"
    | "gitlab"
    | "paypal"
    | "typeform"
    | "calendly"
    | "whatsapp"
    | "intercom"
    | "zendesk"
    | "freshdesk"
    | "woocommerce"
    | "activecampaign"
    | "bitly"
    | "circleci"
    | "jenkins"
    | "cloudflare"
    | "convertkit"
    | "contentful"
    | "mattermost"
    | "pagerduty"
    | "sentry"
    | "todoist"
    | "nocodb"
    | "snowflake"
    | "graphql"
    | "baserow"
    | "elasticsearch"
    | "grafana"
    | "netlify"
    | "wordpress"
    | "xero"
    | "quickbooks"
    | "pipedrive"
    | "helpscout"
    | "reddit"
    | "spotify"
    | "servicenow"
    | "ghost"
    | "webflow"
    | "coda"
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
  aiProvider?: "openai" | "anthropic" | "ollama";
  aiModel?: string;
  aiApiKey?: string;
  aiCredentialId?: string;
  ollamaBaseUrl?: string;
}

export interface ElectronAPI {
  openBrowser: (url: string) => Promise<void>;
  closeBrowser: () => Promise<void>;
  navigate: (url: string) => Promise<void>;
  executeAutomation: (automation: {
    nodes: unknown[];
    edges: unknown[];
    headless?: boolean;
    automationId?: string;
    automationName?: string;
  }) => Promise<{
    success: boolean;
    error?: string;
    cancelled?: boolean;
    variables?: Record<string, unknown>;
  }>;
  cancelAutomation: () => Promise<boolean>;
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
  ai: {
    generateWorkflow: (params: {
      prompt: string;
      provider: "openai" | "anthropic" | "ollama";
      credentialId?: string;
      apiKey?: string;
      model?: string;
      baseUrl?: string;
    }) => Promise<{
      success: boolean;
      data?: {
        nodes: unknown[];
        edges: unknown[];
        name: string;
        description: string;
      };
      error?: string;
    }>;
    copilot: (params: {
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
    }) => Promise<{
      success: boolean;
      response?: string;
      error?: string;
    }>;
  };
  validateWorkflow: (data: { nodes: unknown[]; edges: unknown[] }) => Promise<{
    valid: boolean;
    errors: string[];
    warnings: string[];
  }>;
  history: {
    getAll: () => Promise<ExecutionRecord[]>;
    getByAutomation: (automationId: string) => Promise<ExecutionRecord[]>;
    deleteRecord: (automationId: string, recordId: string) => Promise<boolean>;
    deleteByAutomation: (automationId: string) => Promise<boolean>;
    clearAll: () => Promise<boolean>;
  };
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
    automation?: { variables?: Record<string, unknown> };
  }
}

export {};
