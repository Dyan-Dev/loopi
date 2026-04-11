/**
 * CLI Server — local HTTP server that exposes workflow CRUD and execution
 * endpoints on 127.0.0.1. Used by `loopi-cli` / `pnpm run:workflow`.
 * See docs/CLI.md for the full API reference.
 */

import fs from "fs";
import http from "http";
import path from "path";
import type { Edge, Node } from "../types/flow";
import { AutomationExecutor } from "./automationExecutor";
import { loadCredentials } from "./credentialsStore";
import { executeAutomationGraph } from "./graphExecutor";
import {
  defaultStorageFolder,
  deleteAutomation,
  listAutomations,
  loadAutomation,
  saveAutomation,
} from "./treeStore";
import type { WindowManager } from "./windowManager";
import { type ValidatorNode, validateWorkflow } from "./workflowValidator";

const DEFAULT_PORT = 19542;
const PORT_FILE = ".loopi-port";

let server: http.Server | null = null;
let windowManagerRef: WindowManager | null = null;

function getPortFilePath(): string {
  // biome-ignore lint/style/noCommonJs: lazy electron import
  const { app } = require("electron");
  return path.join(app.getPath("userData"), PORT_FILE);
}

function readBody(req: http.IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
    req.on("error", reject);
  });
}

function sendNdjson(res: http.ServerResponse, data: Record<string, unknown>) {
  res.write(`${JSON.stringify(data)}\n`);
}

const BROWSER_STEP_TYPES = new Set([
  "navigate",
  "click",
  "type",
  "screenshot",
  "extract",
  "scroll",
  "selectOption",
  "fileUpload",
  "hover",
  "browserConditional",
]);

function startNdjsonStream(res: http.ServerResponse) {
  res.writeHead(200, {
    "Content-Type": "application/x-ndjson",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });
}

async function executeWorkflowStream(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  opts: { name: string; nodes: Node[]; edges: Edge[]; headless: boolean }
) {
  const { name, nodes, edges, headless } = opts;

  sendNdjson(res, {
    type: "info",
    message: `Workflow: ${name} | Nodes: ${nodes.length}, Edges: ${edges.length}`,
  });

  const validation = validateWorkflow(nodes as unknown as ValidatorNode[], edges);
  for (const w of validation.warnings) {
    sendNdjson(res, { type: "warning", message: w });
  }
  if (!validation.valid) {
    sendNdjson(res, {
      type: "error",
      message: `Validation failed: ${validation.errors.join("; ")}`,
    });
    res.end();
    return;
  }

  sendNdjson(res, { type: "info", message: "Validation passed. Starting execution..." });

  const hasBrowserSteps = nodes.some(
    (node) =>
      node.type === "automationStep" &&
      node.data.step &&
      BROWSER_STEP_TYPES.has(node.data.step.type)
  );

  let browserWindow = null;
  if (hasBrowserSteps && !headless && windowManagerRef) {
    const bw = windowManagerRef.getBrowserWindow();
    if (!bw || bw.isDestroyed()) {
      await windowManagerRef.ensureBrowserWindow("https://google.com");
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    browserWindow = windowManagerRef.getBrowserWindow();
  }

  const executor = new AutomationExecutor();
  executor.initVariables();
  const cancelSignal = { cancelled: false };
  const startTime = Date.now();

  req.on("close", () => {
    cancelSignal.cancelled = true;
  });

  await executeAutomationGraph({
    nodes,
    edges,
    browserWindow,
    executor,
    headless,
    cancelSignal,
    onNodeStatus: (nodeId, status, error) => {
      const node = nodes.find((n) => n.id === nodeId);
      const stepType = node?.data?.step?.type || node?.type || "unknown";
      sendNdjson(res, {
        type: "status",
        nodeId,
        status,
        stepType,
        ...(error && { error }),
      });
    },
  });

  sendNdjson(res, {
    type: "result",
    success: true,
    duration: Date.now() - startTime,
    variables: executor.getVariables(),
  });
}

async function handleRun(req: http.IncomingMessage, res: http.ServerResponse) {
  startNdjsonStream(res);

  try {
    const body = await readBody(req);
    const workflow = JSON.parse(body) as {
      name?: string;
      nodes: Record<string, unknown>[];
      edges: Record<string, unknown>[];
      headless?: boolean;
    };

    const { nodes: rawNodes, edges: rawEdges } = workflow;

    if (!rawNodes || !rawEdges) {
      sendNdjson(res, { type: "error", message: "Missing nodes or edges in request body" });
      res.end();
      return;
    }

    const cleanNodes: Node[] = rawNodes.map((node) => ({
      id: node.id as string,
      type: (node.type as Node["type"]) || "automationStep",
      data: {
        step: (node.data as Record<string, unknown>)?.step as Node["data"]["step"],
        variableName: (node.data as Record<string, unknown>)?.variableName as string | undefined,
        value: (node.data as Record<string, unknown>)?.value as string | undefined,
        operation: (node.data as Record<string, unknown>)?.operation as Node["data"]["operation"],
      },
      position: (node.position as Node["position"]) || { x: 0, y: 0 },
    }));

    const cleanEdges: Edge[] = rawEdges.map((edge) => ({
      id: edge.id as string,
      source: edge.source as string,
      target: edge.target as string,
      sourceHandle: edge.sourceHandle as string | undefined,
    }));

    await executeWorkflowStream(req, res, {
      name: workflow.name || "Unnamed",
      nodes: cleanNodes,
      edges: cleanEdges,
      headless: workflow.headless !== false,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    sendNdjson(res, { type: "result", success: false, error: message });
  }

  res.end();
}

function sendJson(res: http.ServerResponse, status: number, data: unknown) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

function handleListWorkflows(_req: http.IncomingMessage, res: http.ServerResponse) {
  try {
    const workflows = listAutomations(defaultStorageFolder);
    const summaries = workflows.map((w) => ({
      id: w.id,
      name: w.name,
      description: w.description,
      nodeCount: w.nodes?.length || 0,
      edgeCount: w.edges?.length || 0,
      updatedAt: w.updatedAt,
    }));
    sendJson(res, 200, { workflows: summaries });
  } catch (err) {
    sendJson(res, 500, { error: String(err) });
  }
}

function handleGetWorkflow(id: string, _req: http.IncomingMessage, res: http.ServerResponse) {
  try {
    const workflow = loadAutomation(id, defaultStorageFolder);
    if (!workflow) {
      sendJson(res, 404, { error: `Workflow '${id}' not found` });
      return;
    }
    sendJson(res, 200, { workflow });
  } catch (err) {
    sendJson(res, 500, { error: String(err) });
  }
}

async function handleCreateWorkflow(req: http.IncomingMessage, res: http.ServerResponse) {
  try {
    const body = await readBody(req);
    const data = JSON.parse(body);
    if (!data.name) {
      sendJson(res, 400, { error: "Missing 'name' field" });
      return;
    }
    const automation = {
      id: data.id || crypto.randomUUID(),
      name: data.name,
      description: data.description || "",
      nodes: data.nodes || [],
      edges: data.edges || [],
      steps: data.steps || [],
      variables: data.variables || {},
      updatedAt: new Date().toISOString(),
    };
    const id = saveAutomation(automation, defaultStorageFolder);
    sendJson(res, 201, { id, message: "Workflow created" });
  } catch (err) {
    sendJson(res, 500, { error: String(err) });
  }
}

async function handleUpdateWorkflow(
  id: string,
  req: http.IncomingMessage,
  res: http.ServerResponse
) {
  try {
    const existing = loadAutomation(id, defaultStorageFolder);
    if (!existing) {
      sendJson(res, 404, { error: `Workflow '${id}' not found` });
      return;
    }
    const body = await readBody(req);
    const data = JSON.parse(body);
    const updated = {
      ...existing,
      ...data,
      id, // ensure ID doesn't change
      updatedAt: new Date().toISOString(),
    };
    saveAutomation(updated, defaultStorageFolder);
    sendJson(res, 200, { id, message: "Workflow updated" });
  } catch (err) {
    sendJson(res, 500, { error: String(err) });
  }
}

function handleDeleteWorkflow(id: string, _req: http.IncomingMessage, res: http.ServerResponse) {
  try {
    const deleted = deleteAutomation(id, defaultStorageFolder);
    if (!deleted) {
      sendJson(res, 404, { error: `Workflow '${id}' not found` });
      return;
    }
    sendJson(res, 200, { id, message: "Workflow deleted" });
  } catch (err) {
    sendJson(res, 500, { error: String(err) });
  }
}

async function handleRunById(id: string, req: http.IncomingMessage, res: http.ServerResponse) {
  const workflow = loadAutomation(id, defaultStorageFolder);
  if (!workflow) {
    sendJson(res, 404, { error: `Workflow '${id}' not found` });
    return;
  }

  let headlessOverride: boolean | undefined;
  try {
    const body = await readBody(req);
    if (body.trim()) {
      headlessOverride = JSON.parse(body).headless;
    }
  } catch {
    // Ignore parse errors — use defaults
  }

  startNdjsonStream(res);

  try {
    const cleanNodes: Node[] = (workflow.nodes || []).map((node) => ({
      id: node.id,
      type: node.type || "automationStep",
      data: node.data,
      position: node.position || { x: 0, y: 0 },
    }));
    const cleanEdges: Edge[] = (workflow.edges || []).map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle,
    }));

    await executeWorkflowStream(req, res, {
      name: `${workflow.name} (${id})`,
      nodes: cleanNodes,
      edges: cleanEdges,
      headless: headlessOverride !== undefined ? headlessOverride : workflow.headless !== false,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    sendNdjson(res, { type: "result", success: false, error: message });
  }

  res.end();
}

function getSegments(url: string): string[] {
  return url.split("?")[0].split("/").filter(Boolean);
}

function handleRequest(req: http.IncomingMessage, res: http.ServerResponse) {
  const segments = getSegments(req.url || "/");
  const method = req.method || "GET";

  // GET /ping
  if (segments[0] === "ping" && method === "GET") {
    sendJson(res, 200, { status: "ok" });
    return;
  }

  // POST /run — run inline workflow
  if (segments[0] === "run" && method === "POST") {
    handleRun(req, res).catch((err) => {
      if (!res.headersSent) {
        sendJson(res, 500, { error: String(err) });
      }
    });
    return;
  }

  // /workflows routes
  if (segments[0] === "workflows") {
    // GET /workflows — list all
    if (segments.length === 1 && method === "GET") {
      handleListWorkflows(req, res);
      return;
    }

    // POST /workflows — create new
    if (segments.length === 1 && method === "POST") {
      handleCreateWorkflow(req, res).catch((err) => {
        if (!res.headersSent) sendJson(res, 500, { error: String(err) });
      });
      return;
    }

    const id = segments[1];

    // POST /workflows/:id/run — run saved workflow
    if (segments.length === 3 && segments[2] === "run" && method === "POST") {
      handleRunById(id, req, res).catch((err) => {
        if (!res.headersSent) sendJson(res, 500, { error: String(err) });
      });
      return;
    }

    if (segments.length === 2) {
      // GET /workflows/:id
      if (method === "GET") {
        handleGetWorkflow(id, req, res);
        return;
      }
      // PUT /workflows/:id
      if (method === "PUT") {
        handleUpdateWorkflow(id, req, res).catch((err) => {
          if (!res.headersSent) sendJson(res, 500, { error: String(err) });
        });
        return;
      }
      // DELETE /workflows/:id
      if (method === "DELETE") {
        handleDeleteWorkflow(id, req, res);
        return;
      }
    }
  }

  // GET /credentials — list credential IDs and types (no secrets)
  if (segments[0] === "credentials" && method === "GET") {
    try {
      const creds = loadCredentials();
      const safe = creds.map((c) => ({ id: c.id, name: c.name, type: c.type }));
      sendJson(res, 200, { credentials: safe });
    } catch (err) {
      sendJson(res, 500, { error: String(err) });
    }
    return;
  }

  sendJson(res, 404, { error: "Not found" });
}

export function startCliServer(wm: WindowManager): void {
  windowManagerRef = wm;
  const port = Number(process.env.LOOPI_CLI_PORT) || DEFAULT_PORT;

  server = http.createServer(handleRequest);

  server.listen(port, "127.0.0.1", () => {
    console.log(`[CLI Server] Listening on http://127.0.0.1:${port}`);
    try {
      fs.writeFileSync(getPortFilePath(), String(port), "utf-8");
    } catch {
      // Non-critical
    }
  });

  server.on("error", (err: NodeJS.ErrnoException) => {
    if (err.code === "EADDRINUSE") {
      console.warn(`[CLI Server] Port ${port} in use, trying ${port + 1}`);
      server?.close();
      const nextPort = port + 1;
      server = http.createServer(handleRequest);
      server.listen(nextPort, "127.0.0.1", () => {
        console.log(`[CLI Server] Listening on http://127.0.0.1:${nextPort}`);
        try {
          fs.writeFileSync(getPortFilePath(), String(nextPort), "utf-8");
        } catch {
          // Non-critical
        }
      });
    } else {
      console.error("[CLI Server] Failed to start:", err.message);
    }
  });
}

export function stopCliServer(): void {
  if (server) {
    server.close();
    server = null;
  }

  try {
    const portFile = getPortFilePath();
    if (fs.existsSync(portFile)) {
      fs.unlinkSync(portFile);
    }
  } catch {
    // Non-critical
  }
}
