import { StoredAutomation } from "../types";

/**
 * Export automation to JSON file
 */
export function exportAutomation(automation: StoredAutomation): void {
  const dataStr = JSON.stringify(automation, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(dataBlob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `${automation.name.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_${Date.now()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Import automation from JSON file
 */
export function importAutomation(): Promise<StoredAutomation> {
  return new Promise((resolve, reject) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json,application/json";

    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) {
        reject(new Error("No file selected"));
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          if (!Object.hasOwn(data, "updatedAt")) {
            data["updatedAt"] = new Date().toLocaleString();
          }

          // Check if it's an array (export all format)
          if (Array.isArray(data)) {
            reject(
              new Error("This file contains multiple automations. Please use 'Import All' instead.")
            );
            return;
          }

          // Validate basic structure for single automation
          if (!data.name || !data.nodes || !data.edges) {
            throw new Error("Invalid automation file format");
          }

          // Generate new ID and reset status
          data.id = Date.now().toString();
          data.status = "idle";
          delete data.lastRun;

          resolve(data as StoredAutomation);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsText(file);
    };

    input.click();
  });
}
