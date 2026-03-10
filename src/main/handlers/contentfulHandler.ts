import { BaseRestHandler, HandlerContext } from "./base/BaseRestHandler";
import { registerHandler } from "./base/handlerRegistry";

/**
 * Contentful Content Management API handler
 * API: https://api.contentful.com/spaces/{spaceId}/environments/{environment}/
 */
class ContentfulHandler extends BaseRestHandler {
  protected serviceName = "Contentful";

  constructor() {
    super();
    registerHandler("contentfulGetEntry", this.getEntry.bind(this));
    registerHandler("contentfulListEntries", this.listEntries.bind(this));
    registerHandler("contentfulCreateEntry", this.createEntry.bind(this));
  }

  private resolveAuth(step: Record<string, unknown>): { accessToken: string } {
    const creds = this.resolveCredential(step.credentialId as string, "contentful", {
      accessToken: step.accessToken as string,
    });
    return { accessToken: creds.accessToken };
  }

  private apiUrl(spaceId: string, environment: string): string {
    return `https://api.contentful.com/spaces/${spaceId}/environments/${environment}`;
  }

  private async getEntry(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const { accessToken } = this.resolveAuth(step);
    const spaceId = this.sub(ctx, step.spaceId as string);
    const environment = this.sub(ctx, (step.environment as string) || "master");
    const entryId = this.sub(ctx, step.entryId as string);

    const result = await this.apiCall(
      {
        method: "GET",
        url: `${this.apiUrl(spaceId, environment)}/entries/${entryId}`,
        headers: this.bearerHeaders(accessToken),
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async listEntries(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const { accessToken } = this.resolveAuth(step);
    const spaceId = this.sub(ctx, step.spaceId as string);
    const environment = this.sub(ctx, (step.environment as string) || "master");

    const params: Record<string, unknown> = {};
    if (step.contentType) params.content_type = this.sub(ctx, step.contentType as string);
    if (step.limit) params.limit = Number(this.sub(ctx, step.limit as string));

    const result = await this.apiCall(
      {
        method: "GET",
        url: `${this.apiUrl(spaceId, environment)}/entries`,
        headers: this.bearerHeaders(accessToken),
        params,
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async createEntry(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const { accessToken } = this.resolveAuth(step);
    const spaceId = this.sub(ctx, step.spaceId as string);
    const environment = this.sub(ctx, (step.environment as string) || "master");
    const contentTypeId = this.sub(ctx, step.contentTypeId as string);
    const fields = JSON.parse(this.sub(ctx, step.fields as string));

    const headers = {
      ...this.bearerHeaders(accessToken),
      "X-Contentful-Content-Type": contentTypeId,
    };

    const result = await this.apiCall(
      {
        method: "POST",
        url: `${this.apiUrl(spaceId, environment)}/entries`,
        headers,
        data: { fields },
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }
}

export const contentfulHandler = new ContentfulHandler();
