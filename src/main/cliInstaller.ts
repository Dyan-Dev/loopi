import { app } from "electron";
import fs from "fs";
import path from "path";

/**
 * Installs the `loopi-cli` command by creating a wrapper script that invokes
 * the bundled loopi-cli.js. Targets /usr/local/bin, ~/.local/bin, or %LOCALAPPDATA%.
 */

function getCliJsPath(): string | null {
  const resourcePath = path.join(process.resourcesPath, "loopi-cli.js");
  if (fs.existsSync(resourcePath)) return resourcePath;

  const devPath = path.join(app.getAppPath(), "..", "..", "dist", "loopi-cli.js");
  if (fs.existsSync(devPath)) return devPath;

  return null;
}

function getInstallPath(): string {
  const systemBin = "/usr/local/bin/loopi-cli";
  const userBin = path.join(
    process.env.HOME || process.env.USERPROFILE || "",
    ".local",
    "bin",
    "loopi-cli"
  );

  if (process.platform === "win32") {
    return path.join(
      process.env.LOCALAPPDATA || path.join(process.env.USERPROFILE || "", "AppData", "Local"),
      "Loopi",
      "loopi-cli.cmd"
    );
  }

  try {
    fs.accessSync("/usr/local/bin", fs.constants.W_OK);
    return systemBin;
  } catch {
    return userBin;
  }
}

export function installCli(): void {
  const cliJsPath = getCliJsPath();
  if (!cliJsPath) {
    console.log("[CLI Installer] loopi-cli.js not found, skipping CLI install");
    return;
  }

  const installPath = getInstallPath();

  try {
    fs.mkdirSync(path.dirname(installPath), { recursive: true });

    if (process.platform === "win32") {
      fs.writeFileSync(installPath, `@echo off\r\nnode "${cliJsPath}" %*\r\n`, "utf-8");
    } else {
      const script = `#!/usr/bin/env node\nrequire("${cliJsPath.replace(/\\/g, "/")}");\n`;
      fs.writeFileSync(installPath, script, { mode: 0o755 });
    }

    console.log(`[CLI Installer] Installed CLI at ${installPath}`);
  } catch (err) {
    console.log(`[CLI Installer] Could not install CLI at ${installPath}:`, err);
  }
}

export function uninstallCli(): void {
  const installPath = getInstallPath();
  try {
    if (fs.existsSync(installPath)) {
      fs.unlinkSync(installPath);
      console.log(`[CLI Installer] Removed CLI from ${installPath}`);
    }
  } catch (err) {
    console.log(`[CLI Installer] Could not remove CLI from ${installPath}:`, err);
  }
}
