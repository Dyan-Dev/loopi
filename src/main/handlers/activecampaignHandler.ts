import { BaseRestHandler, HandlerContext } from "./base/BaseRestHandler";
import { registerHandler } from "./base/handlerRegistry";

/**
 * ActiveCampaign API handler
 * API: {baseUrl}/api/3/
 */
class ActiveCampaignHandler extends BaseRestHandler {
  protected serviceName = "ActiveCampaign";

  constructor() {
    super();
    registerHandler("activecampaignCreateContact", this.createContact.bind(this));
    registerHandler("activecampaignGetContact", this.getContact.bind(this));
    registerHandler("activecampaignListContacts", this.listContacts.bind(this));
  }

  private resolveAuth(step: Record<string, unknown>): { apiToken: string } {
    const creds = this.resolveCredential(step.credentialId as string, "activecampaign", {
      apiToken: step.apiToken as string,
    });
    return { apiToken: creds.apiToken };
  }

  private apiUrl(baseUrl: string): string {
    return `${baseUrl.replace(/\/+$/, "")}/api/3`;
  }

  private authHeaders(apiToken: string): Record<string, string> {
    return { "Api-Token": apiToken, "Content-Type": "application/json" };
  }

  private async createContact(
    step: Record<string, unknown>,
    ctx: HandlerContext
  ): Promise<unknown> {
    const { apiToken } = this.resolveAuth(step);
    const baseUrl = this.sub(ctx, step.baseUrl as string);
    const email = this.sub(ctx, step.email as string);

    const contact: Record<string, unknown> = { email };
    if (step.firstName) contact.firstName = this.sub(ctx, step.firstName as string);
    if (step.lastName) contact.lastName = this.sub(ctx, step.lastName as string);
    if (step.phone) contact.phone = this.sub(ctx, step.phone as string);

    const result = await this.apiCall(
      {
        method: "POST",
        url: `${this.apiUrl(baseUrl)}/contacts`,
        headers: this.authHeaders(apiToken),
        data: { contact },
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async getContact(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const { apiToken } = this.resolveAuth(step);
    const baseUrl = this.sub(ctx, step.baseUrl as string);
    const contactId = this.sub(ctx, step.contactId as string);

    const result = await this.apiCall(
      {
        method: "GET",
        url: `${this.apiUrl(baseUrl)}/contacts/${contactId}`,
        headers: this.authHeaders(apiToken),
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async listContacts(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const { apiToken } = this.resolveAuth(step);
    const baseUrl = this.sub(ctx, step.baseUrl as string);

    const params: Record<string, unknown> = {};
    if (step.limit) params.limit = Number(this.sub(ctx, step.limit as string));

    const result = await this.apiCall(
      {
        method: "GET",
        url: `${this.apiUrl(baseUrl)}/contacts`,
        headers: this.authHeaders(apiToken),
        params,
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }
}

export const activecampaignHandler = new ActiveCampaignHandler();
