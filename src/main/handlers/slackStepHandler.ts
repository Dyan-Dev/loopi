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
} from "@app-types/slack";
import { getCredential } from "@main/credentialsStore";
import { debugLogger } from "@main/debugLogger";
import axios from "axios";

/**
 * Handles all Slack-related automation steps
 * Supports v1 and v2 API operations for channels, messages, users, files, and reactions
 */
export class SlackStepHandler {
  /**
   * Resolve Slack credentials from either credentialId or direct token
   */
  static async resolveSlackCredentials(step: {
    credentialId?: string;
    apiToken?: string;
    botToken?: string;
  }): Promise<{
    token: string;
  }> {
    // If credentialId is provided, fetch from store
    if (step.credentialId) {
      const credential = await getCredential(step.credentialId);
      if (!credential || credential.type !== "slack") {
        throw new Error("Invalid or missing Slack credential");
      }
      const token = credential.data.token || credential.data.botToken || credential.data.apiToken;
      if (!token) {
        throw new Error("Slack credential missing token");
      }
      return { token };
    }

    // Otherwise use direct token
    const token = step.apiToken || step.botToken;
    if (!token) {
      throw new Error("Slack token is required");
    }
    return { token };
  }

  /**
   * Make a request to Slack API
   */
  private async slackRequest(
    method: string,
    endpoint: string,
    token: string,
    data?: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    try {
      const config = {
        method,
        url: `https://slack.com/api${endpoint}`,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        data,
      };

      debugLogger.debug("Slack API Request", `${method} ${endpoint}`, config);

      const response = await axios(config);

      if (!response.data.ok) {
        const error = response.data.error || "Unknown error";
        throw new Error(`Slack API Error: ${error}`);
      }

      return response.data;
    } catch (error: unknown) {
      debugLogger.error(
        "Slack API Error",
        error instanceof Error ? error.message : String(error),
        error
      );
      throw error;
    }
  }

  /**
   * Send a message to a channel (v1 & v2)
   */
  async executeSendMessage(
    step: {
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
    },
    substituteVariables: (input?: string) => string,
    resolveSlackCredentials: (step: Record<string, unknown>) => Promise<{ token: string }>,
    variables: Record<string, unknown>
  ): Promise<unknown> {
    const channelId = substituteVariables(step.channelId);
    const text = substituteVariables(step.text);
    const { token } = await resolveSlackCredentials(step);

    debugLogger.debug("Slack Send Message", "Sending message", {
      channelId,
      text: text.substring(0, 100),
    });

    const payload: Record<string, unknown> = {
      channel: channelId,
      text,
    };

    if (step.threadTs) {
      payload.thread_ts = substituteVariables(step.threadTs);
    }

    if (step.replyBroadcast !== undefined) {
      payload.reply_broadcast = step.replyBroadcast;
    }

    if (step.mrkdwn !== undefined) {
      payload.mrkdwn = step.mrkdwn;
    }

    if (step.blocksJson) {
      try {
        payload.blocks = JSON.parse(substituteVariables(step.blocksJson));
      } catch (_) {
        throw new Error("Invalid blocks JSON");
      }
    }

    const response = await this.slackRequest("POST", "/chat.postMessage", token, payload);

    if (step.storeKey) {
      variables[step.storeKey] = response;
    }

    return response;
  }

  /**
   * Update a message (v2)
   */
  async executeUpdateMessage(
    step: {
      channelId: string;
      timestamp: string;
      text: string;
      blocksJson?: string;
      storeKey?: string;
      credentialId?: string;
      apiToken?: string;
      botToken?: string;
    },
    substituteVariables: (input?: string) => string,
    resolveSlackCredentials: (step: Record<string, unknown>) => Promise<{ token: string }>,
    variables: Record<string, unknown>
  ): Promise<unknown> {
    const channelId = substituteVariables(step.channelId);
    const text = substituteVariables(step.text);
    const timestamp = substituteVariables(step.timestamp);
    const { token } = await resolveSlackCredentials(step);

    debugLogger.debug("Slack Update Message", "Updating message", {
      channelId,
      timestamp,
    });

    const payload: Record<string, unknown> = {
      channel: channelId,
      ts: timestamp,
      text,
    };

    if (step.blocksJson) {
      try {
        payload.blocks = JSON.parse(substituteVariables(step.blocksJson));
      } catch (_) {
        throw new Error("Invalid blocks JSON");
      }
    }

    const response = await this.slackRequest("POST", "/chat.update", token, payload);

    if (step.storeKey) {
      variables[step.storeKey] = response;
    }

    return response;
  }

  /**
   * Delete a message (v2)
   */
  async executeDeleteMessage(
    step: {
      channelId: string;
      timestamp: string;
      storeKey?: string;
      credentialId?: string;
      apiToken?: string;
      botToken?: string;
    },
    substituteVariables: (input?: string) => string,
    resolveSlackCredentials: (step: Record<string, unknown>) => Promise<{ token: string }>,
    variables: Record<string, unknown>
  ): Promise<unknown> {
    const channelId = substituteVariables(step.channelId);
    const timestamp = substituteVariables(step.timestamp);
    const { token } = await resolveSlackCredentials(step);

    debugLogger.debug("Slack Delete Message", "Deleting message", {
      channelId,
      timestamp,
    });

    const payload: Record<string, unknown> = {
      channel: channelId,
      ts: timestamp,
    };

    const response = await this.slackRequest("POST", "/chat.delete", token, payload);

    if (step.storeKey) {
      variables[step.storeKey] = response;
    }

    return response;
  }

  /**
   * Create a channel (v1 & v2)
   */
  async executeCreateChannel(
    step: {
      channelName: string;
      isPrivate?: boolean;
      channelDescription?: string;
      storeKey?: string;
      credentialId?: string;
      apiToken?: string;
      botToken?: string;
    },
    substituteVariables: (input?: string) => string,
    resolveSlackCredentials: (step: Record<string, unknown>) => Promise<{ token: string }>,
    variables: Record<string, unknown>
  ): Promise<unknown> {
    const channelName = substituteVariables(step.channelName);
    const { token } = await resolveSlackCredentials(step);

    debugLogger.debug("Slack Create Channel", "Creating channel", {
      channelName,
      isPrivate: step.isPrivate,
    });

    const payload: Record<string, unknown> = {
      name: channelName,
    };

    if (step.isPrivate !== undefined) {
      payload.is_private = step.isPrivate;
    }

    if (step.channelDescription) {
      payload.topic = {
        value: substituteVariables(step.channelDescription),
        canvas: false,
      };
    }

    const response = await this.slackRequest("POST", "/conversations.create", token, payload);

    if (step.storeKey) {
      variables[step.storeKey] = response;
    }

    return response;
  }

  /**
   * Get channel info (v2)
   */
  async executeGetChannel(
    step: {
      channelId: string;
      includeNumMembers?: boolean;
      storeKey?: string;
      credentialId?: string;
      apiToken?: string;
      botToken?: string;
    },
    substituteVariables: (input?: string) => string,
    resolveSlackCredentials: (step: Record<string, unknown>) => Promise<{ token: string }>,
    variables: Record<string, unknown>
  ): Promise<unknown> {
    const channelId = substituteVariables(step.channelId);
    const { token } = await resolveSlackCredentials(step);

    debugLogger.debug("Slack Get Channel", "Getting channel info", { channelId });

    const query = new URLSearchParams();
    query.append("channel", channelId);
    if (step.includeNumMembers) {
      query.append("include_num_members", "true");
    }

    const response = await axios.get("https://slack.com/api/conversations.info", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: Object.fromEntries(query),
    });

    if (!response.data.ok) {
      throw new Error(`Slack API Error: ${response.data.error}`);
    }

    if (step.storeKey) {
      variables[step.storeKey] = response.data;
    }

    return response.data;
  }

  /**
   * List channels (v1 & v2)
   */
  async executeListChannels(
    step: {
      limit?: number;
      excludeArchived?: boolean;
      storeKey?: string;
      credentialId?: string;
      apiToken?: string;
      botToken?: string;
    },
    substituteVariables: (input?: string) => string,
    resolveSlackCredentials: (step: Record<string, unknown>) => Promise<{ token: string }>,
    variables: Record<string, unknown>
  ): Promise<unknown> {
    const { token } = await resolveSlackCredentials(step);

    debugLogger.debug("Slack List Channels", "Listing channels");

    const query = new URLSearchParams();
    if (step.limit) {
      query.append("limit", step.limit.toString());
    }
    if (step.excludeArchived !== undefined) {
      query.append("exclude_archived", step.excludeArchived ? "true" : "false");
    }

    const response = await axios.get("https://slack.com/api/conversations.list", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: Object.fromEntries(query),
    });

    if (!response.data.ok) {
      throw new Error(`Slack API Error: ${response.data.error}`);
    }

    if (step.storeKey) {
      variables[step.storeKey] = response.data;
    }

    return response.data;
  }

  /**
   * Invite users to channel (v2)
   */
  async executeInviteUsers(
    step: {
      channelId: string;
      userIds: string | string[];
      storeKey?: string;
      credentialId?: string;
      apiToken?: string;
      botToken?: string;
    },
    substituteVariables: (input?: string) => string,
    resolveSlackCredentials: (step: Record<string, unknown>) => Promise<{ token: string }>,
    variables: Record<string, unknown>
  ): Promise<unknown> {
    const channelId = substituteVariables(step.channelId);
    let userIds = step.userIds;

    if (typeof userIds === "string") {
      userIds = substituteVariables(userIds)
        .split(",")
        .map((id) => id.trim());
    } else if (Array.isArray(userIds)) {
      userIds = userIds.map((id) => substituteVariables(id));
    }

    const { token } = await resolveSlackCredentials(step);

    debugLogger.debug("Slack Invite Users", "Inviting users to channel", {
      channelId,
      userCount: (userIds as string[]).length,
    });

    const payload: Record<string, unknown> = {
      channel: channelId,
      users: (userIds as string[]).join(","),
    };

    const response = await this.slackRequest("POST", "/conversations.invite", token, payload);

    if (step.storeKey) {
      variables[step.storeKey] = response;
    }

    return response;
  }

  /**
   * Get channel members (v2)
   */
  async executeListMembers(
    step: {
      channelId: string;
      limit?: number;
      storeKey?: string;
      credentialId?: string;
      apiToken?: string;
      botToken?: string;
    },
    substituteVariables: (input?: string) => string,
    resolveSlackCredentials: (step: Record<string, unknown>) => Promise<{ token: string }>,
    variables: Record<string, unknown>
  ): Promise<unknown> {
    const channelId = substituteVariables(step.channelId);
    const { token } = await resolveSlackCredentials(step);

    debugLogger.debug("Slack List Members", "Getting channel members", {
      channelId,
    });

    const query = new URLSearchParams();
    query.append("channel", channelId);
    if (step.limit) {
      query.append("limit", step.limit.toString());
    }

    const response = await axios.get("https://slack.com/api/conversations.members", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: Object.fromEntries(query),
    });

    if (!response.data.ok) {
      throw new Error(`Slack API Error: ${response.data.error}`);
    }

    if (step.storeKey) {
      variables[step.storeKey] = response.data;
    }

    return response.data;
  }

  /**
   * Add reaction to message (v2)
   */
  async executeAddReaction(
    step: {
      channelId: string;
      timestamp: string;
      reactionEmoji: string;
      storeKey?: string;
      credentialId?: string;
      apiToken?: string;
      botToken?: string;
    },
    substituteVariables: (input?: string) => string,
    resolveSlackCredentials: (step: Record<string, unknown>) => Promise<{ token: string }>,
    variables: Record<string, unknown>
  ): Promise<unknown> {
    const channelId = substituteVariables(step.channelId);
    const timestamp = substituteVariables(step.timestamp);
    let emoji = substituteVariables(step.reactionEmoji);

    // Remove colons if present
    emoji = emoji.replace(/:/g, "");

    const { token } = await resolveSlackCredentials(step);

    debugLogger.debug("Slack Add Reaction", "Adding reaction", {
      channelId,
      timestamp,
      emoji,
    });

    const payload: Record<string, unknown> = {
      channel: channelId,
      timestamp,
      name: emoji,
    };

    const response = await this.slackRequest("POST", "/reactions.add", token, payload);

    if (step.storeKey) {
      variables[step.storeKey] = response;
    }

    return response;
  }

  /**
   * Get user info (v2)
   */
  async executeGetUser(
    step: {
      userId: string;
      storeKey?: string;
      credentialId?: string;
      apiToken?: string;
      botToken?: string;
    },
    substituteVariables: (input?: string) => string,
    resolveSlackCredentials: (step: Record<string, unknown>) => Promise<{ token: string }>,
    variables: Record<string, unknown>
  ): Promise<unknown> {
    const userId = substituteVariables(step.userId);
    const { token } = await resolveSlackCredentials(step);

    debugLogger.debug("Slack Get User", "Getting user info", { userId });

    const query = new URLSearchParams();
    query.append("user", userId);

    const response = await axios.get("https://slack.com/api/users.info", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: Object.fromEntries(query),
    });

    if (!response.data.ok) {
      throw new Error(`Slack API Error: ${response.data.error}`);
    }

    if (step.storeKey) {
      variables[step.storeKey] = response.data;
    }

    return response.data;
  }

  /**
   * List all users (v2)
   */
  async executeListUsers(
    step: {
      limit?: number;
      storeKey?: string;
      credentialId?: string;
      apiToken?: string;
      botToken?: string;
    },
    substituteVariables: (input?: string) => string,
    resolveSlackCredentials: (step: Record<string, unknown>) => Promise<{ token: string }>,
    variables: Record<string, unknown>
  ): Promise<unknown> {
    const { token } = await resolveSlackCredentials(step);

    debugLogger.debug("Slack List Users", "Listing users");

    const query = new URLSearchParams();
    if (step.limit) {
      query.append("limit", step.limit.toString());
    }

    const response = await axios.get("https://slack.com/api/users.list", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: Object.fromEntries(query),
    });

    if (!response.data.ok) {
      throw new Error(`Slack API Error: ${response.data.error}`);
    }

    if (step.storeKey) {
      variables[step.storeKey] = response.data;
    }

    return response.data;
  }

  /**
   * Upload a file to Slack (v2)
   * Note: File upload via API is simplified - use direct upload for production
   */
  async executeUploadFile(
    step: {
      channelId: string;
      filePath: string;
      fileName?: string;
      title?: string;
      initialComment?: string;
      storeKey?: string;
      credentialId?: string;
      apiToken?: string;
      botToken?: string;
    },
    substituteVariables: (input?: string) => string,
    resolveSlackCredentials: (step: Record<string, unknown>) => Promise<{ token: string }>,
    variables: Record<string, unknown>
  ): Promise<unknown> {
    const channelId = substituteVariables(step.channelId);
    const filePath = substituteVariables(step.filePath);
    const { token } = await resolveSlackCredentials(step);

    debugLogger.debug("Slack Upload File", "Uploading file", {
      channelId,
      filePath,
    });

    const payload: Record<string, unknown> = {
      channels: channelId,
    };

    if (step.fileName) {
      payload.filename = substituteVariables(step.fileName);
    }

    if (step.title) {
      payload.title = substituteVariables(step.title);
    }

    if (step.initialComment) {
      payload.initial_comment = substituteVariables(step.initialComment);
    }

    try {
      const response = await this.slackRequest("POST", "/files.upload", token, payload);

      if (step.storeKey) {
        variables[step.storeKey] = response;
      }

      return response;
    } catch (error: unknown) {
      debugLogger.error("Slack Upload File", "File upload failed", error);
      throw error;
    }
  }

  /**
   * Get message history from channel (v1 & v2)
   */
  async executeGetHistory(
    step: {
      channelId: string;
      limit?: number;
      oldestTimestamp?: string;
      latestTimestamp?: string;
      storeKey?: string;
      credentialId?: string;
      apiToken?: string;
      botToken?: string;
    },
    substituteVariables: (input?: string) => string,
    resolveSlackCredentials: (step: Record<string, unknown>) => Promise<{ token: string }>,
    variables: Record<string, unknown>
  ): Promise<unknown> {
    const channelId = substituteVariables(step.channelId);
    const { token } = await resolveSlackCredentials(step);

    debugLogger.debug("Slack Get History", "Getting channel history", {
      channelId,
      limit: step.limit,
    });

    const query = new URLSearchParams();
    query.append("channel", channelId);
    if (step.limit) {
      query.append("limit", step.limit.toString());
    }
    if (step.oldestTimestamp) {
      query.append("oldest", substituteVariables(step.oldestTimestamp));
    }
    if (step.latestTimestamp) {
      query.append("latest", substituteVariables(step.latestTimestamp));
    }

    const response = await axios.get("https://slack.com/api/conversations.history", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: Object.fromEntries(query),
    });

    if (!response.data.ok) {
      throw new Error(`Slack API Error: ${response.data.error}`);
    }

    if (step.storeKey) {
      variables[step.storeKey] = response.data;
    }

    return response.data;
  }

  /**
   * Set channel topic (v2)
   */
  async executeSetTopic(
    step: {
      channelId: string;
      topic: string;
      storeKey?: string;
      credentialId?: string;
      apiToken?: string;
      botToken?: string;
    },
    substituteVariables: (input?: string) => string,
    resolveSlackCredentials: (step: Record<string, unknown>) => Promise<{ token: string }>,
    variables: Record<string, unknown>
  ): Promise<unknown> {
    const channelId = substituteVariables(step.channelId);
    const topic = substituteVariables(step.topic);
    const { token } = await resolveSlackCredentials(step);

    debugLogger.debug("Slack Set Topic", "Setting channel topic", {
      channelId,
      topic,
    });

    const payload: Record<string, unknown> = {
      channel: channelId,
      topic,
    };

    const response = await this.slackRequest("POST", "/conversations.setTopic", token, payload);

    if (step.storeKey) {
      variables[step.storeKey] = response;
    }

    return response;
  }

  /**
   * Archive a channel (v2)
   */
  async executeArchiveChannel(
    step: {
      channelId: string;
      storeKey?: string;
      credentialId?: string;
      apiToken?: string;
      botToken?: string;
    },
    substituteVariables: (input?: string) => string,
    resolveSlackCredentials: (step: Record<string, unknown>) => Promise<{ token: string }>,
    variables: Record<string, unknown>
  ): Promise<unknown> {
    const channelId = substituteVariables(step.channelId);
    const { token } = await resolveSlackCredentials(step);

    debugLogger.debug("Slack Archive Channel", "Archiving channel", {
      channelId,
    });

    const payload: Record<string, unknown> = {
      channel: channelId,
    };

    const response = await this.slackRequest("POST", "/conversations.archive", token, payload);

    if (step.storeKey) {
      variables[step.storeKey] = response;
    }

    return response;
  }

  /**
   * Unarchive a channel (v2)
   */
  async executeUnarchiveChannel(
    step: {
      channelId: string;
      storeKey?: string;
      credentialId?: string;
      apiToken?: string;
      botToken?: string;
    },
    substituteVariables: (input?: string) => string,
    resolveSlackCredentials: (step: Record<string, unknown>) => Promise<{ token: string }>,
    variables: Record<string, unknown>
  ): Promise<unknown> {
    const channelId = substituteVariables(step.channelId);
    const { token } = await resolveSlackCredentials(step);

    debugLogger.debug("Slack Unarchive Channel", "Unarchiving channel", {
      channelId,
    });

    const payload: Record<string, unknown> = {
      channel: channelId,
    };

    const response = await this.slackRequest("POST", "/conversations.unarchive", token, payload);

    if (step.storeKey) {
      variables[step.storeKey] = response;
    }

    return response;
  }

  /**
   * Main executor that routes to appropriate method
   */
  async execute(
    step: Record<string, unknown>,
    substituteVariables: (input?: string) => string,
    variables: Record<string, unknown>
  ): Promise<unknown> {
    const operation = step.operation as string;
    const resource = step.resource as string;

    try {
      switch (`${resource}.${operation}`) {
        // Message operations
        case "message.send":
          return await this.executeSendMessage(
            step as unknown as SlackSendMessageStep,
            substituteVariables,
            SlackStepHandler.resolveSlackCredentials,
            variables
          );
        case "message.update":
          return await this.executeUpdateMessage(
            step as unknown as SlackUpdateMessageStep,
            substituteVariables,
            SlackStepHandler.resolveSlackCredentials,
            variables
          );
        case "message.delete":
          return await this.executeDeleteMessage(
            step as unknown as SlackDeleteMessageStep,
            substituteVariables,
            SlackStepHandler.resolveSlackCredentials,
            variables
          );

        // Channel operations
        case "channel.create":
          return await this.executeCreateChannel(
            step as unknown as SlackCreateChannelStep,
            substituteVariables,
            SlackStepHandler.resolveSlackCredentials,
            variables
          );
        case "channel.get":
          return await this.executeGetChannel(
            step as unknown as SlackGetChannelStep,
            substituteVariables,
            SlackStepHandler.resolveSlackCredentials,
            variables
          );
        case "channel.getAll":
        case "channel.list":
          return await this.executeListChannels(
            step as unknown as SlackListChannelsStep,
            substituteVariables,
            SlackStepHandler.resolveSlackCredentials,
            variables
          );
        case "channel.invite":
          return await this.executeInviteUsers(
            step as unknown as SlackInviteUsersStep,
            substituteVariables,
            SlackStepHandler.resolveSlackCredentials,
            variables
          );
        case "channel.member":
        case "channel.members":
          return await this.executeListMembers(
            step as unknown as SlackListMembersStep,
            substituteVariables,
            SlackStepHandler.resolveSlackCredentials,
            variables
          );
        case "channel.setTopic":
        case "channel.setPurpose":
          return await this.executeSetTopic(
            step as unknown as SlackSetTopicStep,
            substituteVariables,
            SlackStepHandler.resolveSlackCredentials,
            variables
          );
        case "channel.archive":
          return await this.executeArchiveChannel(
            step as unknown as SlackArchiveChannelStep,
            substituteVariables,
            SlackStepHandler.resolveSlackCredentials,
            variables
          );
        case "channel.unarchive":
          return await this.executeUnarchiveChannel(
            step as unknown as SlackUnarchiveChannelStep,
            substituteVariables,
            SlackStepHandler.resolveSlackCredentials,
            variables
          );
        case "channel.history":
          return await this.executeGetHistory(
            step as unknown as SlackGetHistoryStep,
            substituteVariables,
            SlackStepHandler.resolveSlackCredentials,
            variables
          );

        // Reaction operations
        case "reaction.add":
          return await this.executeAddReaction(
            step as unknown as SlackAddReactionStep,
            substituteVariables,
            SlackStepHandler.resolveSlackCredentials,
            variables
          );

        // User operations
        case "user.get":
          return await this.executeGetUser(
            step as unknown as SlackGetUserStep,
            substituteVariables,
            SlackStepHandler.resolveSlackCredentials,
            variables
          );
        case "user.getAll":
        case "user.list":
          return await this.executeListUsers(
            step as unknown as SlackListUsersStep,
            substituteVariables,
            SlackStepHandler.resolveSlackCredentials,
            variables
          );

        // File operations
        case "file.upload":
          return await this.executeUploadFile(
            step as unknown as SlackUploadFileStep,
            substituteVariables,
            SlackStepHandler.resolveSlackCredentials,
            variables
          );

        default:
          throw new Error(`Unknown Slack operation: ${resource}.${operation}`);
      }
    } catch (error: unknown) {
      debugLogger.error("Slack Step Handler", `Error executing ${resource}.${operation}`, error);
      throw error;
    }
  }
}
