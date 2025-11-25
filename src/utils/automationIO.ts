import type { Automation } from "../types/types";

/**
 * Export automation to JSON file
 */
export function exportAutomation(automation: Automation): void {
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
export function importAutomation(): Promise<Automation> {
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
          
          // Check if it's an array (export all format)
          if (Array.isArray(data)) {
            reject(new Error("This file contains multiple automations. Please use 'Import All' instead."));
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
          
          resolve(data as Automation);
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

/**
 * Import multiple automations from JSON file
 */
export function importAllAutomations(): Promise<Automation[]> {
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
          
          // Check if it's a single automation
          if (!Array.isArray(data)) {
            reject(new Error("This file contains a single automation. Please use 'Import' instead."));
            return;
          }
          
          // Validate and process each automation
          const automations = data.map((automation: any, index: number) => {
            if (!automation.name || !automation.nodes || !automation.edges) {
              throw new Error(`Invalid automation at index ${index}`);
            }
            
            // Generate new ID and reset status
            return {
              ...automation,
              id: `${Date.now()}_${index}`,
              status: "idle" as const,
              lastRun: undefined,
            };
          });
          
          resolve(automations);
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

/**
 * Export multiple automations
 */
export function exportAllAutomations(automations: Automation[]): void {
  const dataStr = JSON.stringify(automations, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement("a");
  link.href = url;
  link.download = `all_automations_${Date.now()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
