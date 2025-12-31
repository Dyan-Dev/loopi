/**
 * Schedule Store
 * Manages persistent storage of workflow schedules
 */

import type { ScheduleType } from "@app-types/automation";
import { app } from "electron";
import fs from "fs";
import path from "path";

export interface WorkflowSchedule {
  id: string;
  workflowId: string;
  workflowName: string;
  schedule: ScheduleType;
  enabled: boolean;
  headless?: boolean;
  createdAt: string;
}

export class ScheduleStore {
  private schedulesPath: string;

  constructor() {
    const userDataPath = app.getPath("userData");
    this.schedulesPath = path.join(userDataPath, "schedules");
    this.ensureSchedulesDirectory();
  }

  /**
   * Ensure schedules directory exists
   */
  private ensureSchedulesDirectory(): void {
    if (!fs.existsSync(this.schedulesPath)) {
      fs.mkdirSync(this.schedulesPath, { recursive: true });
    }
  }

  /**
   * Get path for a schedule file
   */
  private getSchedulePath(scheduleId: string): string {
    return path.join(this.schedulesPath, `${scheduleId}.json`);
  }

  /**
   * Save a schedule
   */
  save(schedule: WorkflowSchedule): void {
    const schedulePath = this.getSchedulePath(schedule.id);
    fs.writeFileSync(schedulePath, JSON.stringify(schedule, null, 2));
  }

  /**
   * Load a specific schedule
   */
  load(scheduleId: string): WorkflowSchedule | null {
    const schedulePath = this.getSchedulePath(scheduleId);
    if (!fs.existsSync(schedulePath)) {
      return null;
    }
    const content = fs.readFileSync(schedulePath, "utf-8");
    return JSON.parse(content);
  }

  /**
   * List all schedules
   */
  list(): WorkflowSchedule[] {
    const files = fs.readdirSync(this.schedulesPath);
    const schedules: WorkflowSchedule[] = [];

    for (const file of files) {
      if (file.endsWith(".json")) {
        const content = fs.readFileSync(path.join(this.schedulesPath, file), "utf-8");
        schedules.push(JSON.parse(content));
      }
    }

    return schedules.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  /**
   * Delete a schedule
   */
  delete(scheduleId: string): boolean {
    const schedulePath = this.getSchedulePath(scheduleId);
    if (fs.existsSync(schedulePath)) {
      fs.unlinkSync(schedulePath);
      return true;
    }
    return false;
  }

  /**
   * Update a schedule
   */
  update(scheduleId: string, updates: Partial<WorkflowSchedule>): boolean {
    const schedule = this.load(scheduleId);
    if (!schedule) {
      return false;
    }

    const updated = { ...schedule, ...updates };
    this.save(updated);
    return true;
  }

  /**
   * Get all schedules for a specific workflow
   */
  getByWorkflow(workflowId: string): WorkflowSchedule[] {
    return this.list().filter((s) => s.workflowId === workflowId);
  }

  /**
   * Export schedules path for external use
   */
  getSchedulesPath(): string {
    return this.schedulesPath;
  }
}
