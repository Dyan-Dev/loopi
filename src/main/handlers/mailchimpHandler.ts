import { BaseRestHandler, HandlerContext } from "./base/BaseRestHandler";
import { registerHandler } from "./base/handlerRegistry";

/**
 * Mailchimp REST API handler
 * API: https://{dc}.api.mailchimp.com/3.0/
 * The data center (dc) is extracted from the API key after the dash.
 */
class MailchimpHandler extends BaseRestHandler {
  protected serviceName = "Mailchimp";

  constructor() {
    super();
    registerHandler("mailchimpAddSubscriber", this.addSubscriber.bind(this));
    registerHandler("mailchimpGetSubscriber", this.getSubscriber.bind(this));
    registerHandler("mailchimpCreateCampaign", this.createCampaign.bind(this));
    registerHandler("mailchimpListCampaigns", this.listCampaigns.bind(this));
  }

  private buildBaseUrl(apiKey: string): string {
    const dc = apiKey.split("-").pop() || "us1";
    return `https://${dc}.api.mailchimp.com/3.0`;
  }

  private authHeaders(apiKey: string): Record<string, string> {
    return this.basicHeaders("anystring", apiKey);
  }

  private async addSubscriber(
    step: Record<string, unknown>,
    ctx: HandlerContext
  ): Promise<unknown> {
    const creds = this.resolveCredential(step.credentialId as string, "mailchimp", {
      apiKey: step.apiKey as string,
    });
    const apiKey = creds.apiKey;
    const listId = this.sub(ctx, step.listId as string);
    const email = this.sub(ctx, step.email as string);
    const status = this.sub(ctx, step.status as string) || "subscribed";

    const body: Record<string, unknown> = {
      email_address: email,
      status,
    };

    const mergeFields: Record<string, string> = {};
    if (step.firstName) mergeFields.FNAME = this.sub(ctx, step.firstName as string);
    if (step.lastName) mergeFields.LNAME = this.sub(ctx, step.lastName as string);
    if (Object.keys(mergeFields).length > 0) {
      body.merge_fields = mergeFields;
    }

    const result = await this.apiCall(
      {
        method: "POST",
        url: `${this.buildBaseUrl(apiKey)}/lists/${listId}/members`,
        headers: this.authHeaders(apiKey),
        data: body,
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async getSubscriber(
    step: Record<string, unknown>,
    ctx: HandlerContext
  ): Promise<unknown> {
    const creds = this.resolveCredential(step.credentialId as string, "mailchimp", {
      apiKey: step.apiKey as string,
    });
    const apiKey = creds.apiKey;
    const listId = this.sub(ctx, step.listId as string);
    const subscriberHash = this.sub(ctx, step.subscriberHash as string);

    const result = await this.apiCall(
      {
        method: "GET",
        url: `${this.buildBaseUrl(apiKey)}/lists/${listId}/members/${subscriberHash}`,
        headers: this.authHeaders(apiKey),
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async createCampaign(
    step: Record<string, unknown>,
    ctx: HandlerContext
  ): Promise<unknown> {
    const creds = this.resolveCredential(step.credentialId as string, "mailchimp", {
      apiKey: step.apiKey as string,
    });
    const apiKey = creds.apiKey;
    const type = this.sub(ctx, step.type as string) || "regular";
    const listId = this.sub(ctx, step.listId as string);
    const subject = this.sub(ctx, step.subject as string);
    const fromName = this.sub(ctx, step.fromName as string);
    const replyTo = this.sub(ctx, step.replyTo as string);

    const body = {
      type,
      recipients: {
        list_id: listId,
      },
      settings: {
        subject_line: subject,
        from_name: fromName,
        reply_to: replyTo,
      },
    };

    const result = await this.apiCall(
      {
        method: "POST",
        url: `${this.buildBaseUrl(apiKey)}/campaigns`,
        headers: this.authHeaders(apiKey),
        data: body,
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async listCampaigns(
    step: Record<string, unknown>,
    ctx: HandlerContext
  ): Promise<unknown> {
    const creds = this.resolveCredential(step.credentialId as string, "mailchimp", {
      apiKey: step.apiKey as string,
    });
    const apiKey = creds.apiKey;

    const params = new URLSearchParams();
    if (step.count) params.set("count", this.sub(ctx, step.count as string));
    if (step.offset) params.set("offset", this.sub(ctx, step.offset as string));
    const qs = params.toString();

    const result = await this.apiCall(
      {
        method: "GET",
        url: `${this.buildBaseUrl(apiKey)}/campaigns${qs ? `?${qs}` : ""}`,
        headers: this.authHeaders(apiKey),
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }
}

export const mailchimpHandler = new MailchimpHandler();
