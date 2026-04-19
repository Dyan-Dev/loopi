import { app } from "electron";
import fs from "fs";
import path from "path";

interface StoredMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface ChatSession {
  messages: StoredMessage[];
  provider?: string;
  model?: string;
  updatedAt: string;
}

const MAX_MESSAGES = 500;

export class ChatStore {
  private chatPath: string;

  constructor() {
    const userDataPath = app.getPath("userData");
    this.chatPath = path.join(userDataPath, "chat");
    if (!fs.existsSync(this.chatPath)) {
      fs.mkdirSync(this.chatPath, { recursive: true });
    }
  }

  private getFilePath(): string {
    return path.join(this.chatPath, "session.json");
  }

  save(messages: StoredMessage[], provider?: string, model?: string): void {
    const capped = messages.length > MAX_MESSAGES ? messages.slice(-MAX_MESSAGES) : messages;
    const session: ChatSession = {
      messages: capped,
      provider,
      model,
      updatedAt: new Date().toISOString(),
    };
    fs.writeFileSync(this.getFilePath(), JSON.stringify(session, null, 2));
  }

  load(): ChatSession | null {
    const filePath = this.getFilePath();
    if (!fs.existsSync(filePath)) return null;
    try {
      return JSON.parse(fs.readFileSync(filePath, "utf-8"));
    } catch {
      return null;
    }
  }

  clear(): void {
    const filePath = this.getFilePath();
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}
