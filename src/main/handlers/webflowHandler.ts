import { BaseRestHandler, HandlerContext } from "./base/BaseRestHandler";
import { registerHandler } from "./base/handlerRegistry";

class WebflowHandler extends BaseRestHandler {
  protected serviceName = "Webflow";
  private base = "https://api.webflow.com/v2";

  constructor() {
    super();
    registerHandler("webflowListSites", this.listSites.bind(this));
    registerHandler("webflowListCollections", this.listCollections.bind(this));
    registerHandler("webflowListItems", this.listItems.bind(this));
    registerHandler("webflowCreateItem", this.createItem.bind(this));
  }

  private async listSites(step: Record<string, unknown>, ctx: HandlerContext) {
    const creds = this.resolveCredential(step.credentialId as string, "webflow", {
      accessToken: step.accessToken as string,
    });
    const result = await this.apiCall(
      { method: "GET", url: `${this.base}/sites`, headers: this.bearerHeaders(creds.accessToken) },
      ctx
    );
    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async listCollections(step: Record<string, unknown>, ctx: HandlerContext) {
    const creds = this.resolveCredential(step.credentialId as string, "webflow", {
      accessToken: step.accessToken as string,
    });
    const result = await this.apiCall(
      {
        method: "GET",
        url: `${this.base}/sites/${this.sub(ctx, step.siteId as string)}/collections`,
        headers: this.bearerHeaders(creds.accessToken),
      },
      ctx
    );
    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async listItems(step: Record<string, unknown>, ctx: HandlerContext) {
    const creds = this.resolveCredential(step.credentialId as string, "webflow", {
      accessToken: step.accessToken as string,
    });
    const params = new URLSearchParams();
    if (step.limit) params.append("limit", this.sub(ctx, step.limit as string));
    if (step.offset) params.append("offset", this.sub(ctx, step.offset as string));
    const result = await this.apiCall(
      {
        method: "GET",
        url: `${this.base}/collections/${this.sub(ctx, step.collectionId as string)}/items?${params}`,
        headers: this.bearerHeaders(creds.accessToken),
      },
      ctx
    );
    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async createItem(step: Record<string, unknown>, ctx: HandlerContext) {
    const creds = this.resolveCredential(step.credentialId as string, "webflow", {
      accessToken: step.accessToken as string,
    });
    const result = await this.apiCall(
      {
        method: "POST",
        url: `${this.base}/collections/${this.sub(ctx, step.collectionId as string)}/items`,
        headers: this.bearerHeaders(creds.accessToken),
        data: { fieldData: JSON.parse(this.sub(ctx, step.fields as string)) },
      },
      ctx
    );
    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }
}

export const webflowHandler = new WebflowHandler();
