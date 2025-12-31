import type { StoredAutomation } from "@app-types";
import { createLogger } from "@utils/logger";
import { app } from "electron";
import fs from "fs";
import path from "path";

const logger = createLogger("TreeStore");

export const defaultStorageFolder = path.join(app.getPath("userData"), ".trees");
const examplesStorageFolder = path.join(app.getPath("userData"), ".examples");

const genFileName = (treeId: string) => `tree_${treeId}.json`;

const checkFolder = (folder: string) => {
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
  }
};

/**
 * Initialize example automations from docs/examples to app storage on first run
 * This ensures examples are available in the bundled app
 */
export const initializeExamples = (): void => {
  checkFolder(examplesStorageFolder);

  try {
    const possiblePaths = [
      path.join(process.cwd(), "docs", "examples"),
      path.join(app.getAppPath(), "docs", "examples"),
      path.join(app.getAppPath(), "..", "..", "docs", "examples"),
    ];

    let examplesSourcePath: string | null = null;
    for (const possiblePath of possiblePaths) {
      if (fs.existsSync(possiblePath)) {
        examplesSourcePath = possiblePath;
        break;
      }
    }

    if (!examplesSourcePath) {
      logger.warn("No examples source folder found");
      return;
    }

    const files = fs.readdirSync(examplesSourcePath).filter((f) => f.endsWith(".json"));

    for (const file of files) {
      const sourcePath = path.join(examplesSourcePath, file);
      const destPath = path.join(examplesStorageFolder, file);

      const content = fs.readFileSync(sourcePath, "utf-8");
      fs.writeFileSync(destPath, content, "utf-8");
    }
  } catch (error) {
    console.error("Failed to initialize examples:", error);
  }
};

/**
 * Load an example automation by fileName from the examples storage folder
 */
export const loadExample = (fileName: string): StoredAutomation => {
  checkFolder(examplesStorageFolder);
  const examplePath = path.join(examplesStorageFolder, fileName);

  if (!fs.existsSync(examplePath)) {
    throw new Error(`Example file not found: ${fileName}`);
  }

  const data = fs.readFileSync(examplePath, "utf-8");
  return JSON.parse(data) as StoredAutomation;
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

export const deleteAutomation = (id: string, folder: string): boolean => {
  checkFolder(folder);

  const filePath = path.join(folder, genFileName(id));
  if (!fs.existsSync(filePath)) return false;

  fs.unlinkSync(filePath);
  return true;
};
