#!/usr/bin/env node

/**
 * Loopi CLI — manage and run workflows from the command line.
 *
 * Usage:
 *   loopi run <workflow.json>       Run a workflow from a JSON file
 *   loopi run --id <id>             Run a saved workflow by ID
 *   loopi list                      List all saved workflows
 *   loopi get <id>                  Get details of a saved workflow
 *   loopi delete <id>               Delete a saved workflow
 *   loopi create <workflow.json>    Create/import a workflow from JSON
 *   loopi update <id> <file.json>   Update a workflow from JSON
 *   loopi ping                      Check if the desktop app is running
 *
 * Global Options:
 *   --port <port>    Override the default port (19542)
 *   --headless       Run in headless mode (default)
 *   --no-headless    Run with visible browser window
 *   --help, -h       Show usage
 */

import { existsSync, readFileSync } from "fs";
import http from "http";
import { homedir } from "os";
import { join, resolve } from "path";

const DEFAULT_PORT = 19542;

function printUsage() {
  console.log("Loopi CLI — manage and run workflows from the command line.");
  console.log("");
  console.log("Usage:");
  console.log("  loopi run <workflow.json>       Run a workflow from a JSON file");
  console.log("  loopi run --id <id>             Run a saved workflow by ID");
  console.log("  loopi list                      List all saved workflows");
  console.log("  loopi get <id>                  Get details of a saved workflow");
  console.log("  loopi delete <id>               Delete a saved workflow");
  console.log("  loopi create <workflow.json>    Create/import a workflow from JSON");
  console.log("  loopi update <id> <file.json>   Update a workflow from JSON");
  console.log("  loopi ping                      Check if the desktop app is running");
  console.log("");
  console.log("Global Options:");
  console.log("  --port <port>    Override the default port (19542)");
  console.log("  --headless       Run in headless mode (default)");
  console.log("  --no-headless    Run with visible browser window");
  console.log("  --help, -h       Show this help");
  console.log("");
  console.log("The Loopi desktop app must be running. The CLI connects to its local server.");
}

function discoverPort(): number {
  const portFilePaths = [
    join(homedir(), ".config", "loopi", ".loopi-port"),
    join(homedir(), "Library", "Application Support", "loopi", ".loopi-port"),
    join(homedir(), "AppData", "Roaming", "loopi", ".loopi-port"),
  ];

  for (const p of portFilePaths) {
    try {
      if (existsSync(p)) {
        const port = Number(readFileSync(p, "utf-8").trim());
        if (port > 0 && port < 65536) return port;
      }
    } catch {
      // Try next path
    }
  }

  return DEFAULT_PORT;
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function httpRequest(options: {
  port: number;
  path: string;
  method: string;
  body?: string;
  stream?: boolean;
}): Promise<{ status: number; data: string }> {
  return new Promise((resolve, reject) => {
    const headers: Record<string, string> = {};
    if (options.body) {
      headers["Content-Type"] = "application/json";
      headers["Content-Length"] = String(Buffer.byteLength(options.body));
    }

    const req = http.request(
      {
        hostname: "127.0.0.1",
        port: options.port,
        path: options.path,
        method: options.method,
        headers,
      },
      (res) => {
        if (options.stream) {
          let buffer = "";
          res.on("data", (chunk: Buffer) => {
            buffer += chunk.toString();
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";
            for (const line of lines) {
              if (!line.trim()) continue;
              try {
                formatMessage(JSON.parse(line));
              } catch {
                console.log(line);
              }
            }
          });
          res.on("end", () => {
            if (buffer.trim()) {
              try {
                formatMessage(JSON.parse(buffer));
              } catch {
                console.log(buffer);
              }
            }
            resolve({ status: res.statusCode || 200, data: "" });
          });
          res.on("error", reject);
        } else {
          let data = "";
          res.on("data", (chunk: Buffer) => {
            data += chunk.toString();
          });
          res.on("end", () => resolve({ status: res.statusCode || 200, data }));
          res.on("error", reject);
        }
      }
    );

    req.on("error", (err: NodeJS.ErrnoException) => {
      if (err.code === "ECONNREFUSED") {
        reject(
          new Error(`Cannot connect to Loopi on port ${options.port}. Is the desktop app running?`)
        );
      } else {
        reject(err);
      }
    });

    if (options.body) req.write(options.body);
    req.end();
  });
}

function formatMessage(msg: Record<string, unknown>) {
  switch (msg.type) {
    case "info":
      console.log(`  [INFO]  ${msg.message}`);
      break;
    case "warning":
      console.warn(`  [WARN]  ${msg.message}`);
      break;
    case "error":
      console.error(`  [ERR]   ${msg.message}`);
      break;
    case "status": {
      const icon = msg.status === "running" ? "RUN " : msg.status === "success" ? " OK " : "FAIL";
      const suffix = msg.error ? ` — ${msg.error}` : "";
      console.log(`  [${icon}]  ${msg.nodeId} (${msg.stepType})${suffix}`);
      break;
    }
    case "result": {
      console.log("");
      if (msg.success) {
        console.log(
          `Workflow completed successfully in ${formatDuration(msg.duration as number)}.`
        );
        const vars = msg.variables as Record<string, unknown> | undefined;
        if (vars && Object.keys(vars).length > 0) {
          console.log("");
          console.log("Final variables:");
          for (const [key, value] of Object.entries(vars)) {
            const display = typeof value === "object" ? JSON.stringify(value) : String(value);
            console.log(`  ${key}: ${display}`);
          }
        }
      } else {
        console.error(`Workflow failed: ${msg.error}`);
      }
      break;
    }
    default:
      console.log(JSON.stringify(msg));
  }
}

function parseGlobalOptions(args: string[]): {
  port: number | null;
  headless: boolean;
  remaining: string[];
} {
  let port: number | null = null;
  let headless = true;
  const remaining: string[] = [];

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--port" && args[i + 1]) {
      port = Number(args[++i]);
    } else if (args[i] === "--no-headless") {
      headless = false;
    } else if (args[i] === "--headless") {
      headless = true;
    } else {
      remaining.push(args[i]);
    }
  }

  return { port, headless, remaining };
}

async function cmdPing(port: number) {
  const { data } = await httpRequest({ port, path: "/ping", method: "GET" });
  const result = JSON.parse(data);
  if (result.status === "ok") {
    console.log(`Loopi is running on port ${port}.`);
  } else {
    console.log("Unexpected response:", data);
  }
}

async function cmdList(port: number) {
  const { status, data } = await httpRequest({ port, path: "/workflows", method: "GET" });
  const result = JSON.parse(data);

  if (status !== 200) {
    console.error(`Error: ${result.error}`);
    process.exit(1);
  }

  const workflows = result.workflows as Array<{
    id: string;
    name: string;
    description: string;
    nodeCount: number;
    edgeCount: number;
    updatedAt: string;
  }>;

  if (workflows.length === 0) {
    console.log("No workflows found.");
    return;
  }

  console.log(`Found ${workflows.length} workflow(s):\n`);
  for (const w of workflows) {
    console.log(`  ${w.id}`);
    console.log(`    Name:    ${w.name}`);
    if (w.description) console.log(`    Desc:    ${w.description}`);
    console.log(`    Nodes:   ${w.nodeCount}  |  Edges: ${w.edgeCount}`);
    console.log(`    Updated: ${w.updatedAt}`);
    console.log("");
  }
}

async function cmdGet(port: number, id: string) {
  const { status, data } = await httpRequest({
    port,
    path: `/workflows/${encodeURIComponent(id)}`,
    method: "GET",
  });
  const result = JSON.parse(data);

  if (status !== 200) {
    console.error(`Error: ${result.error}`);
    process.exit(1);
  }

  console.log(JSON.stringify(result.workflow, null, 2));
}

async function cmdDelete(port: number, id: string) {
  const { status, data } = await httpRequest({
    port,
    path: `/workflows/${encodeURIComponent(id)}`,
    method: "DELETE",
  });
  const result = JSON.parse(data);

  if (status !== 200) {
    console.error(`Error: ${result.error}`);
    process.exit(1);
  }

  console.log(`Workflow '${id}' deleted.`);
}

async function cmdCreate(port: number, filePath: string) {
  const resolvedPath = resolve(filePath);
  const raw = readFileSync(resolvedPath, "utf-8");
  JSON.parse(raw); // validate JSON

  const { status, data } = await httpRequest({
    port,
    path: "/workflows",
    method: "POST",
    body: raw,
  });
  const result = JSON.parse(data);

  if (status !== 201) {
    console.error(`Error: ${result.error}`);
    process.exit(1);
  }

  console.log(`Workflow created with ID: ${result.id}`);
}

async function cmdUpdate(port: number, id: string, filePath: string) {
  const resolvedPath = resolve(filePath);
  const raw = readFileSync(resolvedPath, "utf-8");
  JSON.parse(raw); // validate JSON

  const { status, data } = await httpRequest({
    port,
    path: `/workflows/${encodeURIComponent(id)}`,
    method: "PUT",
    body: raw,
  });
  const result = JSON.parse(data);

  if (status !== 200) {
    console.error(`Error: ${result.error}`);
    process.exit(1);
  }

  console.log(`Workflow '${id}' updated.`);
}

async function cmdRun(port: number, opts: { filePath?: string; id?: string; headless: boolean }) {
  if (opts.id) {
    // Run saved workflow by ID
    console.log(`Running saved workflow: ${opts.id}`);
    console.log(`Connecting to Loopi on port ${port}...`);
    console.log("");

    await httpRequest({
      port,
      path: `/workflows/${encodeURIComponent(opts.id)}/run`,
      method: "POST",
      body: JSON.stringify({ headless: opts.headless }),
      stream: true,
    });
  } else if (opts.filePath) {
    // Run workflow from file
    const resolvedPath = resolve(opts.filePath);
    const raw = readFileSync(resolvedPath, "utf-8");
    const workflowData = JSON.parse(raw) as Record<string, unknown>;
    workflowData.headless = opts.headless;

    console.log(`Loading workflow from: ${resolvedPath}`);
    console.log(`Connecting to Loopi on port ${port}...`);
    console.log("");

    await httpRequest({
      port,
      path: "/run",
      method: "POST",
      body: JSON.stringify(workflowData),
      stream: true,
    });
  } else {
    console.error("Error: Specify a workflow file or --id <id>.");
    process.exit(1);
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
    printUsage();
    process.exit(args.length === 0 ? 1 : 0);
  }

  const { port: portOverride, headless, remaining } = parseGlobalOptions(args);
  const targetPort = portOverride || discoverPort();
  const command = remaining[0];

  try {
    switch (command) {
      case "ping":
        await cmdPing(targetPort);
        break;

      case "list":
      case "ls":
        await cmdList(targetPort);
        break;

      case "get":
        if (!remaining[1]) {
          console.error("Error: Missing workflow ID. Usage: loopi get <id>");
          process.exit(1);
        }
        await cmdGet(targetPort, remaining[1]);
        break;

      case "delete":
      case "rm":
        if (!remaining[1]) {
          console.error("Error: Missing workflow ID. Usage: loopi delete <id>");
          process.exit(1);
        }
        await cmdDelete(targetPort, remaining[1]);
        break;

      case "create":
      case "import":
        if (!remaining[1]) {
          console.error("Error: Missing workflow file. Usage: loopi create <workflow.json>");
          process.exit(1);
        }
        await cmdCreate(targetPort, remaining[1]);
        break;

      case "update":
        if (!remaining[1] || !remaining[2]) {
          console.error("Error: Usage: loopi update <id> <workflow.json>");
          process.exit(1);
        }
        await cmdUpdate(targetPort, remaining[1], remaining[2]);
        break;

      case "run": {
        // Check for --id flag in remaining args
        let runId: string | undefined;
        let runFile: string | undefined;
        for (let i = 1; i < remaining.length; i++) {
          if (remaining[i] === "--id" && remaining[i + 1]) {
            runId = remaining[++i];
          } else if (!remaining[i].startsWith("--")) {
            runFile = remaining[i];
          }
        }
        await cmdRun(targetPort, { filePath: runFile, id: runId, headless });
        break;
      }

      default:
        // Backwards compat: treat bare argument as a file path to run
        if (remaining[0] && !remaining[0].startsWith("--")) {
          await cmdRun(targetPort, { filePath: remaining[0], headless });
        } else {
          console.error(`Unknown command: ${command}`);
          printUsage();
          process.exit(1);
        }
    }
  } catch (err) {
    console.error("");
    console.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  }
}

main();
