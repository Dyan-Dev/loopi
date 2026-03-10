import { BaseRestHandler, HandlerContext } from "./base/BaseRestHandler";
import { registerHandler } from "./base/handlerRegistry";

/**
 * Zendesk API handler
 * API: https://{subdomain}.zendesk.com/api/v2/
 * Auth: Basic (email/token:{apiToken})
 */
class ZendeskHandler extends BaseRestHandler {
  protected serviceName = "Zendesk";

  constructor() {
    super();
    registerHandler("zendeskCreateTicket", this.createTicket.bind(this));
    registerHandler("zendeskGetTicket", this.getTicket.bind(this));
    registerHandler("zendeskUpdateTicket", this.updateTicket.bind(this));
    registerHandler("zendeskListTickets", this.listTickets.bind(this));
  }

  private resolveAuth(step: Record<string, unknown>): { email: string; apiToken: string } {
    const creds = this.resolveCredential(step.credentialId as string, "zendesk", {
      email: step.email as string,
      apiToken: step.apiToken as string,
    });
    return { email: creds.email, apiToken: creds.apiToken };
  }

  private baseUrl(subdomain: string): string {
    return `https://${subdomain}.zendesk.com/api/v2`;
  }

  private zendeskHeaders(email: string, apiToken: string): Record<string, string> {
    return this.basicHeaders(`${email}/token`, apiToken);
  }

  private async createTicket(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const { email, apiToken } = this.resolveAuth(step);
    const subdomain = this.sub(ctx, step.subdomain as string);
    const subject = this.sub(ctx, step.subject as string);
    const body = this.sub(ctx, step.body as string);

    const ticket: Record<string, unknown> = {
      subject,
      comment: { body },
    };
    if (step.priority) ticket.priority = this.sub(ctx, step.priority as string);
    if (step.type) ticket.type = this.sub(ctx, step.type as string);
    if (step.assigneeId) ticket.assignee_id = Number(this.sub(ctx, step.assigneeId as string));

    const result = await this.apiCall(
      {
        method: "POST",
        url: `${this.baseUrl(subdomain)}/tickets.json`,
        headers: this.zendeskHeaders(email, apiToken),
        data: { ticket },
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async getTicket(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const { email, apiToken } = this.resolveAuth(step);
    const subdomain = this.sub(ctx, step.subdomain as string);
    const ticketId = this.sub(ctx, step.ticketId as string);

    const result = await this.apiCall(
      {
        method: "GET",
        url: `${this.baseUrl(subdomain)}/tickets/${ticketId}.json`,
        headers: this.zendeskHeaders(email, apiToken),
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async updateTicket(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const { email, apiToken } = this.resolveAuth(step);
    const subdomain = this.sub(ctx, step.subdomain as string);
    const ticketId = this.sub(ctx, step.ticketId as string);

    const ticket: Record<string, unknown> = {};
    if (step.status) ticket.status = this.sub(ctx, step.status as string);
    if (step.priority) ticket.priority = this.sub(ctx, step.priority as string);
    if (step.comment) ticket.comment = { body: this.sub(ctx, step.comment as string) };

    const result = await this.apiCall(
      {
        method: "PUT",
        url: `${this.baseUrl(subdomain)}/tickets/${ticketId}.json`,
        headers: this.zendeskHeaders(email, apiToken),
        data: { ticket },
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async listTickets(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const { email, apiToken } = this.resolveAuth(step);
    const subdomain = this.sub(ctx, step.subdomain as string);

    const params = new URLSearchParams();
    if (step.status) params.set("status", this.sub(ctx, step.status as string));
    if (step.perPage) params.set("per_page", this.sub(ctx, step.perPage as string));
    const qs = params.toString();

    const result = await this.apiCall(
      {
        method: "GET",
        url: `${this.baseUrl(subdomain)}/tickets.json${qs ? `?${qs}` : ""}`,
        headers: this.zendeskHeaders(email, apiToken),
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }
}

export const zendeskHandler = new ZendeskHandler();
