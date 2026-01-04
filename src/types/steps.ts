import {
  Camera,
  Clock,
  Code,
  GitBranch,
  Globe,
  Hash,
  MessageCircle,
  Mouse,
  Send,
  Smile,
  Twitter,
  Type as TypeIcon,
  Variable,
  Zap,
} from "lucide-react";

/**
 * Automation Step Type System
 *
 * This module defines a discriminated union for all automation step types.
 * Each step has a unique 'type' field that TypeScript uses for type narrowing.
 */

/** Base properties shared by all automation steps */
export interface StepBase {
  id: string;
  description: string;
}

/** Navigate to a URL */
export interface StepNavigate extends StepBase {
  type: "navigate";
  value: string; // URL
}

export interface StepClick extends StepBase {
  type: "click";
  selector: string;
}

export interface StepType extends StepBase {
  type: "type";
  selector: string;
  value: string;
  credentialId?: string;
}

export interface StepWait extends StepBase {
  type: "wait";
  value: string; // seconds as string (current executor parses with parseInt)
}

export interface StepScreenshot extends StepBase {
  type: "screenshot";
  savePath?: string;
}

export interface StepExtract extends StepBase {
  type: "extract";
  selector: string;
  storeKey?: string;
}

export type ComparisonOp = "equals" | "contains" | "greaterThan" | "lessThan";

export interface StepApiCall extends StepBase {
  type: "apiCall";
  method?: "GET" | "POST";
  url: string;
  body?: string;
  headers?: Record<string, string>;
  storeKey?: string;
}

export type ScrollType = "toElement" | "byAmount";
export interface StepScroll extends StepBase {
  type: "scroll";
  scrollType: ScrollType;
  selector?: string; // required when toElement
  scrollAmount?: number; // required when byAmount
}

export interface StepSelectOption extends StepBase {
  type: "selectOption";
  selector: string;
  optionValue?: string;
  optionIndex?: number;
}

export interface StepFileUpload extends StepBase {
  type: "fileUpload";
  selector: string;
  filePath: string;
}

export interface StepHover extends StepBase {
  type: "hover";
  selector: string;
}

// Set / define a variable (can reference other variables via {{varName}})
export interface StepSetVariable extends StepBase {
  type: "setVariable";
  variableName: string;
  value: string; // supports {{var}} substitution
}

export type ModifyOp = "set" | "increment" | "decrement" | "append";

export interface StepModifyVariable extends StepBase {
  type: "modifyVariable";
  variableName: string;
  operation: ModifyOp;
  value: string; // supports {{var}} substitution
}

// Browser Conditional (DOM-based)
export interface StepBrowserConditional extends StepBase {
  type: "browserConditional";
  browserConditionType: "elementExists" | "valueMatches";
  selector: string;
  expectedValue?: string;
  condition?: "equals" | "contains" | "greaterThan" | "lessThan";
  transformType?: "none" | "stripCurrency" | "stripNonNumeric" | "regexReplace" | "removeChars";
  transformPattern?: string;
  transformReplace?: string;
  transformChars?: string;
  parseAsNumber?: boolean;
}

// Variable Conditional (variable-based)
export interface StepVariableConditional extends StepBase {
  type: "variableConditional";
  variableConditionType:
    | "variableEquals"
    | "variableContains"
    | "variableGreaterThan"
    | "variableLessThan"
    | "variableExists";
  variableName: string;
  expectedValue?: string;
  parseAsNumber?: boolean;
}

// Twitter Integration Steps
export interface StepTwitterCreateTweet extends StepBase {
  type: "twitterCreateTweet";
  text: string;
  credentialId?: string; // ID of saved credential
  apiKey?: string; // Optional: direct input (legacy)
  apiSecret?: string;
  accessToken?: string;
  accessSecret?: string;
  replyToTweetId?: string;
  quoteTweetId?: string;
  mediaId?: string;
  storeKey?: string;
}

export interface StepTwitterDeleteTweet extends StepBase {
  type: "twitterDeleteTweet";
  tweetId: string;
  credentialId?: string;
  apiKey?: string;
  apiSecret?: string;
  accessToken?: string;
  accessSecret?: string;
  storeKey?: string;
}

export interface StepTwitterLikeTweet extends StepBase {
  type: "twitterLikeTweet";
  tweetId: string;
  credentialId?: string;
  apiKey?: string;
  apiSecret?: string;
  accessToken?: string;
  accessSecret?: string;
  storeKey?: string;
}

export interface StepTwitterRetweet extends StepBase {
  type: "twitterRetweet";
  tweetId: string;
  credentialId?: string;
  apiKey?: string;
  apiSecret?: string;
  accessToken?: string;
  accessSecret?: string;
  storeKey?: string;
}

export interface StepTwitterSearchTweets extends StepBase {
  type: "twitterSearchTweets";
  searchQuery: string;
  credentialId?: string;
  apiKey?: string;
  apiSecret?: string;
  accessToken?: string;
  accessSecret?: string;
  maxResults?: number;
  startTime?: string;
  endTime?: string;
  storeKey?: string;
}

export interface StepTwitterSendDM extends StepBase {
  type: "twitterSendDM";
  userId: string;
  text: string;
  credentialId?: string;
  apiKey?: string;
  apiSecret?: string;
  accessToken?: string;
  accessSecret?: string;
  mediaId?: string;
  storeKey?: string;
}

export interface StepTwitterSearchUser extends StepBase {
  type: "twitterSearchUser";
  username: string;
  credentialId?: string;
  apiKey?: string;
  apiSecret?: string;
  accessToken?: string;
  accessSecret?: string;
  storeKey?: string;
}

// Discord Integration Steps
export interface StepDiscordSendMessage extends StepBase {
  type: "discordSendMessage";
  channelId: string;
  content: string;
  tts?: boolean;
  credentialId?: string;
  botToken?: string;
  storeKey?: string;
}

export interface StepDiscordSendWebhook extends StepBase {
  type: "discordSendWebhook";
  webhookUrl?: string;
  credentialId?: string;
  botToken?: string;
  content: string;
  username?: string;
  avatarUrl?: string;
  tts?: boolean;
  embedsJson?: string;
  storeKey?: string;
}

export interface StepDiscordReactMessage extends StepBase {
  type: "discordReactMessage";
  channelId: string;
  messageId: string;
  emoji: string;
  credentialId?: string;
  botToken?: string;
}

export interface StepDiscordGetMessage extends StepBase {
  type: "discordGetMessage";
  channelId: string;
  messageId: string;
  credentialId?: string;
  botToken?: string;
  storeKey?: string;
}

export interface StepDiscordListMessages extends StepBase {
  type: "discordListMessages";
  channelId: string;
  limit?: number;
  credentialId?: string;
  botToken?: string;
  storeKey?: string;
}

export interface StepDiscordDeleteMessage extends StepBase {
  type: "discordDeleteMessage";
  channelId: string;
  messageId: string;
  credentialId?: string;
  botToken?: string;
}

// Union of all supported steps used throughout the app
export type AutomationStep =
  | StepNavigate
  | StepClick
  | StepType
  | StepWait
  | StepScreenshot
  | StepExtract
  | StepApiCall
  | StepScroll
  | StepSelectOption
  | StepFileUpload
  | StepHover
  | StepSetVariable
  | StepModifyVariable
  | StepBrowserConditional
  | StepVariableConditional
  | StepTwitterCreateTweet
  | StepTwitterDeleteTweet
  | StepTwitterLikeTweet
  | StepTwitterRetweet
  | StepTwitterSearchTweets
  | StepTwitterSendDM
  | StepTwitterSearchUser
  | StepDiscordSendMessage
  | StepDiscordSendWebhook
  | StepDiscordReactMessage
  | StepDiscordGetMessage
  | StepDiscordListMessages
  | StepDiscordDeleteMessage;

// UI meta for step type picker - organized by category
export interface StepTypeOption {
  value: AutomationStep["type"];
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

export interface StepCategory {
  category: string;
  icon?: React.ComponentType<{ className?: string }>;
  steps: StepTypeOption[];
}

export const browserSteps: StepTypeOption[] = [
  { value: "navigate", label: "Navigate", icon: Globe, description: "Go to a URL" },
  { value: "click", label: "Click", icon: Mouse, description: "Click an element" },
  { value: "type", label: "Type", icon: TypeIcon, description: "Enter text" },
  {
    value: "selectOption",
    label: "Select Option",
    icon: TypeIcon,
    description: "Select an option from a dropdown",
  },
  { value: "wait", label: "Wait", icon: Clock, description: "Wait for a duration" },
  { value: "screenshot", label: "Screenshot", icon: Camera, description: "Take a screenshot" },
  {
    value: "extract",
    label: "Extract",
    icon: TypeIcon,
    description: "Extract text and store in variable",
  },
  {
    value: "scroll",
    label: "Scroll",
    icon: Mouse,
    description: "Scroll the page or to an element",
  },
  {
    value: "hover",
    label: "Hover",
    icon: Mouse,
    description: "Hover over an element",
  },
  {
    value: "fileUpload",
    label: "File Upload",
    icon: TypeIcon,
    description: "Upload a file",
  },
];

export const dataSteps: StepTypeOption[] = [
  {
    value: "setVariable",
    label: "Set Variable",
    icon: TypeIcon,
    description: "Define or update a variable",
  },
  {
    value: "modifyVariable",
    label: "Modify Variable",
    icon: TypeIcon,
    description: "Increment / decrement / edit a variable",
  },
];

export const logicSteps: StepTypeOption[] = [
  {
    value: "browserConditional",
    label: "Browser Conditional",
    icon: GitBranch,
    description: "Branch based on DOM element or value",
  },
  {
    value: "variableConditional",
    label: "Variable Conditional",
    icon: Variable,
    description: "Branch based on variable condition",
  },
];

export const integrationSteps: StepTypeOption[] = [
  {
    value: "apiCall",
    label: "API Call",
    icon: Zap,
    description: "Make HTTP request (GET/POST)",
  },
];

export const discordSteps: StepTypeOption[] = [
  {
    value: "discordSendMessage",
    label: "Discord Send Message",
    icon: MessageCircle,
    description: "Send a message to a channel",
  },
  {
    value: "discordSendWebhook",
    label: "Discord Webhook",
    icon: Send,
    description: "Post a message via webhook",
  },
  {
    value: "discordReactMessage",
    label: "Discord React",
    icon: Smile,
    description: "Add a reaction to a message",
  },
  {
    value: "discordGetMessage",
    label: "Discord Get Message",
    icon: Hash,
    description: "Fetch a specific message",
  },
  {
    value: "discordListMessages",
    label: "Discord List Messages",
    icon: Hash,
    description: "List recent channel messages",
  },
  {
    value: "discordDeleteMessage",
    label: "Discord Delete Message",
    icon: MessageCircle,
    description: "Delete a message",
  },
];

export const twitterSteps: StepTypeOption[] = [
  {
    value: "twitterCreateTweet",
    label: "Create Tweet",
    icon: Twitter,
    description: "Post a new tweet to Twitter/X",
  },
  {
    value: "twitterDeleteTweet",
    label: "Delete Tweet",
    icon: Twitter,
    description: "Delete a tweet from Twitter/X",
  },
  {
    value: "twitterLikeTweet",
    label: "Like Tweet",
    icon: Twitter,
    description: "Like a tweet on Twitter/X",
  },
  {
    value: "twitterRetweet",
    label: "Retweet",
    icon: Twitter,
    description: "Retweet a tweet on Twitter/X",
  },
  {
    value: "twitterSearchTweets",
    label: "Search Tweets",
    icon: Twitter,
    description: "Search for tweets on Twitter/X",
  },
  {
    value: "twitterSendDM",
    label: "Send Direct Message",
    icon: Twitter,
    description: "Send a DM on Twitter/X",
  },
  {
    value: "twitterSearchUser",
    label: "Search User",
    icon: Twitter,
    description: "Search for a user on Twitter/X",
  },
];

export const stepCategories: StepCategory[] = [
  {
    category: "Browser",
    icon: Globe,
    steps: browserSteps,
  },
  {
    category: "Data",
    icon: TypeIcon,
    steps: dataSteps,
  },
  {
    category: "Logic",
    icon: GitBranch,
    steps: logicSteps,
  },
  {
    category: "Integration",
    icon: Code,
    steps: integrationSteps,
  },
  {
    category: "Discord",
    icon: MessageCircle,
    steps: discordSteps,
  },
  {
    category: "Twitter/X",
    icon: Twitter,
    steps: twitterSteps,
  },
];

export const stepTypes = [
  ...browserSteps,
  ...dataSteps,
  ...logicSteps,
  ...integrationSteps,
  ...discordSteps,
  ...twitterSteps,
] as const;
