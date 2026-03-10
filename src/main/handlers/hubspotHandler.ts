import { BaseRestHandler, HandlerContext } from "./base/BaseRestHandler";
import { registerHandler } from "./base/handlerRegistry";

/**
 * HubSpot CRM REST API handler
 * API: https://api.hubapi.com/crm/v3/objects/
 */
class HubSpotHandler extends BaseRestHandler {
  protected serviceName = "HubSpot";

  private readonly baseUrl = "https://api.hubapi.com/crm/v3/objects";

  constructor() {
    super();
    registerHandler("hubspotCreateContact", this.createContact.bind(this));
    registerHandler("hubspotGetContact", this.getContact.bind(this));
    registerHandler("hubspotUpdateContact", this.updateContact.bind(this));
    registerHandler("hubspotCreateDeal", this.createDeal.bind(this));
    registerHandler("hubspotGetDeal", this.getDeal.bind(this));
  }

  private resolveAuth(step: Record<string, unknown>): string {
    const creds = this.resolveCredential(step.credentialId as string, "hubspot", {
      accessToken: step.accessToken as string,
    });
    return creds.accessToken;
  }

  private async createContact(
    step: Record<string, unknown>,
    ctx: HandlerContext
  ): Promise<unknown> {
    const token = this.resolveAuth(step);

    const properties: Record<string, string> = {
      email: this.sub(ctx, step.email as string),
    };
    if (step.firstName) properties.firstname = this.sub(ctx, step.firstName as string);
    if (step.lastName) properties.lastname = this.sub(ctx, step.lastName as string);
    if (step.phone) properties.phone = this.sub(ctx, step.phone as string);
    if (step.company) properties.company = this.sub(ctx, step.company as string);

    const result = await this.apiCall(
      {
        method: "POST",
        url: `${this.baseUrl}/contacts`,
        headers: this.bearerHeaders(token),
        data: { properties },
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async getContact(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const token = this.resolveAuth(step);
    const contactId = this.sub(ctx, step.contactId as string);

    const result = await this.apiCall(
      {
        method: "GET",
        url: `${this.baseUrl}/contacts/${contactId}`,
        headers: this.bearerHeaders(token),
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async updateContact(
    step: Record<string, unknown>,
    ctx: HandlerContext
  ): Promise<unknown> {
    const token = this.resolveAuth(step);
    const contactId = this.sub(ctx, step.contactId as string);
    const properties = JSON.parse(this.sub(ctx, step.properties as string));

    const result = await this.apiCall(
      {
        method: "PATCH",
        url: `${this.baseUrl}/contacts/${contactId}`,
        headers: this.bearerHeaders(token),
        data: { properties },
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async createDeal(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const token = this.resolveAuth(step);

    const properties: Record<string, string> = {
      dealname: this.sub(ctx, step.dealName as string),
    };
    if (step.amount) properties.amount = this.sub(ctx, step.amount as string);
    if (step.pipeline) properties.pipeline = this.sub(ctx, step.pipeline as string);
    if (step.stage) properties.dealstage = this.sub(ctx, step.stage as string);

    const result = await this.apiCall(
      {
        method: "POST",
        url: `${this.baseUrl}/deals`,
        headers: this.bearerHeaders(token),
        data: { properties },
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async getDeal(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const token = this.resolveAuth(step);
    const dealId = this.sub(ctx, step.dealId as string);

    const result = await this.apiCall(
      {
        method: "GET",
        url: `${this.baseUrl}/deals/${dealId}`,
        headers: this.bearerHeaders(token),
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }
}

export const hubspotHandler = new HubSpotHandler();
