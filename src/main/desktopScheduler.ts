/**
 * Desktop Workflow Scheduler
 * Manages scheduled execution of workflows in the Electron app
 * Uses the existing AutomationExecutor and Electron's browser
 */

import type { ScheduleType, StoredAutomation } from "@app-types/automation";
import type { AutomationStep } from "@app-types/steps";
import { createLogger } from "@utils/logger";
import { app, BrowserWindow } from "electron";
import fs from "fs";
import path from "path";
import { AutomationExecutor } from "./automationExecutor";
import { executeAutomationGraph } from "./graphExecutor";
import type { WindowManager } from "./windowManager";

const logger = createLogger("DesktopScheduler");

interface ScheduledTask {
  scheduleId: string;
  automationId: string;
  schedule: ScheduleType;
  cronTask?: { stop: () => void };
  intervalId?: NodeJS.Timeout;
  enabled: boolean;
}

export class DesktopScheduler {
  private tasks: Map<string, ScheduledTask> = new Map();
  private executor: AutomationExecutor;
  private executionLogPath: string;
  private windowManager: WindowManager | null = null;

  constructor() {
    this.executor = new AutomationExecutor();
    const userDataPath = app.getPath("userData");
    this.executionLogPath = path.join(userDataPath, "schedule_logs");
    this.ensureLogDirectory();
  }

  /**
   * Set the window manager for browser automation
   */
  setWindowManager(manager: WindowManager): void {
    this.windowManager = manager;
  }

  /**
   * Set the browser window for automation execution
   * @deprecated Use setWindowManager instead
   */
  setBrowserWindow(window: BrowserWindow | null): void {
    // Legacy method for compatibility
  }

  /**
   * Ensure log directory exists
   */
  private ensureLogDirectory(): void {
    if (!fs.existsSync(this.executionLogPath)) {
      fs.mkdirSync(this.executionLogPath, { recursive: true });
    }
  }

  /**
   * Schedule an automation workflow
   */
  scheduleAutomation(automation: StoredAutomation, scheduleId: string): boolean {
    if (!automation.schedule || automation.schedule.type === "manual") {
      logger.info(`Automation ${automation.id} has no schedule`);
      return false;
    }

    // Remove existing schedule if any
    this.unscheduleAutomation(scheduleId);

    const task: ScheduledTask = {
      scheduleId,
      automationId: automation.id,
      schedule: automation.schedule,
      enabled: automation.enabled ?? true,
    };

    switch (automation.schedule.type) {
      case "interval":
        task.intervalId = this.scheduleInterval(automation);
        break;
      case "cron":
        task.cronTask = this.scheduleCron(automation);
        break;
      case "once":
        task.intervalId = this.scheduleOnce(automation);
        break;
    }

    this.tasks.set(scheduleId, task);
    logger.info(
      `Scheduled automation ${automation.id} (schedule ${scheduleId}): ${automation.schedule.type}`
    );
    return true;
  }

  /**
   * Schedule interval-based execution
   */
  private scheduleInterval(automation: StoredAutomation): NodeJS.Timeout {
    const schedule = automation.schedule as Extract<ScheduleType, { type: "interval" }>;
    const intervalMs = schedule.intervalMinutes * 60 * 1000;

    return setInterval(async () => {
      if (automation.enabled) {
        await this.executeScheduledAutomation(automation);
      }
    }, intervalMs);
  }

  /**
   * Schedule cron-based execution (lazy load node-cron)
   */
  private scheduleCron(automation: StoredAutomation): { stop: () => void } | undefined {
    const schedule = automation.schedule as Extract<ScheduleType, { type: "cron" }>;

    try {
      // Lazy load node-cron if available (optional dependency)
      // biome-ignore lint/style/noCommonJs: Dynamic require needed for optional dependency
      const cron = require("node-cron");

      if (!cron.validate(schedule.expression)) {
        throw new Error(`Invalid cron expression: ${schedule.expression}`);
      }

      return cron.schedule(schedule.expression, async () => {
        if (automation.enabled) {
          await this.executeScheduledAutomation(automation);
        }
      });
    } catch (error) {
      logger.error("Failed to schedule cron task", error);
      logger.error("Install node-cron to use cron expressions: pnpm add node-cron");
      return undefined;
    }
  }

  /**
   * Schedule one-time execution
   */
  private scheduleOnce(automation: StoredAutomation): NodeJS.Timeout {
    const schedule = automation.schedule as Extract<ScheduleType, { type: "once" }>;
    const targetTime = new Date(schedule.datetime).getTime();
    const now = Date.now();
    const delay = targetTime - now;

    if (delay <= 0) {
      logger.info(`One-time schedule for ${automation.id} is in the past, executing now`);
      // Execute immediately
      this.executeScheduledAutomation(automation);
      return setTimeout(() => {
        // No-op timeout
      }, 0);
    }

    return setTimeout(async () => {
      if (automation.enabled) {
        await this.executeScheduledAutomation(automation);
        // Remove task after execution
        this.unscheduleAutomation(automation.id);
      }
    }, delay);
  }

  /**
   * Execute a scheduled automation using the existing AutomationExecutor
   */
  private async executeScheduledAutomation(automation: StoredAutomation): Promise<void> {
    logger.info(
      `Executing scheduled automation: ${automation.id} - ${automation.name} (headless: ${automation.headless ?? true})`
    );

    const startTime = Date.now();
    let success = false;
    let error: string | undefined;
    const stepResults: Array<{ success: boolean }> = [];
    const useHeadless = automation.headless ?? true; // Default to true headless for scheduled workflows

    try {
      // Use true headless (Puppeteer) when headless flag is enabled
      if (useHeadless && this.requiresBrowser(automation)) {
        logger.info("Using Puppeteer for true headless execution");
        await this.executeWithPuppeteer(automation, stepResults);
      } else {
        // Use Electron for visible browser or non-browser workflows
        this.executor.initVariables({});

        const needsBrowser = this.requiresBrowser(automation);

        if (needsBrowser && this.windowManager) {
          const browserWindow = this.windowManager.getBrowserWindow();
          if (!browserWindow || browserWindow.isDestroyed()) {
            logger.info(`Opening browser window for scheduled automation: ${automation.id}`);
            await this.windowManager.ensureBrowserWindow("https://www.google.com/");
          }
        } else if (needsBrowser && !this.windowManager) {
          throw new Error(
            "WindowManager not available. Cannot execute browser-based workflows. This is a configuration error."
          );
        }

        await this.executeWorkflowGraph(automation, stepResults);
      }

      success = true;
      logger.info(`Scheduled automation completed: ${automation.id}`);
    } catch (err) {
      error = err instanceof Error ? err.message : String(err);
      logger.error(`Scheduled automation failed: ${automation.id}`, err);
    }

    const duration = Date.now() - startTime;

    // Log execution
    this.logExecution(automation, {
      success,
      duration,
      error,
      steps: stepResults,
      variables: useHeadless ? {} : this.executor.getVariables(),
    });
  }

  /**
   * Execute workflow using Puppeteer for true headless mode
   */
  private async executeWithPuppeteer(
    automation: StoredAutomation,
    stepResults: Array<{ success: boolean }>
  ): Promise<void> {
    await executeAutomationGraph({
      nodes: automation.nodes,
      edges: automation.edges,
      executor: this.executor,
      headless: true,
      onNodeStatus: (nodeId, status, error) => {
        if (status === "success") {
          stepResults.push({ success: true });
        } else if (status === "error") {
          stepResults.push({ success: false });
        }
      },
    });
  }

  /**
   * Execute workflow using graph traversal (supports loops, conditionals)
   * Mirrors the logic from useExecution.ts for consistency
   */
  private async executeWorkflowGraph(
    automation: StoredAutomation,
    stepResults: Array<{ success: boolean }>
  ): Promise<void> {
    const browserWindow = this.windowManager?.getBrowserWindow() || null;

    await executeAutomationGraph({
      nodes: automation.nodes,
      edges: automation.edges,
      browserWindow,
      executor: this.executor,
      headless: false,
      onNodeStatus: (nodeId, status, error) => {
        if (status === "success") {
          stepResults.push({ success: true });
        } else if (status === "error") {
          stepResults.push({ success: false });
        }
      },
    });
  }

  /**
   * Check if automation requires browser
   */
  private requiresBrowser(automation: StoredAutomation): boolean {
    const browserSteps = [
      "navigate",
      "click",
      "type",
      "extract",
      "scroll",
      "screenshot",
      "selectOption",
      "fileUpload",
      "hover",
    ];
    return automation.steps.some((step) => browserSteps.includes(step.type));
  }

  /**
   * Execute a single automation step
   */
  private async executeStep(step: AutomationStep): Promise<unknown> {
    // Browser steps that require a browser window
    const browserSteps = [
      "navigate",
      "click",
      "type",
      "extract",
      "scroll",
      "screenshot",
      "selectOption",
      "fileUpload",
      "hover",
    ];

    if (browserSteps.includes(step.type)) {
      // Browser steps require a browser window
      const browserWindow = this.windowManager?.getBrowserWindow();

      if (!browserWindow || browserWindow.isDestroyed()) {
        throw new Error(`Cannot execute step type: ${step.type} - browser window not available`);
      }

      return await this.executor.executeStep(browserWindow, step);
    }

    // All other steps (API, variables, Twitter, etc.) can run without a browser window
    return await this.executor.executeStep(null, step);
  }

  /**
   * Log execution result
   */
  private logExecution(
    automation: StoredAutomation,
    result: {
      success: boolean;
      duration: number;
      error?: string;
      steps: Array<{ success: boolean }>;
      variables?: Record<string, unknown>;
    }
  ): void {
    const logEntry = {
      automationId: automation.id,
      automationName: automation.name,
      timestamp: new Date().toISOString(),
      success: result.success,
      duration: result.duration,
      error: result.error,
      stepsExecuted: result.steps.length,
      stepsSucceeded: result.steps.filter((s) => s.success).length,
      variables: result.variables,
    };

    const logFile = path.join(this.executionLogPath, `${automation.id}_${Date.now()}.json`);

    fs.writeFileSync(logFile, JSON.stringify(logEntry, null, 2));
  }

  /**
   * Unschedule an automation by schedule ID
   */
  unscheduleAutomation(scheduleId: string): boolean {
    const task = this.tasks.get(scheduleId);
    if (!task) return false;

    if (task.cronTask) {
      task.cronTask.stop();
    }

    if (task.intervalId) {
      clearInterval(task.intervalId);
    }

    this.tasks.delete(scheduleId);
    logger.info(`Unscheduled schedule: ${scheduleId} (automation: ${task.automationId})`);
    return true;
  }

  /**
   * Enable/disable a scheduled automation
   */
  toggleAutomation(scheduleId: string, enabled: boolean): boolean {
    const task = this.tasks.get(scheduleId);
    if (!task) return false;

    task.enabled = enabled;
    logger.info(
      `Schedule ${scheduleId} (automation ${task.automationId}) ${enabled ? "enabled" : "disabled"}`
    );
    return true;
  }

  /**
   * Get all scheduled tasks
   */
  getScheduledTasks(): Array<{
    scheduleId: string;
    automationId: string;
    schedule: ScheduleType;
    enabled: boolean;
  }> {
    return Array.from(this.tasks.values()).map((task) => ({
      scheduleId: task.scheduleId,
      automationId: task.automationId,
      schedule: task.schedule,
      enabled: task.enabled,
    }));
  }

  /**
   * Get execution logs for an automation
   */
  getExecutionLogs(automationId: string, limit = 10): unknown[] {
    const logs: unknown[] = [];

    if (!fs.existsSync(this.executionLogPath)) {
      return logs;
    }

    const files = fs
      .readdirSync(this.executionLogPath)
      .filter((f) => f.startsWith(automationId) && f.endsWith(".json"))
      .sort()
      .reverse()
      .slice(0, limit);

    for (const file of files) {
      const content = fs.readFileSync(path.join(this.executionLogPath, file), "utf-8");
      logs.push(JSON.parse(content));
    }

    return logs;
  }

  /**
   * Cleanup all scheduled tasks
   */
  cleanup(): void {
    for (const [scheduleId] of this.tasks) {
      this.unscheduleAutomation(scheduleId);
    }
    logger.info("All scheduled tasks cleaned up");
  }

  /**
   * Load and activate schedules from the schedule store
   */
  async loadAndActivateSchedules(): Promise<void> {
    try {
      const { ScheduleStore } = await import("./scheduleStore");
      const store = new ScheduleStore();
      const schedules = store.list();

      logger.info(`Loading ${schedules.length} schedules`);

      for (const schedule of schedules) {
        if (!schedule.enabled) {
          logger.info(
            `Skipping disabled schedule: ${schedule.id} for workflow ${schedule.workflowId}`
          );
          continue;
        }

        // Load the workflow
        const { loadAutomation, defaultStorageFolder } = await import("./treeStore");
        const workflow = await loadAutomation(schedule.workflowId, defaultStorageFolder);

        if (!workflow) {
          logger.error(`Workflow ${schedule.workflowId} not found for schedule ${schedule.id}`);
          continue;
        }

        // Add schedule to workflow and activate
        const workflowWithSchedule = {
          ...workflow,
          schedule: schedule.schedule,
          enabled: schedule.enabled,
          headless: schedule.headless ?? true, // Default to headless for scheduled workflows
        };

        this.scheduleAutomation(workflowWithSchedule, schedule.id);
      }

      logger.info(`Activated ${this.tasks.size} schedules`);
    } catch (error) {
      logger.error("Failed to load schedules", error);
    }
  }
}
