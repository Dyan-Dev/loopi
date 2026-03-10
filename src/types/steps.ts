import {
  Braces,
  Calculator,
  Calendar,
  Camera,
  Clock,
  Cloud,
  Code,
  CreditCard,
  Database,
  FileText,
  Filter,
  FolderOpen,
  GitBranch,
  Globe,
  Hash,
  Link,
  List,
  Lock,
  Mail,
  MessageCircle,
  Mouse,
  Phone,
  Repeat,
  Send,
  Server,
  Sheet,
  ShoppingCart,
  Smile,
  Sparkles,
  Twitter,
  Type as TypeIcon,
  Variable,
  Zap,
} from "lucide-react";
import type { IntegrationStep } from "./integrations";
import type {
  SlackAddReactionStep,
  SlackArchiveChannelStep,
  SlackCreateChannelStep,
  SlackDeleteMessageStep,
  SlackGetChannelStep,
  SlackGetHistoryStep,
  SlackGetUserStep,
  SlackInviteUsersStep,
  SlackListChannelsStep,
  SlackListMembersStep,
  SlackListUsersStep,
  SlackSendMessageStep,
  SlackSetTopicStep,
  SlackUnarchiveChannelStep,
  SlackUpdateMessageStep,
  SlackUploadFileStep,
} from "./slack";

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
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "HEAD" | "OPTIONS";
  url: string;
  body?: string;
  headers?: Record<string, string>;
  storeKey?: string;
  contentType?: "json" | "form" | "text" | "none";
  timeout?: number;
}

/** Parse a JSON string into an object */
export interface StepJsonParse extends StepBase {
  type: "jsonParse";
  sourceVariable: string;
  storeKey?: string;
}

/** Stringify an object to JSON */
export interface StepJsonStringify extends StepBase {
  type: "jsonStringify";
  sourceVariable: string;
  pretty?: boolean;
  storeKey?: string;
}

/** Math operations on variables */
export type MathOp =
  | "add"
  | "subtract"
  | "multiply"
  | "divide"
  | "modulo"
  | "power"
  | "abs"
  | "round"
  | "floor"
  | "ceil"
  | "min"
  | "max"
  | "random";
export interface StepMathOperation extends StepBase {
  type: "mathOperation";
  operation: MathOp;
  valueA: string;
  valueB?: string;
  storeKey?: string;
}

/** String operations */
export type StringOp =
  | "uppercase"
  | "lowercase"
  | "trim"
  | "replace"
  | "split"
  | "join"
  | "substring"
  | "length"
  | "includes"
  | "startsWith"
  | "endsWith"
  | "padStart"
  | "padEnd"
  | "repeat"
  | "reverse";
export interface StepStringOperation extends StepBase {
  type: "stringOperation";
  operation: StringOp;
  value: string;
  param1?: string;
  param2?: string;
  storeKey?: string;
}

/** Date/Time operations */
export type DateTimeOp =
  | "now"
  | "format"
  | "add"
  | "subtract"
  | "diff"
  | "parse"
  | "timestamp"
  | "dayOfWeek"
  | "startOf"
  | "endOf";
export interface StepDateTime extends StepBase {
  type: "dateTime";
  operation: DateTimeOp;
  value?: string;
  format?: string;
  amount?: number;
  unit?: "milliseconds" | "seconds" | "minutes" | "hours" | "days" | "weeks" | "months" | "years";
  storeKey?: string;
}

/** Filter array by condition */
export interface StepFilterArray extends StepBase {
  type: "filterArray";
  sourceVariable: string;
  condition:
    | "equals"
    | "notEquals"
    | "contains"
    | "greaterThan"
    | "lessThan"
    | "truthy"
    | "falsy"
    | "exists";
  field?: string;
  compareValue?: string;
  storeKey?: string;
}

/** Map/transform array items */
export interface StepMapArray extends StepBase {
  type: "mapArray";
  sourceVariable: string;
  expression: string;
  storeKey?: string;
}

/** Execute a JavaScript expression */
export interface StepCodeExecute extends StepBase {
  type: "codeExecute";
  code: string;
  storeKey?: string;
}

// ─── Integration Node Types ──────────────────────────────────────────

/** Telegram Bot */
export type TelegramOperation =
  | "telegramSendMessage"
  | "telegramSendPhoto"
  | "telegramEditMessage"
  | "telegramDeleteMessage"
  | "telegramSendLocation"
  | "telegramGetUpdates"
  | "telegramSendDocument";

export interface StepTelegramSendMessage extends StepBase {
  type: "telegramSendMessage";
  chatId: string;
  text: string;
  parseMode?: string;
  disableNotification?: boolean;
  credentialId?: string;
  botToken?: string;
  storeKey?: string;
}
export interface StepTelegramSendPhoto extends StepBase {
  type: "telegramSendPhoto";
  chatId: string;
  photo: string;
  caption?: string;
  credentialId?: string;
  botToken?: string;
  storeKey?: string;
}
export interface StepTelegramEditMessage extends StepBase {
  type: "telegramEditMessage";
  chatId: string;
  messageId: string;
  text: string;
  credentialId?: string;
  botToken?: string;
  storeKey?: string;
}
export interface StepTelegramDeleteMessage extends StepBase {
  type: "telegramDeleteMessage";
  chatId: string;
  messageId: string;
  credentialId?: string;
  botToken?: string;
}
export interface StepTelegramSendLocation extends StepBase {
  type: "telegramSendLocation";
  chatId: string;
  latitude: string;
  longitude: string;
  credentialId?: string;
  botToken?: string;
  storeKey?: string;
}
export interface StepTelegramGetUpdates extends StepBase {
  type: "telegramGetUpdates";
  offset?: string;
  limit?: string;
  credentialId?: string;
  botToken?: string;
  storeKey?: string;
}
export interface StepTelegramSendDocument extends StepBase {
  type: "telegramSendDocument";
  chatId: string;
  document: string;
  caption?: string;
  credentialId?: string;
  botToken?: string;
  storeKey?: string;
}

/** GitHub */
export interface StepGithubCreateIssue extends StepBase {
  type: "githubCreateIssue";
  owner: string;
  repo: string;
  title: string;
  body?: string;
  labels?: string;
  assignees?: string;
  credentialId?: string;
  accessToken?: string;
  storeKey?: string;
}
export interface StepGithubGetIssue extends StepBase {
  type: "githubGetIssue";
  owner: string;
  repo: string;
  issueNumber: string;
  credentialId?: string;
  accessToken?: string;
  storeKey?: string;
}
export interface StepGithubListIssues extends StepBase {
  type: "githubListIssues";
  owner: string;
  repo: string;
  state?: string;
  labels?: string;
  perPage?: string;
  credentialId?: string;
  accessToken?: string;
  storeKey?: string;
}
export interface StepGithubCreateComment extends StepBase {
  type: "githubCreateComment";
  owner: string;
  repo: string;
  issueNumber: string;
  body: string;
  credentialId?: string;
  accessToken?: string;
  storeKey?: string;
}
export interface StepGithubGetRepo extends StepBase {
  type: "githubGetRepo";
  owner: string;
  repo: string;
  credentialId?: string;
  accessToken?: string;
  storeKey?: string;
}
export interface StepGithubListRepos extends StepBase {
  type: "githubListRepos";
  owner?: string;
  repoType?: string;
  perPage?: string;
  credentialId?: string;
  accessToken?: string;
  storeKey?: string;
}
export interface StepGithubCreateRelease extends StepBase {
  type: "githubCreateRelease";
  owner: string;
  repo: string;
  tagName: string;
  name?: string;
  body?: string;
  draft?: boolean;
  prerelease?: boolean;
  credentialId?: string;
  accessToken?: string;
  storeKey?: string;
}

/** Notion */
export interface StepNotionCreatePage extends StepBase {
  type: "notionCreatePage";
  parentId: string;
  parentType?: string;
  title: string;
  content?: string;
  properties?: string;
  credentialId?: string;
  apiKey?: string;
  storeKey?: string;
}
export interface StepNotionGetPage extends StepBase {
  type: "notionGetPage";
  pageId: string;
  credentialId?: string;
  apiKey?: string;
  storeKey?: string;
}
export interface StepNotionUpdatePage extends StepBase {
  type: "notionUpdatePage";
  pageId: string;
  properties: string;
  archived?: boolean;
  credentialId?: string;
  apiKey?: string;
  storeKey?: string;
}
export interface StepNotionQueryDatabase extends StepBase {
  type: "notionQueryDatabase";
  databaseId: string;
  filter?: string;
  sorts?: string;
  pageSize?: number;
  credentialId?: string;
  apiKey?: string;
  storeKey?: string;
}
export interface StepNotionCreateDatabaseEntry extends StepBase {
  type: "notionCreateDatabaseEntry";
  databaseId: string;
  properties: string;
  credentialId?: string;
  apiKey?: string;
  storeKey?: string;
}
export interface StepNotionSearch extends StepBase {
  type: "notionSearch";
  query: string;
  filterType?: string;
  pageSize?: number;
  credentialId?: string;
  apiKey?: string;
  storeKey?: string;
}

/** SendGrid */
export interface StepSendGridSendEmail extends StepBase {
  type: "sendgridSendEmail";
  toEmail: string;
  fromEmail: string;
  fromName?: string;
  subject: string;
  contentType?: string;
  content: string;
  cc?: string;
  bcc?: string;
  replyTo?: string;
  credentialId?: string;
  apiKey?: string;
  storeKey?: string;
}
export interface StepSendGridSendTemplate extends StepBase {
  type: "sendgridSendTemplate";
  toEmail: string;
  fromEmail: string;
  fromName?: string;
  templateId: string;
  dynamicData?: string;
  credentialId?: string;
  apiKey?: string;
  storeKey?: string;
}
export interface StepSendGridGetContacts extends StepBase {
  type: "sendgridGetContacts";
  credentialId?: string;
  apiKey?: string;
  storeKey?: string;
}

/** Stripe */
export interface StepStripeGetBalance extends StepBase {
  type: "stripeGetBalance";
  credentialId?: string;
  secretKey?: string;
  storeKey?: string;
}
export interface StepStripeCreateCustomer extends StepBase {
  type: "stripeCreateCustomer";
  name?: string;
  email?: string;
  customerDescription?: string;
  phone?: string;
  metadata?: string;
  credentialId?: string;
  secretKey?: string;
  storeKey?: string;
}
export interface StepStripeGetCustomer extends StepBase {
  type: "stripeGetCustomer";
  customerId: string;
  credentialId?: string;
  secretKey?: string;
  storeKey?: string;
}
export interface StepStripeListCustomers extends StepBase {
  type: "stripeListCustomers";
  limit?: string;
  email?: string;
  credentialId?: string;
  secretKey?: string;
  storeKey?: string;
}
export interface StepStripeCreateCharge extends StepBase {
  type: "stripeCreateCharge";
  amount: string;
  currency: string;
  customerId?: string;
  source?: string;
  chargeDescription?: string;
  credentialId?: string;
  secretKey?: string;
  storeKey?: string;
}
export interface StepStripeCreatePaymentIntent extends StepBase {
  type: "stripeCreatePaymentIntent";
  amount: string;
  currency: string;
  customerId?: string;
  paymentMethodTypes?: string;
  intentDescription?: string;
  credentialId?: string;
  secretKey?: string;
  storeKey?: string;
}
export interface StepStripeListCharges extends StepBase {
  type: "stripeListCharges";
  limit?: string;
  customerId?: string;
  credentialId?: string;
  secretKey?: string;
  storeKey?: string;
}

/** Postgres */
export interface StepPostgresQuery extends StepBase {
  type: "postgresQuery";
  query: string;
  credentialId?: string;
  host?: string;
  port?: string;
  database?: string;
  user?: string;
  password?: string;
  ssl?: boolean;
  storeKey?: string;
}
export interface StepPostgresInsert extends StepBase {
  type: "postgresInsert";
  table: string;
  columns: string;
  values: string;
  returning?: string;
  credentialId?: string;
  host?: string;
  port?: string;
  database?: string;
  user?: string;
  password?: string;
  ssl?: boolean;
  storeKey?: string;
}
export interface StepPostgresSelect extends StepBase {
  type: "postgresSelect";
  table: string;
  columns?: string;
  where?: string;
  orderBy?: string;
  limit?: string;
  credentialId?: string;
  host?: string;
  port?: string;
  database?: string;
  user?: string;
  password?: string;
  ssl?: boolean;
  storeKey?: string;
}
export interface StepPostgresUpdate extends StepBase {
  type: "postgresUpdate";
  table: string;
  set: string;
  where: string;
  returning?: string;
  credentialId?: string;
  host?: string;
  port?: string;
  database?: string;
  user?: string;
  password?: string;
  ssl?: boolean;
  storeKey?: string;
}

/** Google Sheets */
export interface StepGoogleSheetsReadRows extends StepBase {
  type: "googleSheetsReadRows";
  spreadsheetId: string;
  range: string;
  firstRowHeaders?: boolean;
  credentialId?: string;
  apiKey?: string;
  storeKey?: string;
}
export interface StepGoogleSheetsAppendRow extends StepBase {
  type: "googleSheetsAppendRow";
  spreadsheetId: string;
  range: string;
  values: string;
  valueInputOption?: string;
  credentialId?: string;
  apiKey?: string;
  storeKey?: string;
}
export interface StepGoogleSheetsUpdateRow extends StepBase {
  type: "googleSheetsUpdateRow";
  spreadsheetId: string;
  range: string;
  values: string;
  valueInputOption?: string;
  credentialId?: string;
  apiKey?: string;
  storeKey?: string;
}
export interface StepGoogleSheetsClear extends StepBase {
  type: "googleSheetsClear";
  spreadsheetId: string;
  range: string;
  credentialId?: string;
  apiKey?: string;
  storeKey?: string;
}

/** OpenAI (including GPT-4, GPT-3.5, etc.) */
export interface StepAIOpenAI extends StepBase {
  type: "aiOpenAI";
  model: string;
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  baseUrl?: string;
  credentialId?: string;
  apiKey?: string;
  timeoutMs?: number;
  storeKey?: string;
}

/** Anthropic (Claude models) */
export interface StepAIAnthropic extends StepBase {
  type: "aiAnthropic";
  model: string;
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  baseUrl?: string;
  credentialId?: string;
  apiKey?: string;
  timeoutMs?: number;
  storeKey?: string;
}

/** Ollama (local models) */
export interface StepAIOllama extends StepBase {
  type: "aiOllama";
  model: string;
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  baseUrl?: string;
  timeoutMs?: number;
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

// ForEach Loop
export interface StepForEach extends StepBase {
  type: "forEach";
  arrayVariable: string; // variable name holding the array
  itemVariable: string; // variable name for current item (default: "currentItem")
  indexVariable: string; // variable name for current index (default: "loopIndex")
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
  | StepAIOpenAI
  | StepAIAnthropic
  | StepAIOllama
  | StepScroll
  | StepSelectOption
  | StepFileUpload
  | StepHover
  | StepSetVariable
  | StepModifyVariable
  | StepBrowserConditional
  | StepVariableConditional
  | StepForEach
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
  | StepDiscordDeleteMessage
  | StepJsonParse
  | StepJsonStringify
  | StepMathOperation
  | StepStringOperation
  | StepDateTime
  | StepFilterArray
  | StepMapArray
  | StepCodeExecute
  // Telegram
  | StepTelegramSendMessage
  | StepTelegramSendPhoto
  | StepTelegramEditMessage
  | StepTelegramDeleteMessage
  | StepTelegramSendLocation
  | StepTelegramGetUpdates
  | StepTelegramSendDocument
  // GitHub
  | StepGithubCreateIssue
  | StepGithubGetIssue
  | StepGithubListIssues
  | StepGithubCreateComment
  | StepGithubGetRepo
  | StepGithubListRepos
  | StepGithubCreateRelease
  // Notion
  | StepNotionCreatePage
  | StepNotionGetPage
  | StepNotionUpdatePage
  | StepNotionQueryDatabase
  | StepNotionCreateDatabaseEntry
  | StepNotionSearch
  // SendGrid
  | StepSendGridSendEmail
  | StepSendGridSendTemplate
  | StepSendGridGetContacts
  // Stripe
  | StepStripeGetBalance
  | StepStripeCreateCustomer
  | StepStripeGetCustomer
  | StepStripeListCustomers
  | StepStripeCreateCharge
  | StepStripeCreatePaymentIntent
  | StepStripeListCharges
  // Postgres
  | StepPostgresQuery
  | StepPostgresInsert
  | StepPostgresSelect
  | StepPostgresUpdate
  // Google Sheets
  | StepGoogleSheetsReadRows
  | StepGoogleSheetsAppendRow
  | StepGoogleSheetsUpdateRow
  | StepGoogleSheetsClear
  | SlackSendMessageStep
  | SlackUpdateMessageStep
  | SlackDeleteMessageStep
  | SlackCreateChannelStep
  | SlackGetChannelStep
  | SlackListChannelsStep
  | SlackInviteUsersStep
  | SlackListMembersStep
  | SlackSetTopicStep
  | SlackArchiveChannelStep
  | SlackUnarchiveChannelStep
  | SlackGetHistoryStep
  | SlackGetUserStep
  | SlackListUsersStep
  | SlackAddReactionStep
  | SlackUploadFileStep
  | IntegrationStep;

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
  {
    value: "navigate",
    label: "Navigate",
    icon: Globe,
    description: "Go to a URL",
  },
  {
    value: "click",
    label: "Click",
    icon: Mouse,
    description: "Click an element",
  },
  { value: "type", label: "Type", icon: TypeIcon, description: "Enter text" },
  {
    value: "selectOption",
    label: "Select Option",
    icon: TypeIcon,
    description: "Select an option from a dropdown",
  },
  {
    value: "wait",
    label: "Wait",
    icon: Clock,
    description: "Wait for a duration",
  },
  {
    value: "screenshot",
    label: "Screenshot",
    icon: Camera,
    description: "Take a screenshot",
  },
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
  {
    value: "jsonParse",
    label: "JSON Parse",
    icon: Braces,
    description: "Parse a JSON string into an object",
  },
  {
    value: "jsonStringify",
    label: "JSON Stringify",
    icon: Braces,
    description: "Convert an object to a JSON string",
  },
  {
    value: "mathOperation",
    label: "Math",
    icon: Calculator,
    description: "Perform math operations (add, multiply, round, etc.)",
  },
  {
    value: "stringOperation",
    label: "String",
    icon: TypeIcon,
    description: "String operations (uppercase, replace, split, etc.)",
  },
  {
    value: "dateTime",
    label: "Date/Time",
    icon: Calendar,
    description: "Date/time operations (now, format, add, diff)",
  },
  {
    value: "filterArray",
    label: "Filter Array",
    icon: Filter,
    description: "Filter array items by condition",
  },
  {
    value: "mapArray",
    label: "Map Array",
    icon: List,
    description: "Transform each item in an array",
  },
  {
    value: "codeExecute",
    label: "Code",
    icon: Code,
    description: "Execute a JavaScript expression",
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
  {
    value: "forEach",
    label: "ForEach Loop",
    icon: Repeat,
    description: "Iterate over an array variable",
  },
];

export const integrationSteps: StepTypeOption[] = [
  {
    value: "apiCall",
    label: "HTTP Request",
    icon: Zap,
    description: "Make HTTP request (GET/POST/PUT/DELETE/PATCH)",
  },
];

export const telegramSteps: StepTypeOption[] = [
  {
    value: "telegramSendMessage",
    label: "Send Message",
    icon: Send,
    description: "Send a Telegram message",
  },
  {
    value: "telegramSendPhoto",
    label: "Send Photo",
    icon: Send,
    description: "Send a photo via Telegram",
  },
  {
    value: "telegramEditMessage",
    label: "Edit Message",
    icon: Send,
    description: "Edit an existing message",
  },
  {
    value: "telegramDeleteMessage",
    label: "Delete Message",
    icon: Send,
    description: "Delete a message",
  },
  {
    value: "telegramSendLocation",
    label: "Send Location",
    icon: Globe,
    description: "Send a GPS location",
  },
  {
    value: "telegramGetUpdates",
    label: "Get Updates",
    icon: Send,
    description: "Get recent bot updates",
  },
  {
    value: "telegramSendDocument",
    label: "Send Document",
    icon: FileText,
    description: "Send a file/document",
  },
];

export const githubSteps: StepTypeOption[] = [
  {
    value: "githubCreateIssue",
    label: "Create Issue",
    icon: GitBranch,
    description: "Create a GitHub issue",
  },
  {
    value: "githubGetIssue",
    label: "Get Issue",
    icon: GitBranch,
    description: "Get issue details",
  },
  {
    value: "githubListIssues",
    label: "List Issues",
    icon: GitBranch,
    description: "List repository issues",
  },
  {
    value: "githubCreateComment",
    label: "Create Comment",
    icon: MessageCircle,
    description: "Comment on an issue or PR",
  },
  {
    value: "githubGetRepo",
    label: "Get Repository",
    icon: Code,
    description: "Get repository info",
  },
  {
    value: "githubListRepos",
    label: "List Repositories",
    icon: Code,
    description: "List user/org repositories",
  },
  {
    value: "githubCreateRelease",
    label: "Create Release",
    icon: GitBranch,
    description: "Create a GitHub release",
  },
];

export const notionSteps: StepTypeOption[] = [
  {
    value: "notionCreatePage",
    label: "Create Page",
    icon: FileText,
    description: "Create a Notion page",
  },
  {
    value: "notionGetPage",
    label: "Get Page",
    icon: FileText,
    description: "Get a page by ID",
  },
  {
    value: "notionUpdatePage",
    label: "Update Page",
    icon: FileText,
    description: "Update page properties",
  },
  {
    value: "notionQueryDatabase",
    label: "Query Database",
    icon: Database,
    description: "Query a Notion database",
  },
  {
    value: "notionCreateDatabaseEntry",
    label: "Create DB Entry",
    icon: Database,
    description: "Add entry to Notion database",
  },
  {
    value: "notionSearch",
    label: "Search",
    icon: FileText,
    description: "Search pages and databases",
  },
];

export const sendgridSteps: StepTypeOption[] = [
  {
    value: "sendgridSendEmail",
    label: "Send Email",
    icon: Mail,
    description: "Send email via SendGrid",
  },
  {
    value: "sendgridSendTemplate",
    label: "Send Template",
    icon: Mail,
    description: "Send templated email",
  },
  {
    value: "sendgridGetContacts",
    label: "Get Contacts",
    icon: Mail,
    description: "List marketing contacts",
  },
];

export const stripeSteps: StepTypeOption[] = [
  {
    value: "stripeGetBalance",
    label: "Get Balance",
    icon: CreditCard,
    description: "Get Stripe account balance",
  },
  {
    value: "stripeCreateCustomer",
    label: "Create Customer",
    icon: CreditCard,
    description: "Create a Stripe customer",
  },
  {
    value: "stripeGetCustomer",
    label: "Get Customer",
    icon: CreditCard,
    description: "Get customer details",
  },
  {
    value: "stripeListCustomers",
    label: "List Customers",
    icon: CreditCard,
    description: "List Stripe customers",
  },
  {
    value: "stripeCreateCharge",
    label: "Create Charge",
    icon: CreditCard,
    description: "Create a payment charge",
  },
  {
    value: "stripeCreatePaymentIntent",
    label: "Payment Intent",
    icon: CreditCard,
    description: "Create a payment intent",
  },
  {
    value: "stripeListCharges",
    label: "List Charges",
    icon: CreditCard,
    description: "List payment charges",
  },
];

export const postgresSteps: StepTypeOption[] = [
  {
    value: "postgresQuery",
    label: "Execute Query",
    icon: Database,
    description: "Run a raw SQL query",
  },
  {
    value: "postgresInsert",
    label: "Insert",
    icon: Database,
    description: "Insert rows into a table",
  },
  {
    value: "postgresSelect",
    label: "Select",
    icon: Database,
    description: "Select rows from a table",
  },
  {
    value: "postgresUpdate",
    label: "Update",
    icon: Database,
    description: "Update rows in a table",
  },
];

export const googleSheetsSteps: StepTypeOption[] = [
  {
    value: "googleSheetsReadRows",
    label: "Read Rows",
    icon: Sheet,
    description: "Read rows from a spreadsheet",
  },
  {
    value: "googleSheetsAppendRow",
    label: "Append Row",
    icon: Sheet,
    description: "Add row to a spreadsheet",
  },
  {
    value: "googleSheetsUpdateRow",
    label: "Update Row",
    icon: Sheet,
    description: "Update a spreadsheet row",
  },
  {
    value: "googleSheetsClear",
    label: "Clear Range",
    icon: Sheet,
    description: "Clear a cell range",
  },
];

export const aiSteps: StepTypeOption[] = [
  {
    value: "aiOpenAI",
    label: "AI: OpenAI",
    icon: Sparkles,
    description: "Send prompt to OpenAI (GPT-4, etc.)",
  },
  {
    value: "aiAnthropic",
    label: "AI: Anthropic",
    icon: Sparkles,
    description: "Send prompt to Anthropic (Claude)",
  },
  {
    value: "aiOllama",
    label: "AI: Ollama",
    icon: Sparkles,
    description: "Send prompt to local Ollama model",
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

export const slackSteps: StepTypeOption[] = [
  {
    value: "slackSendMessage",
    label: "Send Message",
    icon: Send,
    description: "Send a message to a Slack channel",
  },
  {
    value: "slackUpdateMessage",
    label: "Update Message",
    icon: MessageCircle,
    description: "Update an existing Slack message",
  },
  {
    value: "slackDeleteMessage",
    label: "Delete Message",
    icon: MessageCircle,
    description: "Delete a message from Slack",
  },
  {
    value: "slackCreateChannel",
    label: "Create Channel",
    icon: Hash,
    description: "Create a new Slack channel",
  },
  {
    value: "slackGetChannel",
    label: "Get Channel",
    icon: Hash,
    description: "Get information about a Slack channel",
  },
  {
    value: "slackListChannels",
    label: "List Channels",
    icon: Hash,
    description: "List all Slack channels",
  },
  {
    value: "slackInviteUsers",
    label: "Invite Users",
    icon: Variable,
    description: "Invite users to a Slack channel",
  },
  {
    value: "slackListMembers",
    label: "List Members",
    icon: Variable,
    description: "List members of a Slack channel",
  },
  {
    value: "slackSetTopic",
    label: "Set Topic",
    icon: MessageCircle,
    description: "Set the topic of a Slack channel",
  },
  {
    value: "slackArchiveChannel",
    label: "Archive Channel",
    icon: Hash,
    description: "Archive a Slack channel",
  },
  {
    value: "slackUnarchiveChannel",
    label: "Unarchive Channel",
    icon: Hash,
    description: "Unarchive a Slack channel",
  },
  {
    value: "slackGetHistory",
    label: "Get History",
    icon: Clock,
    description: "Get message history from a Slack channel",
  },
  {
    value: "slackGetUser",
    label: "Get User",
    icon: Variable,
    description: "Get information about a Slack user",
  },
  {
    value: "slackListUsers",
    label: "List Users",
    icon: Variable,
    description: "List all Slack workspace users",
  },
  {
    value: "slackAddReaction",
    label: "Add Reaction",
    icon: Smile,
    description: "Add an emoji reaction to a message",
  },
  {
    value: "slackUploadFile",
    label: "Upload File",
    icon: Code,
    description: "Upload a file to a Slack channel",
  },
];

export const airtableSteps: StepTypeOption[] = [
  {
    value: "airtableCreateRecord",
    label: "Create Record",
    icon: Database,
    description: "Create an Airtable record",
  },
  {
    value: "airtableGetRecord",
    label: "Get Record",
    icon: Database,
    description: "Get an Airtable record",
  },
  {
    value: "airtableListRecords",
    label: "List Records",
    icon: Database,
    description: "List Airtable records",
  },
  {
    value: "airtableUpdateRecord",
    label: "Update Record",
    icon: Database,
    description: "Update an Airtable record",
  },
  {
    value: "airtableDeleteRecord",
    label: "Delete Record",
    icon: Database,
    description: "Delete an Airtable record",
  },
];

export const jiraSteps: StepTypeOption[] = [
  {
    value: "jiraCreateIssue",
    label: "Create Issue",
    icon: Globe,
    description: "Create a Jira issue",
  },
  {
    value: "jiraGetIssue",
    label: "Get Issue",
    icon: Globe,
    description: "Get a Jira issue",
  },
  {
    value: "jiraUpdateIssue",
    label: "Update Issue",
    icon: Globe,
    description: "Update a Jira issue",
  },
  {
    value: "jiraAddComment",
    label: "Add Comment",
    icon: MessageCircle,
    description: "Add comment to Jira issue",
  },
  {
    value: "jiraListIssues",
    label: "List Issues",
    icon: List,
    description: "Search Jira issues with JQL",
  },
];

export const hubspotSteps: StepTypeOption[] = [
  {
    value: "hubspotCreateContact",
    label: "Create Contact",
    icon: Globe,
    description: "Create a HubSpot contact",
  },
  {
    value: "hubspotGetContact",
    label: "Get Contact",
    icon: Globe,
    description: "Get a HubSpot contact",
  },
  {
    value: "hubspotUpdateContact",
    label: "Update Contact",
    icon: Globe,
    description: "Update a HubSpot contact",
  },
  {
    value: "hubspotCreateDeal",
    label: "Create Deal",
    icon: CreditCard,
    description: "Create a HubSpot deal",
  },
  {
    value: "hubspotGetDeal",
    label: "Get Deal",
    icon: CreditCard,
    description: "Get a HubSpot deal",
  },
];

export const twilioSteps: StepTypeOption[] = [
  {
    value: "twilioSendSms",
    label: "Send SMS",
    icon: Phone,
    description: "Send an SMS via Twilio",
  },
  {
    value: "twilioMakeCall",
    label: "Make Call",
    icon: Phone,
    description: "Make a phone call via Twilio",
  },
  {
    value: "twilioSendWhatsApp",
    label: "Send WhatsApp",
    icon: Phone,
    description: "Send WhatsApp message via Twilio",
  },
];

export const mailchimpSteps: StepTypeOption[] = [
  {
    value: "mailchimpAddSubscriber",
    label: "Add Subscriber",
    icon: Mail,
    description: "Add a Mailchimp subscriber",
  },
  {
    value: "mailchimpGetSubscriber",
    label: "Get Subscriber",
    icon: Mail,
    description: "Get a Mailchimp subscriber",
  },
  {
    value: "mailchimpCreateCampaign",
    label: "Create Campaign",
    icon: Mail,
    description: "Create a Mailchimp campaign",
  },
  {
    value: "mailchimpListCampaigns",
    label: "List Campaigns",
    icon: Mail,
    description: "List Mailchimp campaigns",
  },
];

export const zoomSteps: StepTypeOption[] = [
  {
    value: "zoomCreateMeeting",
    label: "Create Meeting",
    icon: Calendar,
    description: "Create a Zoom meeting",
  },
  {
    value: "zoomGetMeeting",
    label: "Get Meeting",
    icon: Calendar,
    description: "Get Zoom meeting details",
  },
  {
    value: "zoomListMeetings",
    label: "List Meetings",
    icon: Calendar,
    description: "List Zoom meetings",
  },
];

export const supabaseSteps: StepTypeOption[] = [
  {
    value: "supabaseSelect",
    label: "Select",
    icon: Database,
    description: "Select rows from Supabase",
  },
  {
    value: "supabaseInsert",
    label: "Insert",
    icon: Database,
    description: "Insert row into Supabase",
  },
  {
    value: "supabaseUpdate",
    label: "Update",
    icon: Database,
    description: "Update rows in Supabase",
  },
  {
    value: "supabaseDelete",
    label: "Delete",
    icon: Database,
    description: "Delete rows from Supabase",
  },
];

export const salesforceSteps: StepTypeOption[] = [
  {
    value: "salesforceCreateRecord",
    label: "Create Record",
    icon: Cloud,
    description: "Create Salesforce record",
  },
  {
    value: "salesforceGetRecord",
    label: "Get Record",
    icon: Cloud,
    description: "Get Salesforce record",
  },
  {
    value: "salesforceUpdateRecord",
    label: "Update Record",
    icon: Cloud,
    description: "Update Salesforce record",
  },
  {
    value: "salesforceQuery",
    label: "SOQL Query",
    icon: Cloud,
    description: "Run Salesforce SOQL query",
  },
];

export const trelloSteps: StepTypeOption[] = [
  {
    value: "trelloCreateCard",
    label: "Create Card",
    icon: Globe,
    description: "Create a Trello card",
  },
  {
    value: "trelloGetCard",
    label: "Get Card",
    icon: Globe,
    description: "Get a Trello card",
  },
  {
    value: "trelloMoveCard",
    label: "Move Card",
    icon: Globe,
    description: "Move a Trello card",
  },
  {
    value: "trelloListCards",
    label: "List Cards",
    icon: List,
    description: "List Trello cards",
  },
  {
    value: "trelloListBoards",
    label: "List Boards",
    icon: List,
    description: "List Trello boards",
  },
];

export const googleCalendarSteps: StepTypeOption[] = [
  {
    value: "googleCalendarCreateEvent",
    label: "Create Event",
    icon: Calendar,
    description: "Create a Google Calendar event",
  },
  {
    value: "googleCalendarGetEvents",
    label: "Get Events",
    icon: Calendar,
    description: "Get Google Calendar events",
  },
  {
    value: "googleCalendarUpdateEvent",
    label: "Update Event",
    icon: Calendar,
    description: "Update a Google Calendar event",
  },
  {
    value: "googleCalendarDeleteEvent",
    label: "Delete Event",
    icon: Calendar,
    description: "Delete a Google Calendar event",
  },
];

export const googleDriveSteps: StepTypeOption[] = [
  {
    value: "googleDriveUploadFile",
    label: "Upload File",
    icon: FolderOpen,
    description: "Upload file to Google Drive",
  },
  {
    value: "googleDriveListFiles",
    label: "List Files",
    icon: FolderOpen,
    description: "List Google Drive files",
  },
  {
    value: "googleDriveCreateFolder",
    label: "Create Folder",
    icon: FolderOpen,
    description: "Create a Google Drive folder",
  },
  {
    value: "googleDriveDeleteFile",
    label: "Delete File",
    icon: FolderOpen,
    description: "Delete a Google Drive file",
  },
];

export const gmailSteps: StepTypeOption[] = [
  {
    value: "gmailSendEmail",
    label: "Send Email",
    icon: Mail,
    description: "Send email via Gmail",
  },
  {
    value: "gmailGetEmails",
    label: "Get Emails",
    icon: Mail,
    description: "List Gmail messages",
  },
  {
    value: "gmailGetEmail",
    label: "Get Email",
    icon: Mail,
    description: "Get a Gmail message",
  },
];

export const mongodbSteps: StepTypeOption[] = [
  {
    value: "mongodbFind",
    label: "Find",
    icon: Database,
    description: "Find MongoDB documents",
  },
  {
    value: "mongodbInsertOne",
    label: "Insert One",
    icon: Database,
    description: "Insert a MongoDB document",
  },
  {
    value: "mongodbUpdateOne",
    label: "Update One",
    icon: Database,
    description: "Update a MongoDB document",
  },
  {
    value: "mongodbDeleteOne",
    label: "Delete One",
    icon: Database,
    description: "Delete a MongoDB document",
  },
  {
    value: "mongodbAggregate",
    label: "Aggregate",
    icon: Database,
    description: "Run MongoDB aggregation",
  },
];

export const mysqlSteps: StepTypeOption[] = [
  {
    value: "mysqlQuery",
    label: "Query",
    icon: Database,
    description: "Run a MySQL query",
  },
  {
    value: "mysqlInsert",
    label: "Insert",
    icon: Database,
    description: "Insert MySQL row",
  },
  {
    value: "mysqlSelect",
    label: "Select",
    icon: Database,
    description: "Select MySQL rows",
  },
  {
    value: "mysqlUpdate",
    label: "Update",
    icon: Database,
    description: "Update MySQL rows",
  },
];

export const redisSteps: StepTypeOption[] = [
  {
    value: "redisGet",
    label: "Get",
    icon: Server,
    description: "Get Redis value",
  },
  {
    value: "redisSet",
    label: "Set",
    icon: Server,
    description: "Set Redis value",
  },
  {
    value: "redisDelete",
    label: "Delete",
    icon: Server,
    description: "Delete Redis key",
  },
  {
    value: "redisKeys",
    label: "Keys",
    icon: Server,
    description: "List Redis keys",
  },
  {
    value: "redisHget",
    label: "Hash Get",
    icon: Server,
    description: "Get Redis hash field",
  },
  {
    value: "redisHset",
    label: "Hash Set",
    icon: Server,
    description: "Set Redis hash field",
  },
];

export const awsS3Steps: StepTypeOption[] = [
  {
    value: "s3PutObject",
    label: "Put Object",
    icon: Cloud,
    description: "Upload to S3",
  },
  {
    value: "s3GetObject",
    label: "Get Object",
    icon: Cloud,
    description: "Download from S3",
  },
  {
    value: "s3ListObjects",
    label: "List Objects",
    icon: Cloud,
    description: "List S3 objects",
  },
  {
    value: "s3DeleteObject",
    label: "Delete Object",
    icon: Cloud,
    description: "Delete S3 object",
  },
];

export const shopifySteps: StepTypeOption[] = [
  {
    value: "shopifyCreateProduct",
    label: "Create Product",
    icon: ShoppingCart,
    description: "Create Shopify product",
  },
  {
    value: "shopifyGetProduct",
    label: "Get Product",
    icon: ShoppingCart,
    description: "Get Shopify product",
  },
  {
    value: "shopifyListProducts",
    label: "List Products",
    icon: ShoppingCart,
    description: "List Shopify products",
  },
  {
    value: "shopifyCreateOrder",
    label: "Create Order",
    icon: ShoppingCart,
    description: "Create Shopify order",
  },
  {
    value: "shopifyGetOrder",
    label: "Get Order",
    icon: ShoppingCart,
    description: "Get Shopify order",
  },
  {
    value: "shopifyListOrders",
    label: "List Orders",
    icon: ShoppingCart,
    description: "List Shopify orders",
  },
];

export const asanaSteps: StepTypeOption[] = [
  {
    value: "asanaCreateTask",
    label: "Create Task",
    icon: Globe,
    description: "Create an Asana task",
  },
  {
    value: "asanaGetTask",
    label: "Get Task",
    icon: Globe,
    description: "Get an Asana task",
  },
  {
    value: "asanaUpdateTask",
    label: "Update Task",
    icon: Globe,
    description: "Update an Asana task",
  },
  {
    value: "asanaListTasks",
    label: "List Tasks",
    icon: List,
    description: "List Asana tasks",
  },
];

export const linearSteps: StepTypeOption[] = [
  {
    value: "linearCreateIssue",
    label: "Create Issue",
    icon: Globe,
    description: "Create a Linear issue",
  },
  {
    value: "linearGetIssue",
    label: "Get Issue",
    icon: Globe,
    description: "Get a Linear issue",
  },
  {
    value: "linearUpdateIssue",
    label: "Update Issue",
    icon: Globe,
    description: "Update a Linear issue",
  },
  {
    value: "linearListIssues",
    label: "List Issues",
    icon: List,
    description: "List Linear issues",
  },
];

export const clickupSteps: StepTypeOption[] = [
  {
    value: "clickupCreateTask",
    label: "Create Task",
    icon: Globe,
    description: "Create a ClickUp task",
  },
  {
    value: "clickupGetTask",
    label: "Get Task",
    icon: Globe,
    description: "Get a ClickUp task",
  },
  {
    value: "clickupUpdateTask",
    label: "Update Task",
    icon: Globe,
    description: "Update a ClickUp task",
  },
  {
    value: "clickupListTasks",
    label: "List Tasks",
    icon: List,
    description: "List ClickUp tasks",
  },
];

export const mondaySteps: StepTypeOption[] = [
  {
    value: "mondayCreateItem",
    label: "Create Item",
    icon: Globe,
    description: "Create a Monday.com item",
  },
  {
    value: "mondayGetItem",
    label: "Get Item",
    icon: Globe,
    description: "Get a Monday.com item",
  },
  {
    value: "mondayUpdateItem",
    label: "Update Item",
    icon: Globe,
    description: "Update a Monday.com item",
  },
  {
    value: "mondayListItems",
    label: "List Items",
    icon: List,
    description: "List Monday.com items",
  },
];

export const dropboxSteps: StepTypeOption[] = [
  {
    value: "dropboxUploadFile",
    label: "Upload File",
    icon: FolderOpen,
    description: "Upload file to Dropbox",
  },
  {
    value: "dropboxListFiles",
    label: "List Files",
    icon: FolderOpen,
    description: "List Dropbox files",
  },
  {
    value: "dropboxDownloadFile",
    label: "Download File",
    icon: FolderOpen,
    description: "Download from Dropbox",
  },
  {
    value: "dropboxDeleteFile",
    label: "Delete File",
    icon: FolderOpen,
    description: "Delete Dropbox file",
  },
];

export const boxSteps: StepTypeOption[] = [
  {
    value: "boxUploadFile",
    label: "Upload File",
    icon: FolderOpen,
    description: "Upload file to Box",
  },
  {
    value: "boxListFiles",
    label: "List Files",
    icon: FolderOpen,
    description: "List Box files",
  },
  {
    value: "boxGetFile",
    label: "Get File",
    icon: FolderOpen,
    description: "Get Box file info",
  },
  {
    value: "boxDeleteFile",
    label: "Delete File",
    icon: FolderOpen,
    description: "Delete Box file",
  },
];

export const gitlabSteps: StepTypeOption[] = [
  {
    value: "gitlabCreateIssue",
    label: "Create Issue",
    icon: GitBranch,
    description: "Create a GitLab issue",
  },
  {
    value: "gitlabGetIssue",
    label: "Get Issue",
    icon: GitBranch,
    description: "Get a GitLab issue",
  },
  {
    value: "gitlabListIssues",
    label: "List Issues",
    icon: GitBranch,
    description: "List GitLab issues",
  },
  {
    value: "gitlabCreateMergeRequest",
    label: "Create MR",
    icon: GitBranch,
    description: "Create GitLab merge request",
  },
];

export const paypalSteps: StepTypeOption[] = [
  {
    value: "paypalCreateOrder",
    label: "Create Order",
    icon: CreditCard,
    description: "Create PayPal order",
  },
  {
    value: "paypalGetOrder",
    label: "Get Order",
    icon: CreditCard,
    description: "Get PayPal order",
  },
  {
    value: "paypalCaptureOrder",
    label: "Capture Order",
    icon: CreditCard,
    description: "Capture PayPal order",
  },
  {
    value: "paypalListTransactions",
    label: "List Transactions",
    icon: CreditCard,
    description: "List PayPal transactions",
  },
];

export const typeformSteps: StepTypeOption[] = [
  {
    value: "typeformGetForm",
    label: "Get Form",
    icon: FileText,
    description: "Get Typeform form",
  },
  {
    value: "typeformListForms",
    label: "List Forms",
    icon: FileText,
    description: "List Typeform forms",
  },
  {
    value: "typeformGetResponses",
    label: "Get Responses",
    icon: FileText,
    description: "Get Typeform responses",
  },
];

export const calendlySteps: StepTypeOption[] = [
  {
    value: "calendlyGetUser",
    label: "Get User",
    icon: Calendar,
    description: "Get Calendly user info",
  },
  {
    value: "calendlyListEvents",
    label: "List Events",
    icon: Calendar,
    description: "List Calendly events",
  },
  {
    value: "calendlyListEventTypes",
    label: "List Event Types",
    icon: Calendar,
    description: "List Calendly event types",
  },
];

export const whatsappSteps: StepTypeOption[] = [
  {
    value: "whatsappSendMessage",
    label: "Send Message",
    icon: MessageCircle,
    description: "Send WhatsApp message",
  },
  {
    value: "whatsappSendTemplate",
    label: "Send Template",
    icon: MessageCircle,
    description: "Send WhatsApp template",
  },
  {
    value: "whatsappGetMedia",
    label: "Get Media",
    icon: MessageCircle,
    description: "Get WhatsApp media",
  },
];

export const intercomSteps: StepTypeOption[] = [
  {
    value: "intercomCreateContact",
    label: "Create Contact",
    icon: MessageCircle,
    description: "Create Intercom contact",
  },
  {
    value: "intercomGetContact",
    label: "Get Contact",
    icon: MessageCircle,
    description: "Get Intercom contact",
  },
  {
    value: "intercomSendMessage",
    label: "Send Message",
    icon: MessageCircle,
    description: "Send Intercom message",
  },
  {
    value: "intercomListContacts",
    label: "List Contacts",
    icon: List,
    description: "List Intercom contacts",
  },
];

export const zendeskSteps: StepTypeOption[] = [
  {
    value: "zendeskCreateTicket",
    label: "Create Ticket",
    icon: Globe,
    description: "Create Zendesk ticket",
  },
  {
    value: "zendeskGetTicket",
    label: "Get Ticket",
    icon: Globe,
    description: "Get Zendesk ticket",
  },
  {
    value: "zendeskUpdateTicket",
    label: "Update Ticket",
    icon: Globe,
    description: "Update Zendesk ticket",
  },
  {
    value: "zendeskListTickets",
    label: "List Tickets",
    icon: List,
    description: "List Zendesk tickets",
  },
];

export const freshdeskSteps: StepTypeOption[] = [
  {
    value: "freshdeskCreateTicket",
    label: "Create Ticket",
    icon: Globe,
    description: "Create Freshdesk ticket",
  },
  {
    value: "freshdeskGetTicket",
    label: "Get Ticket",
    icon: Globe,
    description: "Get Freshdesk ticket",
  },
  {
    value: "freshdeskUpdateTicket",
    label: "Update Ticket",
    icon: Globe,
    description: "Update Freshdesk ticket",
  },
  {
    value: "freshdeskListTickets",
    label: "List Tickets",
    icon: List,
    description: "List Freshdesk tickets",
  },
];

export const woocommerceSteps: StepTypeOption[] = [
  {
    value: "wooCreateProduct",
    label: "Create Product",
    icon: ShoppingCart,
    description: "Create WooCommerce product",
  },
  {
    value: "wooGetProduct",
    label: "Get Product",
    icon: ShoppingCart,
    description: "Get WooCommerce product",
  },
  {
    value: "wooListProducts",
    label: "List Products",
    icon: ShoppingCart,
    description: "List WooCommerce products",
  },
  {
    value: "wooCreateOrder",
    label: "Create Order",
    icon: ShoppingCart,
    description: "Create WooCommerce order",
  },
  {
    value: "wooGetOrder",
    label: "Get Order",
    icon: ShoppingCart,
    description: "Get WooCommerce order",
  },
  {
    value: "wooListOrders",
    label: "List Orders",
    icon: ShoppingCart,
    description: "List WooCommerce orders",
  },
];

export const activecampaignSteps: StepTypeOption[] = [
  {
    value: "activecampaignCreateContact",
    label: "Create Contact",
    icon: Mail,
    description: "Create ActiveCampaign contact",
  },
  {
    value: "activecampaignGetContact",
    label: "Get Contact",
    icon: Mail,
    description: "Get ActiveCampaign contact",
  },
  {
    value: "activecampaignListContacts",
    label: "List Contacts",
    icon: Mail,
    description: "List ActiveCampaign contacts",
  },
];

export const bitlySteps: StepTypeOption[] = [
  {
    value: "bitlyCreateLink",
    label: "Create Link",
    icon: Link,
    description: "Create Bitly short link",
  },
  {
    value: "bitlyGetLink",
    label: "Get Link",
    icon: Link,
    description: "Get Bitly link info",
  },
  {
    value: "bitlyListLinks",
    label: "List Links",
    icon: Link,
    description: "List Bitly links",
  },
];

export const circleciSteps: StepTypeOption[] = [
  {
    value: "circleciGetPipeline",
    label: "Get Pipeline",
    icon: Code,
    description: "Get CircleCI pipeline",
  },
  {
    value: "circleciListPipelines",
    label: "List Pipelines",
    icon: Code,
    description: "List CircleCI pipelines",
  },
  {
    value: "circleciTriggerPipeline",
    label: "Trigger Pipeline",
    icon: Code,
    description: "Trigger CircleCI pipeline",
  },
];

export const jenkinsSteps: StepTypeOption[] = [
  {
    value: "jenkinsTriggerBuild",
    label: "Trigger Build",
    icon: Server,
    description: "Trigger Jenkins build",
  },
  {
    value: "jenkinsGetBuild",
    label: "Get Build",
    icon: Server,
    description: "Get Jenkins build info",
  },
  {
    value: "jenkinsListJobs",
    label: "List Jobs",
    icon: Server,
    description: "List Jenkins jobs",
  },
];

export const cloudflareSteps: StepTypeOption[] = [
  {
    value: "cloudflareListZones",
    label: "List Zones",
    icon: Cloud,
    description: "List Cloudflare zones",
  },
  {
    value: "cloudflareGetDnsRecords",
    label: "Get DNS Records",
    icon: Cloud,
    description: "Get Cloudflare DNS records",
  },
  {
    value: "cloudflareCreateDnsRecord",
    label: "Create DNS Record",
    icon: Cloud,
    description: "Create Cloudflare DNS record",
  },
  {
    value: "cloudflarePurgeCache",
    label: "Purge Cache",
    icon: Cloud,
    description: "Purge Cloudflare cache",
  },
];

export const convertkitSteps: StepTypeOption[] = [
  {
    value: "convertkitAddSubscriber",
    label: "Add Subscriber",
    icon: Mail,
    description: "Add ConvertKit subscriber",
  },
  {
    value: "convertkitGetSubscriber",
    label: "Get Subscriber",
    icon: Mail,
    description: "Get ConvertKit subscriber",
  },
  {
    value: "convertkitListSubscribers",
    label: "List Subscribers",
    icon: Mail,
    description: "List ConvertKit subscribers",
  },
];

export const contentfulSteps: StepTypeOption[] = [
  {
    value: "contentfulGetEntry",
    label: "Get Entry",
    icon: FileText,
    description: "Get Contentful entry",
  },
  {
    value: "contentfulListEntries",
    label: "List Entries",
    icon: FileText,
    description: "List Contentful entries",
  },
  {
    value: "contentfulCreateEntry",
    label: "Create Entry",
    icon: FileText,
    description: "Create Contentful entry",
  },
];

export const mattermostSteps: StepTypeOption[] = [
  {
    value: "mattermostSendMessage",
    label: "Send Message",
    icon: MessageCircle,
    description: "Send Mattermost message",
  },
  {
    value: "mattermostGetChannel",
    label: "Get Channel",
    icon: Hash,
    description: "Get Mattermost channel",
  },
  {
    value: "mattermostListChannels",
    label: "List Channels",
    icon: Hash,
    description: "List Mattermost channels",
  },
];

export const pagerdutySteps: StepTypeOption[] = [
  {
    value: "pagerdutyCreateIncident",
    label: "Create Incident",
    icon: Zap,
    description: "Create PagerDuty incident",
  },
  {
    value: "pagerdutyGetIncident",
    label: "Get Incident",
    icon: Zap,
    description: "Get PagerDuty incident",
  },
  {
    value: "pagerdutyListIncidents",
    label: "List Incidents",
    icon: Zap,
    description: "List PagerDuty incidents",
  },
];

export const sentrySteps: StepTypeOption[] = [
  {
    value: "sentryListIssues",
    label: "List Issues",
    icon: Code,
    description: "List Sentry issues",
  },
  {
    value: "sentryGetIssue",
    label: "Get Issue",
    icon: Code,
    description: "Get Sentry issue",
  },
  {
    value: "sentryListProjects",
    label: "List Projects",
    icon: Code,
    description: "List Sentry projects",
  },
];

export const todoistSteps: StepTypeOption[] = [
  {
    value: "todoistCreateTask",
    label: "Create Task",
    icon: Globe,
    description: "Create Todoist task",
  },
  {
    value: "todoistGetTask",
    label: "Get Task",
    icon: Globe,
    description: "Get Todoist task",
  },
  {
    value: "todoistListTasks",
    label: "List Tasks",
    icon: List,
    description: "List Todoist tasks",
  },
  {
    value: "todoistCloseTask",
    label: "Close Task",
    icon: Globe,
    description: "Close Todoist task",
  },
];

export const nocodbSteps: StepTypeOption[] = [
  {
    value: "nocodbListRows",
    label: "List Rows",
    icon: Database,
    description: "List NocoDB rows",
  },
  {
    value: "nocodbGetRow",
    label: "Get Row",
    icon: Database,
    description: "Get NocoDB row",
  },
  {
    value: "nocodbCreateRow",
    label: "Create Row",
    icon: Database,
    description: "Create NocoDB row",
  },
  {
    value: "nocodbUpdateRow",
    label: "Update Row",
    icon: Database,
    description: "Update NocoDB row",
  },
];

export const snowflakeSteps: StepTypeOption[] = [
  {
    value: "snowflakeQuery",
    label: "Query",
    icon: Database,
    description: "Run Snowflake SQL query",
  },
];

export const graphqlSteps: StepTypeOption[] = [
  {
    value: "graphqlQuery",
    label: "GraphQL Query",
    icon: Globe,
    description: "Execute a GraphQL query",
  },
];

export const cryptoSteps: StepTypeOption[] = [
  {
    value: "cryptoHash",
    label: "Hash",
    icon: Lock,
    description: "Generate a hash",
  },
  {
    value: "cryptoHmac",
    label: "HMAC",
    icon: Lock,
    description: "Generate HMAC",
  },
  {
    value: "cryptoEncrypt",
    label: "Encrypt",
    icon: Lock,
    description: "Encrypt data",
  },
  {
    value: "cryptoDecrypt",
    label: "Decrypt",
    icon: Lock,
    description: "Decrypt data",
  },
];

export const baserowSteps: StepTypeOption[] = [
  {
    value: "baserowListRows",
    label: "List Rows",
    icon: Database,
    description: "List Baserow rows",
  },
  {
    value: "baserowGetRow",
    label: "Get Row",
    icon: Database,
    description: "Get Baserow row",
  },
  {
    value: "baserowCreateRow",
    label: "Create Row",
    icon: Database,
    description: "Create Baserow row",
  },
  {
    value: "baserowUpdateRow",
    label: "Update Row",
    icon: Database,
    description: "Update Baserow row",
  },
];

export const elasticsearchSteps: StepTypeOption[] = [
  {
    value: "elasticsearchSearch",
    label: "Search",
    icon: Database,
    description: "Elasticsearch search",
  },
  {
    value: "elasticsearchIndex",
    label: "Index",
    icon: Database,
    description: "Index Elasticsearch document",
  },
  {
    value: "elasticsearchGet",
    label: "Get",
    icon: Database,
    description: "Get Elasticsearch document",
  },
  {
    value: "elasticsearchDelete",
    label: "Delete",
    icon: Database,
    description: "Delete Elasticsearch document",
  },
];

export const grafanaSteps: StepTypeOption[] = [
  {
    value: "grafanaListDashboards",
    label: "List Dashboards",
    icon: Globe,
    description: "List Grafana dashboards",
  },
  {
    value: "grafanaGetDashboard",
    label: "Get Dashboard",
    icon: Globe,
    description: "Get Grafana dashboard",
  },
  {
    value: "grafanaCreateAnnotation",
    label: "Create Annotation",
    icon: Globe,
    description: "Create Grafana annotation",
  },
];

export const netlifySteps: StepTypeOption[] = [
  {
    value: "netlifyListSites",
    label: "List Sites",
    icon: Globe,
    description: "List Netlify sites",
  },
  {
    value: "netlifyGetSite",
    label: "Get Site",
    icon: Globe,
    description: "Get Netlify site",
  },
  {
    value: "netlifyTriggerBuild",
    label: "Trigger Build",
    icon: Globe,
    description: "Trigger Netlify build",
  },
];

export const wordpressSteps: StepTypeOption[] = [
  {
    value: "wordpressCreatePost",
    label: "Create Post",
    icon: FileText,
    description: "Create WordPress post",
  },
  {
    value: "wordpressGetPost",
    label: "Get Post",
    icon: FileText,
    description: "Get WordPress post",
  },
  {
    value: "wordpressListPosts",
    label: "List Posts",
    icon: FileText,
    description: "List WordPress posts",
  },
  {
    value: "wordpressUpdatePost",
    label: "Update Post",
    icon: FileText,
    description: "Update WordPress post",
  },
];

export const xeroSteps: StepTypeOption[] = [
  {
    value: "xeroListContacts",
    label: "List Contacts",
    icon: CreditCard,
    description: "List Xero contacts",
  },
  {
    value: "xeroGetContact",
    label: "Get Contact",
    icon: CreditCard,
    description: "Get Xero contact",
  },
  {
    value: "xeroCreateInvoice",
    label: "Create Invoice",
    icon: CreditCard,
    description: "Create Xero invoice",
  },
  {
    value: "xeroListInvoices",
    label: "List Invoices",
    icon: CreditCard,
    description: "List Xero invoices",
  },
];

export const quickbooksSteps: StepTypeOption[] = [
  {
    value: "quickbooksGetCompany",
    label: "Get Company",
    icon: CreditCard,
    description: "Get QuickBooks company",
  },
  {
    value: "quickbooksCreateInvoice",
    label: "Create Invoice",
    icon: CreditCard,
    description: "Create QuickBooks invoice",
  },
  {
    value: "quickbooksListInvoices",
    label: "List Invoices",
    icon: CreditCard,
    description: "List QuickBooks invoices",
  },
  {
    value: "quickbooksQuery",
    label: "Query",
    icon: CreditCard,
    description: "Run QuickBooks query",
  },
];

export const pipedriveSteps: StepTypeOption[] = [
  {
    value: "pipedriveCreateDeal",
    label: "Create Deal",
    icon: CreditCard,
    description: "Create Pipedrive deal",
  },
  {
    value: "pipedriveGetDeal",
    label: "Get Deal",
    icon: CreditCard,
    description: "Get Pipedrive deal",
  },
  {
    value: "pipedriveListDeals",
    label: "List Deals",
    icon: CreditCard,
    description: "List Pipedrive deals",
  },
  {
    value: "pipedriveCreatePerson",
    label: "Create Person",
    icon: CreditCard,
    description: "Create Pipedrive person",
  },
];

export const helpscoutSteps: StepTypeOption[] = [
  {
    value: "helpscoutListConversations",
    label: "List Conversations",
    icon: MessageCircle,
    description: "List Help Scout conversations",
  },
  {
    value: "helpscoutGetConversation",
    label: "Get Conversation",
    icon: MessageCircle,
    description: "Get Help Scout conversation",
  },
  {
    value: "helpscoutCreateConversation",
    label: "Create Conversation",
    icon: MessageCircle,
    description: "Create Help Scout conversation",
  },
];

export const redditSteps: StepTypeOption[] = [
  {
    value: "redditGetPost",
    label: "Get Post",
    icon: Globe,
    description: "Get Reddit post",
  },
  {
    value: "redditListPosts",
    label: "List Posts",
    icon: Globe,
    description: "List Reddit posts",
  },
  {
    value: "redditSubmitPost",
    label: "Submit Post",
    icon: Globe,
    description: "Submit Reddit post",
  },
];

export const spotifySteps: StepTypeOption[] = [
  {
    value: "spotifySearch",
    label: "Search",
    icon: Globe,
    description: "Search Spotify",
  },
  {
    value: "spotifyGetTrack",
    label: "Get Track",
    icon: Globe,
    description: "Get Spotify track",
  },
  {
    value: "spotifyGetPlaylist",
    label: "Get Playlist",
    icon: Globe,
    description: "Get Spotify playlist",
  },
];

export const servicenowSteps: StepTypeOption[] = [
  {
    value: "servicenowCreateIncident",
    label: "Create Incident",
    icon: Server,
    description: "Create ServiceNow incident",
  },
  {
    value: "servicenowGetIncident",
    label: "Get Incident",
    icon: Server,
    description: "Get ServiceNow incident",
  },
  {
    value: "servicenowListIncidents",
    label: "List Incidents",
    icon: Server,
    description: "List ServiceNow incidents",
  },
  {
    value: "servicenowUpdateIncident",
    label: "Update Incident",
    icon: Server,
    description: "Update ServiceNow incident",
  },
];

export const ghostSteps: StepTypeOption[] = [
  {
    value: "ghostCreatePost",
    label: "Create Post",
    icon: FileText,
    description: "Create Ghost post",
  },
  {
    value: "ghostGetPost",
    label: "Get Post",
    icon: FileText,
    description: "Get Ghost post",
  },
  {
    value: "ghostListPosts",
    label: "List Posts",
    icon: FileText,
    description: "List Ghost posts",
  },
];

export const webflowSteps: StepTypeOption[] = [
  {
    value: "webflowListSites",
    label: "List Sites",
    icon: Globe,
    description: "List Webflow sites",
  },
  {
    value: "webflowListCollections",
    label: "List Collections",
    icon: Globe,
    description: "List Webflow collections",
  },
  {
    value: "webflowListItems",
    label: "List Items",
    icon: Globe,
    description: "List Webflow items",
  },
  {
    value: "webflowCreateItem",
    label: "Create Item",
    icon: Globe,
    description: "Create Webflow item",
  },
];

export const codaSteps: StepTypeOption[] = [
  {
    value: "codaListDocs",
    label: "List Docs",
    icon: FileText,
    description: "List Coda docs",
  },
  {
    value: "codaGetDoc",
    label: "Get Doc",
    icon: FileText,
    description: "Get Coda doc",
  },
  {
    value: "codaListRows",
    label: "List Rows",
    icon: FileText,
    description: "List Coda rows",
  },
  {
    value: "codaInsertRow",
    label: "Insert Row",
    icon: FileText,
    description: "Insert Coda row",
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
    category: "AI",
    icon: Sparkles,
    steps: aiSteps,
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
  {
    category: "Slack",
    icon: MessageCircle,
    steps: slackSteps,
  },
  {
    category: "Telegram",
    icon: Send,
    steps: telegramSteps,
  },
  {
    category: "GitHub",
    icon: GitBranch,
    steps: githubSteps,
  },
  {
    category: "Notion",
    icon: FileText,
    steps: notionSteps,
  },
  {
    category: "SendGrid",
    icon: Mail,
    steps: sendgridSteps,
  },
  {
    category: "Stripe",
    icon: CreditCard,
    steps: stripeSteps,
  },
  {
    category: "Postgres",
    icon: Database,
    steps: postgresSteps,
  },
  {
    category: "Google Sheets",
    icon: Sheet,
    steps: googleSheetsSteps,
  },
  { category: "Airtable", icon: Database, steps: airtableSteps },
  { category: "Jira", icon: Globe, steps: jiraSteps },
  { category: "HubSpot", icon: Globe, steps: hubspotSteps },
  { category: "Twilio", icon: Phone, steps: twilioSteps },
  { category: "Mailchimp", icon: Mail, steps: mailchimpSteps },
  { category: "Zoom", icon: Calendar, steps: zoomSteps },
  { category: "Supabase", icon: Database, steps: supabaseSteps },
  { category: "Salesforce", icon: Cloud, steps: salesforceSteps },
  { category: "Trello", icon: Globe, steps: trelloSteps },
  { category: "Google Calendar", icon: Calendar, steps: googleCalendarSteps },
  { category: "Google Drive", icon: FolderOpen, steps: googleDriveSteps },
  { category: "Gmail", icon: Mail, steps: gmailSteps },
  { category: "MongoDB", icon: Database, steps: mongodbSteps },
  { category: "MySQL", icon: Database, steps: mysqlSteps },
  { category: "Redis", icon: Server, steps: redisSteps },
  { category: "AWS S3", icon: Cloud, steps: awsS3Steps },
  { category: "Shopify", icon: ShoppingCart, steps: shopifySteps },
  { category: "Asana", icon: Globe, steps: asanaSteps },
  { category: "Linear", icon: Globe, steps: linearSteps },
  { category: "ClickUp", icon: Globe, steps: clickupSteps },
  { category: "Monday.com", icon: Globe, steps: mondaySteps },
  { category: "Dropbox", icon: FolderOpen, steps: dropboxSteps },
  { category: "Box", icon: FolderOpen, steps: boxSteps },
  { category: "GitLab", icon: GitBranch, steps: gitlabSteps },
  { category: "PayPal", icon: CreditCard, steps: paypalSteps },
  { category: "Typeform", icon: FileText, steps: typeformSteps },
  { category: "Calendly", icon: Calendar, steps: calendlySteps },
  { category: "WhatsApp", icon: MessageCircle, steps: whatsappSteps },
  { category: "Intercom", icon: MessageCircle, steps: intercomSteps },
  { category: "Zendesk", icon: Globe, steps: zendeskSteps },
  { category: "Freshdesk", icon: Globe, steps: freshdeskSteps },
  { category: "WooCommerce", icon: ShoppingCart, steps: woocommerceSteps },
  { category: "ActiveCampaign", icon: Mail, steps: activecampaignSteps },
  { category: "Bitly", icon: Link, steps: bitlySteps },
  { category: "CircleCI", icon: Code, steps: circleciSteps },
  { category: "Jenkins", icon: Server, steps: jenkinsSteps },
  { category: "Cloudflare", icon: Cloud, steps: cloudflareSteps },
  { category: "ConvertKit", icon: Mail, steps: convertkitSteps },
  { category: "Contentful", icon: FileText, steps: contentfulSteps },
  { category: "Mattermost", icon: MessageCircle, steps: mattermostSteps },
  { category: "PagerDuty", icon: Zap, steps: pagerdutySteps },
  { category: "Sentry", icon: Code, steps: sentrySteps },
  { category: "Todoist", icon: Globe, steps: todoistSteps },
  { category: "NocoDB", icon: Database, steps: nocodbSteps },
  { category: "Snowflake", icon: Database, steps: snowflakeSteps },
  { category: "GraphQL", icon: Globe, steps: graphqlSteps },
  { category: "Crypto", icon: Lock, steps: cryptoSteps },
  { category: "Baserow", icon: Database, steps: baserowSteps },
  { category: "Elasticsearch", icon: Database, steps: elasticsearchSteps },
  { category: "Grafana", icon: Globe, steps: grafanaSteps },
  { category: "Netlify", icon: Globe, steps: netlifySteps },
  { category: "WordPress", icon: FileText, steps: wordpressSteps },
  { category: "Xero", icon: CreditCard, steps: xeroSteps },
  { category: "QuickBooks", icon: CreditCard, steps: quickbooksSteps },
  { category: "Pipedrive", icon: CreditCard, steps: pipedriveSteps },
  { category: "Help Scout", icon: MessageCircle, steps: helpscoutSteps },
  { category: "Reddit", icon: Globe, steps: redditSteps },
  { category: "Spotify", icon: Globe, steps: spotifySteps },
  { category: "ServiceNow", icon: Server, steps: servicenowSteps },
  { category: "Ghost", icon: FileText, steps: ghostSteps },
  { category: "Webflow", icon: Globe, steps: webflowSteps },
  { category: "Coda", icon: FileText, steps: codaSteps },
];

export const stepTypes = [
  ...browserSteps,
  ...dataSteps,
  ...logicSteps,
  ...aiSteps,
  ...integrationSteps,
  ...discordSteps,
  ...twitterSteps,
  ...slackSteps,
  ...telegramSteps,
  ...githubSteps,
  ...notionSteps,
  ...sendgridSteps,
  ...stripeSteps,
  ...postgresSteps,
  ...googleSheetsSteps,
  ...airtableSteps,
  ...jiraSteps,
  ...hubspotSteps,
  ...twilioSteps,
  ...mailchimpSteps,
  ...zoomSteps,
  ...supabaseSteps,
  ...salesforceSteps,
  ...trelloSteps,
  ...googleCalendarSteps,
  ...googleDriveSteps,
  ...gmailSteps,
  ...mongodbSteps,
  ...mysqlSteps,
  ...redisSteps,
  ...awsS3Steps,
  ...shopifySteps,
  ...asanaSteps,
  ...linearSteps,
  ...clickupSteps,
  ...mondaySteps,
  ...dropboxSteps,
  ...boxSteps,
  ...gitlabSteps,
  ...paypalSteps,
  ...typeformSteps,
  ...calendlySteps,
  ...whatsappSteps,
  ...intercomSteps,
  ...zendeskSteps,
  ...freshdeskSteps,
  ...woocommerceSteps,
  ...activecampaignSteps,
  ...bitlySteps,
  ...circleciSteps,
  ...jenkinsSteps,
  ...cloudflareSteps,
  ...convertkitSteps,
  ...contentfulSteps,
  ...mattermostSteps,
  ...pagerdutySteps,
  ...sentrySteps,
  ...todoistSteps,
  ...nocodbSteps,
  ...snowflakeSteps,
  ...graphqlSteps,
  ...cryptoSteps,
  ...baserowSteps,
  ...elasticsearchSteps,
  ...grafanaSteps,
  ...netlifySteps,
  ...wordpressSteps,
  ...xeroSteps,
  ...quickbooksSteps,
  ...pipedriveSteps,
  ...helpscoutSteps,
  ...redditSteps,
  ...spotifySteps,
  ...servicenowSteps,
  ...ghostSteps,
  ...webflowSteps,
  ...codaSteps,
] as const;
