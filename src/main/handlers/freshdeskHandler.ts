import { BaseRestHandler, HandlerContext } from "./base/BaseRestHandler";
import { registerHandler } from "./base/handlerRegistry";

class FreshdeskHandler extends BaseRestHandler {
  protected serviceName = "Freshdesk";

  constructor() {
    super();
    registerHandler("freshdeskCreateTicket", this.createTicket.bind(this));
    registerHandler("freshdeskGetTicket", this.getTicket.bind(this));
    registerHandler("freshdeskUpdateTicket", this.updateTicket.bind(this));
    registerHandler("freshdeskListTickets", this.listTickets.bind(this));
  }

  private getBase(step: Record<string, unknown>, ctx: HandlerContext) {
    return `https://${this.sub(ctx, step.domain as string)}.freshdesk.com/api/v2`;
  }

  private async createTicket(step: Record<string, unknown>, ctx: HandlerContext) {
    const creds = this.resolveCredential(step.credentialId as string, "freshdesk", {
      apiKey: step.apiKey as string,
    });
    const body: Record<string, unknown> = {
      subject: this.sub(ctx, step.subject as string),
      description: this.sub(ctx, step.description as string),
      email: this.sub(ctx, step.email as string),
    };
    if (step.priority) body.priority = Number(this.sub(ctx, step.priority as string));
    if (step.status) body.status = Number(this.sub(ctx, step.status as string));
    const result = await this.apiCall(
      {
        method: "POST",
        url: `${this.getBase(step, ctx)}/tickets`,
        headers: this.basicHeaders(creds.apiKey, "X"),
        data: body,
      },
      ctx
    );
    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async getTicket(step: Record<string, unknown>, ctx: HandlerContext) {
    const creds = this.resolveCredential(step.credentialId as string, "freshdesk", {
      apiKey: step.apiKey as string,
    });
    const result = await this.apiCall(
      {
        method: "GET",
        url: `${this.getBase(step, ctx)}/tickets/${this.sub(ctx, step.ticketId as string)}`,
        headers: this.basicHeaders(creds.apiKey, "X"),
      },
      ctx
    );
    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async updateTicket(step: Record<string, unknown>, ctx: HandlerContext) {
    const creds = this.resolveCredential(step.credentialId as string, "freshdesk", {
      apiKey: step.apiKey as string,
    });
    const body: Record<string, unknown> = {};
    if (step.status) body.status = Number(this.sub(ctx, step.status as string));
    if (step.priority) body.priority = Number(this.sub(ctx, step.priority as string));
    const result = await this.apiCall(
      {
        method: "PUT",
        url: `${this.getBase(step, ctx)}/tickets/${this.sub(ctx, step.ticketId as string)}`,
        headers: this.basicHeaders(creds.apiKey, "X"),
        data: body,
      },
      ctx
    );
    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async listTickets(step: Record<string, unknown>, ctx: HandlerContext) {
    const creds = this.resolveCredential(step.credentialId as string, "freshdesk", {
      apiKey: step.apiKey as string,
    });
    const params = new URLSearchParams();
    if (step.perPage) params.append("per_page", this.sub(ctx, step.perPage as string));
    const result = await this.apiCall(
      {
        method: "GET",
        url: `${this.getBase(step, ctx)}/tickets?${params}`,
        headers: this.basicHeaders(creds.apiKey, "X"),
      },
      ctx
    );
    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }
}

export const freshdeskHandler = new FreshdeskHandler();
