import { BaseRestHandler, HandlerContext } from "./base/BaseRestHandler";
import { registerHandler } from "./base/handlerRegistry";

/**
 * Cloudflare API handler
 * API: https://api.cloudflare.com/client/v4/
 */
class CloudflareHandler extends BaseRestHandler {
  protected serviceName = "Cloudflare";
  private readonly baseUrl = "https://api.cloudflare.com/client/v4";

  constructor() {
    super();
    registerHandler("cloudflareListZones", this.listZones.bind(this));
    registerHandler("cloudflareGetDnsRecords", this.getDnsRecords.bind(this));
    registerHandler("cloudflareCreateDnsRecord", this.createDnsRecord.bind(this));
    registerHandler("cloudflarePurgeCache", this.purgeCache.bind(this));
  }

  private resolveAuth(step: Record<string, unknown>): { apiToken: string } {
    const creds = this.resolveCredential(step.credentialId as string, "cloudflare", {
      apiToken: step.apiToken as string,
    });
    return { apiToken: creds.apiToken };
  }

  private async listZones(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const { apiToken } = this.resolveAuth(step);

    const result = await this.apiCall(
      {
        method: "GET",
        url: `${this.baseUrl}/zones`,
        headers: this.bearerHeaders(apiToken),
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async getDnsRecords(
    step: Record<string, unknown>,
    ctx: HandlerContext
  ): Promise<unknown> {
    const { apiToken } = this.resolveAuth(step);
    const zoneId = this.sub(ctx, step.zoneId as string);

    const result = await this.apiCall(
      {
        method: "GET",
        url: `${this.baseUrl}/zones/${zoneId}/dns_records`,
        headers: this.bearerHeaders(apiToken),
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async createDnsRecord(
    step: Record<string, unknown>,
    ctx: HandlerContext
  ): Promise<unknown> {
    const { apiToken } = this.resolveAuth(step);
    const zoneId = this.sub(ctx, step.zoneId as string);

    const data: Record<string, unknown> = {
      type: this.sub(ctx, step.type as string),
      name: this.sub(ctx, step.name as string),
      content: this.sub(ctx, step.content as string),
    };
    if (step.ttl) data.ttl = Number(this.sub(ctx, step.ttl as string));
    if (step.proxied !== undefined) data.proxied = step.proxied;

    const result = await this.apiCall(
      {
        method: "POST",
        url: `${this.baseUrl}/zones/${zoneId}/dns_records`,
        headers: this.bearerHeaders(apiToken),
        data,
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async purgeCache(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const { apiToken } = this.resolveAuth(step);
    const zoneId = this.sub(ctx, step.zoneId as string);

    const data: Record<string, unknown> = {};
    if (step.purgeEverything) {
      data.purge_everything = true;
    } else if (step.files) {
      data.files = JSON.parse(this.sub(ctx, step.files as string));
    }

    const result = await this.apiCall(
      {
        method: "POST",
        url: `${this.baseUrl}/zones/${zoneId}/purge_cache`,
        headers: this.bearerHeaders(apiToken),
        data,
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }
}

export const cloudflareHandler = new CloudflareHandler();
