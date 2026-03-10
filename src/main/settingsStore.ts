import type { AppSettings } from "@app-types/globals";
import fs from "fs";
import path from "path";

let _settingsPath: string | null = null;
function getSettingsPath(): string {
  if (!_settingsPath) {
    // biome-ignore lint/style/noCommonJs: lazy electron import
    const { app } = require("electron");
    _settingsPath = path.join(app.getPath("userData"), "settings.json");
  }
  return _settingsPath;
}

function getDefaultSettings(): AppSettings {
  try {
    // biome-ignore lint/style/noCommonJs: lazy electron import
    const { app } = require("electron");
    return {
      theme: "light",
      enableNotifications: true,
      downloadPath: app.getPath("downloads"),
    };
  } catch {
    return {
      theme: "light",
      enableNotifications: true,
    };
  }
}

/**
 * Load app settings from Electron storage
 */
export const loadSettings = (): AppSettings => {
  const defaults = getDefaultSettings();
  try {
    const sp = getSettingsPath();
    if (fs.existsSync(sp)) {
      const data = fs.readFileSync(sp, "utf-8");
      const settings = JSON.parse(data) as AppSettings;
      return { ...defaults, ...settings };
    }
  } catch (error) {
    console.error("Failed to load settings:", error);
  }
  return defaults;
};

/**
 * Save app settings to Electron storage
 */
export const saveSettings = (settings: AppSettings): boolean => {
  try {
    fs.writeFileSync(getSettingsPath(), JSON.stringify(settings, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error("Failed to save settings:", error);
    return false;
  }
};
