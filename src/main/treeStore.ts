import { app } from "electron";
import fs from "fs";
import path from "path";
import type { StoredAutomation } from "../types";

export const defaultStorageFolder = path.join(app.getPath("userData"), ".trees");

const genFileName = (treeId: string) => `tree_${treeId}.json`;

const checkFolder = (folder: string) => {
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
  }
};

export const listAutomations = (folder: string): Array<StoredAutomation> => {
  checkFolder(folder);

  const files = fs.readdirSync(folder).filter((f) => f.endsWith(".json"));

  return files.map((file) => {
    const fullPath = path.join(folder, file);
    const raw = fs.readFileSync(fullPath, "utf-8");
    const automationTree = JSON.parse(raw) as StoredAutomation;

    return automationTree;
  });
};

export const loadAutomation = (id: string, folder: string): StoredAutomation | null => {
  checkFolder(folder);

  const filePath = path.join(folder, genFileName(id));
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as StoredAutomation;
};

export const saveAutomation = (automation: StoredAutomation, folder: string): string => {
  checkFolder(folder);

  const id = automation.id ?? crypto.randomUUID();
  const filePath = path.join(folder, genFileName(id));

  fs.writeFileSync(filePath, JSON.stringify(automation, null, 2), "utf-8");

  return id;
};
