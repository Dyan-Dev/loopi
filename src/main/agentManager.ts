import type {
  Agent,
  AgentCapability,
  AgentLogEntry,
  AgentModelConfig,
  AgentReflection,
  AgentSchedule,
} from "@app-types/agent";
import type { StoredAutomation } from "@app-types/automation";
import type { Edge, Node } from "@app-types/flow";
import { createLogger } from "@utils/logger";
import { randomUUID } from "crypto";
import { Notification } from "electron";
import { validateModelForAgents } from "./agentModelValidator";
import {
  type NodeOutcome,
  type ReflectionResult,
  type RunSnapshot,
  reflectOnRun,
  toReflectionRecord,
} from "./agentReflector";
import { AgentStore } from "./agentStore";
import { AutomationExecutor } from "./automationExecutor";
import { DesktopScheduler } from "./desktopScheduler";
import { executeAutomationGraph } from "./graphExecutor";
import { defaultStorageFolder, listAutomations, loadAutomation, saveAutomation } from "./treeStore";

const logger = createLogger("AgentManager");

const MAX_REFLECTIONS = 50;

export interface CreateAgentConfig {
  name: string;
  role: string;
  description: string;
  capabilities: AgentCapability[];
  model: AgentModelConfig;
  goal: string;
  workflowIds?: string[];
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
      goal: config.goal,
      workflowIds: config.workflowIds ? Array.from(new Set(config.workflowIds)) : [],
      reflections: [],
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
    this.store.saveInstructions(agent.id, this.generateInstructions(agent));

    logger.info("Agent created", { id: agent.id, name: agent.name, role: agent.role });

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
    this.addLog(agent, "info", `Agent started — goal: ${agent.goal.slice(0, 120)}`);
    this.store.save(agent);

    const cancelSignal = { cancelled: false };
    this.runningAgents.set(agentId, {
      cancel: () => {
        cancelSignal.cancelled = true;
      },
    });

    try {
      if (agent.workflowIds.length === 0) {
        this.addLog(agent, "warn", "Agent has no workflows assigned; nothing to run.");
      }

      for (const workflowId of agent.workflowIds) {
        if (cancelSignal.cancelled) {
          this.addLog(agent, "info", "Agent run cancelled by user");
          break;
        }
        await this.runAndReflect(agent, workflowId, cancelSignal);
        // Persist after each workflow so logs/reflections are visible even mid-run
        this.store.save(agent);
      }

      if (agent.status === "running") {
        agent.status = "idle";
        this.addLog(agent, "info", "Agent run finished");
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

  private async runAndReflect(
    agent: Agent,
    workflowId: string,
    cancelSignal: { cancelled: boolean }
  ): Promise<void> {
    const automation = loadAutomation(workflowId, defaultStorageFolder);
    if (!automation) {
      this.addLog(agent, "error", `Workflow ${workflowId} not found`, workflowId);
      return;
    }

    const snapshot = await this.executeWorkflow(agent, automation, cancelSignal);
    this.addLog(
      agent,
      snapshot.success ? "info" : "warn",
      `Workflow "${automation.name}" finished (success=${snapshot.success}, nodes=${snapshot.nodeOutcomes.length})`,
      workflowId
    );

    if (cancelSignal.cancelled) return;

    let reflection: ReflectionResult;
    try {
      reflection = await reflectOnRun(
        agent,
        {
          id: automation.id,
          name: automation.name,
          nodes: automation.nodes,
          edges: automation.edges || [],
        },
        snapshot
      );
    } catch (err) {
      this.addLog(
        agent,
        "error",
        `Reflection failed: ${err instanceof Error ? err.message : String(err)}`,
        workflowId
      );
      return;
    }

    this.addLog(
      agent,
      reflection.verdict === "fail" ? "error" : "info",
      `Reflection [${reflection.verdict}]: ${reflection.reason}`,
      workflowId
    );

    let patchApplied = false;
    let rolledBack = false;
    if (reflection.verdict === "modify" && reflection.patch) {
      const applied = this.applyPatch(agent, automation, reflection.patch);
      patchApplied = applied.applied;
      rolledBack = applied.rolledBack;
    }

    this.recordReflection(
      agent,
      toReflectionRecord(snapshot, reflection, patchApplied, rolledBack)
    );
  }

  private applyPatch(
    agent: Agent,
    automation: StoredAutomation,
    patch: { nodes: Node[]; edges: Edge[] }
  ): { applied: boolean; rolledBack: boolean } {
    const backup: StoredAutomation = {
      ...automation,
      nodes: automation.nodes,
      edges: automation.edges || [],
    };
    try {
      const patched: StoredAutomation = {
        ...automation,
        nodes: patch.nodes,
        edges: patch.edges,
        updatedAt: new Date().toISOString(),
      };
      saveAutomation(patched, defaultStorageFolder);
      this.addLog(
        agent,
        "info",
        `Auto-applied workflow patch to "${automation.name}" (nodes: ${patch.nodes.length}, edges: ${patch.edges.length})`,
        automation.id
      );
      return { applied: true, rolledBack: false };
    } catch (err) {
      logger.error("Failed to apply workflow patch, rolling back", { agentId: agent.id, err });
      try {
        saveAutomation(backup, defaultStorageFolder);
      } catch (rollbackErr) {
        logger.error("Rollback also failed", { agentId: agent.id, rollbackErr });
      }
      this.addLog(
        agent,
        "error",
        `Patch failed and was rolled back: ${err instanceof Error ? err.message : String(err)}`,
        automation.id
      );
      return { applied: false, rolledBack: true };
    }
  }

  private async executeWorkflow(
    agent: Agent,
    automation: StoredAutomation,
    cancelSignal: { cancelled: boolean }
  ): Promise<RunSnapshot> {
    const executor = new AutomationExecutor();
    executor.initVariables({
      agentDataDir: this.store.getAgentDir(agent.id),
      agentId: agent.id,
      agentName: agent.name,
    });

    const outcomes: NodeOutcome[] = [];
    const nodeTypeById = new Map<string, string>();
    for (const node of automation.nodes) {
      const stepType = (node.data as { step?: { type?: string } })?.step?.type || "unknown";
      nodeTypeById.set(node.id, stepType);
    }

    const startedAt = Date.now();
    let success = false;
    try {
      const result = await executeAutomationGraph({
        nodes: automation.nodes,
        edges: (automation.edges || []) as Edge[],
        executor,
        onNodeStatus: (nodeId, status, error) => {
          if (status === "running") return;
          outcomes.push({
            nodeId,
            stepType: nodeTypeById.get(nodeId) || "unknown",
            status: status as "success" | "error",
            error,
          });
        },
        cancelSignal,
        headless: true,
      });
      success = result.success;
    } catch (err) {
      this.addLog(
        agent,
        "error",
        `Workflow execution threw: ${err instanceof Error ? err.message : String(err)}`,
        automation.id
      );
    }

    return {
      workflowId: automation.id,
      workflowName: automation.name,
      success,
      nodeOutcomes: outcomes,
      finalVariables: executor.getVariables(),
      durationMs: Date.now() - startedAt,
    };
  }

  private recordReflection(agent: Agent, reflection: AgentReflection): void {
    agent.reflections.push(reflection);
    if (agent.reflections.length > MAX_REFLECTIONS) {
      agent.reflections = agent.reflections.slice(-MAX_REFLECTIONS);
    }
  }

  async stopAgent(agentId: string): Promise<Agent> {
    const running = this.runningAgents.get(agentId);
    if (running) {
      running.cancel();
      this.runningAgents.delete(agentId);
    }

    const agent = this.store.load(agentId);
    if (!agent) throw new Error(`Agent ${agentId} not found`);

    agent.status = "idle";
    this.addLog(agent, "info", "Agent stopped by user");
    this.store.save(agent);
    return agent;
  }

  async deleteAgent(agentId: string): Promise<boolean> {
    const running = this.runningAgents.get(agentId);
    if (running) {
      running.cancel();
      this.runningAgents.delete(agentId);
    }
    this.scheduler.unscheduleAutomation(agentId);
    return this.store.delete(agentId);
  }

  getAgent(agentId: string): Agent | null {
    return this.store.load(agentId);
  }

  listAgents(): Agent[] {
    return this.store.list();
  }

  addWorkflow(agentId: string, workflowId: string): Agent {
    const agent = this.store.load(agentId);
    if (!agent) throw new Error(`Agent ${agentId} not found`);
    if (!agent.workflowIds.includes(workflowId)) {
      agent.workflowIds.push(workflowId);
      this.store.save(agent);
    }
    return agent;
  }

  removeWorkflow(agentId: string, workflowId: string): Agent {
    const agent = this.store.load(agentId);
    if (!agent) throw new Error(`Agent ${agentId} not found`);
    agent.workflowIds = agent.workflowIds.filter((id) => id !== workflowId);
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

  getAgentReflections(agentId: string): AgentReflection[] {
    const agent = this.store.load(agentId);
    return agent?.reflections || [];
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
        if (this.runningAgents.has(agentId)) {
          logger.warn("Skipping scheduled run — previous run still active", { agentId });
          return;
        }
        this.resetAgentForScheduledRun(agentId);
        await this.startAgent(agentId);
      } catch (err) {
        logger.error("Scheduled agent execution failed", { agentId, error: err });
      }
    });
    logger.info("Agent scheduled", { agentId, schedule });
  }

  private resetAgentForScheduledRun(agentId: string): void {
    const agent = this.store.load(agentId);
    if (!agent) return;
    agent.status = "idle";
    this.store.save(agent);
  }

  async loadAndActivateScheduledAgents(): Promise<void> {
    const agents = this.store.list();
    let activated = 0;
    for (const agent of agents) {
      if (agent.status === "running") {
        agent.status = "idle";
        this.store.save(agent);
      }
      if (agent.schedule && agent.schedule.type !== "manual") {
        this.scheduleAgent(agent.id, agent.schedule);
        activated++;
      }
    }
    logger.info(`Activated ${activated} agent schedules`);
  }

  sendDesktopNotification(title: string, body: string): void {
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
    lines.push(`--- Goal ---`);
    lines.push(agent.goal || "(no goal defined)");
    lines.push(``);
    lines.push(`--- Capabilities ---`);
    for (const cap of agent.capabilities) {
      lines.push(`  - ${cap}`);
    }
    lines.push(``);
    lines.push(`--- Model ---`);
    lines.push(`  Provider: ${agent.model.provider}`);
    lines.push(`  Model: ${agent.model.model}`);
    lines.push(``);
    if (agent.workflowIds.length > 0) {
      lines.push(`--- Assigned Workflows ---`);
      for (const id of agent.workflowIds) {
        lines.push(`  - ${id}`);
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
    lines.push(`--- Behaviour ---`);
    lines.push(`After each workflow run, the reflection engine checks whether progress was made`);
    lines.push(`toward the goal and auto-applies patches to the workflow graph when needed.`);
    lines.push(`========================================`);
    return lines.join("\n");
  }

  private addLog(
    agent: Agent,
    level: AgentLogEntry["level"],
    message: string,
    workflowId?: string
  ): void {
    agent.logs.push({
      timestamp: new Date().toISOString(),
      level,
      message,
      workflowId,
    });
  }
}
