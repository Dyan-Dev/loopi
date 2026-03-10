import { describe, expect, it, vi } from "vitest";

vi.mock("@app-types", () => ({
  stepTypes: [
    { value: "navigate", label: "Navigate", icon: null },
    { value: "click", label: "Click", icon: null },
    { value: "type", label: "Type", icon: null },
    { value: "wait", label: "Wait", icon: null },
    { value: "screenshot", label: "Screenshot", icon: null },
    { value: "extract", label: "Extract", icon: null },
    { value: "scroll", label: "Scroll", icon: null },
    { value: "selectOption", label: "Select Option", icon: null },
    { value: "fileUpload", label: "File Upload", icon: null },
    { value: "hover", label: "Hover", icon: null },
    { value: "setVariable", label: "Set Variable", icon: null },
    { value: "modifyVariable", label: "Modify Variable", icon: null },
    { value: "apiCall", label: "API Call", icon: null },
    { value: "aiOpenAI", label: "AI OpenAI", icon: null },
    { value: "aiAnthropic", label: "AI Anthropic", icon: null },
    { value: "aiOllama", label: "AI Ollama", icon: null },
    { value: "discordSendMessage", label: "Discord Send Message", icon: null },
    { value: "discordSendWebhook", label: "Discord Send Webhook", icon: null },
    { value: "slackSendMessage", label: "Slack Send Message", icon: null },
    { value: "twitterCreateTweet", label: "Twitter Create Tweet", icon: null },
  ],
}));

import { createNode } from "../nodeFactory";

const handleNodeAction = vi.fn();

describe("createNode", () => {
  describe("Special types", () => {
    it("creates a browserConditional node with correct type and defaults", () => {
      const node = createNode({
        type: "browserConditional",
        newId: "bc-1",
        handleNodeAction,
        currentNodes: [],
      });
      expect(node.type).toBe("browserConditional");
      expect(node.data.step.type).toBe("browserConditional");
      expect((node.data.step as any).browserConditionType).toBe("elementExists");
    });

    it("creates a variableConditional node with correct type and defaults", () => {
      const node = createNode({
        type: "variableConditional",
        newId: "vc-1",
        handleNodeAction,
        currentNodes: [],
      });
      expect(node.type).toBe("variableConditional");
      expect(node.data.step.type).toBe("variableConditional");
      expect((node.data.step as any).variableConditionType).toBe("variableEquals");
    });

    it("creates a forEach node with correct type and defaults", () => {
      const node = createNode({
        type: "forEach",
        newId: "fe-1",
        handleNodeAction,
        currentNodes: [],
      });
      expect(node.type).toBe("forEach");
      expect(node.data.step.type).toBe("forEach");
      expect((node.data.step as any).arrayVariable).toBe("");
      expect((node.data.step as any).itemVariable).toBe("currentItem");
      expect((node.data.step as any).indexVariable).toBe("loopIndex");
    });

    it("sets step.id to match the node id for special types", () => {
      const bcNode = createNode({
        type: "browserConditional",
        newId: "id-bc",
        handleNodeAction,
        currentNodes: [],
      });
      const vcNode = createNode({
        type: "variableConditional",
        newId: "id-vc",
        handleNodeAction,
        currentNodes: [],
      });
      const feNode = createNode({
        type: "forEach",
        newId: "id-fe",
        handleNodeAction,
        currentNodes: [],
      });

      expect(bcNode.data.step.id).toBe("id-bc");
      expect(vcNode.data.step.id).toBe("id-vc");
      expect(feNode.data.step.id).toBe("id-fe");
    });

    it("sets nodeRunning to false for special types", () => {
      const bcNode = createNode({
        type: "browserConditional",
        newId: "nr-1",
        handleNodeAction,
        currentNodes: [],
      });
      const vcNode = createNode({
        type: "variableConditional",
        newId: "nr-2",
        handleNodeAction,
        currentNodes: [],
      });
      const feNode = createNode({
        type: "forEach",
        newId: "nr-3",
        handleNodeAction,
        currentNodes: [],
      });

      expect(bcNode.data.nodeRunning).toBe(false);
      expect(vcNode.data.nodeRunning).toBe(false);
      expect(feNode.data.nodeRunning).toBe(false);
    });

    it("sets onAddNode to the handleNodeAction callback for special types", () => {
      const bcNode = createNode({
        type: "browserConditional",
        newId: "on-1",
        handleNodeAction,
        currentNodes: [],
      });
      const vcNode = createNode({
        type: "variableConditional",
        newId: "on-2",
        handleNodeAction,
        currentNodes: [],
      });
      const feNode = createNode({
        type: "forEach",
        newId: "on-3",
        handleNodeAction,
        currentNodes: [],
      });

      expect(bcNode.data.onAddNode).toBe(handleNodeAction);
      expect(vcNode.data.onAddNode).toBe(handleNodeAction);
      expect(feNode.data.onAddNode).toBe(handleNodeAction);
    });
  });

  describe("Standard steps", () => {
    it("creates a navigate step with value 'https://'", () => {
      const node = createNode({
        type: "navigate",
        newId: "nav-1",
        handleNodeAction,
        currentNodes: [],
      });
      expect(node.type).toBe("automationStep");
      expect(node.data.step.type).toBe("navigate");
      expect((node.data.step as any).value).toBe("https://");
    });

    it("creates a click step with selector 'body'", () => {
      const node = createNode({
        type: "click",
        newId: "clk-1",
        handleNodeAction,
        currentNodes: [],
      });
      expect(node.type).toBe("automationStep");
      expect(node.data.step.type).toBe("click");
      expect((node.data.step as any).selector).toBe("body");
    });

    it("creates a type step with selector and value", () => {
      const node = createNode({ type: "type", newId: "typ-1", handleNodeAction, currentNodes: [] });
      expect(node.type).toBe("automationStep");
      expect(node.data.step.type).toBe("type");
      expect((node.data.step as any).selector).toBe("body");
      expect((node.data.step as any).value).toBe("");
    });

    it("creates a wait step with value '1'", () => {
      const node = createNode({ type: "wait", newId: "wt-1", handleNodeAction, currentNodes: [] });
      expect(node.type).toBe("automationStep");
      expect(node.data.step.type).toBe("wait");
      expect((node.data.step as any).value).toBe("1");
    });

    it("creates a screenshot step with savePath", () => {
      const node = createNode({
        type: "screenshot",
        newId: "ss-1",
        handleNodeAction,
        currentNodes: [],
      });
      expect(node.type).toBe("automationStep");
      expect(node.data.step.type).toBe("screenshot");
      expect((node.data.step as any).savePath).toBe("");
    });

    it("creates an extract step with selector and storeKey", () => {
      const node = createNode({
        type: "extract",
        newId: "ext-1",
        handleNodeAction,
        currentNodes: [],
      });
      expect(node.type).toBe("automationStep");
      expect(node.data.step.type).toBe("extract");
      expect((node.data.step as any).selector).toBe("");
      expect((node.data.step as any).storeKey).toBe("");
    });

    it("creates an apiCall step with method GET, url, headers, and body", () => {
      const node = createNode({
        type: "apiCall",
        newId: "api-1",
        handleNodeAction,
        currentNodes: [],
      });
      expect(node.type).toBe("automationStep");
      expect(node.data.step.type).toBe("apiCall");
      expect((node.data.step as any).method).toBe("GET");
      expect((node.data.step as any).url).toBe("");
      expect((node.data.step as any).headers).toEqual({});
      expect((node.data.step as any).body).toBe("");
    });

    it("creates a setVariable step with variableName and value", () => {
      const node = createNode({
        type: "setVariable",
        newId: "sv-1",
        handleNodeAction,
        currentNodes: [],
      });
      expect(node.type).toBe("automationStep");
      expect(node.data.step.type).toBe("setVariable");
      expect((node.data.step as any).variableName).toBe("");
      expect((node.data.step as any).value).toBe("");
    });

    it("creates a modifyVariable step with variableName, operation 'set', and value", () => {
      const node = createNode({
        type: "modifyVariable",
        newId: "mv-1",
        handleNodeAction,
        currentNodes: [],
      });
      expect(node.type).toBe("automationStep");
      expect(node.data.step.type).toBe("modifyVariable");
      expect((node.data.step as any).variableName).toBe("");
      expect((node.data.step as any).operation).toBe("set");
      expect((node.data.step as any).value).toBe("");
    });

    it("creates an aiOpenAI step with model 'gpt-4o-mini', prompt, and storeKey", () => {
      const node = createNode({
        type: "aiOpenAI",
        newId: "oai-1",
        handleNodeAction,
        currentNodes: [],
      });
      expect(node.type).toBe("automationStep");
      expect(node.data.step.type).toBe("aiOpenAI");
      expect((node.data.step as any).model).toBe("gpt-4o-mini");
      expect((node.data.step as any).prompt).toBe("");
      expect((node.data.step as any).storeKey).toBe("aiResponse");
    });

    it("creates an aiAnthropic step with a model containing 'claude'", () => {
      const node = createNode({
        type: "aiAnthropic",
        newId: "ant-1",
        handleNodeAction,
        currentNodes: [],
      });
      expect(node.type).toBe("automationStep");
      expect(node.data.step.type).toBe("aiAnthropic");
      expect((node.data.step as any).model).toContain("claude");
    });

    it("creates an aiOllama step with model 'mistral' and baseUrl", () => {
      const node = createNode({
        type: "aiOllama",
        newId: "oll-1",
        handleNodeAction,
        currentNodes: [],
      });
      expect(node.type).toBe("automationStep");
      expect(node.data.step.type).toBe("aiOllama");
      expect((node.data.step as any).model).toBe("mistral");
      expect((node.data.step as any).baseUrl).toBe("http://localhost:11434");
    });

    it("creates a scroll step with scrollType 'toElement'", () => {
      const node = createNode({
        type: "scroll",
        newId: "scr-1",
        handleNodeAction,
        currentNodes: [],
      });
      expect(node.type).toBe("automationStep");
      expect(node.data.step.type).toBe("scroll");
      expect((node.data.step as any).scrollType).toBe("toElement");
    });

    it("creates a fileUpload step with selector and filePath", () => {
      const node = createNode({
        type: "fileUpload",
        newId: "fu-1",
        handleNodeAction,
        currentNodes: [],
      });
      expect(node.type).toBe("automationStep");
      expect(node.data.step.type).toBe("fileUpload");
      expect((node.data.step as any).selector).toBe("");
      expect((node.data.step as any).filePath).toBe("");
    });

    it("creates a hover step with selector", () => {
      const node = createNode({
        type: "hover",
        newId: "hov-1",
        handleNodeAction,
        currentNodes: [],
      });
      expect(node.type).toBe("automationStep");
      expect(node.data.step.type).toBe("hover");
      expect((node.data.step as any).selector).toBe("");
    });

    it("creates a selectOption step with selector and optionValue", () => {
      const node = createNode({
        type: "selectOption",
        newId: "so-1",
        handleNodeAction,
        currentNodes: [],
      });
      expect(node.type).toBe("automationStep");
      expect(node.data.step.type).toBe("selectOption");
      expect((node.data.step as any).selector).toBe("");
      expect((node.data.step as any).optionValue).toBe("");
    });

    it("creates a discordSendMessage step with channelId and content", () => {
      const node = createNode({
        type: "discordSendMessage",
        newId: "dsm-1",
        handleNodeAction,
        currentNodes: [],
      });
      expect(node.type).toBe("automationStep");
      expect(node.data.step.type).toBe("discordSendMessage");
      expect((node.data.step as any).channelId).toBe("");
      expect((node.data.step as any).content).toBe("");
    });

    it("creates a slackSendMessage step with channelId and text", () => {
      const node = createNode({
        type: "slackSendMessage",
        newId: "ssm-1",
        handleNodeAction,
        currentNodes: [],
      });
      expect(node.type).toBe("automationStep");
      expect(node.data.step.type).toBe("slackSendMessage");
      expect((node.data.step as any).channelId).toBe("");
      expect((node.data.step as any).text).toBe("");
    });

    it("creates a twitterCreateTweet step with text", () => {
      const node = createNode({
        type: "twitterCreateTweet",
        newId: "tw-1",
        handleNodeAction,
        currentNodes: [],
      });
      expect(node.type).toBe("automationStep");
      expect(node.data.step.type).toBe("twitterCreateTweet");
      expect((node.data.step as any).text).toBe("");
    });

    it("falls through to click with selector 'body' for an unknown type", () => {
      const node = createNode({
        type: "unknownType" as any,
        newId: "unk-1",
        handleNodeAction,
        currentNodes: [],
      });
      expect(node.type).toBe("automationStep");
      expect(node.data.step.type).toBe("click");
      expect((node.data.step as any).selector).toBe("body");
    });
  });

  describe("Positioning", () => {
    it("positions based on sourceNode when provided", () => {
      const sourceNode = {
        id: "src",
        position: { x: 400, y: 300 },
        data: {},
        type: "automationStep",
      } as any;
      const node = createNode({
        type: "click",
        newId: "pos-1",
        handleNodeAction,
        currentNodes: [],
        sourceNode,
      });
      expect(node.position.x).toBe(400);
      expect(node.position.y).toBe(400);
    });

    it("uses x=250 when no sourceNode is provided", () => {
      const node = createNode({
        type: "click",
        newId: "pos-2",
        handleNodeAction,
        currentNodes: [],
      });
      expect(node.position.x).toBe(250);
    });

    it("calculates y based on currentNodes length when no sourceNode", () => {
      const currentNodes = [
        { id: "n1", position: { x: 0, y: 0 }, data: {}, type: "automationStep" },
        { id: "n2", position: { x: 0, y: 0 }, data: {}, type: "automationStep" },
        { id: "n3", position: { x: 0, y: 0 }, data: {}, type: "automationStep" },
      ] as any[];
      const node = createNode({ type: "click", newId: "pos-3", handleNodeAction, currentNodes });
      expect(node.position.y).toBe(3 * 150 + 50);
    });

    it("positions a browserConditional node correctly with sourceNode", () => {
      const sourceNode = {
        id: "src",
        position: { x: 100, y: 200 },
        data: {},
        type: "automationStep",
      } as any;
      const node = createNode({
        type: "browserConditional",
        newId: "pos-4",
        handleNodeAction,
        currentNodes: [],
        sourceNode,
      });
      expect(node.position.x).toBe(100);
      expect(node.position.y).toBe(300);
    });

    it("handles an empty currentNodes array for y calculation", () => {
      const node = createNode({
        type: "click",
        newId: "pos-5",
        handleNodeAction,
        currentNodes: [],
      });
      expect(node.position.y).toBe(0 * 150 + 50);
    });
  });
});
