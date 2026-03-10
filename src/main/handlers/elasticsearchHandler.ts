import { BaseRestHandler, HandlerContext } from "./base/BaseRestHandler";
import { registerHandler } from "./base/handlerRegistry";

class ElasticsearchHandler extends BaseRestHandler {
  protected serviceName = "Elasticsearch";

  constructor() {
    super();
    registerHandler("elasticsearchSearch", this.search.bind(this));
    registerHandler("elasticsearchIndex", this.indexDoc.bind(this));
    registerHandler("elasticsearchGet", this.getDoc.bind(this));
    registerHandler("elasticsearchDelete", this.deleteDoc.bind(this));
  }

  private getHeaders(step: Record<string, unknown>, ctx: HandlerContext) {
    const creds = this.resolveCredential(step.credentialId as string, "elasticsearch", {
      username: step.username as string,
      password: step.password as string,
      apiKey: step.apiKey as string,
    });
    if (creds.apiKey)
      return { Authorization: `ApiKey ${creds.apiKey}`, "Content-Type": "application/json" };
    if (creds.username) return this.basicHeaders(creds.username, creds.password);
    return { "Content-Type": "application/json" };
  }

  private async search(step: Record<string, unknown>, ctx: HandlerContext) {
    const headers = this.getHeaders(step, ctx);
    const base = this.sub(ctx, step.baseUrl as string);
    const body: Record<string, unknown> = {
      query: JSON.parse(this.sub(ctx, step.query as string)),
    };
    if (step.size) body.size = Number(this.sub(ctx, step.size as string));
    const result = await this.apiCall(
      {
        method: "POST",
        url: `${base}/${this.sub(ctx, step.index as string)}/_search`,
        headers,
        data: body,
      },
      ctx
    );
    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async indexDoc(step: Record<string, unknown>, ctx: HandlerContext) {
    const headers = this.getHeaders(step, ctx);
    const base = this.sub(ctx, step.baseUrl as string);
    const index = this.sub(ctx, step.index as string);
    const id = step.id ? this.sub(ctx, step.id as string) : undefined;
    const url = id ? `${base}/${index}/_doc/${id}` : `${base}/${index}/_doc`;
    const result = await this.apiCall(
      {
        method: id ? "PUT" : "POST",
        url,
        headers,
        data: JSON.parse(this.sub(ctx, step.document as string)),
      },
      ctx
    );
    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async getDoc(step: Record<string, unknown>, ctx: HandlerContext) {
    const headers = this.getHeaders(step, ctx);
    const base = this.sub(ctx, step.baseUrl as string);
    const result = await this.apiCall(
      {
        method: "GET",
        url: `${base}/${this.sub(ctx, step.index as string)}/_doc/${this.sub(ctx, step.id as string)}`,
        headers,
      },
      ctx
    );
    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async deleteDoc(step: Record<string, unknown>, ctx: HandlerContext) {
    const headers = this.getHeaders(step, ctx);
    const base = this.sub(ctx, step.baseUrl as string);
    const result = await this.apiCall(
      {
        method: "DELETE",
        url: `${base}/${this.sub(ctx, step.index as string)}/_doc/${this.sub(ctx, step.id as string)}`,
        headers,
      },
      ctx
    );
    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }
}

export const elasticsearchHandler = new ElasticsearchHandler();
