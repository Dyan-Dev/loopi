import { BaseRestHandler, HandlerContext } from "./base/BaseRestHandler";
import { registerHandler } from "./base/handlerRegistry";

/**
 * Bitly API handler
 * API: https://api-ssl.bitly.com/v4/
 */
class BitlyHandler extends BaseRestHandler {
  protected serviceName = "Bitly";
  private readonly baseUrl = "https://api-ssl.bitly.com/v4";

  constructor() {
    super();
    registerHandler("bitlyCreateLink", this.createLink.bind(this));
    registerHandler("bitlyGetLink", this.getLink.bind(this));
    registerHandler("bitlyListLinks", this.listLinks.bind(this));
  }

  private resolveAuth(step: Record<string, unknown>): { accessToken: string } {
    const creds = this.resolveCredential(step.credentialId as string, "bitly", {
      accessToken: step.accessToken as string,
    });
    return { accessToken: creds.accessToken };
  }

  private async createLink(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const { accessToken } = this.resolveAuth(step);
    const longUrl = this.sub(ctx, step.longUrl as string);

    const data: Record<string, unknown> = { long_url: longUrl };
    if (step.title) data.title = this.sub(ctx, step.title as string);
    if (step.domain) data.domain = this.sub(ctx, step.domain as string);

    const result = await this.apiCall(
      {
        method: "POST",
        url: `${this.baseUrl}/shorten`,
        headers: this.bearerHeaders(accessToken),
        data,
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async getLink(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const { accessToken } = this.resolveAuth(step);
    const bitlink = this.sub(ctx, step.bitlink as string);

    const result = await this.apiCall(
      {
        method: "GET",
        url: `${this.baseUrl}/bitlinks/${bitlink}`,
        headers: this.bearerHeaders(accessToken),
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async listLinks(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const { accessToken } = this.resolveAuth(step);
    const groupGuid = this.sub(ctx, step.groupGuid as string);

    const params: Record<string, unknown> = {};
    if (step.size) params.size = Number(this.sub(ctx, step.size as string));

    const result = await this.apiCall(
      {
        method: "GET",
        url: `${this.baseUrl}/groups/${groupGuid}/bitlinks`,
        headers: this.bearerHeaders(accessToken),
        params,
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }
}

export const bitlyHandler = new BitlyHandler();
