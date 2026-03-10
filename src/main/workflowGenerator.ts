/**
 * AI Workflow Generator
 * Generates automation workflows from natural language descriptions
 * Supports OpenAI, Anthropic, and Ollama providers
 */

import { getCredential } from "@main/credentialsStore";
import { createLogger } from "@utils/logger";
import axios from "axios";

const logger = createLogger("WorkflowGenerator");

export interface GenerateParams {
  prompt: string;
  provider: "openai" | "anthropic" | "ollama";
  credentialId?: string;
  apiKey?: string;
  model?: string;
  baseUrl?: string;
}

interface GeneratedNode {
  id: string;
  type: string;
  data: {
    step: Record<string, unknown>;
  };
  position: { x: number; y: number };
}

interface GeneratedEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
}

export interface GenerateResult {
  nodes: GeneratedNode[];
  edges: GeneratedEdge[];
  name: string;
  description: string;
  warnings: string[];
}

const VALID_STEP_TYPES = new Set([
  "navigate",
  "click",
  "type",
  "wait",
  "screenshot",
  "extract",
  "scroll",
  "selectOption",
  "fileUpload",
  "hover",
  "setVariable",
  "modifyVariable",
  "browserConditional",
  "variableConditional",
  "forEach",
  "apiCall",
  "aiOpenAI",
  "aiAnthropic",
  "aiOllama",
  "jsonParse",
  "jsonStringify",
  "mathOperation",
  "stringOperation",
  "dateTime",
  "filterArray",
  "mapArray",
  "codeExecute",
  "discordSendMessage",
  "discordSendWebhook",
  "discordReactMessage",
  "discordGetMessage",
  "discordListMessages",
  "discordDeleteMessage",
  "twitterCreateTweet",
  "twitterDeleteTweet",
  "twitterLikeTweet",
  "twitterRetweet",
  "twitterSearchTweets",
  "twitterSendDM",
  "twitterSearchUser",
  "slackSendMessage",
  "slackUpdateMessage",
  "slackDeleteMessage",
  "slackCreateChannel",
  "slackGetChannel",
  "slackListChannels",
  "slackInviteUsers",
  "slackListMembers",
  "slackSetTopic",
  "slackArchiveChannel",
  "slackUnarchiveChannel",
  "slackGetHistory",
  "slackGetUser",
  "slackListUsers",
  "slackAddReaction",
  "slackUploadFile",
  // Telegram
  "telegramSendMessage",
  "telegramSendPhoto",
  "telegramEditMessage",
  "telegramDeleteMessage",
  "telegramSendLocation",
  "telegramGetUpdates",
  "telegramSendDocument",
  // GitHub
  "githubCreateIssue",
  "githubGetIssue",
  "githubListIssues",
  "githubCreateComment",
  "githubGetRepo",
  "githubListRepos",
  "githubCreateRelease",
  // Notion
  "notionCreatePage",
  "notionGetPage",
  "notionUpdatePage",
  "notionQueryDatabase",
  "notionCreateDatabaseEntry",
  "notionSearch",
  // SendGrid
  "sendgridSendEmail",
  "sendgridSendTemplate",
  "sendgridGetContacts",
  // Stripe
  "stripeGetBalance",
  "stripeCreateCustomer",
  "stripeGetCustomer",
  "stripeListCustomers",
  "stripeCreateCharge",
  "stripeCreatePaymentIntent",
  "stripeListCharges",
  // Postgres
  "postgresQuery",
  "postgresInsert",
  "postgresSelect",
  "postgresUpdate",
  // Google Sheets
  "googleSheetsReadRows",
  "googleSheetsAppendRow",
  "googleSheetsUpdateRow",
  "googleSheetsClear",
]);

const CONDITIONAL_TYPES = new Set(["browserConditional", "variableConditional"]);
const FOREACH_TYPE = "forEach";

export class WorkflowGenerator {
  async generate(params: GenerateParams): Promise<GenerateResult> {
    const systemPrompt = this.buildSystemPrompt();
    const maxRetries = 2;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const promptToUse =
          attempt === 0
            ? params
            : {
                ...params,
                prompt: `${params.prompt}\n\nIMPORTANT: Your previous response failed to parse. Error: ${lastError?.message}. Please return ONLY valid JSON with no extra text.`,
              };
        const rawResponse = await this.callAI(promptToUse, systemPrompt);
        return this.parseAndValidate(rawResponse);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        if (attempt < maxRetries) {
          logger.warn(`Generation attempt ${attempt + 1} failed, retrying: ${lastError.message}`);
        }
      }
    }

    throw lastError!;
  }

  private buildSystemPrompt(): string {
    return `You are an automation workflow generator for Loopi, a visual workflow automation app.
Given a user's description, generate a JSON workflow with nodes and edges.

## Available Step Types

### Browser Steps
- navigate: { type: "navigate", value: "https://..." } - Navigate to URL
- click: { type: "click", selector: "css-selector" } - Click element
- type: { type: "type", selector: "css-selector", value: "text" } - Type into input
- wait: { type: "wait", value: "2" } - Wait seconds
- screenshot: { type: "screenshot" } - Take screenshot
- extract: { type: "extract", selector: "css-selector", storeKey: "varName" } - Extract text to variable
- scroll: { type: "scroll", scrollType: "toElement"|"byAmount", selector?: "css", scrollAmount?: 500 }
- selectOption: { type: "selectOption", selector: "css", optionValue: "val" }
- hover: { type: "hover", selector: "css" }
- fileUpload: { type: "fileUpload", selector: "css", filePath: "/path" }

### Data Steps
- setVariable: { type: "setVariable", variableName: "name", value: "val" } - Set variable (supports {{otherVar}})
- modifyVariable: { type: "modifyVariable", variableName: "name", operation: "set"|"increment"|"decrement"|"append", value: "val" }

### Logic Steps
- browserConditional: { type: "browserConditional", browserConditionType: "elementExists"|"valueMatches", selector: "css", expectedValue?: "val", condition?: "equals"|"contains"|"greaterThan"|"lessThan" }
  Node type: "browserConditional". Has TWO output handles: "if" and "else"
- variableConditional: { type: "variableConditional", variableConditionType: "variableEquals"|"variableContains"|"variableGreaterThan"|"variableLessThan"|"variableExists", variableName: "name", expectedValue?: "val" }
  Node type: "variableConditional". Has TWO output handles: "if" and "else"
- forEach: { type: "forEach", arrayVariable: "items", itemVariable: "currentItem", indexVariable: "loopIndex" }
  Node type: "forEach". Has TWO output handles: "loop" (body) and "done" (after completion).
  Use {{currentItem}} and {{loopIndex}} in loop body nodes.

### Integration Steps
- apiCall: { type: "apiCall", method: "GET"|"POST", url: "https://...", headers: {}, body: "", storeKey: "response" }

### AI Steps
- aiOpenAI: { type: "aiOpenAI", model: "gpt-4o-mini", prompt: "...", systemPrompt: "...", storeKey: "aiResponse" }
- aiAnthropic: { type: "aiAnthropic", model: "claude-3-5-sonnet-20241022", prompt: "...", systemPrompt: "...", storeKey: "aiResponse" }
- aiOllama: { type: "aiOllama", model: "mistral", prompt: "...", baseUrl: "http://localhost:11434", storeKey: "aiResponse" }

### Discord Steps
- discordSendMessage: { type: "discordSendMessage", channelId: "", content: "" }
- discordSendWebhook: { type: "discordSendWebhook", webhookUrl: "", content: "" }

### Twitter/X Steps
- twitterCreateTweet: { type: "twitterCreateTweet", text: "" }
- twitterSearchTweets: { type: "twitterSearchTweets", searchQuery: "" }

### Slack Steps
- slackSendMessage: { type: "slackSendMessage", channelId: "", text: "" }

## Output Format

Return ONLY valid JSON (no markdown fences, no explanation):
{
  "name": "Short workflow name",
  "description": "Brief description",
  "nodes": [
    {
      "id": "1",
      "type": "automationStep",
      "data": { "step": { "id": "1", "type": "navigate", "description": "Go to site", "value": "https://example.com" } },
      "position": { "x": 250, "y": 0 }
    }
  ],
  "edges": [
    { "id": "e1-2", "source": "1", "target": "2" }
  ]
}

## Rules
1. Node "type" must be "automationStep" for most steps. Use "browserConditional", "variableConditional", or "forEach" for those specific types.
2. Each step.id must match the node.id
3. Edges from conditional nodes MUST have sourceHandle: "if" or "else"
4. Edges from forEach nodes MUST have sourceHandle: "loop" or "done"
5. Regular nodes have at most 1 outgoing edge (no sourceHandle needed)
6. Variable references use {{variableName}} syntax
7. Use storeKey to save results for later use
8. Use realistic CSS selectors when possible
9. Keep workflows practical and focused`;
  }

  private async callAI(params: GenerateParams, systemPrompt: string): Promise<string> {
    const apiKey = await this.resolveApiKey(params);

    switch (params.provider) {
      case "openai":
        return this.callOpenAI(params, systemPrompt, apiKey);
      case "anthropic":
        return this.callAnthropic(params, systemPrompt, apiKey);
      case "ollama":
        return this.callOllama(params, systemPrompt);
      default:
        throw new Error(`Unsupported provider: ${params.provider}`);
    }
  }

  private async resolveApiKey(params: GenerateParams): Promise<string> {
    if (params.credentialId) {
      const credential = await getCredential(params.credentialId);
      if (!credential) throw new Error("Credential not found");
      const key =
        credential.data.apiKey ||
        credential.data.key ||
        credential.data.token ||
        credential.data.accessToken;
      if (key) return key;
      throw new Error("Credential is missing an API key value");
    }
    if (params.apiKey) return params.apiKey;
    if (params.provider === "ollama") return "";
    throw new Error("API key or credential is required");
  }

  private async callOpenAI(
    params: GenerateParams,
    systemPrompt: string,
    apiKey: string
  ): Promise<string> {
    const baseUrl = params.baseUrl || "https://api.openai.com/v1";
    const model = params.model || "gpt-4o-mini";

    const response = await axios.post(
      `${baseUrl}/chat/completions`,
      {
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: params.prompt },
        ],
        temperature: 0,
        max_tokens: 4096,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        timeout: 60000,
      }
    );

    return response.data.choices[0]?.message?.content || "";
  }

  private async callAnthropic(
    params: GenerateParams,
    systemPrompt: string,
    apiKey: string
  ): Promise<string> {
    const baseUrl = params.baseUrl || "https://api.anthropic.com";
    const model = params.model || "claude-sonnet-4-5-20250929";

    const response = await axios.post(
      `${baseUrl}/v1/messages`,
      {
        model,
        system: systemPrompt,
        messages: [{ role: "user", content: params.prompt }],
        max_tokens: 4096,
        temperature: 0,
      },
      {
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json",
        },
        timeout: 60000,
      }
    );

    const content = response.data.content;
    if (Array.isArray(content) && content.length > 0) {
      return content[0].text || "";
    }
    return "";
  }

  private async callOllama(params: GenerateParams, systemPrompt: string): Promise<string> {
    const baseUrl = params.baseUrl || "http://localhost:11434";
    const model = params.model || "mistral";

    const response = await axios.post(
      `${baseUrl}/api/chat`,
      {
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: params.prompt },
        ],
        stream: false,
      },
      { timeout: 120000 }
    );

    return response.data.message?.content || "";
  }

  parseAndValidate(rawResponse: string): GenerateResult {
    const warnings: string[] = [];

    // Strip markdown code fences if present
    let cleaned = rawResponse.trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
    }

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      // Try regex extraction for embedded JSON
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          parsed = JSON.parse(match[0]);
        } catch {
          throw new Error("AI returned invalid JSON. Please try again with a clearer description.");
        }
      } else {
        throw new Error("AI returned invalid JSON. Please try again with a clearer description.");
      }
    }

    const name = (parsed.name as string) || "AI Generated Workflow";
    const description = (parsed.description as string) || "";
    const rawNodes = (parsed.nodes as GeneratedNode[]) || [];
    const rawEdges = (parsed.edges as GeneratedEdge[]) || [];

    // Validate and filter nodes
    const validNodeIds = new Set<string>();
    const nodes: GeneratedNode[] = [];

    for (const node of rawNodes) {
      if (!node.id || !node.data?.step?.type) {
        logger.warn("Skipping invalid node", node);
        warnings.push(`Skipped node with missing id or step type.`);
        continue;
      }
      const stepType = node.data.step.type as string;
      if (!VALID_STEP_TYPES.has(stepType)) {
        logger.warn(`Skipping unknown step type: ${stepType}`);
        warnings.push(`Skipped node with unknown step type: "${stepType}".`);
        continue;
      }

      // Ensure correct node type
      if (CONDITIONAL_TYPES.has(stepType)) {
        node.type = stepType;
      } else if (stepType === FOREACH_TYPE) {
        node.type = FOREACH_TYPE;
      } else {
        node.type = "automationStep";
      }

      // Ensure step.id matches node.id
      node.data.step.id = node.id;

      // Ensure step has description
      if (!node.data.step.description) {
        node.data.step.description = `${stepType} step`;
      }

      validNodeIds.add(node.id);
      nodes.push(node);
    }

    // Validate and filter edges
    const edges: GeneratedEdge[] = [];
    for (const edge of rawEdges) {
      if (!edge.source || !edge.target) {
        warnings.push("Skipped edge with missing source or target.");
        continue;
      }
      if (!validNodeIds.has(edge.source) || !validNodeIds.has(edge.target)) {
        logger.warn("Skipping edge with invalid node reference", edge);
        warnings.push(`Skipped edge referencing non-existent node.`);
        continue;
      }
      if (!edge.id) {
        edge.id = `e${edge.source}-${edge.target}-${edge.sourceHandle || "default"}`;
      }
      edges.push(edge);
    }

    // Auto-fix: add missing edges between sequential nodes that have no connections
    this.autoFixMissingEdges(nodes, edges, warnings);

    // Auto-fix: ensure conditional/forEach nodes have correct sourceHandle on edges
    this.autoFixSourceHandles(nodes, edges, warnings);

    // Node sanity checks
    for (const node of nodes) {
      const step = node.data.step;
      const stepType = step.type as string;

      // forEach must have arrayVariable
      if (stepType === "forEach" && !step.arrayVariable) {
        warnings.push(`Node "${node.id}": forEach missing arrayVariable - defaulting to "items"`);
        step.arrayVariable = "items";
      }

      // forEach should have itemVariable defaults
      if (stepType === "forEach") {
        if (!step.itemVariable) step.itemVariable = "currentItem";
        if (!step.indexVariable) step.indexVariable = "loopIndex";
      }

      // navigate must have value (URL)
      if (stepType === "navigate" && !step.value) {
        warnings.push(`Node "${node.id}": navigate step has no URL`);
      }

      // extract must have selector and storeKey
      if (stepType === "extract" && !step.selector) {
        warnings.push(`Node "${node.id}": extract step has no selector`);
      }

      // apiCall must have url
      if (stepType === "apiCall" && !step.url) {
        warnings.push(`Node "${node.id}": apiCall step has no url`);
      }
    }

    // Auto-layout if positions seem default/missing
    const needsLayout =
      nodes.every((n) => n.position.x === 0 && n.position.y === 0) ||
      (nodes.length > 0 && !nodes[0].position);

    if (needsLayout) {
      this.autoLayout(nodes, edges);
    }

    return { nodes, edges, name, description, warnings };
  }

  /**
   * Auto-fix: if sequential nodes have no edges between them, add them.
   * Only applies when there are nodes but fewer edges than expected.
   */
  private autoFixMissingEdges(
    nodes: GeneratedNode[],
    edges: GeneratedEdge[],
    warnings: string[]
  ): void {
    if (nodes.length <= 1) return;

    // Find nodes that have no incoming and no outgoing edges (isolated)
    // but only if there are some edges (don't auto-connect a fully edge-less workflow differently)
    if (edges.length === 0 && nodes.length > 1) {
      // No edges at all - connect sequentially
      for (let i = 0; i < nodes.length - 1; i++) {
        const edgeId = `e${nodes[i].id}-${nodes[i + 1].id}-auto`;
        edges.push({
          id: edgeId,
          source: nodes[i].id,
          target: nodes[i + 1].id,
        });
      }
      warnings.push("Auto-connected nodes sequentially (no edges were provided)");
    }
  }

  /**
   * Auto-fix: ensure conditional and forEach edges have correct sourceHandle
   */
  private autoFixSourceHandles(
    nodes: GeneratedNode[],
    edges: GeneratedEdge[],
    warnings: string[]
  ): void {
    for (const node of nodes) {
      const stepType = node.data.step.type as string;

      if (CONDITIONAL_TYPES.has(stepType)) {
        const outEdges = edges.filter((e) => e.source === node.id);
        const hasHandles = outEdges.some(
          (e) => e.sourceHandle === "if" || e.sourceHandle === "else"
        );

        if (!hasHandles && outEdges.length >= 2) {
          outEdges[0].sourceHandle = "if";
          outEdges[1].sourceHandle = "else";
          warnings.push(`Auto-assigned if/else handles to conditional node "${node.id}"`);
        } else if (!hasHandles && outEdges.length === 1) {
          outEdges[0].sourceHandle = "if";
          warnings.push(`Auto-assigned "if" handle to conditional node "${node.id}"`);
        }
      }

      if (stepType === FOREACH_TYPE) {
        const outEdges = edges.filter((e) => e.source === node.id);
        const hasHandles = outEdges.some(
          (e) => e.sourceHandle === "loop" || e.sourceHandle === "done"
        );

        if (!hasHandles && outEdges.length >= 2) {
          outEdges[0].sourceHandle = "loop";
          outEdges[1].sourceHandle = "done";
          warnings.push(`Auto-assigned loop/done handles to forEach node "${node.id}"`);
        } else if (!hasHandles && outEdges.length === 1) {
          outEdges[0].sourceHandle = "loop";
          warnings.push(`Auto-assigned "loop" handle to forEach node "${node.id}"`);
        }
      }
    }
  }

  autoLayout(nodes: GeneratedNode[], edges: GeneratedEdge[]): void {
    // Build adjacency for topological sort
    const inDegree = new Map<string, number>();
    const adj = new Map<string, string[]>();

    for (const node of nodes) {
      inDegree.set(node.id, 0);
      adj.set(node.id, []);
    }

    for (const edge of edges) {
      adj.get(edge.source)?.push(edge.target);
      inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
    }

    // BFS topological sort to assign levels
    const queue: string[] = [];
    const level = new Map<string, number>();

    for (const [id, deg] of inDegree) {
      if (deg === 0) {
        queue.push(id);
        level.set(id, 0);
      }
    }

    while (queue.length > 0) {
      const current = queue.shift()!;
      const currentLevel = level.get(current) || 0;
      for (const next of adj.get(current) || []) {
        const newDeg = (inDegree.get(next) || 1) - 1;
        inDegree.set(next, newDeg);
        const existing = level.get(next);
        level.set(next, Math.max(existing ?? 0, currentLevel + 1));
        if (newDeg === 0) {
          queue.push(next);
        }
      }
    }

    // Group nodes by level and assign positions
    const levelGroups = new Map<number, string[]>();
    for (const node of nodes) {
      const lvl = level.get(node.id) ?? 0;
      if (!levelGroups.has(lvl)) levelGroups.set(lvl, []);
      levelGroups.get(lvl)!.push(node.id);
    }

    const nodeMap = new Map(nodes.map((n) => [n.id, n]));
    const Y_GAP = 120;
    const X_GAP = 200;

    for (const [lvl, ids] of levelGroups) {
      const startX = 250 - ((ids.length - 1) * X_GAP) / 2;
      ids.forEach((id, idx) => {
        const node = nodeMap.get(id);
        if (node) {
          node.position = { x: startX + idx * X_GAP, y: lvl * Y_GAP + 50 };
        }
      });
    }
  }
}
