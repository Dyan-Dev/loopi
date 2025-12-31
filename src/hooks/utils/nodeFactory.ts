import type { AutomationStep, ReactFlowNode } from "@app-types";
import { stepTypes } from "@app-types";
import type { NodeDataBase } from "@app-types/flow";

/**
 * Factory function to create a new node of a given type.
 * Handles conditional nodes (browser and variable) and automation step nodes.
 */
export function createNode({
  type,
  newId,
  sourceNode,
  handleNodeAction,
  currentNodes,
}: {
  type: AutomationStep["type"];
  newId: string;
  sourceNode?: ReactFlowNode;
  handleNodeAction: (
    sourceId: string,
    type: AutomationStep["type"] | "update" | "delete",
    updates?: Partial<NodeDataBase>
  ) => void;
  currentNodes: ReactFlowNode[];
}): ReactFlowNode {
  if (type === "browserConditional") {
    return {
      id: newId,
      type: "browserConditional",
      data: {
        step: {
          id: newId,
          type: "browserConditional",
          description: "Browser Conditional step",
          browserConditionType: "elementExists",
          selector: "",
        },
        onAddNode: handleNodeAction,
        nodeRunning: false,
      },
      position: {
        x: sourceNode ? sourceNode.position.x : 250,
        y: sourceNode ? sourceNode.position.y + 100 : currentNodes.length * 150 + 50,
      },
    };
  }
  if (type === "variableConditional") {
    return {
      id: newId,
      type: "variableConditional",
      data: {
        step: {
          id: newId,
          type: "variableConditional",
          description: "Variable Conditional step",
          variableConditionType: "variableEquals",
          variableName: "",
        },
        onAddNode: handleNodeAction,
        nodeRunning: false,
      },
      position: {
        x: sourceNode ? sourceNode.position.x : 250,
        y: sourceNode ? sourceNode.position.y + 100 : currentNodes.length * 150 + 50,
      },
    };
  }
  const label = stepTypes.find((s) => s.value === (type as string))?.label || "Step";
  let step: AutomationStep;
  switch (type) {
    case "navigate":
      step = { id: newId, type: "navigate", description: `${label} step`, value: "https://" };
      break;
    case "click":
      step = { id: newId, type: "click", description: `${label} step`, selector: "body" };
      break;
    case "type":
      step = { id: newId, type: "type", description: `${label} step`, selector: "body", value: "" };
      break;
    case "wait":
      step = { id: newId, type: "wait", description: `${label} step`, value: "1" };
      break;
    case "screenshot":
      step = { id: newId, type: "screenshot", description: `${label} step`, savePath: "" };
      break;
    case "selectOption":
      step = {
        id: newId,
        type: "selectOption",
        description: `${label} step`,
        selector: "",
        optionValue: "",
      };
      break;
    case "extract":
      step = {
        id: newId,
        type: "extract",
        description: `${label} step`,
        selector: "",
        storeKey: "",
      };
      break;
    case "apiCall":
      step = {
        id: newId,
        type: "apiCall",
        description: `${label} step`,
        method: "GET",
        url: "",
        headers: {},
        body: "",
      };
      break;
    case "scroll":
      step = {
        id: newId,
        type: "scroll",
        description: `${label} step`,
        scrollType: "toElement",
        selector: "",
      };
      break;
    case "fileUpload":
      step = {
        id: newId,
        type: "fileUpload",
        description: `${label} step`,
        selector: "",
        filePath: "",
      };
      break;
    case "hover":
      step = { id: newId, type: "hover", description: `${label} step`, selector: "" };
      break;
    case "setVariable":
      step = {
        id: newId,
        type: "setVariable",
        description: `${label} step`,
        variableName: "",
        value: "",
      };
      break;
    case "modifyVariable":
      step = {
        id: newId,
        type: "modifyVariable",
        description: `${label} step`,
        variableName: "",
        operation: "set",
        value: "",
      };
      break;
    case "twitterCreateTweet":
      step = {
        id: newId,
        type: "twitterCreateTweet",
        description: `${label} step`,
        text: "",
        apiKey: "",
        apiSecret: "",
        accessToken: "",
        accessSecret: "",
      };
      break;
    case "twitterDeleteTweet":
      step = {
        id: newId,
        type: "twitterDeleteTweet",
        description: `${label} step`,
        tweetId: "",
        apiKey: "",
        apiSecret: "",
        accessToken: "",
        accessSecret: "",
      };
      break;
    case "twitterLikeTweet":
      step = {
        id: newId,
        type: "twitterLikeTweet",
        description: `${label} step`,
        tweetId: "",
        apiKey: "",
        apiSecret: "",
        accessToken: "",
        accessSecret: "",
      };
      break;
    case "twitterRetweet":
      step = {
        id: newId,
        type: "twitterRetweet",
        description: `${label} step`,
        tweetId: "",
        apiKey: "",
        apiSecret: "",
        accessToken: "",
        accessSecret: "",
      };
      break;
    case "twitterSearchTweets":
      step = {
        id: newId,
        type: "twitterSearchTweets",
        description: `${label} step`,
        searchQuery: "",
        apiKey: "",
        apiSecret: "",
        accessToken: "",
        accessSecret: "",
      };
      break;
    case "twitterSendDM":
      step = {
        id: newId,
        type: "twitterSendDM",
        description: `${label} step`,
        userId: "",
        text: "",
        apiKey: "",
        apiSecret: "",
        accessToken: "",
        accessSecret: "",
      };
      break;
    case "twitterSearchUser":
      step = {
        id: newId,
        type: "twitterSearchUser",
        description: `${label} step`,
        username: "",
        apiKey: "",
        apiSecret: "",
        accessToken: "",
        accessSecret: "",
      };
      break;
    default:
      step = { id: newId, type: "click", description: `${label} step`, selector: "body" };
  }
  return {
    id: newId,
    type: "automationStep",
    data: {
      step,
      onAddNode: handleNodeAction,
      nodeRunning: false,
    },
    position: {
      x: sourceNode ? sourceNode.position.x : 250,
      y: sourceNode ? sourceNode.position.y + 100 : currentNodes.length * 150 + 50,
    },
  };
}
