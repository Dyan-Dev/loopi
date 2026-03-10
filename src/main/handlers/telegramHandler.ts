import { getCredential } from "@main/credentialsStore";
import { debugLogger } from "@main/debugLogger";
import axios from "axios";

/**
 * Telegram Bot API handler
 * API: https://api.telegram.org/bot{token}/{method}
 */
export class TelegramHandler {
  private async resolveCredentials(step: {
    credentialId?: string;
    botToken?: string;
  }): Promise<{ botToken: string }> {
    if (step.credentialId) {
      const cred = getCredential(step.credentialId);
      if (cred?.data?.botToken) return { botToken: cred.data.botToken };
    }
    if (step.botToken) return { botToken: step.botToken };
    throw new Error(
      "Telegram bot token is required. Add a credential or provide botToken directly."
    );
  }

  private async callApi(
    token: string,
    method: string,
    params: Record<string, unknown> = {}
  ): Promise<unknown> {
    const url = `https://api.telegram.org/bot${token}/${method}`;
    debugLogger.debug("Telegram", `Calling ${method}`, { params: Object.keys(params) });
    const response = await axios.post(url, params);
    if (!response.data.ok) {
      throw new Error(`Telegram API error: ${response.data.description || "Unknown error"}`);
    }
    return response.data.result;
  }

  async executeSendMessage(
    step: {
      chatId: string;
      text: string;
      parseMode?: string;
      disableNotification?: boolean;
      credentialId?: string;
      botToken?: string;
      storeKey?: string;
    },
    substituteVariables: (input?: string) => string,
    variables: Record<string, unknown>
  ): Promise<unknown> {
    const { botToken } = await this.resolveCredentials(step);
    const result = await this.callApi(botToken, "sendMessage", {
      chat_id: substituteVariables(step.chatId),
      text: substituteVariables(step.text),
      parse_mode: step.parseMode || "Markdown",
      disable_notification: step.disableNotification || false,
    });
    if (step.storeKey) variables[step.storeKey] = result;
    debugLogger.debug("Telegram", "Message sent successfully");
    return result;
  }

  async executeSendPhoto(
    step: {
      chatId: string;
      photo: string;
      caption?: string;
      credentialId?: string;
      botToken?: string;
      storeKey?: string;
    },
    substituteVariables: (input?: string) => string,
    variables: Record<string, unknown>
  ): Promise<unknown> {
    const { botToken } = await this.resolveCredentials(step);
    const result = await this.callApi(botToken, "sendPhoto", {
      chat_id: substituteVariables(step.chatId),
      photo: substituteVariables(step.photo),
      caption: step.caption ? substituteVariables(step.caption) : undefined,
    });
    if (step.storeKey) variables[step.storeKey] = result;
    return result;
  }

  async executeEditMessage(
    step: {
      chatId: string;
      messageId: string;
      text: string;
      credentialId?: string;
      botToken?: string;
      storeKey?: string;
    },
    substituteVariables: (input?: string) => string,
    variables: Record<string, unknown>
  ): Promise<unknown> {
    const { botToken } = await this.resolveCredentials(step);
    const result = await this.callApi(botToken, "editMessageText", {
      chat_id: substituteVariables(step.chatId),
      message_id: Number(substituteVariables(step.messageId)),
      text: substituteVariables(step.text),
      parse_mode: "Markdown",
    });
    if (step.storeKey) variables[step.storeKey] = result;
    return result;
  }

  async executeDeleteMessage(
    step: {
      chatId: string;
      messageId: string;
      credentialId?: string;
      botToken?: string;
    },
    substituteVariables: (input?: string) => string
  ): Promise<unknown> {
    const { botToken } = await this.resolveCredentials(step);
    return this.callApi(botToken, "deleteMessage", {
      chat_id: substituteVariables(step.chatId),
      message_id: Number(substituteVariables(step.messageId)),
    });
  }

  async executeSendLocation(
    step: {
      chatId: string;
      latitude: string;
      longitude: string;
      credentialId?: string;
      botToken?: string;
      storeKey?: string;
    },
    substituteVariables: (input?: string) => string,
    variables: Record<string, unknown>
  ): Promise<unknown> {
    const { botToken } = await this.resolveCredentials(step);
    const result = await this.callApi(botToken, "sendLocation", {
      chat_id: substituteVariables(step.chatId),
      latitude: Number(substituteVariables(step.latitude)),
      longitude: Number(substituteVariables(step.longitude)),
    });
    if (step.storeKey) variables[step.storeKey] = result;
    return result;
  }

  async executeGetUpdates(
    step: {
      offset?: string;
      limit?: string;
      credentialId?: string;
      botToken?: string;
      storeKey?: string;
    },
    substituteVariables: (input?: string) => string,
    variables: Record<string, unknown>
  ): Promise<unknown> {
    const { botToken } = await this.resolveCredentials(step);
    const params: Record<string, unknown> = {};
    if (step.offset) params.offset = Number(substituteVariables(step.offset));
    if (step.limit) params.limit = Number(substituteVariables(step.limit));
    const result = await this.callApi(botToken, "getUpdates", params);
    if (step.storeKey) variables[step.storeKey] = result;
    return result;
  }

  async executeSendDocument(
    step: {
      chatId: string;
      document: string;
      caption?: string;
      credentialId?: string;
      botToken?: string;
      storeKey?: string;
    },
    substituteVariables: (input?: string) => string,
    variables: Record<string, unknown>
  ): Promise<unknown> {
    const { botToken } = await this.resolveCredentials(step);
    const result = await this.callApi(botToken, "sendDocument", {
      chat_id: substituteVariables(step.chatId),
      document: substituteVariables(step.document),
      caption: step.caption ? substituteVariables(step.caption) : undefined,
    });
    if (step.storeKey) variables[step.storeKey] = result;
    return result;
  }
}
