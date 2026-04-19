import type { Agent } from "@app-types/agent";
import { app } from "electron";
import fs from "fs";
import path from "path";

const MAX_LOGS = 100;

export class AgentStore {
  private agentsPath: string;

  constructor() {
    const userDataPath = app.getPath("userData");
    this.agentsPath = path.join(userDataPath, "agents");
    this.ensureDirectory();
  }

  private ensureDirectory(): void {
    if (!fs.existsSync(this.agentsPath)) {
      fs.mkdirSync(this.agentsPath, { recursive: true });
    }
  }

  private getAgentPath(agentId: string): string {
    return path.join(this.agentsPath, `${agentId}.json`);
  }

  private getInstructionsPath(agentId: string): string {
    return path.join(this.agentsPath, `${agentId}.instructions.txt`);
  }

  getAgentDir(agentId: string): string {
    const dir = path.join(this.agentsPath, agentId, "files");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    return dir;
  }

  private resolveAgentFile(agentId: string, filename: string): string {
    const safe = path.basename(filename);
    if (!safe || safe.startsWith(".") || safe.includes(path.sep)) {
      throw new Error(`Invalid filename: ${filename}`);
    }
    return path.join(this.getAgentDir(agentId), safe);
  }

  listFiles(agentId: string): Array<{ name: string; size: number; modifiedAt: string }> {
    const dir = this.getAgentDir(agentId);
    return fs
      .readdirSync(dir)
      .filter((f) => {
        const stat = fs.statSync(path.join(dir, f));
        return stat.isFile();
      })
      .map((name) => {
        const stat = fs.statSync(path.join(dir, name));
        return { name, size: stat.size, modifiedAt: stat.mtime.toISOString() };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  readFile(agentId: string, filename: string): string {
    const filePath = this.resolveAgentFile(agentId, filename);
    if (!fs.existsSync(filePath)) throw new Error(`File not found: ${filename}`);
    return fs.readFileSync(filePath, "utf-8");
  }

  writeFile(agentId: string, filename: string, content: string): void {
    const filePath = this.resolveAgentFile(agentId, filename);
    fs.writeFileSync(filePath, content, "utf-8");
  }

  deleteFile(agentId: string, filename: string): boolean {
    const filePath = this.resolveAgentFile(agentId, filename);
    if (!fs.existsSync(filePath)) return false;
    fs.unlinkSync(filePath);
    return true;
  }

  save(agent: Agent): void {
    // Cap logs before persisting
    if (agent.logs.length > MAX_LOGS) {
      agent.logs = agent.logs.slice(-MAX_LOGS);
    }
    agent.updatedAt = new Date().toISOString();
    fs.writeFileSync(this.getAgentPath(agent.id), JSON.stringify(agent, null, 2));
  }

  load(agentId: string): Agent | null {
    const agentPath = this.getAgentPath(agentId);
    if (!fs.existsSync(agentPath)) return null;
    return JSON.parse(fs.readFileSync(agentPath, "utf-8"));
  }

  list(): Agent[] {
    const files = fs.readdirSync(this.agentsPath);
    const agents: Agent[] = [];
    for (const file of files) {
      if (file.endsWith(".json")) {
        try {
          agents.push(JSON.parse(fs.readFileSync(path.join(this.agentsPath, file), "utf-8")));
        } catch {
          // Skip corrupted files
        }
      }
    }
    return agents.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  delete(agentId: string): boolean {
    const agentPath = this.getAgentPath(agentId);
    if (fs.existsSync(agentPath)) {
      fs.unlinkSync(agentPath);
      const instrPath = this.getInstructionsPath(agentId);
      if (fs.existsSync(instrPath)) {
        fs.unlinkSync(instrPath);
      }
      const agentDir = path.join(this.agentsPath, agentId);
      if (fs.existsSync(agentDir)) {
        fs.rmSync(agentDir, { recursive: true, force: true });
      }
      return true;
    }
    return false;
  }

  saveInstructions(agentId: string, content: string): void {
    fs.writeFileSync(this.getInstructionsPath(agentId), content, "utf-8");
  }

  loadInstructions(agentId: string): string | null {
    const instrPath = this.getInstructionsPath(agentId);
    if (!fs.existsSync(instrPath)) return null;
    return fs.readFileSync(instrPath, "utf-8");
  }

  update(agentId: string, updates: Partial<Agent>): Agent | null {
    const agent = this.load(agentId);
    if (!agent) return null;
    const updated = { ...agent, ...updates };
    this.save(updated);
    return updated;
  }
}
