import { BaseRestHandler, HandlerContext } from "./base/BaseRestHandler";
import { registerHandler } from "./base/handlerRegistry";

class HelpScoutHandler extends BaseRestHandler {
  protected serviceName = "Help Scout";
  private base = "https://api.helpscout.net/v2";

  constructor() {
    super();
    registerHandler("helpscoutListConversations", this.listConversations.bind(this));
    registerHandler("helpscoutGetConversation", this.getConversation.bind(this));
    registerHandler("helpscoutCreateConversation", this.createConversation.bind(this));
  }

  private async listConversations(step: Record<string, unknown>, ctx: HandlerContext) {
    const creds = this.resolveCredential(step.credentialId as string, "helpscout", {
      accessToken: step.accessToken as string,
    });
    const params = new URLSearchParams();
    if (step.mailboxId) params.append("mailbox", this.sub(ctx, step.mailboxId as string));
    if (step.status) params.append("status", this.sub(ctx, step.status as string));
    const result = await this.apiCall(
      {
        method: "GET",
        url: `${this.base}/conversations?${params}`,
        headers: this.bearerHeaders(creds.accessToken),
      },
      ctx
    );
    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async getConversation(step: Record<string, unknown>, ctx: HandlerContext) {
    const creds = this.resolveCredential(step.credentialId as string, "helpscout", {
      accessToken: step.accessToken as string,
    });
    const result = await this.apiCall(
      {
        method: "GET",
        url: `${this.base}/conversations/${this.sub(ctx, step.conversationId as string)}`,
        headers: this.bearerHeaders(creds.accessToken),
      },
      ctx
    );
    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async createConversation(step: Record<string, unknown>, ctx: HandlerContext) {
    const creds = this.resolveCredential(step.credentialId as string, "helpscout", {
      accessToken: step.accessToken as string,
    });
    const body: Record<string, unknown> = {
      subject: this.sub(ctx, step.subject as string),
      mailboxId: Number(this.sub(ctx, step.mailboxId as string)),
      customer: JSON.parse(this.sub(ctx, step.customer as string)),
      threads: JSON.parse(this.sub(ctx, step.threads as string)),
      type: "email",
    };
    const result = await this.apiCall(
      {
        method: "POST",
        url: `${this.base}/conversations`,
        headers: this.bearerHeaders(creds.accessToken),
        data: body,
      },
      ctx
    );
    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }
}

export const helpscoutHandler = new HelpScoutHandler();
