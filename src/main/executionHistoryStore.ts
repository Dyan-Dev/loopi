import type { ExecutionRecord } from "@app-types/automation";
import fs from "fs";
import path from "path";

const MAX_RECORDS_PER_AUTOMATION = 50;

export class ExecutionHistoryStore {
  private _storagePath: string | null = null;

  private get storagePath(): string {
    if (!this._storagePath) {
      // biome-ignore lint/style/noCommonJs: lazy electron import
      const { app } = require("electron");
      this._storagePath = path.join(app.getPath("userData"), "execution-history");
      this.ensureDirectory();
    }
    return this._storagePath;
  }

  private ensureDirectory(): void {
    if (!fs.existsSync(this.storagePath)) {
      fs.mkdirSync(this.storagePath, { recursive: true });
    }
  }

  private getFilePath(automationId: string): string {
    return path.join(this.storagePath, `history_${automationId}.json`);
  }

  private readRecords(automationId: string): ExecutionRecord[] {
    const filePath = this.getFilePath(automationId);
    if (!fs.existsSync(filePath)) return [];
    try {
      const raw = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(raw) as ExecutionRecord[];
    } catch {
      return [];
    }
  }

  private writeRecords(automationId: string, records: ExecutionRecord[]): void {
    const filePath = this.getFilePath(automationId);
    fs.writeFileSync(filePath, JSON.stringify(records, null, 2), "utf-8");
  }

  save(record: ExecutionRecord): void {
    const records = this.readRecords(record.automationId);
    records.unshift(record);
    // Keep only the most recent entries
    const trimmed = records.slice(0, MAX_RECORDS_PER_AUTOMATION);
    this.writeRecords(record.automationId, trimmed);
  }

  getByAutomation(automationId: string): ExecutionRecord[] {
    return this.readRecords(automationId);
  }

  getAll(): ExecutionRecord[] {
    this.ensureDirectory();
    const files = fs.readdirSync(this.storagePath).filter((f) => f.endsWith(".json"));
    const all: ExecutionRecord[] = [];
    for (const file of files) {
      try {
        const raw = fs.readFileSync(path.join(this.storagePath, file), "utf-8");
        const records = JSON.parse(raw) as ExecutionRecord[];
        all.push(...records);
      } catch {
        // skip corrupt files
      }
    }
    return all.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  deleteByAutomation(automationId: string): boolean {
    const filePath = this.getFilePath(automationId);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  }

  deleteRecord(automationId: string, recordId: string): boolean {
    const records = this.readRecords(automationId);
    const filtered = records.filter((r) => r.id !== recordId);
    if (filtered.length === records.length) return false;
    this.writeRecords(automationId, filtered);
    return true;
  }

  clearAll(): void {
    this.ensureDirectory();
    const files = fs.readdirSync(this.storagePath).filter((f) => f.endsWith(".json"));
    for (const file of files) {
      fs.unlinkSync(path.join(this.storagePath, file));
    }
  }
}
