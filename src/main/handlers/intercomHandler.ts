import { BaseRestHandler, HandlerContext } from "./base/BaseRestHandler";
import { registerHandler } from "./base/handlerRegistry";

const INTERCOM_BASE_URL = "https://api.intercom.io";

/**
 * Intercom API handler
 * API: https://api.intercom.io/
 */
class IntercomHandler extends BaseRestHandler {
  protected serviceName = "Intercom";

  constructor() {
    super();
    registerHandler("intercomCreateContact", this.createContact.bind(this));
    registerHandler("intercomGetContact", this.getContact.bind(this));
    registerHandler("intercomSendMessage", this.sendMessage.bind(this));
    registerHandler("intercomListContacts", this.listContacts.bind(this));
  }

  private resolveAuth(step: Record<string, unknown>): { accessToken: string } {
    const creds = this.resolveCredential(step.credentialId as string, "intercom", {
      accessToken: step.accessToken as string,
    });
    return { accessToken: creds.accessToken };
  }

  private async createContact(
    step: Record<string, unknown>,
    ctx: HandlerContext
  ): Promise<unknown> {
    const { accessToken } = this.resolveAuth(step);
    const role = this.sub(ctx, step.role as string);

    const body: Record<string, unknown> = { role };
    if (step.email) body.email = this.sub(ctx, step.email as string);
    if (step.name) body.name = this.sub(ctx, step.name as string);
    if (step.phone) body.phone = this.sub(ctx, step.phone as string);

    const result = await this.apiCall(
      {
        method: "POST",
        url: `${INTERCOM_BASE_URL}/contacts`,
        headers: this.bearerHeaders(accessToken),
        data: body,
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async getContact(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const { accessToken } = this.resolveAuth(step);
    const contactId = this.sub(ctx, step.contactId as string);

    const result = await this.apiCall(
      {
        method: "GET",
        url: `${INTERCOM_BASE_URL}/contacts/${contactId}`,
        headers: this.bearerHeaders(accessToken),
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async sendMessage(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const { accessToken } = this.resolveAuth(step);
    const messageType = this.sub(ctx, step.messageType as string);
    const from = this.sub(ctx, step.from as string);
    const to = this.sub(ctx, step.to as string);
    const body = this.sub(ctx, step.body as string);

    const data: Record<string, unknown> = {
      message_type: messageType,
      from: { type: "admin", id: from },
      to: { type: "user", id: to },
      body,
    };
    if (step.subject) data.subject = this.sub(ctx, step.subject as string);

    const result = await this.apiCall(
      {
        method: "POST",
        url: `${INTERCOM_BASE_URL}/messages`,
        headers: this.bearerHeaders(accessToken),
        data,
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async listContacts(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const { accessToken } = this.resolveAuth(step);

    const params = new URLSearchParams();
    if (step.perPage) params.set("per_page", this.sub(ctx, step.perPage as string));
    const qs = params.toString();

    const result = await this.apiCall(
      {
        method: "GET",
        url: `${INTERCOM_BASE_URL}/contacts${qs ? `?${qs}` : ""}`,
        headers: this.bearerHeaders(accessToken),
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }
}

export const intercomHandler = new IntercomHandler();
