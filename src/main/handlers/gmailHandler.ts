import { BaseRestHandler, HandlerContext } from "./base/BaseRestHandler";
import { registerHandler } from "./base/handlerRegistry";

const GMAIL_BASE_URL = "https://gmail.googleapis.com/gmail/v1/users/me";

/**
 * Gmail REST API handler
 * API: https://gmail.googleapis.com/gmail/v1/users/me
 */
class GmailHandler extends BaseRestHandler {
  protected serviceName = "Gmail";

  constructor() {
    super();
    registerHandler("gmailSendEmail", this.sendEmail.bind(this));
    registerHandler("gmailGetEmails", this.getEmails.bind(this));
    registerHandler("gmailGetEmail", this.getEmail.bind(this));
  }

  private async sendEmail(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const creds = this.resolveCredential(step.credentialId as string, "gmail", {
      accessToken: step.accessToken as string,
    });
    const token = creds.accessToken;

    const to = this.sub(ctx, step.to as string);
    const subject = this.sub(ctx, step.subject as string);
    const body = this.sub(ctx, step.body as string);

    const headers: string[] = [];
    headers.push(`To: ${to}`);
    if (step.from) headers.push(`From: ${this.sub(ctx, step.from as string)}`);
    if (step.cc) headers.push(`Cc: ${this.sub(ctx, step.cc as string)}`);
    if (step.bcc) headers.push(`Bcc: ${this.sub(ctx, step.bcc as string)}`);
    headers.push(`Subject: ${subject}`);
    headers.push("Content-Type: text/html; charset=utf-8");

    const rawMessage = headers.join("\r\n") + "\r\n\r\n" + body;
    const raw = Buffer.from(rawMessage).toString("base64url");

    const result = await this.apiCall(
      {
        method: "POST",
        url: `${GMAIL_BASE_URL}/messages/send`,
        headers: this.bearerHeaders(token),
        data: { raw },
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async getEmails(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const creds = this.resolveCredential(step.credentialId as string, "gmail", {
      accessToken: step.accessToken as string,
    });
    const token = creds.accessToken;

    const params = new URLSearchParams();
    if (step.query) params.set("q", this.sub(ctx, step.query as string));
    if (step.maxResults) params.set("maxResults", this.sub(ctx, step.maxResults as string));
    if (step.labelIds) {
      const labels = this.sub(ctx, step.labelIds as string)
        .split(",")
        .map((l) => l.trim());
      for (const label of labels) {
        params.append("labelIds", label);
      }
    }
    const qs = params.toString();

    const result = await this.apiCall(
      {
        method: "GET",
        url: `${GMAIL_BASE_URL}/messages${qs ? `?${qs}` : ""}`,
        headers: this.bearerHeaders(token),
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async getEmail(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const creds = this.resolveCredential(step.credentialId as string, "gmail", {
      accessToken: step.accessToken as string,
    });
    const token = creds.accessToken;
    const messageId = this.sub(ctx, step.messageId as string);

    const params = new URLSearchParams();
    if (step.format) params.set("format", this.sub(ctx, step.format as string));
    const qs = params.toString();

    const result = await this.apiCall(
      {
        method: "GET",
        url: `${GMAIL_BASE_URL}/messages/${encodeURIComponent(messageId)}${qs ? `?${qs}` : ""}`,
        headers: this.bearerHeaders(token),
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }
}

export const gmailHandler = new GmailHandler();
