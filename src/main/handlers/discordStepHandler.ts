import { getCredential } from "@main/credentialsStore";
import { debugLogger } from "@main/debugLogger";
import axios from "axios";

/**
 * Handles all Discord-related automation steps
 */
export class DiscordStepHandler {
  /**
   * Execute send message step
   */
  async executeSendMessage(
    step: {
      channelId: string;
      content: string;
      tts?: boolean;
      storeKey?: string;
      credentialId?: string;
      botToken?: string;
    },
    substituteVariables: (input?: string) => string,
    resolveDiscordCredentials: (step: Record<string, unknown>) => Promise<{ botToken: string }>,
    variables: Record<string, unknown>
  ): Promise<unknown> {
    const channelId = substituteVariables(step.channelId);
    const content = substituteVariables(step.content);
    const { botToken } = await resolveDiscordCredentials(step);

    if (!botToken) {
      throw new Error("Discord bot token is required to send messages");
    }

    const payload: Record<string, unknown> = { content, tts: !!step.tts };

    const response = await this.discordRequest(
      "POST",
      `/channels/${channelId}/messages`,
      payload,
      botToken
    );

    if (step.storeKey) {
      variables[step.storeKey] = response.data;
    }

    return response.data;
  }

  /**
   * Execute send webhook step
   */
  async executeSendWebhook(
    step: {
      webhookUrl?: string;
      content: string;
      username?: string;
      avatarUrl?: string;
      tts?: boolean;
      embedsJson?: string;
      storeKey?: string;
    },
    substituteVariables: (input?: string) => string,
    variables: Record<string, unknown>
  ): Promise<unknown> {
    const content = substituteVariables(step.content);
    const resolvedWebhook = substituteVariables(step.webhookUrl || "");

    if (!resolvedWebhook) {
      throw new Error("Webhook URL is required for Discord webhook step");
    }

    const payload: Record<string, unknown> = {
      content,
      username: step.username ? substituteVariables(step.username) : undefined,
      avatar_url: step.avatarUrl ? substituteVariables(step.avatarUrl) : undefined,
      tts: !!step.tts,
    };

    if (step.embedsJson) {
      try {
        payload.embeds = JSON.parse(substituteVariables(step.embedsJson));
      } catch (error) {
        debugLogger.error("Discord Send Webhook", "Invalid embeds JSON", error);
        throw new Error("Invalid embeds JSON for Discord webhook");
      }
    }

    const response = await axios.post(resolvedWebhook, payload, {
      headers: { "Content-Type": "application/json" },
    });

    if (step.storeKey) {
      variables[step.storeKey] = response.data;
    }

    return response.data;
  }

  /**
   * Execute react message step
   */
  async executeReactMessage(
    step: {
      channelId: string;
      messageId: string;
      emoji: string;
      credentialId?: string;
      botToken?: string;
    },
    substituteVariables: (input?: string) => string,
    resolveDiscordCredentials: (step: Record<string, unknown>) => Promise<{ botToken: string }>
  ): Promise<unknown> {
    const channelId = substituteVariables(step.channelId);
    const messageId = substituteVariables(step.messageId);
    const emoji = encodeURIComponent(substituteVariables(step.emoji));
    const { botToken } = await resolveDiscordCredentials(step);

    if (!botToken) {
      throw new Error("Discord bot token is required to react to messages");
    }

    await this.discordRequest(
      "PUT",
      `/channels/${channelId}/messages/${messageId}/reactions/${emoji}/@me`,
      undefined,
      botToken
    );

    return { success: true };
  }

  /**
   * Execute get message step
   */
  async executeGetMessage(
    step: {
      channelId: string;
      messageId: string;
      storeKey?: string;
      credentialId?: string;
      botToken?: string;
    },
    substituteVariables: (input?: string) => string,
    resolveDiscordCredentials: (step: Record<string, unknown>) => Promise<{ botToken: string }>,
    variables: Record<string, unknown>
  ): Promise<unknown> {
    const channelId = substituteVariables(step.channelId);
    const messageId = substituteVariables(step.messageId);
    const { botToken } = await resolveDiscordCredentials(step);

    if (!botToken) {
      throw new Error("Discord bot token is required to fetch messages");
    }

    const response = await this.discordRequest(
      "GET",
      `/channels/${channelId}/messages/${messageId}`,
      undefined,
      botToken
    );

    if (step.storeKey) {
      variables[step.storeKey] = response.data;
    }

    return response.data;
  }

  /**
   * Execute list messages step
   */
  async executeListMessages(
    step: {
      channelId: string;
      limit?: number;
      storeKey?: string;
      credentialId?: string;
      botToken?: string;
    },
    substituteVariables: (input?: string) => string,
    resolveDiscordCredentials: (step: Record<string, unknown>) => Promise<{ botToken: string }>,
    variables: Record<string, unknown>
  ): Promise<unknown> {
    const channelId = substituteVariables(step.channelId);
    const limit = step.limit && step.limit > 0 ? Math.min(step.limit, 100) : 10;
    const { botToken } = await resolveDiscordCredentials(step);

    if (!botToken) {
      throw new Error("Discord bot token is required to list messages");
    }

    const response = await this.discordRequest(
      "GET",
      `/channels/${channelId}/messages?limit=${limit}`,
      undefined,
      botToken
    );

    if (step.storeKey) {
      variables[step.storeKey] = response.data;
    }

    return response.data;
  }

  /**
   * Execute delete message step
   */
  async executeDeleteMessage(
    step: {
      channelId: string;
      messageId: string;
      credentialId?: string;
      botToken?: string;
    },
    substituteVariables: (input?: string) => string,
    resolveDiscordCredentials: (step: Record<string, unknown>) => Promise<{ botToken: string }>
  ): Promise<unknown> {
    const channelId = substituteVariables(step.channelId);
    const messageId = substituteVariables(step.messageId);
    const { botToken } = await resolveDiscordCredentials(step);

    if (!botToken) {
      throw new Error("Discord bot token is required to delete messages");
    }

    await this.discordRequest(
      "DELETE",
      `/channels/${channelId}/messages/${messageId}`,
      undefined,
      botToken
    );

    return { success: true };
  }

  /**
   * Lightweight Discord API client helper
   */
  private async discordRequest(
    method: "GET" | "POST" | "DELETE" | "PUT",
    path: string,
    data: unknown,
    botToken: string
  ) {
    const baseUrl = "https://discord.com/api/v10";
    const url = `${baseUrl}${path}`;

    return axios({
      method,
      url,
      data,
      headers: {
        Authorization: `Bot ${botToken}`,
        "Content-Type": "application/json",
      },
    });
  }

  /**
   * Resolve Discord credentials from store or direct fields
   */
  static async resolveDiscordCredentials(step: {
    credentialId?: string;
    botToken?: string;
  }): Promise<{ botToken: string }> {
    if (step.credentialId) {
      const credential = await getCredential(step.credentialId);
      if (!credential || credential.type !== "discord") {
        throw new Error("Invalid or missing Discord credential");
      }
      return {
        botToken: credential.data.botToken || "",
      };
    }

    return {
      botToken: step.botToken || "",
    };
  }
}
