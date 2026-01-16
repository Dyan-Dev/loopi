/**
 * Slack automation step types and interfaces
 * Supports both V1 and V2 API operations
 */

import type { StepBase } from "./steps";

// ===== Message Operations =====
export interface SlackSendMessageStep extends StepBase {
  type: "slackSendMessage";
  operation: "send";
  resource: "message";
  channelId: string;
  text: string;
  threadTs?: string;
  replyBroadcast?: boolean;
  mrkdwn?: boolean;
  blocksJson?: string;
  storeKey?: string;
  credentialId?: string;
  apiToken?: string;
  botToken?: string;
}

export interface SlackUpdateMessageStep extends StepBase {
  type: "slackUpdateMessage";
  operation: "update";
  resource: "message";
  channelId: string;
  timestamp: string;
  text: string;
  blocksJson?: string;
  storeKey?: string;
  credentialId?: string;
  apiToken?: string;
  botToken?: string;
}

export interface SlackDeleteMessageStep extends StepBase {
  type: "slackDeleteMessage";
  operation: "delete";
  resource: "message";
  channelId: string;
  timestamp: string;
  storeKey?: string;
  credentialId?: string;
  apiToken?: string;
  botToken?: string;
}

// ===== Channel Operations =====
export interface SlackCreateChannelStep extends StepBase {
  type: "slackCreateChannel";
  operation: "create";
  resource: "channel";
  channelName: string;
  isPrivate?: boolean;
  channelDescription?: string;
  storeKey?: string;
  credentialId?: string;
  apiToken?: string;
  botToken?: string;
}

export interface SlackGetChannelStep extends StepBase {
  type: "slackGetChannel";
  operation: "get";
  resource: "channel";
  channelId: string;
  includeNumMembers?: boolean;
  storeKey?: string;
  credentialId?: string;
  apiToken?: string;
  botToken?: string;
}

export interface SlackListChannelsStep extends StepBase {
  type: "slackListChannels";
  operation: "getAll" | "list";
  resource: "channel";
  limit?: number;
  excludeArchived?: boolean;
  storeKey?: string;
  credentialId?: string;
  apiToken?: string;
  botToken?: string;
}

export interface SlackInviteUsersStep extends StepBase {
  type: "slackInviteUsers";
  operation: "invite";
  resource: "channel";
  channelId: string;
  userIds: string | string[];
  storeKey?: string;
  credentialId?: string;
  apiToken?: string;
  botToken?: string;
}

export interface SlackListMembersStep extends StepBase {
  type: "slackListMembers";
  operation: "member" | "members";
  resource: "channel";
  channelId: string;
  limit?: number;
  storeKey?: string;
  credentialId?: string;
  apiToken?: string;
  botToken?: string;
}

export interface SlackSetTopicStep extends StepBase {
  type: "slackSetTopic";
  operation: "setTopic" | "setPurpose";
  resource: "channel";
  channelId: string;
  topic: string;
  storeKey?: string;
  credentialId?: string;
  apiToken?: string;
  botToken?: string;
}

export interface SlackArchiveChannelStep extends StepBase {
  type: "slackArchiveChannel";
  operation: "archive";
  resource: "channel";
  channelId: string;
  storeKey?: string;
  credentialId?: string;
  apiToken?: string;
  botToken?: string;
}

export interface SlackUnarchiveChannelStep extends StepBase {
  type: "slackUnarchiveChannel";
  operation: "unarchive";
  resource: "channel";
  channelId: string;
  storeKey?: string;
  credentialId?: string;
  apiToken?: string;
  botToken?: string;
}

export interface SlackGetHistoryStep extends StepBase {
  type: "slackGetHistory";
  operation: "history";
  resource: "channel";
  channelId: string;
  limit?: number;
  oldestTimestamp?: string;
  latestTimestamp?: string;
  storeKey?: string;
  credentialId?: string;
  apiToken?: string;
  botToken?: string;
}

// ===== User Operations =====
export interface SlackGetUserStep extends StepBase {
  type: "slackGetUser";
  operation: "get";
  resource: "user";
  userId: string;
  storeKey?: string;
  credentialId?: string;
  apiToken?: string;
  botToken?: string;
}

export interface SlackListUsersStep extends StepBase {
  type: "slackListUsers";
  operation: "getAll" | "list";
  resource: "user";
  limit?: number;
  storeKey?: string;
  credentialId?: string;
  apiToken?: string;
  botToken?: string;
}

// ===== Reaction Operations =====
export interface SlackAddReactionStep extends StepBase {
  type: "slackAddReaction";
  operation: "add";
  resource: "reaction";
  channelId: string;
  timestamp: string;
  reactionEmoji: string;
  storeKey?: string;
  credentialId?: string;
  apiToken?: string;
  botToken?: string;
}

// ===== File Operations =====
export interface SlackUploadFileStep extends StepBase {
  type: "slackUploadFile";
  operation: "upload";
  resource: "file";
  channelId: string;
  filePath: string;
  fileName?: string;
  title?: string;
  initialComment?: string;
  storeKey?: string;
  credentialId?: string;
  apiToken?: string;
  botToken?: string;
}

// ===== Union Type =====
export type SlackAutomationStep =
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
  | SlackUploadFileStep;

// ===== API Response Types =====
export interface SlackApiResponse {
  ok: boolean;
  error?: string;
  response_metadata?: {
    messages?: string[];
    warnings?: string[];
    next_cursor?: string;
  };
  [key: string]: unknown;
}

export interface SlackMessage {
  type: string;
  user: string;
  text: string;
  ts: string;
  thread_ts?: string;
  reply_count?: number;
  reply_users_count?: number;
  latest_reply?: string;
  [key: string]: unknown;
}

export interface SlackChannel {
  id: string;
  name: string;
  is_channel: boolean;
  is_group: boolean;
  is_im: boolean;
  created: number;
  creator: string;
  is_archived: boolean;
  is_general: boolean;
  unlinked: number;
  name_normalized: string;
  is_shared: boolean;
  is_ext_shared: boolean;
  is_org_shared: boolean;
  is_private: boolean;
  is_mpim: boolean;
  topic: {
    value: string;
    creator: string;
    last_set: number;
  };
  purpose: {
    value: string;
    creator: string;
    last_set: number;
  };
  num_members?: number;
  members?: string[];
  [key: string]: unknown;
}

export interface SlackUser {
  id: string;
  team_id: string;
  name: string;
  deleted: boolean;
  color: string;
  real_name: string;
  tz: string;
  tz_label: string;
  tz_offset: number;
  profile: {
    title: string;
    phone: string;
    skype: string;
    real_name: string;
    real_name_normalized: string;
    display_name: string;
    display_name_normalized: string;
    status_text: string;
    status_emoji: string;
    email: string;
    image_24: string;
    image_32: string;
    image_48: string;
    image_72: string;
    image_192: string;
    image_512: string;
    [key: string]: unknown;
  };
  is_admin: boolean;
  is_owner: boolean;
  is_primary_owner: boolean;
  is_restricted: boolean;
  is_ultra_restricted: boolean;
  is_bot: boolean;
  updated: number;
  is_app_user: boolean;
  [key: string]: unknown;
}

export interface SlackFile {
  id: string;
  created: number;
  timestamp: number;
  name: string;
  title: string;
  mimetype: string;
  filetype: string;
  pretty_type: string;
  user: string;
  editable: boolean;
  size: number;
  mode: string;
  is_external: boolean;
  external_type: string;
  is_public: boolean;
  public_url_shared: boolean;
  display_as_bot: boolean;
  username: string;
  url_private: string;
  url_private_download: string;
  thumb_64: string;
  thumb_80: string;
  thumb_160: string;
  thumb_360: string;
  thumb_360_w: number;
  thumb_360_h: number;
  thumb_480: string;
  thumb_480_w: number;
  thumb_480_h: number;
  thumb_720: string;
  thumb_720_w: number;
  thumb_720_h: number;
  thumb_960: string;
  thumb_960_w: number;
  thumb_960_h: number;
  thumb_1024: string;
  thumb_1024_w: number;
  thumb_1024_h: number;
  image_exif_rotation: number;
  original_w: number;
  original_h: number;
  [key: string]: unknown;
}

export interface SlackReaction {
  name: string;
  users: string[];
  count: number;
}

// ===== Credential Types =====
export interface SlackCredential {
  type: "slack" | "slackOAuth2";
  data: {
    token?: string;
    botToken?: string;
    apiToken?: string;
    accessToken?: string;
    slackTeamId?: string;
    slackBotUserId?: string;
    [key: string]: unknown;
  };
}

// ===== V1 to V2 Migration =====
export const V1_TO_V2_OPERATION_MAP: Record<string, string> = {
  // Channel operations
  "channel.getAll": "channel.list",
  "channel.archive": "channel.archive",
  "channel.unarchive": "channel.unarchive",
  "channel.close": "channel.close",
  "channel.create": "channel.create",
  "channel.get": "channel.get",
  "channel.history": "channel.history",
  "channel.invite": "channel.invite",
  "channel.join": "channel.join",
  "channel.kick": "channel.kick",
  "channel.leave": "channel.leave",
  "channel.member": "channel.member",
  "channel.open": "channel.open",
  "channel.rename": "channel.rename",
  "channel.replies": "channel.replies",
  "channel.setPurpose": "channel.setTopic",
  "channel.setTopic": "channel.setTopic",

  // Message operations
  "message.send": "message.send",

  // File operations
  "file.upload": "file.upload",
  "file.delete": "file.delete",
  "file.getAll": "file.list",
  "file.get": "file.get",

  // Reaction operations
  "reaction.add": "reaction.add",
  "reaction.remove": "reaction.remove",
  "reaction.getAll": "reaction.list",
  "reaction.get": "reaction.get",

  // User operations
  "user.get": "user.get",
  "user.getAll": "user.list",

  // User Group operations
  "userGroup.getAll": "userGroup.list",
  "userGroup.get": "userGroup.get",
};
