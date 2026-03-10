import { IntegrationStepTypes } from "@app-types/integrations";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select";
import { Textarea } from "@components/ui/textarea";
import type { StepProps } from "../types";
import { SharedCredentialFields } from "./SharedCredentialFields";

interface FieldDef {
  key: string;
  label: string;
  placeholder?: string;
  hint?: string;
  multiline?: boolean;
  type?: "select" | "checkbox";
  options?: { value: string; label: string }[];
}

// ─── Field definitions for all integration step types ───────────────

const FIELD_DEFS: Record<string, FieldDef[]> = {
  // ─── Discord ────────────────────────────────────────────────────
  discordSendMessage: [
    { key: "channelId", label: "Channel ID", placeholder: "Channel ID" },
    {
      key: "content",
      label: "Message Content",
      placeholder: "Message content (supports {{variableName}})",
      multiline: true,
    },
    { key: "tts", label: "Text-to-Speech", type: "checkbox" },
    { key: "botToken", label: "Bot Token (if not using Credential ID)", placeholder: "Bot token" },
  ],
  discordSendWebhook: [
    {
      key: "webhookUrl",
      label: "Webhook URL",
      placeholder: "https://discord.com/api/webhooks/...",
    },
    { key: "content", label: "Message Content", placeholder: "Message content", multiline: true },
    { key: "username", label: "Username Override", placeholder: "Display name override" },
    { key: "avatarUrl", label: "Avatar URL", placeholder: "Avatar image URL" },
    { key: "tts", label: "Text-to-Speech", type: "checkbox" },
    {
      key: "embedsJson",
      label: "Embeds (JSON)",
      placeholder: '[{"title":"Hello","description":"World"}]',
      multiline: true,
    },
  ],
  discordReactMessage: [
    { key: "channelId", label: "Channel ID", placeholder: "Channel ID" },
    { key: "messageId", label: "Message ID", placeholder: "Message ID" },
    { key: "emoji", label: "Emoji", placeholder: ":smile: or unicode codepoint" },
    { key: "botToken", label: "Bot Token (if not using Credential ID)", placeholder: "Bot token" },
  ],
  discordGetMessage: [
    { key: "channelId", label: "Channel ID", placeholder: "Channel ID" },
    { key: "messageId", label: "Message ID", placeholder: "Message ID" },
    { key: "botToken", label: "Bot Token (if not using Credential ID)", placeholder: "Bot token" },
  ],
  discordListMessages: [
    { key: "channelId", label: "Channel ID", placeholder: "Channel ID" },
    { key: "limit", label: "Limit", placeholder: "10" },
    { key: "botToken", label: "Bot Token (if not using Credential ID)", placeholder: "Bot token" },
  ],
  discordDeleteMessage: [
    { key: "channelId", label: "Channel ID", placeholder: "Channel ID" },
    { key: "messageId", label: "Message ID", placeholder: "Message ID" },
    { key: "botToken", label: "Bot Token (if not using Credential ID)", placeholder: "Bot token" },
  ],

  // ─── Slack ──────────────────────────────────────────────────────
  slackSendMessage: [
    { key: "channelId", label: "Channel ID", placeholder: "C123456 or #general" },
    {
      key: "text",
      label: "Message Text",
      placeholder: "Message content (supports {{variableName}})",
      multiline: true,
    },
    { key: "mrkdwn", label: "Enable Markdown", type: "checkbox" },
    {
      key: "threadTs",
      label: "Thread Timestamp (optional)",
      placeholder: "Leave empty for main channel",
    },
    { key: "replyBroadcast", label: "Broadcast Reply", type: "checkbox" },
    {
      key: "blocksJson",
      label: "Blocks (JSON, optional)",
      placeholder: '{"type": "section", "text": {"type": "mrkdwn", "text": "..."}}',
      multiline: true,
    },
    { key: "apiToken", label: "API Token (if not using Credential ID)", placeholder: "xoxb-..." },
    { key: "botToken", label: "Bot Token (if not using Credential ID)", placeholder: "xoxb-..." },
  ],
  slackUpdateMessage: [
    { key: "channelId", label: "Channel ID", placeholder: "C123456" },
    { key: "timestamp", label: "Message Timestamp", placeholder: "1503435956.000247" },
    {
      key: "text",
      label: "New Message Content",
      placeholder: "New message content",
      multiline: true,
    },
    {
      key: "blocksJson",
      label: "Blocks (JSON, optional)",
      placeholder: '{"type": "section", "text": {"type": "mrkdwn", "text": "..."}}',
      multiline: true,
    },
    { key: "apiToken", label: "API Token (if not using Credential ID)", placeholder: "xoxb-..." },
    { key: "botToken", label: "Bot Token (if not using Credential ID)", placeholder: "xoxb-..." },
  ],
  slackDeleteMessage: [
    { key: "channelId", label: "Channel ID", placeholder: "C123456" },
    { key: "timestamp", label: "Message Timestamp", placeholder: "1503435956.000247" },
    { key: "apiToken", label: "API Token (if not using Credential ID)", placeholder: "xoxb-..." },
    { key: "botToken", label: "Bot Token (if not using Credential ID)", placeholder: "xoxb-..." },
  ],
  slackCreateChannel: [
    { key: "channelName", label: "Channel Name", placeholder: "general, my-project" },
    { key: "isPrivate", label: "Private Channel", type: "checkbox" },
    {
      key: "channelDescription",
      label: "Description (optional)",
      placeholder: "Description for the channel",
      multiline: true,
    },
    { key: "apiToken", label: "API Token (if not using Credential ID)", placeholder: "xoxb-..." },
    { key: "botToken", label: "Bot Token (if not using Credential ID)", placeholder: "xoxb-..." },
  ],
  slackGetChannel: [
    { key: "channelId", label: "Channel ID", placeholder: "C123456" },
    { key: "includeNumMembers", label: "Include Member Count", type: "checkbox" },
    { key: "apiToken", label: "API Token (if not using Credential ID)", placeholder: "xoxb-..." },
    { key: "botToken", label: "Bot Token (if not using Credential ID)", placeholder: "xoxb-..." },
  ],
  slackListChannels: [
    { key: "limit", label: "Limit (optional)", placeholder: "Maximum number of channels" },
    { key: "excludeArchived", label: "Exclude Archived", type: "checkbox" },
    { key: "apiToken", label: "API Token (if not using Credential ID)", placeholder: "xoxb-..." },
    { key: "botToken", label: "Bot Token (if not using Credential ID)", placeholder: "xoxb-..." },
  ],
  slackInviteUsers: [
    { key: "channelId", label: "Channel ID", placeholder: "C123456" },
    {
      key: "userIds",
      label: "User IDs",
      placeholder: "User IDs (one per line or comma-separated)",
      multiline: true,
    },
    { key: "apiToken", label: "API Token (if not using Credential ID)", placeholder: "xoxb-..." },
    { key: "botToken", label: "Bot Token (if not using Credential ID)", placeholder: "xoxb-..." },
  ],
  slackListMembers: [
    { key: "channelId", label: "Channel ID", placeholder: "C123456" },
    { key: "apiToken", label: "API Token (if not using Credential ID)", placeholder: "xoxb-..." },
    { key: "botToken", label: "Bot Token (if not using Credential ID)", placeholder: "xoxb-..." },
  ],
  slackSetTopic: [
    { key: "channelId", label: "Channel ID", placeholder: "C123456" },
    { key: "topic", label: "Topic", placeholder: "New channel topic" },
    { key: "apiToken", label: "API Token (if not using Credential ID)", placeholder: "xoxb-..." },
    { key: "botToken", label: "Bot Token (if not using Credential ID)", placeholder: "xoxb-..." },
  ],
  slackArchiveChannel: [
    { key: "channelId", label: "Channel ID", placeholder: "C123456" },
    { key: "apiToken", label: "API Token (if not using Credential ID)", placeholder: "xoxb-..." },
    { key: "botToken", label: "Bot Token (if not using Credential ID)", placeholder: "xoxb-..." },
  ],
  slackUnarchiveChannel: [
    { key: "channelId", label: "Channel ID", placeholder: "C123456" },
    { key: "apiToken", label: "API Token (if not using Credential ID)", placeholder: "xoxb-..." },
    { key: "botToken", label: "Bot Token (if not using Credential ID)", placeholder: "xoxb-..." },
  ],
  slackGetHistory: [
    { key: "channelId", label: "Channel ID", placeholder: "C123456" },
    { key: "limit", label: "Limit (optional)", placeholder: "100" },
    { key: "apiToken", label: "API Token (if not using Credential ID)", placeholder: "xoxb-..." },
    { key: "botToken", label: "Bot Token (if not using Credential ID)", placeholder: "xoxb-..." },
  ],
  slackGetUser: [
    { key: "userId", label: "User ID", placeholder: "U123456" },
    { key: "apiToken", label: "API Token (if not using Credential ID)", placeholder: "xoxb-..." },
    { key: "botToken", label: "Bot Token (if not using Credential ID)", placeholder: "xoxb-..." },
  ],
  slackListUsers: [
    { key: "limit", label: "Limit (optional)", placeholder: "Maximum number of users" },
    { key: "apiToken", label: "API Token (if not using Credential ID)", placeholder: "xoxb-..." },
    { key: "botToken", label: "Bot Token (if not using Credential ID)", placeholder: "xoxb-..." },
  ],
  slackAddReaction: [
    { key: "channelId", label: "Channel ID", placeholder: "C123456" },
    { key: "timestamp", label: "Message Timestamp", placeholder: "1503435956.000247" },
    { key: "reactionEmoji", label: "Emoji Name", placeholder: "thumbsup, heart" },
    { key: "apiToken", label: "API Token (if not using Credential ID)", placeholder: "xoxb-..." },
    { key: "botToken", label: "Bot Token (if not using Credential ID)", placeholder: "xoxb-..." },
  ],
  slackUploadFile: [
    { key: "channelId", label: "Channel ID", placeholder: "C123456" },
    { key: "filePath", label: "File Path", placeholder: "Path to file or URL" },
    { key: "fileName", label: "File Name (optional)", placeholder: "report.txt" },
    { key: "title", label: "Title (optional)", placeholder: "Display title for the file" },
    {
      key: "initialComment",
      label: "Comment (optional)",
      placeholder: "Comment to add with the file",
    },
    { key: "apiToken", label: "API Token (if not using Credential ID)", placeholder: "xoxb-..." },
    { key: "botToken", label: "Bot Token (if not using Credential ID)", placeholder: "xoxb-..." },
  ],

  // ─── Twitter ────────────────────────────────────────────────────
  twitterCreateTweet: [
    { key: "text", label: "Tweet Text", placeholder: "What's happening?", multiline: true },
    { key: "replyToTweetId", label: "Reply To (optional)", placeholder: "Tweet ID to reply to" },
    { key: "quoteTweetId", label: "Quote Tweet (optional)", placeholder: "Tweet ID to quote" },
    { key: "mediaId", label: "Media ID (optional)", placeholder: "Media ID to attach" },
    { key: "apiKey", label: "API Key", placeholder: "API key" },
    { key: "apiSecret", label: "API Secret", placeholder: "API secret" },
    { key: "accessToken", label: "Access Token", placeholder: "Access token" },
    { key: "accessSecret", label: "Access Secret", placeholder: "Access secret" },
  ],
  twitterDeleteTweet: [
    { key: "tweetId", label: "Tweet ID", placeholder: "Tweet ID or URL" },
    { key: "apiKey", label: "API Key", placeholder: "API key" },
    { key: "apiSecret", label: "API Secret", placeholder: "API secret" },
    { key: "accessToken", label: "Access Token", placeholder: "Access token" },
    { key: "accessSecret", label: "Access Secret", placeholder: "Access secret" },
  ],
  twitterLikeTweet: [
    { key: "tweetId", label: "Tweet ID", placeholder: "Tweet ID or URL to like" },
    { key: "apiKey", label: "API Key", placeholder: "API key" },
    { key: "apiSecret", label: "API Secret", placeholder: "API secret" },
    { key: "accessToken", label: "Access Token", placeholder: "Access token" },
    { key: "accessSecret", label: "Access Secret", placeholder: "Access secret" },
  ],
  twitterRetweet: [
    { key: "tweetId", label: "Tweet ID", placeholder: "Tweet ID or URL to retweet" },
    { key: "apiKey", label: "API Key", placeholder: "API key" },
    { key: "apiSecret", label: "API Secret", placeholder: "API secret" },
    { key: "accessToken", label: "Access Token", placeholder: "Access token" },
    { key: "accessSecret", label: "Access Secret", placeholder: "Access secret" },
  ],
  twitterSearchTweets: [
    { key: "searchQuery", label: "Search Query", placeholder: "Search term or query" },
    { key: "maxResults", label: "Max Results", placeholder: "10" },
    { key: "startTime", label: "Start Time (optional)", placeholder: "ISO datetime" },
    { key: "endTime", label: "End Time (optional)", placeholder: "ISO datetime" },
    { key: "apiKey", label: "API Key", placeholder: "API key" },
    { key: "apiSecret", label: "API Secret", placeholder: "API secret" },
    { key: "accessToken", label: "Access Token", placeholder: "Access token" },
    { key: "accessSecret", label: "Access Secret", placeholder: "Access secret" },
  ],
  twitterSendDM: [
    { key: "userId", label: "User ID", placeholder: "Twitter user ID or @username" },
    { key: "text", label: "Message", placeholder: "Your message", multiline: true },
    { key: "mediaId", label: "Media ID (optional)", placeholder: "Media ID to attach" },
    { key: "apiKey", label: "API Key", placeholder: "API key" },
    { key: "apiSecret", label: "API Secret", placeholder: "API secret" },
    { key: "accessToken", label: "Access Token", placeholder: "Access token" },
    { key: "accessSecret", label: "Access Secret", placeholder: "Access secret" },
  ],
  twitterSearchUser: [
    { key: "username", label: "Username", placeholder: "@username or username" },
    { key: "apiKey", label: "API Key", placeholder: "API key" },
    { key: "apiSecret", label: "API Secret", placeholder: "API secret" },
    { key: "accessToken", label: "Access Token", placeholder: "Access token" },
    { key: "accessSecret", label: "Access Secret", placeholder: "Access secret" },
  ],

  // ─── Telegram ───────────────────────────────────────────────────
  telegramSendMessage: [
    { key: "chatId", label: "Chat ID", placeholder: "123456789 or @channelname" },
    {
      key: "text",
      label: "Message Text",
      placeholder: "Hello! Supports {{variableName}}",
      multiline: true,
    },
    {
      key: "parseMode",
      label: "Parse Mode",
      type: "select",
      options: [
        { value: "None", label: "None" },
        { value: "Markdown", label: "Markdown" },
        { value: "HTML", label: "HTML" },
      ],
    },
  ],
  telegramSendPhoto: [
    { key: "chatId", label: "Chat ID", placeholder: "123456789 or @channelname" },
    { key: "photo", label: "Photo URL", placeholder: "https://example.com/photo.jpg" },
    { key: "caption", label: "Caption (optional)", placeholder: "Photo description" },
  ],
  telegramEditMessage: [
    { key: "chatId", label: "Chat ID", placeholder: "123456789" },
    { key: "messageId", label: "Message ID", placeholder: "42" },
    { key: "text", label: "New Text", placeholder: "Updated message text", multiline: true },
  ],
  telegramDeleteMessage: [
    { key: "chatId", label: "Chat ID", placeholder: "123456789" },
    { key: "messageId", label: "Message ID", placeholder: "42" },
  ],
  telegramSendLocation: [
    { key: "chatId", label: "Chat ID", placeholder: "123456789" },
    { key: "latitude", label: "Latitude", placeholder: "40.7128" },
    { key: "longitude", label: "Longitude", placeholder: "-74.0060" },
  ],
  telegramGetUpdates: [
    {
      key: "offset",
      label: "Offset (optional)",
      placeholder: "0",
      hint: "Identifier of the first update to be returned",
    },
    {
      key: "limit",
      label: "Limit (optional)",
      placeholder: "100",
      hint: "Number of updates to retrieve (1-100)",
    },
  ],
  telegramSendDocument: [
    { key: "chatId", label: "Chat ID", placeholder: "123456789 or @channelname" },
    { key: "document", label: "Document URL", placeholder: "https://example.com/file.pdf" },
    { key: "caption", label: "Caption (optional)", placeholder: "Document description" },
  ],

  // ─── GitHub ─────────────────────────────────────────────────────
  githubCreateIssue: [
    { key: "owner", label: "Owner", placeholder: "octocat" },
    { key: "repo", label: "Repository", placeholder: "my-project" },
    { key: "title", label: "Title", placeholder: "Bug: Something is broken" },
    {
      key: "body",
      label: "Body (optional)",
      placeholder: "Describe the issue in detail...",
      multiline: true,
    },
    { key: "labels", label: "Labels (optional)", placeholder: "bug, priority:high" },
    { key: "assignees", label: "Assignees (optional)", placeholder: "octocat, contributor1" },
  ],
  githubGetIssue: [
    { key: "owner", label: "Owner", placeholder: "octocat" },
    { key: "repo", label: "Repository", placeholder: "my-project" },
    { key: "issueNumber", label: "Issue Number", placeholder: "42" },
  ],
  githubListIssues: [
    { key: "owner", label: "Owner", placeholder: "octocat" },
    { key: "repo", label: "Repository", placeholder: "my-project" },
    {
      key: "state",
      label: "State",
      type: "select",
      options: [
        { value: "open", label: "Open" },
        { value: "closed", label: "Closed" },
        { value: "all", label: "All" },
      ],
    },
    { key: "labels", label: "Labels (optional)", placeholder: "bug, enhancement" },
    { key: "perPage", label: "Per Page (optional)", placeholder: "30" },
  ],
  githubCreateComment: [
    { key: "owner", label: "Owner", placeholder: "octocat" },
    { key: "repo", label: "Repository", placeholder: "my-project" },
    { key: "issueNumber", label: "Issue Number", placeholder: "42" },
    {
      key: "body",
      label: "Comment Body",
      placeholder: "Write your comment here...",
      multiline: true,
    },
  ],
  githubGetRepo: [
    { key: "owner", label: "Owner", placeholder: "octocat" },
    { key: "repo", label: "Repository", placeholder: "my-project" },
  ],
  githubListRepos: [
    {
      key: "owner",
      label: "Owner (optional)",
      placeholder: "octocat (leave empty for authenticated user)",
    },
    { key: "perPage", label: "Per Page (optional)", placeholder: "30" },
  ],
  githubCreateRelease: [
    { key: "owner", label: "Owner", placeholder: "octocat" },
    { key: "repo", label: "Repository", placeholder: "my-project" },
    { key: "tagName", label: "Tag Name", placeholder: "v1.0.0" },
    { key: "name", label: "Release Name (optional)", placeholder: "Version 1.0.0" },
    {
      key: "body",
      label: "Release Notes (optional)",
      placeholder: "Describe the changes in this release...",
      multiline: true,
    },
  ],

  // ─── Notion ─────────────────────────────────────────────────────
  notionCreatePage: [
    { key: "parentId", label: "Parent ID", placeholder: "a1b2c3d4-e5f6-7890-abcd-ef1234567890" },
    {
      key: "parentType",
      label: "Parent Type",
      type: "select",
      options: [
        { value: "page_id", label: "Page" },
        { value: "database_id", label: "Database" },
      ],
    },
    { key: "title", label: "Title", placeholder: "My New Page" },
    {
      key: "content",
      label: "Content (optional)",
      placeholder: "Page content in plain text or markdown...",
      multiline: true,
    },
  ],
  notionGetPage: [
    { key: "pageId", label: "Page ID", placeholder: "a1b2c3d4-e5f6-7890-abcd-ef1234567890" },
  ],
  notionUpdatePage: [
    { key: "pageId", label: "Page ID", placeholder: "a1b2c3d4-e5f6-7890-abcd-ef1234567890" },
    {
      key: "properties",
      label: "Properties (JSON)",
      placeholder: '{"Name": {"title": [{"text": {"content": "Updated"}}]}}',
      multiline: true,
    },
  ],
  notionQueryDatabase: [
    {
      key: "databaseId",
      label: "Database ID",
      placeholder: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    },
    {
      key: "filter",
      label: "Filter (JSON, optional)",
      placeholder: '{"property": "Status", "select": {"equals": "Done"}}',
      multiline: true,
    },
    {
      key: "sorts",
      label: "Sorts (JSON, optional)",
      placeholder: '[{"property": "Created", "direction": "descending"}]',
      multiline: true,
    },
  ],
  notionCreateDatabaseEntry: [
    {
      key: "databaseId",
      label: "Database ID",
      placeholder: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    },
    {
      key: "properties",
      label: "Properties (JSON)",
      placeholder: '{"Name": {"title": [{"text": {"content": "New Entry"}}]}}',
      multiline: true,
    },
  ],
  notionSearch: [
    { key: "query", label: "Search Query", placeholder: "Search pages and databases..." },
    {
      key: "filterType",
      label: "Filter Type",
      type: "select",
      options: [
        { value: "all", label: "All" },
        { value: "page", label: "Pages" },
        { value: "database", label: "Databases" },
      ],
    },
  ],

  // ─── SendGrid ───────────────────────────────────────────────────
  sendgridSendEmail: [
    { key: "toEmail", label: "To", placeholder: "recipient@example.com" },
    { key: "fromEmail", label: "From", placeholder: "sender@yourdomain.com" },
    { key: "fromName", label: "From Name", placeholder: "Your Company Name" },
    { key: "subject", label: "Subject", placeholder: "Your email subject line" },
    { key: "content", label: "Email Body", placeholder: "Email body content...", multiline: true },
    {
      key: "contentType",
      label: "Content Type",
      type: "select",
      options: [
        { value: "text/plain", label: "Plain Text" },
        { value: "text/html", label: "HTML" },
      ],
    },
    { key: "cc", label: "CC (optional)", placeholder: "cc@example.com" },
    { key: "bcc", label: "BCC (optional)", placeholder: "bcc@example.com" },
  ],
  sendgridSendTemplate: [
    { key: "toEmail", label: "To", placeholder: "recipient@example.com" },
    { key: "fromEmail", label: "From", placeholder: "sender@yourdomain.com" },
    { key: "fromName", label: "From Name", placeholder: "Your Company Name" },
    { key: "templateId", label: "Template ID", placeholder: "d-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" },
    {
      key: "dynamicData",
      label: "Dynamic Data (JSON)",
      placeholder: '{"first_name": "John", "order_id": "12345"}',
      multiline: true,
    },
  ],
  sendgridGetContacts: [],

  // ─── Stripe ─────────────────────────────────────────────────────
  stripeGetBalance: [],
  stripeCreateCustomer: [
    { key: "name", label: "Name", placeholder: "John Doe" },
    { key: "email", label: "Email", placeholder: "john@example.com" },
    { key: "customerDescription", label: "Description", placeholder: "VIP customer" },
    { key: "phone", label: "Phone", placeholder: "+1-555-555-5555" },
    {
      key: "metadata",
      label: "Metadata (JSON)",
      placeholder: '{"plan": "premium", "source": "website"}',
      multiline: true,
    },
  ],
  stripeGetCustomer: [
    { key: "customerId", label: "Customer ID", placeholder: "cus_xxxxxxxxxxxxxx" },
  ],
  stripeListCustomers: [
    { key: "limit", label: "Limit (optional)", placeholder: "10" },
    { key: "email", label: "Email Filter (optional)", placeholder: "john@example.com" },
  ],
  stripeCreateCharge: [
    { key: "amount", label: "Amount (cents)", placeholder: "2000 (for $20.00)" },
    { key: "currency", label: "Currency", placeholder: "usd" },
    { key: "customerId", label: "Customer ID (optional)", placeholder: "cus_xxxxxxxxxxxxxx" },
    { key: "source", label: "Source (optional)", placeholder: "tok_visa" },
    { key: "chargeDescription", label: "Description", placeholder: "Payment for order #1234" },
  ],
  stripeCreatePaymentIntent: [
    { key: "amount", label: "Amount (cents)", placeholder: "2000 (for $20.00)" },
    { key: "currency", label: "Currency", placeholder: "usd" },
    { key: "customerId", label: "Customer ID (optional)", placeholder: "cus_xxxxxxxxxxxxxx" },
    {
      key: "paymentMethodTypes",
      label: "Payment Method Types",
      placeholder: "card, bank_transfer",
    },
    { key: "intentDescription", label: "Description", placeholder: "Payment for order #1234" },
  ],
  stripeListCharges: [
    { key: "limit", label: "Limit (optional)", placeholder: "10" },
    { key: "customerId", label: "Customer ID (optional)", placeholder: "cus_xxxxxxxxxxxxxx" },
  ],

  // ─── Postgres ───────────────────────────────────────────────────
  postgresQuery: [
    {
      key: "query",
      label: "SQL Query",
      placeholder: "SELECT * FROM users WHERE id = $1",
      multiline: true,
    },
  ],
  postgresInsert: [
    { key: "table", label: "Table", placeholder: "users" },
    { key: "columns", label: "Columns", placeholder: "name, email, age" },
    { key: "values", label: "Values", placeholder: "'John', 'john@example.com', 30" },
    { key: "returning", label: "RETURNING (optional)", placeholder: "* or id, name" },
  ],
  postgresSelect: [
    { key: "table", label: "Table", placeholder: "users" },
    { key: "columns", label: "Columns", placeholder: "* or id, name, email" },
    { key: "where", label: "WHERE (optional)", placeholder: "age > 18 AND status = 'active'" },
    { key: "orderBy", label: "ORDER BY (optional)", placeholder: "created_at DESC" },
    { key: "limit", label: "Limit (optional)", placeholder: "100" },
  ],
  postgresUpdate: [
    { key: "table", label: "Table", placeholder: "users" },
    { key: "set", label: "SET", placeholder: "name = 'Jane', age = 25" },
    { key: "where", label: "WHERE", placeholder: "id = 42" },
    { key: "returning", label: "RETURNING (optional)", placeholder: "* or id, name" },
  ],

  // ─── Google Sheets ──────────────────────────────────────────────
  googleSheetsReadRows: [
    {
      key: "spreadsheetId",
      label: "Spreadsheet ID",
      placeholder: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms",
    },
    { key: "range", label: "Range", placeholder: "Sheet1!A1:D10" },
    {
      key: "firstRowHeaders",
      label: "First Row as Headers",
      type: "select",
      options: [
        { value: "true", label: "Yes" },
        { value: "false", label: "No" },
      ],
    },
  ],
  googleSheetsAppendRow: [
    {
      key: "spreadsheetId",
      label: "Spreadsheet ID",
      placeholder: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms",
    },
    { key: "range", label: "Range", placeholder: "Sheet1!A:D" },
    {
      key: "values",
      label: "Values (JSON)",
      placeholder: '[["John", "john@example.com", "30"]]',
      multiline: true,
    },
    {
      key: "valueInputOption",
      label: "Value Input Option",
      type: "select",
      options: [
        { value: "USER_ENTERED", label: "User Entered" },
        { value: "RAW", label: "Raw" },
      ],
    },
  ],
  googleSheetsUpdateRow: [
    {
      key: "spreadsheetId",
      label: "Spreadsheet ID",
      placeholder: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms",
    },
    { key: "range", label: "Range", placeholder: "Sheet1!A2:D2" },
    {
      key: "values",
      label: "Values (JSON)",
      placeholder: '[["Jane", "jane@example.com", "28"]]',
      multiline: true,
    },
    {
      key: "valueInputOption",
      label: "Value Input Option",
      type: "select",
      options: [
        { value: "USER_ENTERED", label: "User Entered" },
        { value: "RAW", label: "Raw" },
      ],
    },
  ],
  googleSheetsClear: [
    {
      key: "spreadsheetId",
      label: "Spreadsheet ID",
      placeholder: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms",
    },
    { key: "range", label: "Range", placeholder: "Sheet1!A1:D10" },
  ],

  // ─── Airtable ───────────────────────────────────────────────────
  airtableCreateRecord: [
    { key: "baseId", label: "Base ID", placeholder: "appXXXXXXXXXXXXXX" },
    { key: "tableName", label: "Table Name", placeholder: "Table 1" },
    {
      key: "fields",
      label: "Fields (JSON)",
      placeholder: '{"Name": "John", "Email": "john@example.com"}',
      multiline: true,
    },
  ],
  airtableGetRecord: [
    { key: "baseId", label: "Base ID", placeholder: "appXXXXXXXXXXXXXX" },
    { key: "tableName", label: "Table Name", placeholder: "Table 1" },
    { key: "recordId", label: "Record ID", placeholder: "recXXXXXXXXXXXXXX" },
  ],
  airtableListRecords: [
    { key: "baseId", label: "Base ID", placeholder: "appXXXXXXXXXXXXXX" },
    { key: "tableName", label: "Table Name", placeholder: "Table 1" },
    { key: "maxRecords", label: "Max Records (optional)", placeholder: "100" },
    {
      key: "filterFormula",
      label: "Filter Formula (optional)",
      placeholder: "{Status} = 'Active'",
    },
  ],
  airtableUpdateRecord: [
    { key: "baseId", label: "Base ID", placeholder: "appXXXXXXXXXXXXXX" },
    { key: "tableName", label: "Table Name", placeholder: "Table 1" },
    { key: "recordId", label: "Record ID", placeholder: "recXXXXXXXXXXXXXX" },
    { key: "fields", label: "Fields (JSON)", placeholder: '{"Status": "Done"}', multiline: true },
  ],
  airtableDeleteRecord: [
    { key: "baseId", label: "Base ID", placeholder: "appXXXXXXXXXXXXXX" },
    { key: "tableName", label: "Table Name", placeholder: "Table 1" },
    { key: "recordId", label: "Record ID", placeholder: "recXXXXXXXXXXXXXX" },
  ],

  // ─── Jira ───────────────────────────────────────────────────────
  jiraCreateIssue: [
    { key: "domain", label: "Domain", placeholder: "yourcompany.atlassian.net" },
    { key: "projectKey", label: "Project Key", placeholder: "PROJ" },
    { key: "issueType", label: "Issue Type", placeholder: "Task" },
    { key: "summary", label: "Summary", placeholder: "Issue title" },
    {
      key: "description",
      label: "Description (optional)",
      placeholder: "Issue description",
      multiline: true,
    },
  ],
  jiraGetIssue: [
    { key: "domain", label: "Domain", placeholder: "yourcompany.atlassian.net" },
    { key: "issueKey", label: "Issue Key", placeholder: "PROJ-123" },
  ],
  jiraUpdateIssue: [
    { key: "domain", label: "Domain", placeholder: "yourcompany.atlassian.net" },
    { key: "issueKey", label: "Issue Key", placeholder: "PROJ-123" },
    {
      key: "fields",
      label: "Fields (JSON)",
      placeholder: '{"summary": "Updated title"}',
      multiline: true,
    },
  ],
  jiraAddComment: [
    { key: "domain", label: "Domain", placeholder: "yourcompany.atlassian.net" },
    { key: "issueKey", label: "Issue Key", placeholder: "PROJ-123" },
    { key: "body", label: "Comment Body", placeholder: "Your comment", multiline: true },
  ],
  jiraListIssues: [
    { key: "domain", label: "Domain", placeholder: "yourcompany.atlassian.net" },
    { key: "jql", label: "JQL Query (optional)", placeholder: "project = PROJ AND status = Open" },
    { key: "maxResults", label: "Max Results (optional)", placeholder: "50" },
  ],

  // ─── HubSpot ───────────────────────────────────────────────────
  hubspotCreateContact: [
    { key: "email", label: "Email", placeholder: "john@example.com" },
    { key: "firstName", label: "First Name (optional)", placeholder: "John" },
    { key: "lastName", label: "Last Name (optional)", placeholder: "Doe" },
    { key: "phone", label: "Phone (optional)", placeholder: "+1234567890" },
    { key: "company", label: "Company (optional)", placeholder: "Acme Inc" },
  ],
  hubspotGetContact: [{ key: "contactId", label: "Contact ID", placeholder: "123" }],
  hubspotUpdateContact: [
    { key: "contactId", label: "Contact ID", placeholder: "123" },
    {
      key: "properties",
      label: "Properties (JSON)",
      placeholder: '{"firstname": "Jane"}',
      multiline: true,
    },
  ],
  hubspotCreateDeal: [
    { key: "dealName", label: "Deal Name", placeholder: "New Deal" },
    { key: "amount", label: "Amount (optional)", placeholder: "1000" },
    { key: "pipeline", label: "Pipeline (optional)", placeholder: "default" },
    { key: "stage", label: "Stage (optional)", placeholder: "appointmentscheduled" },
  ],
  hubspotGetDeal: [{ key: "dealId", label: "Deal ID", placeholder: "123" }],

  // ─── Twilio ─────────────────────────────────────────────────────
  twilioSendSms: [
    { key: "to", label: "To", placeholder: "+1234567890" },
    { key: "from", label: "From", placeholder: "+1234567890" },
    { key: "body", label: "Message Body", placeholder: "Hello!", multiline: true },
  ],
  twilioMakeCall: [
    { key: "to", label: "To", placeholder: "+1234567890" },
    { key: "from", label: "From", placeholder: "+1234567890" },
    { key: "url", label: "TwiML URL", placeholder: "https://example.com/twiml" },
  ],
  twilioSendWhatsApp: [
    { key: "to", label: "To", placeholder: "+1234567890" },
    { key: "from", label: "From", placeholder: "+1234567890" },
    { key: "body", label: "Message Body", placeholder: "Hello!", multiline: true },
  ],

  // ─── Mailchimp ──────────────────────────────────────────────────
  mailchimpAddSubscriber: [
    { key: "listId", label: "List ID", placeholder: "abc123" },
    { key: "email", label: "Email", placeholder: "john@example.com" },
    { key: "firstName", label: "First Name (optional)", placeholder: "John" },
    { key: "lastName", label: "Last Name (optional)", placeholder: "Doe" },
    { key: "status", label: "Status", placeholder: "subscribed" },
  ],
  mailchimpGetSubscriber: [
    { key: "listId", label: "List ID", placeholder: "abc123" },
    { key: "subscriberHash", label: "Subscriber Hash (MD5 of email)", placeholder: "md5hash" },
  ],
  mailchimpCreateCampaign: [
    { key: "listId", label: "List ID", placeholder: "abc123" },
    { key: "subject", label: "Subject", placeholder: "Newsletter" },
    { key: "fromName", label: "From Name", placeholder: "Your Company" },
    { key: "replyTo", label: "Reply To", placeholder: "reply@example.com" },
  ],
  mailchimpListCampaigns: [
    { key: "count", label: "Count (optional)", placeholder: "10" },
    { key: "offset", label: "Offset (optional)", placeholder: "0" },
  ],

  // ─── Zoom ───────────────────────────────────────────────────────
  zoomCreateMeeting: [
    { key: "topic", label: "Topic", placeholder: "Team Meeting" },
    { key: "startTime", label: "Start Time (optional)", placeholder: "2024-01-01T10:00:00Z" },
    { key: "duration", label: "Duration (min, optional)", placeholder: "60" },
    { key: "timezone", label: "Timezone (optional)", placeholder: "America/New_York" },
  ],
  zoomGetMeeting: [{ key: "meetingId", label: "Meeting ID", placeholder: "123456789" }],
  zoomListMeetings: [
    { key: "userId", label: "User ID (optional, default: me)", placeholder: "me" },
    { key: "pageSize", label: "Page Size (optional)", placeholder: "30" },
  ],

  // ─── Supabase ───────────────────────────────────────────────────
  supabaseSelect: [
    { key: "projectUrl", label: "Project URL", placeholder: "https://xxx.supabase.co" },
    { key: "table", label: "Table", placeholder: "users" },
    { key: "columns", label: "Columns (optional)", placeholder: "id,name,email" },
    { key: "filter", label: "Filter (optional)", placeholder: "status=eq.active" },
    { key: "limit", label: "Limit (optional)", placeholder: "100" },
  ],
  supabaseInsert: [
    { key: "projectUrl", label: "Project URL", placeholder: "https://xxx.supabase.co" },
    { key: "table", label: "Table", placeholder: "users" },
    { key: "data", label: "Data (JSON)", placeholder: '{"name": "John"}', multiline: true },
  ],
  supabaseUpdate: [
    { key: "projectUrl", label: "Project URL", placeholder: "https://xxx.supabase.co" },
    { key: "table", label: "Table", placeholder: "users" },
    { key: "data", label: "Data (JSON)", placeholder: '{"name": "Jane"}', multiline: true },
    { key: "filter", label: "Filter", placeholder: "id=eq.1" },
  ],
  supabaseDelete: [
    { key: "projectUrl", label: "Project URL", placeholder: "https://xxx.supabase.co" },
    { key: "table", label: "Table", placeholder: "users" },
    { key: "filter", label: "Filter", placeholder: "id=eq.1" },
  ],

  // ─── Salesforce ─────────────────────────────────────────────────
  salesforceCreateRecord: [
    { key: "instanceUrl", label: "Instance URL", placeholder: "https://yourorg.salesforce.com" },
    { key: "objectType", label: "Object Type", placeholder: "Account" },
    { key: "fields", label: "Fields (JSON)", placeholder: '{"Name": "Acme"}', multiline: true },
  ],
  salesforceGetRecord: [
    { key: "instanceUrl", label: "Instance URL", placeholder: "https://yourorg.salesforce.com" },
    { key: "objectType", label: "Object Type", placeholder: "Account" },
    { key: "recordId", label: "Record ID", placeholder: "001XXXXXXXXXXXX" },
  ],
  salesforceUpdateRecord: [
    { key: "instanceUrl", label: "Instance URL", placeholder: "https://yourorg.salesforce.com" },
    { key: "objectType", label: "Object Type", placeholder: "Account" },
    { key: "recordId", label: "Record ID", placeholder: "001XXXXXXXXXXXX" },
    { key: "fields", label: "Fields (JSON)", placeholder: '{"Name": "Updated"}', multiline: true },
  ],
  salesforceQuery: [
    { key: "instanceUrl", label: "Instance URL", placeholder: "https://yourorg.salesforce.com" },
    {
      key: "soql",
      label: "SOQL Query",
      placeholder: "SELECT Id, Name FROM Account LIMIT 10",
      multiline: true,
    },
  ],

  // ─── Trello ─────────────────────────────────────────────────────
  trelloCreateCard: [
    { key: "listId", label: "List ID", placeholder: "list123" },
    { key: "name", label: "Card Name", placeholder: "New Card" },
    {
      key: "description",
      label: "Description (optional)",
      placeholder: "Card description",
      multiline: true,
    },
  ],
  trelloGetCard: [{ key: "cardId", label: "Card ID", placeholder: "card123" }],
  trelloMoveCard: [
    { key: "cardId", label: "Card ID", placeholder: "card123" },
    { key: "listId", label: "Destination List ID", placeholder: "list456" },
  ],
  trelloListCards: [{ key: "listId", label: "List ID", placeholder: "list123" }],
  trelloListBoards: [
    { key: "memberId", label: "Member ID (optional, default: me)", placeholder: "me" },
  ],

  // ─── Google Calendar ────────────────────────────────────────────
  googleCalendarCreateEvent: [
    { key: "calendarId", label: "Calendar ID (optional)", placeholder: "primary" },
    { key: "summary", label: "Summary", placeholder: "Team Meeting" },
    { key: "startDateTime", label: "Start DateTime", placeholder: "2024-01-01T10:00:00Z" },
    { key: "endDateTime", label: "End DateTime", placeholder: "2024-01-01T11:00:00Z" },
    {
      key: "description",
      label: "Description (optional)",
      placeholder: "Meeting agenda",
      multiline: true,
    },
    { key: "location", label: "Location (optional)", placeholder: "Room 101" },
  ],
  googleCalendarGetEvents: [
    { key: "calendarId", label: "Calendar ID (optional)", placeholder: "primary" },
    { key: "timeMin", label: "Time Min (optional)", placeholder: "2024-01-01T00:00:00Z" },
    { key: "timeMax", label: "Time Max (optional)", placeholder: "2024-12-31T23:59:59Z" },
    { key: "maxResults", label: "Max Results (optional)", placeholder: "10" },
  ],
  googleCalendarUpdateEvent: [
    { key: "calendarId", label: "Calendar ID (optional)", placeholder: "primary" },
    { key: "eventId", label: "Event ID", placeholder: "event123" },
    { key: "summary", label: "Summary (optional)", placeholder: "Updated Meeting" },
  ],
  googleCalendarDeleteEvent: [
    { key: "calendarId", label: "Calendar ID (optional)", placeholder: "primary" },
    { key: "eventId", label: "Event ID", placeholder: "event123" },
  ],

  // ─── Google Drive ───────────────────────────────────────────────
  googleDriveUploadFile: [
    { key: "fileName", label: "File Name", placeholder: "document.pdf" },
    { key: "mimeType", label: "MIME Type", placeholder: "application/pdf" },
    {
      key: "content",
      label: "Content (base64)",
      placeholder: "base64 encoded content",
      multiline: true,
    },
    { key: "folderId", label: "Folder ID (optional)", placeholder: "folder123" },
  ],
  googleDriveListFiles: [
    { key: "query", label: "Query (optional)", placeholder: "name contains 'report'" },
    { key: "pageSize", label: "Page Size (optional)", placeholder: "10" },
  ],
  googleDriveCreateFolder: [
    { key: "name", label: "Folder Name", placeholder: "New Folder" },
    { key: "parentId", label: "Parent ID (optional)", placeholder: "folder123" },
  ],
  googleDriveDeleteFile: [{ key: "fileId", label: "File ID", placeholder: "file123" }],

  // ─── Gmail ──────────────────────────────────────────────────────
  gmailSendEmail: [
    { key: "to", label: "To", placeholder: "recipient@example.com" },
    { key: "subject", label: "Subject", placeholder: "Email subject" },
    { key: "body", label: "Body (HTML)", placeholder: "<p>Hello!</p>", multiline: true },
    { key: "cc", label: "CC (optional)", placeholder: "cc@example.com" },
    { key: "bcc", label: "BCC (optional)", placeholder: "bcc@example.com" },
  ],
  gmailGetEmails: [
    { key: "query", label: "Query (optional)", placeholder: "is:unread" },
    { key: "maxResults", label: "Max Results (optional)", placeholder: "10" },
  ],
  gmailGetEmail: [
    { key: "messageId", label: "Message ID", placeholder: "msg123" },
    { key: "format", label: "Format (optional)", placeholder: "full" },
  ],

  // ─── MongoDB ────────────────────────────────────────────────────
  mongodbFind: [
    {
      key: "connectionString",
      label: "Connection String",
      placeholder: "mongodb://localhost:27017",
    },
    { key: "database", label: "Database", placeholder: "mydb" },
    { key: "collection", label: "Collection", placeholder: "users" },
    {
      key: "filter",
      label: "Filter (JSON, optional)",
      placeholder: '{"active": true}',
      multiline: true,
    },
    { key: "limit", label: "Limit (optional)", placeholder: "100" },
  ],
  mongodbInsertOne: [
    {
      key: "connectionString",
      label: "Connection String",
      placeholder: "mongodb://localhost:27017",
    },
    { key: "database", label: "Database", placeholder: "mydb" },
    { key: "collection", label: "Collection", placeholder: "users" },
    { key: "document", label: "Document (JSON)", placeholder: '{"name": "John"}', multiline: true },
  ],
  mongodbUpdateOne: [
    {
      key: "connectionString",
      label: "Connection String",
      placeholder: "mongodb://localhost:27017",
    },
    { key: "database", label: "Database", placeholder: "mydb" },
    { key: "collection", label: "Collection", placeholder: "users" },
    { key: "filter", label: "Filter (JSON)", placeholder: '{"_id": "123"}', multiline: true },
    {
      key: "update",
      label: "Update (JSON)",
      placeholder: '{"$set": {"name": "Jane"}}',
      multiline: true,
    },
  ],
  mongodbDeleteOne: [
    {
      key: "connectionString",
      label: "Connection String",
      placeholder: "mongodb://localhost:27017",
    },
    { key: "database", label: "Database", placeholder: "mydb" },
    { key: "collection", label: "Collection", placeholder: "users" },
    { key: "filter", label: "Filter (JSON)", placeholder: '{"_id": "123"}', multiline: true },
  ],
  mongodbAggregate: [
    {
      key: "connectionString",
      label: "Connection String",
      placeholder: "mongodb://localhost:27017",
    },
    { key: "database", label: "Database", placeholder: "mydb" },
    { key: "collection", label: "Collection", placeholder: "users" },
    {
      key: "pipeline",
      label: "Pipeline (JSON array)",
      placeholder: '[{"$match": {"active": true}}]',
      multiline: true,
    },
  ],

  // ─── MySQL ──────────────────────────────────────────────────────
  mysqlQuery: [
    { key: "host", label: "Host", placeholder: "localhost" },
    { key: "database", label: "Database", placeholder: "mydb" },
    {
      key: "query",
      label: "SQL Query",
      placeholder: "SELECT * FROM users LIMIT 10",
      multiline: true,
    },
  ],
  mysqlInsert: [
    { key: "host", label: "Host", placeholder: "localhost" },
    { key: "database", label: "Database", placeholder: "mydb" },
    { key: "table", label: "Table", placeholder: "users" },
    { key: "columns", label: "Columns", placeholder: "name,email" },
    { key: "values", label: "Values (JSON array)", placeholder: '["John","john@example.com"]' },
  ],
  mysqlSelect: [
    { key: "host", label: "Host", placeholder: "localhost" },
    { key: "database", label: "Database", placeholder: "mydb" },
    { key: "table", label: "Table", placeholder: "users" },
    { key: "where", label: "WHERE (optional)", placeholder: "active = 1" },
    { key: "limit", label: "Limit (optional)", placeholder: "100" },
  ],
  mysqlUpdate: [
    { key: "host", label: "Host", placeholder: "localhost" },
    { key: "database", label: "Database", placeholder: "mydb" },
    { key: "table", label: "Table", placeholder: "users" },
    { key: "set", label: "SET (JSON)", placeholder: '{"name": "Jane"}', multiline: true },
    { key: "where", label: "WHERE", placeholder: "id = 1" },
  ],

  // ─── Redis ──────────────────────────────────────────────────────
  redisGet: [{ key: "key", label: "Key", placeholder: "mykey" }],
  redisSet: [
    { key: "key", label: "Key", placeholder: "mykey" },
    { key: "value", label: "Value", placeholder: "myvalue" },
    { key: "ttl", label: "TTL (seconds, optional)", placeholder: "3600" },
  ],
  redisDelete: [{ key: "key", label: "Key", placeholder: "mykey" }],
  redisKeys: [{ key: "pattern", label: "Pattern (optional)", placeholder: "*" }],
  redisHget: [
    { key: "key", label: "Key", placeholder: "myhash" },
    { key: "field", label: "Field", placeholder: "myfield" },
  ],
  redisHset: [
    { key: "key", label: "Key", placeholder: "myhash" },
    { key: "field", label: "Field", placeholder: "myfield" },
    { key: "value", label: "Value", placeholder: "myvalue" },
  ],

  // ─── AWS S3 ─────────────────────────────────────────────────────
  s3PutObject: [
    { key: "region", label: "Region", placeholder: "us-east-1" },
    { key: "bucket", label: "Bucket", placeholder: "my-bucket" },
    { key: "key", label: "Key (path)", placeholder: "path/to/file.txt" },
    { key: "body", label: "Body", placeholder: "File content", multiline: true },
    { key: "contentType", label: "Content Type (optional)", placeholder: "text/plain" },
  ],
  s3GetObject: [
    { key: "region", label: "Region", placeholder: "us-east-1" },
    { key: "bucket", label: "Bucket", placeholder: "my-bucket" },
    { key: "key", label: "Key (path)", placeholder: "path/to/file.txt" },
  ],
  s3ListObjects: [
    { key: "region", label: "Region", placeholder: "us-east-1" },
    { key: "bucket", label: "Bucket", placeholder: "my-bucket" },
    { key: "prefix", label: "Prefix (optional)", placeholder: "path/to/" },
  ],
  s3DeleteObject: [
    { key: "region", label: "Region", placeholder: "us-east-1" },
    { key: "bucket", label: "Bucket", placeholder: "my-bucket" },
    { key: "key", label: "Key (path)", placeholder: "path/to/file.txt" },
  ],

  // ─── Shopify ────────────────────────────────────────────────────
  shopifyCreateProduct: [
    { key: "shop", label: "Shop Name", placeholder: "mystore" },
    { key: "title", label: "Product Title", placeholder: "New Product" },
    {
      key: "bodyHtml",
      label: "Description HTML (optional)",
      placeholder: "<p>Product description</p>",
      multiline: true,
    },
    { key: "vendor", label: "Vendor (optional)", placeholder: "My Brand" },
  ],
  shopifyGetProduct: [
    { key: "shop", label: "Shop Name", placeholder: "mystore" },
    { key: "productId", label: "Product ID", placeholder: "123456" },
  ],
  shopifyListProducts: [
    { key: "shop", label: "Shop Name", placeholder: "mystore" },
    { key: "limit", label: "Limit (optional)", placeholder: "50" },
  ],
  shopifyCreateOrder: [
    { key: "shop", label: "Shop Name", placeholder: "mystore" },
    {
      key: "lineItems",
      label: "Line Items (JSON)",
      placeholder: '[{"variant_id":123,"quantity":1}]',
      multiline: true,
    },
  ],
  shopifyGetOrder: [
    { key: "shop", label: "Shop Name", placeholder: "mystore" },
    { key: "orderId", label: "Order ID", placeholder: "789" },
  ],
  shopifyListOrders: [
    { key: "shop", label: "Shop Name", placeholder: "mystore" },
    { key: "status", label: "Status (optional)", placeholder: "any" },
  ],
};

// ─── Service name mapping ─────────────────────────────────────────

const SERVICE_NAMES: Record<string, string> = {
  discord: "Discord",
  slack: "Slack",
  twitter: "Twitter",
  telegram: "Telegram",
  github: "GitHub",
  notion: "Notion",
  sendgrid: "SendGrid",
  stripe: "Stripe",
  postgres: "PostgreSQL",
  googleSheets: "Google Sheets",
  airtable: "Airtable",
  jira: "Jira",
  hubspot: "HubSpot",
  twilio: "Twilio",
  mailchimp: "Mailchimp",
  zoom: "Zoom",
  supabase: "Supabase",
  salesforce: "Salesforce",
  trello: "Trello",
  googleCalendar: "Google Calendar",
  googleDrive: "Google Drive",
  gmail: "Gmail",
  mongodb: "MongoDB",
  mysql: "MySQL",
  redis: "Redis",
  s3: "AWS S3",
  shopify: "Shopify",
  asana: "Asana",
  linear: "Linear",
  clickup: "ClickUp",
  monday: "Monday.com",
  dropbox: "Dropbox",
  box: "Box",
  gitlab: "GitLab",
  paypal: "PayPal",
  typeform: "Typeform",
  calendly: "Calendly",
  whatsapp: "WhatsApp",
  intercom: "Intercom",
  zendesk: "Zendesk",
  freshdesk: "Freshdesk",
  woo: "WooCommerce",
  activecampaign: "ActiveCampaign",
  bitly: "Bitly",
  circleci: "CircleCI",
  jenkins: "Jenkins",
  cloudflare: "Cloudflare",
  convertkit: "ConvertKit",
  contentful: "Contentful",
  mattermost: "Mattermost",
  pagerduty: "PagerDuty",
  sentry: "Sentry",
  todoist: "Todoist",
  nocodb: "NocoDB",
  snowflake: "Snowflake",
  graphql: "GraphQL",
  crypto: "Crypto",
  baserow: "Baserow",
  elasticsearch: "Elasticsearch",
  grafana: "Grafana",
  netlify: "Netlify",
  wordpress: "WordPress",
  xero: "Xero",
  quickbooks: "QuickBooks",
  pipedrive: "Pipedrive",
  helpscout: "Help Scout",
  reddit: "Reddit",
  spotify: "Spotify",
  servicenow: "ServiceNow",
  ghost: "Ghost",
  webflow: "Webflow",
  coda: "Coda",
};

function getServiceName(stepType: string): string {
  for (const [prefix, name] of Object.entries(SERVICE_NAMES)) {
    if (stepType.startsWith(prefix)) return name;
  }
  return stepType;
}

// ─── Step types handled by this editor ────────────────────────────

const LEGACY_INTEGRATION_TYPES = [
  // Discord
  "discordSendMessage",
  "discordSendWebhook",
  "discordReactMessage",
  "discordGetMessage",
  "discordListMessages",
  "discordDeleteMessage",
  // Slack
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
  // Twitter
  "twitterCreateTweet",
  "twitterDeleteTweet",
  "twitterLikeTweet",
  "twitterRetweet",
  "twitterSearchTweets",
  "twitterSendDM",
  "twitterSearchUser",
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
] as const;

const ALL_INTEGRATION_TYPES = new Set<string>([
  ...LEGACY_INTEGRATION_TYPES,
  ...(IntegrationStepTypes as readonly string[]),
]);

export function isIntegrationStep(stepType: string): boolean {
  return ALL_INTEGRATION_TYPES.has(stepType);
}

// ─── Component ────────────────────────────────────────────────────

export function IntegrationStepEditor({ step, id, onUpdate }: StepProps) {
  const fields = FIELD_DEFS[step.type] || [];
  const serviceName = getServiceName(step.type);
  const stepRecord = step as unknown as Record<string, unknown>;

  const renderField = (field: FieldDef) => {
    if (field.type === "checkbox") {
      return (
        <div key={field.key} className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={Boolean(stepRecord[field.key])}
            onChange={(e) =>
              onUpdate(id, "update", { step: { ...step, [field.key]: e.target.checked } })
            }
            className="h-3 w-3"
          />
          <Label className="text-xs">{field.label}</Label>
        </div>
      );
    }

    if (field.type === "select" && field.options) {
      return (
        <div key={field.key} className="space-y-2">
          <Label className="text-xs">{field.label}</Label>
          <Select
            value={(stepRecord[field.key] as string) || field.options[0]?.value}
            onValueChange={(v) => onUpdate(id, "update", { step: { ...step, [field.key]: v } })}
          >
            <SelectTrigger className="text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {field.options.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {field.hint && <p className="text-xs text-gray-500">{field.hint}</p>}
        </div>
      );
    }

    const value = (stepRecord[field.key] as string) || "";

    if (field.multiline) {
      return (
        <div key={field.key} className="space-y-2">
          <Label className="text-xs">{field.label}</Label>
          <Textarea
            value={value}
            placeholder={field.placeholder}
            onChange={(e) =>
              onUpdate(id, "update", { step: { ...step, [field.key]: e.target.value } })
            }
            className="text-xs min-h-20"
          />
          {field.hint && <p className="text-xs text-gray-500">{field.hint}</p>}
        </div>
      );
    }

    return (
      <div key={field.key} className="space-y-2">
        <Label className="text-xs">{field.label}</Label>
        <Input
          value={value}
          placeholder={field.placeholder}
          onChange={(e) =>
            onUpdate(id, "update", { step: { ...step, [field.key]: e.target.value } })
          }
          className="text-xs"
        />
        {field.hint && <p className="text-xs text-gray-500">{field.hint}</p>}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {fields.map(renderField)}
      <SharedCredentialFields step={step} id={id} onUpdate={onUpdate} serviceName={serviceName} />
    </div>
  );
}
