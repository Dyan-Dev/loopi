import { getCredential } from "@main/credentialsStore";
import { debugLogger } from "@main/debugLogger";
import axios, { type AxiosRequestConfig } from "axios";

const SENDGRID_BASE_URL = "https://api.sendgrid.com/v3";

/**
 * SendGrid Email API handler
 * API: https://api.sendgrid.com/v3
 */
export class SendGridHandler {
  private async resolveCredentials(step: {
    credentialId?: string;
    apiKey?: string;
  }): Promise<{ apiKey: string }> {
    if (step.credentialId) {
      const cred = getCredential(step.credentialId);
      if (cred?.data?.apiKey) return { apiKey: cred.data.apiKey };
    }
    if (step.apiKey) return { apiKey: step.apiKey };
    throw new Error("SendGrid API key is required.");
  }

  private async callApi(
    apiKey: string,
    method: string,
    endpoint: string,
    data?: unknown
  ): Promise<unknown> {
    const url = `${SENDGRID_BASE_URL}${endpoint}`;
    debugLogger.debug("SendGrid", `${method} ${endpoint}`);
    const config: AxiosRequestConfig = {
      method: method as AxiosRequestConfig["method"],
      url,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      data,
      validateStatus: () => true,
    };
    const response = await axios(config);
    if (response.status >= 400) {
      const errMsg = response.data?.errors
        ? response.data.errors.map((e: { message: string }) => e.message).join("; ")
        : `HTTP ${response.status}`;
      throw new Error(`SendGrid API error: ${errMsg}`);
    }
    return response.data;
  }

  async executeSendEmail(
    step: {
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
    },
    substituteVariables: (input?: string) => string,
    variables: Record<string, unknown>
  ): Promise<unknown> {
    const { apiKey } = await this.resolveCredentials(step);

    const toEmails = substituteVariables(step.toEmail)
      .split(",")
      .map((e) => ({ email: e.trim() }));
    const body: Record<string, unknown> = {
      personalizations: [{ to: toEmails }],
      from: {
        email: substituteVariables(step.fromEmail),
        name: step.fromName ? substituteVariables(step.fromName) : undefined,
      },
      subject: substituteVariables(step.subject),
      content: [
        {
          type: step.contentType || "text/html",
          value: substituteVariables(step.content),
        },
      ],
    };

    // CC
    if (step.cc) {
      const ccEmails = substituteVariables(step.cc)
        .split(",")
        .map((e) => ({ email: e.trim() }));
      (body.personalizations as Record<string, unknown>[])[0].cc = ccEmails;
    }

    // BCC
    if (step.bcc) {
      const bccEmails = substituteVariables(step.bcc)
        .split(",")
        .map((e) => ({ email: e.trim() }));
      (body.personalizations as Record<string, unknown>[])[0].bcc = bccEmails;
    }

    // Reply-to
    if (step.replyTo) {
      body.reply_to = { email: substituteVariables(step.replyTo) };
    }

    const result = await this.callApi(apiKey, "POST", "/mail/send", body);
    if (step.storeKey) variables[step.storeKey] = result || { success: true };
    debugLogger.debug("SendGrid", "Email sent successfully");
    return result || { success: true };
  }

  async executeSendTemplateEmail(
    step: {
      toEmail: string;
      fromEmail: string;
      fromName?: string;
      templateId: string;
      dynamicData?: string;
      credentialId?: string;
      apiKey?: string;
      storeKey?: string;
    },
    substituteVariables: (input?: string) => string,
    variables: Record<string, unknown>
  ): Promise<unknown> {
    const { apiKey } = await this.resolveCredentials(step);

    const toEmails = substituteVariables(step.toEmail)
      .split(",")
      .map((e) => ({ email: e.trim() }));
    const personalization: Record<string, unknown> = { to: toEmails };

    if (step.dynamicData) {
      try {
        personalization.dynamic_template_data = JSON.parse(substituteVariables(step.dynamicData));
      } catch {
        /* ignore */
      }
    }

    const body = {
      personalizations: [personalization],
      from: {
        email: substituteVariables(step.fromEmail),
        name: step.fromName ? substituteVariables(step.fromName) : undefined,
      },
      template_id: substituteVariables(step.templateId),
    };

    const result = await this.callApi(apiKey, "POST", "/mail/send", body);
    if (step.storeKey) variables[step.storeKey] = result || { success: true };
    debugLogger.debug("SendGrid", "Template email sent successfully");
    return result || { success: true };
  }

  async executeGetContacts(
    step: {
      credentialId?: string;
      apiKey?: string;
      storeKey?: string;
    },
    _substituteVariables: (input?: string) => string,
    variables: Record<string, unknown>
  ): Promise<unknown> {
    const { apiKey } = await this.resolveCredentials(step);
    const result = await this.callApi(apiKey, "GET", "/marketing/contacts");
    if (step.storeKey) variables[step.storeKey] = result;
    return result;
  }
}
