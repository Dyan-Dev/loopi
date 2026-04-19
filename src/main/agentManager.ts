import type {
  Agent,
  AgentCapability,
  AgentLogEntry,
  AgentModelConfig,
  AgentSchedule,
  AgentTask,
} from "@app-types/agent";
import { createLogger } from "@utils/logger";
import { randomUUID } from "crypto";
import { Notification } from "electron";
import { validateModelForAgents } from "./agentModelValidator";
import { AgentStore } from "./agentStore";
import { AutomationExecutor } from "./automationExecutor";
import { DesktopScheduler } from "./desktopScheduler";
import { executeAutomationGraph } from "./graphExecutor";
import { callLLM } from "./llmClient";
import { defaultStorageFolder, listAutomations, loadAutomation } from "./treeStore";
import type { WindowManager } from "./windowManager";

const logger = createLogger("AgentManager");

export interface CreateAgentConfig {
  name: string;
  role: string;
  description: string;
  capabilities: AgentCapability[];
  model: AgentModelConfig;
  tasks?: Array<{ description: string; workflowId?: string }>;
  schedule?: AgentSchedule;
  credentialIds?: string[];
  createdBy?: "user" | "loopi";
  parentAgentId?: string;
}

export class AgentManager {
  private runningAgents: Map<string, { cancel: () => void }> = new Map();

  constructor(
    private store: AgentStore,
    private scheduler: DesktopScheduler
  ) {}

  async createAgent(config: CreateAgentConfig): Promise<Agent> {
    const validation = validateModelForAgents(config.model.provider, config.model.model);
    if (!validation.valid) {
      throw new Error(
        `Model not suitable for agents: ${validation.reason}` +
          (validation.suggestions ? ` Try: ${validation.suggestions.join(", ")}` : "")
      );
    }

    const now = new Date().toISOString();
    const agent: Agent = {
      id: randomUUID(),
      name: config.name,
      role: config.role,
      description: config.description,
      status: "idle",
      capabilities: config.capabilities,
      tasks: (config.tasks || []).map((t) => ({
        id: randomUUID(),
        description: t.description,
        status: "pending" as const,
        workflowId: t.workflowId,
      })),
      model: config.model,
      schedule: config.schedule,
      credentialIds: config.credentialIds || [],
      createdAt: now,
      updatedAt: now,
      logs: [],
      createdBy: config.createdBy || "user",
      parentAgentId: config.parentAgentId,
    };

    this.store.save(agent);

    // Generate instruction file for the agent
    this.store.saveInstructions(agent.id, this.generateInstructions(agent));

    logger.info("Agent created", { id: agent.id, name: agent.name, role: agent.role });

    // Auto-schedule if schedule is provided
    if (agent.schedule && agent.schedule.type !== "manual") {
      this.scheduleAgent(agent.id, agent.schedule);
    }

    return agent;
  }

  async startAgent(agentId: string): Promise<Agent> {
    const agent = this.store.load(agentId);
    if (!agent) throw new Error(`Agent ${agentId} not found`);
    if (agent.status === "running") throw new Error(`Agent ${agentId} is already running`);

    agent.status = "running";
    agent.lastRunAt = new Date().toISOString();
    this.addLog(agent, "info", "Agent started");
    this.store.save(agent);

    const cancelSignal = { cancelled: false };
    this.runningAgents.set(agentId, {
      cancel: () => {
        cancelSignal.cancelled = true;
      },
    });

    // Execute tasks sequentially
    try {
      for (const task of agent.tasks) {
        if (cancelSignal.cancelled) {
          agent.status = "paused";
          this.addLog(agent, "info", "Agent paused by user");
          break;
        }
        if (task.status === "completed") continue;

        task.status = "running";
        task.startedAt = new Date().toISOString();
        this.store.save(agent);

        try {
          const result = await this.executeTask(agent, task, cancelSignal);
          task.status = "completed";
          task.result = result;
          task.completedAt = new Date().toISOString();
          this.addLog(agent, "info", `Task completed: ${task.description}`, task.id);
        } catch (err) {
          task.status = "failed";
          task.error = err instanceof Error ? err.message : String(err);
          task.completedAt = new Date().toISOString();
          this.addLog(agent, "error", `Task failed: ${task.error}`, task.id);
          agent.status = "failed";
          this.store.save(agent);
          break;
        }
      }

      if (agent.status === "running") {
        agent.status = "completed";
        this.addLog(agent, "info", "All tasks completed");
      }
    } catch (err) {
      agent.status = "failed";
      this.addLog(
        agent,
        "error",
        `Agent failed: ${err instanceof Error ? err.message : String(err)}`
      );
    } finally {
      this.runningAgents.delete(agentId);
      this.store.save(agent);
    }

    return agent;
  }

  async stopAgent(agentId: string): Promise<Agent> {
    const running = this.runningAgents.get(agentId);
    if (running) {
      running.cancel();
      this.runningAgents.delete(agentId);
    }

    const agent = this.store.load(agentId);
    if (!agent) throw new Error(`Agent ${agentId} not found`);

    agent.status = "paused";
    this.addLog(agent, "info", "Agent stopped by user");
    this.store.save(agent);
    return agent;
  }

  async deleteAgent(agentId: string): Promise<boolean> {
    // Stop if running
    const running = this.runningAgents.get(agentId);
    if (running) {
      running.cancel();
      this.runningAgents.delete(agentId);
    }
    // Unschedule
    this.scheduler.unscheduleAutomation(agentId);
    return this.store.delete(agentId);
  }

  getAgent(agentId: string): Agent | null {
    return this.store.load(agentId);
  }

  listAgents(): Agent[] {
    return this.store.list();
  }

  addTask(agentId: string, taskConfig: { description: string; workflowId?: string }): Agent {
    const agent = this.store.load(agentId);
    if (!agent) throw new Error(`Agent ${agentId} not found`);

    agent.tasks.push({
      id: randomUUID(),
      description: taskConfig.description,
      status: "pending",
      workflowId: taskConfig.workflowId,
    });
    this.store.save(agent);
    return agent;
  }

  updateAgent(agentId: string, updates: Partial<Agent>): Agent | null {
    return this.store.update(agentId, updates);
  }

  getAgentLogs(agentId: string): AgentLogEntry[] {
    const agent = this.store.load(agentId);
    return agent?.logs || [];
  }

  scheduleAgent(agentId: string, schedule: AgentSchedule): void {
    const scheduleType =
      schedule.type === "interval"
        ? { type: "interval" as const, intervalMinutes: schedule.intervalMinutes || 60 }
        : schedule.type === "cron"
          ? { type: "cron" as const, expression: schedule.expression || "0 * * * *" }
          : schedule.type === "once"
            ? { type: "once" as const, datetime: schedule.datetime || new Date().toISOString() }
            : null;

    if (!scheduleType) return;

    this.scheduler.scheduleCallback(agentId, scheduleType, async () => {
      try {
        await this.startAgent(agentId);
      } catch (err) {
        logger.error("Scheduled agent execution failed", { agentId, error: err });
      }
    });
    logger.info("Agent scheduled", { agentId, schedule });
  }

  async loadAndActivateScheduledAgents(): Promise<void> {
    const agents = this.store.list();
    let activated = 0;
    for (const agent of agents) {
      // Reset previously running agents to idle
      if (agent.status === "running") {
        agent.status = "idle";
        this.store.save(agent);
      }
      // Re-schedule agents with active schedules
      if (agent.schedule && agent.schedule.type !== "manual") {
        this.scheduleAgent(agent.id, agent.schedule);
        activated++;
      }
    }
    logger.info(`Activated ${activated} agent schedules`);
  }

  private async executeTask(
    agent: Agent,
    task: AgentTask,
    cancelSignal: { cancelled: boolean }
  ): Promise<string> {
    // If task has a workflow, execute it
    if (task.workflowId) {
      return this.executeWorkflowTask(agent, task.workflowId, cancelSignal);
    }

    // Otherwise, use LLM to decide what to do
    return this.executeLLMTask(agent, task);
  }

  private async executeWorkflowTask(
    agent: Agent,
    workflowId: string,
    cancelSignal: { cancelled: boolean }
  ): Promise<string> {
    const automation = loadAutomation(workflowId, defaultStorageFolder);
    if (!automation) throw new Error(`Workflow ${workflowId} not found`);

    const executor = new AutomationExecutor();
    executor.initVariables({
      agentDataDir: this.store.getAgentDir(agent.id),
      agentId: agent.id,
      agentName: agent.name,
    });
    const result = await executeAutomationGraph({
      nodes: automation.nodes as Parameters<typeof executeAutomationGraph>[0]["nodes"],
      edges: (automation.edges || []) as Parameters<typeof executeAutomationGraph>[0]["edges"],
      executor,
      onNodeStatus: (nodeId: string, status: string, error?: string) => {
        logger.debug("Agent workflow node status", { nodeId, status, error });
      },
      cancelSignal,
      headless: true,
    });

    return result.success ? "Workflow completed successfully" : "Workflow failed";
  }

  private async executeLLMTask(agent: Agent, task: AgentTask): Promise<string> {
    // Build a prompt that tells the LLM about the task and available workflows
    const workflows = listAutomations(defaultStorageFolder);
    const workflowList = workflows
      .map((w) => `- ${w.name} (id: ${w.id}): ${w.description || "No description"}`)
      .join("\n");

    // Load custom instructions if available
    const instructions = this.store.loadInstructions(agent.id);

    const systemPrompt = `You are an AI agent named "${agent.name}" with the role: "${agent.role}".
Your capabilities: ${agent.capabilities.join(", ")}.
You have access to these existing workflows:
${workflowList || "No workflows available."}
${instructions ? `\n--- Agent Instructions ---\n${instructions}\n--- End Instructions ---\n` : ""}

Complete the following task. Respond with a clear summary of what you did or what needs to be done.

Available actions (use EXACTLY one per response):
- EXECUTE_WORKFLOW:<workflow_id> — Run an existing workflow by its ID
- SEND_NOTIFICATION:<title>|<message> — Send a desktop notification to the user

If no action is needed, just respond with a text summary.
Keep your response concise.`;

    const result = await callLLM({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: task.description },
      ],
      provider: agent.model.provider,
      model: agent.model.model,
      credentialId: agent.model.credentialId,
      apiKey: agent.model.apiKey,
      baseUrl: agent.model.baseUrl,
    });

    if (!result.success) {
      throw new Error(result.error || "LLM call failed");
    }

    // Check if the LLM wants to execute an action
    const response = result.response || "";

    // Check for SEND_NOTIFICATION action
    const notifMatch = response.match(/SEND_NOTIFICATION:([^|]+)\|(.+)/s);
    if (notifMatch) {
      const title = notifMatch[1].trim();
      const body = notifMatch[2].trim();
      this.sendDesktopNotification(title, body);
      this.addLog(agent, "info", `Sent desktop notification: ${title}`, task.id);
      return `Notification sent: ${title}`;
    }

    // Check for EXECUTE_WORKFLOW action
    const workflowMatch = response.match(/EXECUTE_WORKFLOW:(\S+)/);
    if (workflowMatch) {
      const wfId = workflowMatch[1];
      this.addLog(agent, "info", `LLM requested workflow execution: ${wfId}`, task.id);
      return this.executeWorkflowTask(agent, wfId, { cancelled: false });
    }

    return response;
  }

  private sendDesktopNotification(title: string, body: string): void {
    try {
      const notification = new Notification({ title, body });
      notification.show();
      logger.info("Desktop notification sent", { title });
    } catch (err) {
      logger.error("Failed to send desktop notification", { error: err });
    }
  }

  getInstructions(agentId: string): string | null {
    return this.store.loadInstructions(agentId);
  }

  saveInstructions(agentId: string, content: string): boolean {
    const agent = this.store.load(agentId);
    if (!agent) return false;
    this.store.saveInstructions(agentId, content);
    return true;
  }

  listFiles(agentId: string): Array<{ name: string; size: number; modifiedAt: string }> {
    return this.store.listFiles(agentId);
  }

  readFile(agentId: string, filename: string): string {
    return this.store.readFile(agentId, filename);
  }

  writeFile(agentId: string, filename: string, content: string): boolean {
    const agent = this.store.load(agentId);
    if (!agent) return false;
    this.store.writeFile(agentId, filename, content);
    return true;
  }

  deleteFile(agentId: string, filename: string): boolean {
    return this.store.deleteFile(agentId, filename);
  }

  getAgentDir(agentId: string): string {
    return this.store.getAgentDir(agentId);
  }

  private generateInstructions(agent: Agent): string {
    const lines: string[] = [];
    lines.push(`========================================`);
    lines.push(`AGENT: ${agent.name}`);
    lines.push(`========================================`);
    lines.push(``);
    lines.push(`Role: ${agent.role}`);
    lines.push(`Description: ${agent.description || "No description provided"}`);
    lines.push(`Created: ${new Date(agent.createdAt).toLocaleString()}`);
    lines.push(`Created By: ${agent.createdBy || "user"}`);
    lines.push(``);
    lines.push(`--- Capabilities ---`);
    for (const cap of agent.capabilities) {
      lines.push(`  - ${cap}`);
    }
    lines.push(``);
    lines.push(`--- Model Configuration ---`);
    lines.push(`  Provider: ${agent.model.provider}`);
    lines.push(`  Model: ${agent.model.model}`);
    lines.push(``);
    if (agent.tasks.length > 0) {
      lines.push(`--- Tasks ---`);
      for (let i = 0; i < agent.tasks.length; i++) {
        const task = agent.tasks[i];
        lines.push(`  ${i + 1}. ${task.description}`);
        if (task.workflowId) {
          lines.push(`     Workflow ID: ${task.workflowId}`);
        }
      }
      lines.push(``);
    }
    if (agent.schedule && agent.schedule.type !== "manual") {
      lines.push(`--- Schedule ---`);
      lines.push(`  Type: ${agent.schedule.type}`);
      if (agent.schedule.type === "interval") {
        lines.push(`  Interval: Every ${agent.schedule.intervalMinutes} minutes`);
      } else if (agent.schedule.type === "cron") {
        lines.push(`  Expression: ${agent.schedule.expression}`);
      } else if (agent.schedule.type === "once") {
        lines.push(`  Run at: ${agent.schedule.datetime}`);
      }
      lines.push(``);
    }
    lines.push(`--- Instructions ---`);
    lines.push(`You are "${agent.name}", an AI agent with the role: "${agent.role}".`);
    lines.push(`Your job is to complete the tasks assigned to you using your capabilities.`);
    lines.push(``);
    lines.push(`Behavior guidelines:`);
    lines.push(`  - Execute each task sequentially and thoroughly`);
    lines.push(`  - Use your assigned workflows to complete tasks`);
    lines.push(`  - Report results clearly and concisely`);
    lines.push(`  - If a task fails, log the error and continue to the next task`);
    if (agent.capabilities.includes("desktop")) {
      lines.push(`  - You have desktop control access (mouse, keyboard, screenshots)`);
    }
    if (agent.capabilities.includes("browser")) {
      lines.push(`  - You have browser automation access (navigate, click, extract, etc.)`);
    }
    if (agent.capabilities.includes("api")) {
      lines.push(`  - You can make API calls to external services`);
    }
    if (agent.capabilities.includes("filesystem")) {
      lines.push(`  - You can read/write files on the local filesystem`);
    }
    lines.push(``);
    lines.push(`========================================`);
    lines.push(`NOTE: You can edit this file to customize the agent's behavior.`);
    lines.push(`Changes will take effect on the next agent run.`);
    lines.push(`========================================`);
    return lines.join("\n");
  }

  private addLog(
    agent: Agent,
    level: AgentLogEntry["level"],
    message: string,
    taskId?: string
  ): void {
    agent.logs.push({
      timestamp: new Date().toISOString(),
      level,
      message,
      taskId,
    });
  }
}
