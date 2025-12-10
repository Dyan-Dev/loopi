import { app, session } from "electron";
import fs from "fs";
import path from "path";
import { loadSettings } from "./settingsStore";

/**
 * Setup download handler with current settings
 */
export const setupDownloadHandler = () => {
  const settings = loadSettings();
  const downloadPath = settings.downloadPath || app.getPath("downloads");

  if (!fs.existsSync(downloadPath)) {
    try {
      fs.mkdirSync(downloadPath, { recursive: true });
    } catch (error) {
      console.error("Failed to create download directory:", error);
    }
  }

  const browserSession = session.defaultSession;
  if (browserSession) {
    browserSession.removeAllListeners("will-download");
    browserSession.on("will-download", (_event, item) => {
      const fullPath = path.join(downloadPath, item.getFilename());
      item.setSavePath(fullPath);
    });
  }
};
