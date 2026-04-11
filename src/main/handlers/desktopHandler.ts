import { debugLogger } from "@main/debugLogger";
import type { Key } from "@nut-tree-fork/nut-js";
import { exec, execSync } from "child_process";
import { writeFileSync } from "fs";
import { resolve } from "path";

/**
 * On macOS, nut-js needs Accessibility permissions to control the cursor/keyboard.
 * This check runs once per session and logs a warning if permissions are missing.
 */
let accessibilityChecked = false;
async function checkMacOSAccessibility(): Promise<void> {
  if (accessibilityChecked || process.platform !== "darwin") return;
  accessibilityChecked = true;
  try {
    const { systemPreferences } = await import("electron");
    const trusted = systemPreferences.isTrustedAccessibilityClient(false);
    if (!trusted) {
      debugLogger.warn(
        "DesktopHandler",
        "macOS Accessibility permission not granted. Desktop control steps may fail. " +
          "Grant access in System Settings > Privacy & Security > Accessibility."
      );
    }
  } catch {
    // Not running in Electron context (e.g. tests) — skip
  }
}

// --- Wayland detection & ydotool helpers ---

let isWayland: boolean | null = null;
let hasYdotool: boolean | null = null;

function detectWayland(): boolean {
  if (isWayland !== null) return isWayland;
  isWayland =
    process.platform === "linux" &&
    (process.env.XDG_SESSION_TYPE === "wayland" || !!process.env.WAYLAND_DISPLAY);
  return isWayland;
}

function checkYdotool(): boolean {
  if (hasYdotool !== null) return hasYdotool;
  try {
    execSync("which ydotool", { stdio: "ignore" });
    hasYdotool = true;
  } catch {
    hasYdotool = false;
  }
  if (detectWayland() && !hasYdotool) {
    debugLogger.warn(
      "DesktopHandler",
      "Wayland detected but ydotool not found. Mouse/keyboard control may not work visually. " +
        "Install with: sudo apt install ydotool"
    );
  }
  return hasYdotool;
}

/** Detect ydotool version: v0.x uses "mousemove X Y", v1.x uses "mousemove --absolute -x X -y Y" */
let ydotoolVersion: "v0" | "v1" | null = null;
function getYdotoolVersion(): "v0" | "v1" {
  if (ydotoolVersion) return ydotoolVersion;
  try {
    const help = execSync("ydotool mousemove --help 2>&1", { timeout: 3000 }).toString();
    // v1.x has "--absolute" flag, v0.x just has "<x> <y>"
    ydotoolVersion = help.includes("--absolute") ? "v1" : "v0";
  } catch {
    ydotoolVersion = "v0";
  }
  debugLogger.debug("DesktopHandler", `ydotool version detected: ${ydotoolVersion}`);
  return ydotoolVersion;
}

/** Check if ydotool can run without root, or needs pkexec */
let ydotoolPrefix: string | null = null;
function getYdotoolPrefix(): string {
  if (ydotoolPrefix !== null) return ydotoolPrefix;
  try {
    // Try running without elevation first
    execSync("ydotool mousemove -- 0 0", { timeout: 3000, stdio: "ignore" });
    ydotoolPrefix = "";
  } catch {
    // Needs elevation — use pkexec for GUI auth
    ydotoolPrefix = "pkexec ";
    debugLogger.debug("DesktopHandler", "ydotool requires elevation, using pkexec");
  }
  return ydotoolPrefix;
}

function useYdotool(): boolean {
  return detectWayland() && checkYdotool();
}

function ydotoolExec(cmd: string): Promise<void> {
  const prefix = getYdotoolPrefix();
  const fullCmd = `${prefix}ydotool ${cmd}`;
  return new Promise((res, rej) => {
    exec(fullCmd, { timeout: 10_000 }, (err, _stdout, stderr) => {
      // ydotool v0.1.8 prints "ydotoold backend unavailable" as a notice, not an error
      if (err && !stderr.includes("ydotoold backend unavailable")) {
        rej(new Error(`ydotool failed: ${stderr.trim() || err.message}`));
      } else {
        res();
      }
    });
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/** Move cursor to absolute X,Y — handles both v0 (relative) and v1 (--absolute) */
async function ydotoolMoveTo(x: number, y: number): Promise<void> {
  if (getYdotoolVersion() === "v1") {
    await ydotoolExec(`mousemove --absolute -x ${x} -y ${y}`);
  } else {
    // v0.1.8 only has relative movement: move to 0,0 first then to target
    await ydotoolExec(`mousemove -- -20000 -20000`);
    await sleep(50);
    await ydotoolExec(`mousemove ${x} ${y}`);
  }
}

/** Map nut-js key names to ydotool v0.1.8 key names (used in hotkey combos) */
function ydotoolV0KeyName(name: string): string {
  const map: Record<string, string> = {
    LeftControl: "ctrl",
    RightControl: "ctrl",
    LeftShift: "shift",
    RightShift: "shift",
    LeftAlt: "alt",
    RightAlt: "alt",
    LeftSuper: "super",
    RightSuper: "super",
    Return: "Return",
    Enter: "Return",
    Escape: "Escape",
    Tab: "Tab",
    Space: "space",
    Backspace: "BackSpace",
    Delete: "Delete",
    Up: "Up",
    Down: "Down",
    Left: "Left",
    Right: "Right",
  };
  return map[name] || name.toLowerCase();
}

// --- Lazy-loaded nut-js references (used on X11, macOS, Windows) ---

let nutMouse: typeof import("@nut-tree-fork/nut-js").mouse | null = null;
let nutKeyboard: typeof import("@nut-tree-fork/nut-js").keyboard | null = null;
let nutScreen: typeof import("@nut-tree-fork/nut-js").screen | null = null;
let NutPoint: typeof import("@nut-tree-fork/nut-js").Point | null = null;
let NutButton: typeof import("@nut-tree-fork/nut-js").Button | null = null;
let NutKey: typeof import("@nut-tree-fork/nut-js").Key | null = null;
let NutRegion: typeof import("@nut-tree-fork/nut-js").Region | null = null;
let nutSaveImage: typeof import("@nut-tree-fork/nut-js").saveImage | null = null;
let nutStraightTo: typeof import("@nut-tree-fork/nut-js").straightTo | null = null;

async function loadNut() {
  if (nutMouse) return;
  const nut = await import("@nut-tree-fork/nut-js");
  nutMouse = nut.mouse;
  nutKeyboard = nut.keyboard;
  nutScreen = nut.screen;
  NutPoint = nut.Point;
  NutButton = nut.Button;
  NutKey = nut.Key;
  NutRegion = nut.Region;
  nutStraightTo = nut.straightTo;
  nutSaveImage = nut.saveImage;
}

export class DesktopHandler {
  private async ensureReady() {
    await loadNut();
    await checkMacOSAccessibility();
  }

  async executeMouseMove(
    step: { x: string; y: string; speed?: string },
    substituteVariables: (input?: string) => string
  ): Promise<void> {
    await this.ensureReady();
    const x = Number(substituteVariables(step.x));
    const y = Number(substituteVariables(step.y));

    debugLogger.debug("DesktopMouseMove", "Moving cursor", { x, y });

    if (useYdotool()) {
      await ydotoolMoveTo(x, y);
    } else {
      nutMouse!.config.mouseSpeed = step.speed ? Number(substituteVariables(step.speed)) : 1000;
      await nutMouse!.move(nutStraightTo!(new NutPoint!(x, y)));
    }
  }

  async executeMouseClick(
    step: { x?: string; y?: string; button?: string; clickType?: string },
    substituteVariables: (input?: string) => string
  ): Promise<void> {
    await this.ensureReady();

    if (useYdotool()) {
      if (step.x && step.y) {
        const x = Number(substituteVariables(step.x));
        const y = Number(substituteVariables(step.y));
        await ydotoolMoveTo(x, y);
        await sleep(50);
      }
      const v = getYdotoolVersion();
      const btnV0: Record<string, string> = { left: "1", right: "2", middle: "3" };
      const btnV1: Record<string, string> = { left: "0xC0", right: "0xC1", middle: "0xC2" };
      const btn =
        v === "v0" ? btnV0[step.button || "left"] || "1" : btnV1[step.button || "left"] || "0xC0";
      if (step.clickType === "double") {
        await ydotoolExec(`click ${btn}`);
        await sleep(50);
        await ydotoolExec(`click ${btn}`);
      } else {
        await ydotoolExec(`click ${btn}`);
      }
    } else {
      if (step.x && step.y) {
        const x = Number(substituteVariables(step.x));
        const y = Number(substituteVariables(step.y));
        nutMouse!.config.mouseSpeed = 1500;
        await nutMouse!.move(nutStraightTo!(new NutPoint!(x, y)));
      }
      const button =
        step.button === "right"
          ? NutButton!.RIGHT
          : step.button === "middle"
            ? NutButton!.MIDDLE
            : NutButton!.LEFT;

      debugLogger.debug("DesktopMouseClick", "Clicking", {
        button: step.button || "left",
        clickType: step.clickType || "single",
      });

      if (step.clickType === "double") {
        await nutMouse!.doubleClick(button);
      } else {
        await nutMouse!.click(button);
      }
    }
  }

  async executeMouseDrag(
    step: { startX: string; startY: string; endX: string; endY: string; speed?: string },
    substituteVariables: (input?: string) => string
  ): Promise<void> {
    await this.ensureReady();
    const startX = Number(substituteVariables(step.startX));
    const startY = Number(substituteVariables(step.startY));
    const endX = Number(substituteVariables(step.endX));
    const endY = Number(substituteVariables(step.endY));

    debugLogger.debug("DesktopMouseDrag", "Dragging", { startX, startY, endX, endY });

    if (useYdotool()) {
      await ydotoolMoveTo(startX, startY);
      await sleep(50);
      // For drag: v0 doesn't support button down/up separately,
      // so we use nut-js for the actual drag even on Wayland
      nutMouse!.config.mouseSpeed = step.speed ? Number(substituteVariables(step.speed)) : 800;
      await nutMouse!.move(nutStraightTo!(new NutPoint!(startX, startY)));
      await nutMouse!.pressButton(NutButton!.LEFT);
      await nutMouse!.move(nutStraightTo!(new NutPoint!(endX, endY)));
      await nutMouse!.releaseButton(NutButton!.LEFT);
    } else {
      nutMouse!.config.mouseSpeed = step.speed ? Number(substituteVariables(step.speed)) : 800;
      await nutMouse!.move(nutStraightTo!(new NutPoint!(startX, startY)));
      await nutMouse!.pressButton(NutButton!.LEFT);
      await nutMouse!.move(nutStraightTo!(new NutPoint!(endX, endY)));
      await nutMouse!.releaseButton(NutButton!.LEFT);
    }
  }

  async executeMouseScroll(
    step: { direction: string; amount: string },
    substituteVariables: (input?: string) => string
  ): Promise<void> {
    await this.ensureReady();
    const amount = Number(substituteVariables(step.amount));

    debugLogger.debug("DesktopMouseScroll", "Scrolling", {
      direction: step.direction,
      amount,
    });

    if (useYdotool()) {
      // nut-js scroll works even on Wayland for scroll events
      switch (step.direction) {
        case "up":
          await nutMouse!.scrollUp(amount);
          break;
        case "down":
          await nutMouse!.scrollDown(amount);
          break;
        case "left":
          await nutMouse!.scrollLeft(amount);
          break;
        case "right":
          await nutMouse!.scrollRight(amount);
          break;
      }
    } else {
      switch (step.direction) {
        case "up":
          await nutMouse!.scrollUp(amount);
          break;
        case "down":
          await nutMouse!.scrollDown(amount);
          break;
        case "left":
          await nutMouse!.scrollLeft(amount);
          break;
        case "right":
          await nutMouse!.scrollRight(amount);
          break;
      }
    }
  }

  async executeDesktopScreenshot(
    step: {
      savePath?: string;
      storeKey?: string;
      regionX?: string;
      regionY?: string;
      regionWidth?: string;
      regionHeight?: string;
    },
    substituteVariables: (input?: string) => string,
    variables: Record<string, unknown>
  ): Promise<string> {
    await this.ensureReady();

    const savePath = step.savePath
      ? resolve(substituteVariables(step.savePath))
      : resolve(`desktop-screenshot-${Date.now()}.png`);

    const hasRegion = step.regionX && step.regionY && step.regionWidth && step.regionHeight;

    debugLogger.debug("DesktopScreenshot", "Capturing screen", {
      savePath,
      hasRegion: !!hasRegion,
    });

    // Strategy 1: nut-js (works on X11, macOS, Windows)
    try {
      let region: InstanceType<NonNullable<typeof NutRegion>> | undefined;
      if (hasRegion) {
        const rx = Number(substituteVariables(step.regionX!));
        const ry = Number(substituteVariables(step.regionY!));
        const rw = Number(substituteVariables(step.regionWidth!));
        const rh = Number(substituteVariables(step.regionHeight!));
        region = new NutRegion!(rx, ry, rw, rh);
      }
      const image = region ? await nutScreen!.grabRegion(region) : await nutScreen!.grab();
      await nutSaveImage!({ image, path: savePath });
      debugLogger.debug("DesktopScreenshot", "Saved via nut-js", { savePath });
      if (step.storeKey) variables[step.storeKey] = savePath;
      return savePath;
    } catch (nutErr) {
      debugLogger.debug(
        "DesktopScreenshot",
        "nut-js grab failed, trying Electron desktopCapturer",
        {
          error: (nutErr as Error).message,
        }
      );
    }

    // Strategy 2: Electron desktopCapturer (works on Wayland via PipeWire)
    try {
      const { desktopCapturer } = await import("electron");
      const sources = await desktopCapturer.getSources({
        types: ["screen"],
        thumbnailSize: { width: 3840, height: 2160 },
      });
      if (sources.length > 0) {
        let png = sources[0].thumbnail.toPNG();
        if (hasRegion) {
          const rx = Number(substituteVariables(step.regionX!));
          const ry = Number(substituteVariables(step.regionY!));
          const rw = Number(substituteVariables(step.regionWidth!));
          const rh = Number(substituteVariables(step.regionHeight!));
          const cropped = sources[0].thumbnail.crop({ x: rx, y: ry, width: rw, height: rh });
          png = cropped.toPNG();
        }
        writeFileSync(savePath, png);
        debugLogger.debug("DesktopScreenshot", "Saved via Electron desktopCapturer", { savePath });
        if (step.storeKey) variables[step.storeKey] = savePath;
        return savePath;
      }
    } catch (electronErr) {
      debugLogger.debug(
        "DesktopScreenshot",
        "Electron desktopCapturer failed, trying shell fallback",
        {
          error: (electronErr as Error).message,
        }
      );
    }

    // Strategy 3: Shell fallback (gnome-screenshot, scrot, grim, import)
    const shellResult = await this.shellScreenshot(savePath);
    if (shellResult) {
      debugLogger.debug("DesktopScreenshot", "Saved via shell fallback", { savePath });
      if (step.storeKey) variables[step.storeKey] = savePath;
      return savePath;
    }

    throw new Error(
      "Failed to capture screen: nut-js, Electron desktopCapturer, and shell tools all failed. " +
        "On Linux/Wayland, install one of: gnome-screenshot, scrot, grim, or flameshot."
    );
  }

  private shellScreenshot(savePath: string): Promise<boolean> {
    const commands = [
      `gnome-screenshot -f "${savePath}"`,
      `scrot "${savePath}"`,
      `grim "${savePath}"`,
      `flameshot full -p "${savePath}"`,
      `import -window root "${savePath}"`,
    ];
    return new Promise((resolveP) => {
      const tryNext = (i: number) => {
        if (i >= commands.length) return resolveP(false);
        exec(commands[i], { timeout: 10_000 }, (err) => {
          if (!err) return resolveP(true);
          tryNext(i + 1);
        });
      };
      tryNext(0);
    });
  }

  async executeKeyboard(
    step: { action: string; text?: string; key?: string; keys?: string },
    substituteVariables: (input?: string) => string
  ): Promise<void> {
    await this.ensureReady();

    debugLogger.debug("DesktopKeyboard", "Executing", {
      action: step.action,
      text: step.text,
      key: step.key,
    });

    if (useYdotool()) {
      switch (step.action) {
        case "type": {
          const text = substituteVariables(step.text);
          // v0.1.8: ydotool type <text>, v1.x: ydotool type --clearmodifiers -- <text>
          const escaped = text.replace(/"/g, '\\"');
          if (getYdotoolVersion() === "v0") {
            await ydotoolExec(`type "${escaped}"`);
          } else {
            await ydotoolExec(`type --clearmodifiers -- "${escaped}"`);
          }
          break;
        }
        case "press": {
          const keyName = substituteVariables(step.key);
          // v0.1.8: ydotool key <keyname>, e.g. "ydotool key Escape"
          // v1.x: ydotool key <code:down> <code:up>
          if (getYdotoolVersion() === "v0") {
            await ydotoolExec(`key ${keyName}`);
          } else {
            const keyCode = ydotoolKeyMap(keyName!);
            await ydotoolExec(`key ${keyCode}`);
          }
          break;
        }
        case "hotkey": {
          const keyNames = substituteVariables(step.keys)
            ?.split("+")
            .map((k) => k.trim());
          if (!keyNames?.length) throw new Error("No keys specified for hotkey");
          // v0.1.8: ydotool key ctrl+a (modifier+key syntax)
          // v1.x: ydotool key <code1> <code2>
          if (getYdotoolVersion() === "v0") {
            // Map nut-js key names to ydotool v0 names
            const v0Names = keyNames.map((n) => ydotoolV0KeyName(n));
            await ydotoolExec(`key ${v0Names.join("+")}`);
          } else {
            const codes = keyNames.map((name) => ydotoolKeyMap(name));
            await ydotoolExec(`key ${codes.join(" ")}`);
          }
          break;
        }
      }
    } else {
      switch (step.action) {
        case "type": {
          const text = substituteVariables(step.text);
          await nutKeyboard!.type(text);
          break;
        }
        case "press": {
          const keyName = substituteVariables(step.key) as keyof typeof NutKey;
          const key = NutKey![keyName] as unknown as Key;
          if (key !== undefined) {
            await nutKeyboard!.pressKey(key);
            await nutKeyboard!.releaseKey(key);
          } else {
            throw new Error(`Unknown key: ${keyName}`);
          }
          break;
        }
        case "hotkey": {
          const keyNames = substituteVariables(step.keys)
            ?.split("+")
            .map((k) => k.trim());
          if (!keyNames?.length) throw new Error("No keys specified for hotkey");
          const resolvedKeys = keyNames.map((name) => {
            const k = NutKey![name as keyof typeof NutKey] as unknown as Key;
            if (k === undefined) throw new Error(`Unknown key: ${name}`);
            return k;
          });
          for (const k of resolvedKeys) await nutKeyboard!.pressKey(k);
          for (const k of resolvedKeys.reverse()) await nutKeyboard!.releaseKey(k);
          break;
        }
      }
    }
  }
}

/**
 * Maps common key names (as used in nut-js / workflow steps) to ydotool key codes.
 * ydotool uses Linux input event codes (KEY_* from linux/input-event-codes.h).
 * Format: "keycode:down" = press+release. We use shorthand "keycode" for tap.
 */
function ydotoolKeyMap(name: string): string {
  const map: Record<string, string> = {
    // Modifiers
    LeftControl: "29:1 29:0",
    RightControl: "97:1 97:0",
    LeftShift: "42:1 42:0",
    RightShift: "54:1 54:0",
    LeftAlt: "56:1 56:0",
    RightAlt: "100:1 100:0",
    LeftSuper: "125:1 125:0",
    RightSuper: "126:1 126:0",
    // Common keys
    Return: "28:1 28:0",
    Enter: "28:1 28:0",
    Escape: "1:1 1:0",
    Tab: "15:1 15:0",
    Space: "57:1 57:0",
    Backspace: "14:1 14:0",
    Delete: "111:1 111:0",
    Home: "102:1 102:0",
    End: "107:1 107:0",
    PageUp: "104:1 104:0",
    PageDown: "109:1 109:0",
    Up: "103:1 103:0",
    Down: "108:1 108:0",
    Left: "105:1 105:0",
    Right: "106:1 106:0",
    // Letters (lowercase)
    A: "30:1 30:0",
    B: "48:1 48:0",
    C: "46:1 46:0",
    D: "32:1 32:0",
    E: "18:1 18:0",
    F: "33:1 33:0",
    G: "34:1 34:0",
    H: "35:1 35:0",
    I: "23:1 23:0",
    J: "36:1 36:0",
    K: "37:1 37:0",
    L: "38:1 38:0",
    M: "50:1 50:0",
    N: "49:1 49:0",
    O: "24:1 24:0",
    P: "25:1 25:0",
    Q: "16:1 16:0",
    R: "19:1 19:0",
    S: "31:1 31:0",
    T: "20:1 20:0",
    U: "22:1 22:0",
    V: "47:1 47:0",
    W: "17:1 17:0",
    X: "45:1 45:0",
    Y: "21:1 21:0",
    Z: "44:1 44:0",
    // F-keys
    F1: "59:1 59:0",
    F2: "60:1 60:0",
    F3: "61:1 61:0",
    F4: "62:1 62:0",
    F5: "63:1 63:0",
    F6: "64:1 64:0",
    F7: "65:1 65:0",
    F8: "66:1 66:0",
    F9: "67:1 67:0",
    F10: "68:1 68:0",
    F11: "87:1 87:0",
    F12: "88:1 88:0",
  };
  const code = map[name];
  if (!code) throw new Error(`Unknown key for ydotool: ${name}. Use Linux key names.`);
  return code;
}
