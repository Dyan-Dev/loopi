#!/usr/bin/env node
/**
 * CLI Workflow Runner
 * Runs automation workflows headlessly from the command line.
 *
 * Usage: pnpm run:workflow <workflow.json>
 */

import { readFileSync } from "fs";
import { resolve } from "path";
import { AutomationExecutor } from "../main/automationExecutor";
import { executeAutomationGraph } from "../main/graphExecutor";
import { validateWorkflow } from "../main/workflowValidator";

function printUsage() {
  console.log("Usage: pnpm run:workflow <workflow.json>");
  console.log("");
  console.log("Runs an automation workflow headlessly from the command line.");
  console.log("");
  console.log(
    "The workflow JSON file should contain nodes, edges, and optionally name/description."
  );
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
    printUsage();
    process.exit(args.length === 0 ? 1 : 0);
  }

  const filePath = resolve(args[0]);
  console.log(`Loading workflow from: ${filePath}`);

  let workflowData: {
    name?: string;
    description?: string;
    nodes: Array<{
      id: string;
      type: string;
      data: Record<string, unknown>;
      position: { x: number; y: number };
    }>;
    edges: Array<{ id: string; source: string; target: string; sourceHandle?: string }>;
  };

  try {
    const raw = readFileSync(filePath, "utf-8");
    workflowData = JSON.parse(raw);
  } catch (err) {
    console.error(`Failed to read workflow file: ${err instanceof Error ? err.message : err}`);
    process.exit(1);
  }

  const { nodes, edges, name, description } = workflowData;

  console.log(`Workflow: ${name || "Unnamed"}`);
  if (description) console.log(`Description: ${description}`);
  console.log(`Nodes: ${nodes.length}, Edges: ${edges.length}`);
  console.log("");

  // Pre-flight validation
  const validation = validateWorkflow(
    nodes as Parameters<typeof validateWorkflow>[0],
    edges as Parameters<typeof validateWorkflow>[1]
  );

  if (validation.warnings.length > 0) {
    for (const warning of validation.warnings) {
      console.warn(`Warning: ${warning}`);
    }
  }

  if (!validation.valid) {
    console.error("Validation failed:");
    for (const error of validation.errors) {
      console.error(`  - ${error}`);
    }
    process.exit(1);
  }

  console.log("Validation passed. Starting execution...");
  console.log("");

  // Create executor and initialize
  const executor = new AutomationExecutor();
  executor.initVariables();

  const onNodeStatus = (
    nodeId: string,
    status: "running" | "success" | "error",
    error?: string
  ) => {
    const node = nodes.find((n) => n.id === nodeId);
    const stepType =
      (node?.data as { step?: { type?: string } })?.step?.type || node?.type || "unknown";
    const desc = (node?.data as { step?: { description?: string } })?.step?.description || "";

    if (status === "running") {
      console.log(`  [RUN]  Node ${nodeId} (${stepType}): ${desc}`);
    } else if (status === "success") {
      console.log(`  [ OK]  Node ${nodeId} (${stepType}): done`);
    } else if (status === "error") {
      console.error(`  [ERR]  Node ${nodeId} (${stepType}): ${error}`);
    }
  };

  try {
    const result = await executeAutomationGraph({
      nodes: nodes as Parameters<typeof executeAutomationGraph>[0]["nodes"],
      edges: edges as Parameters<typeof executeAutomationGraph>[0]["edges"],
      executor,
      headless: true,
      onNodeStatus,
    });

    console.log("");
    if (result.success) {
      console.log("Workflow completed successfully.");
      const variables = executor.getVariables();
      if (Object.keys(variables).length > 0) {
        console.log("");
        console.log("Final variables:");
        for (const [key, value] of Object.entries(variables)) {
          const display = typeof value === "object" ? JSON.stringify(value) : String(value);
          console.log(`  ${key}: ${display}`);
        }
      }
    } else {
      console.error("Workflow completed with errors.");
      process.exit(1);
    }
  } catch (err) {
    console.error("");
    console.error(`Workflow execution failed: ${err instanceof Error ? err.message : err}`);
    process.exit(1);
  }
}

main();
