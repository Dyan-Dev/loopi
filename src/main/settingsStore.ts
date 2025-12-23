import type { AppSettings } from "@app-types/globals";
import { app } from "electron";
import fs from "fs";
import path from "path";

const defaultSettings: AppSettings = {
  theme: "light",
  enableNotifications: true,
  downloadPath: app.getPath("downloads"),
};

const settingsPath = path.join(app.getPath("userData"), "settings.json");

/**
 * Load app settings from Electron storage
 */
export const loadSettings = (): AppSettings => {
  try {
    if (fs.existsSync(settingsPath)) {
      const data = fs.readFileSync(settingsPath, "utf-8");
      const settings = JSON.parse(data) as AppSettings;
      return { ...defaultSettings, ...settings };
    }
  } catch (error) {
    console.error("Failed to load settings:", error);
  }
  return defaultSettings;
};

/**
 * Save app settings to Electron storage
 */
export const saveSettings = (settings: AppSettings): boolean => {
  try {
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error("Failed to save settings:", error);
    return false;
  }
};
