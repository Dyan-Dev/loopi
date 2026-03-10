import { BaseRestHandler, HandlerContext } from "./base/BaseRestHandler";
import { registerHandler } from "./base/handlerRegistry";

class NetlifyHandler extends BaseRestHandler {
  protected serviceName = "Netlify";
  private base = "https://api.netlify.com/api/v1";

  constructor() {
    super();
    registerHandler("netlifyListSites", this.listSites.bind(this));
    registerHandler("netlifyGetSite", this.getSite.bind(this));
    registerHandler("netlifyTriggerBuild", this.triggerBuild.bind(this));
  }

  private async listSites(step: Record<string, unknown>, ctx: HandlerContext) {
    const creds = this.resolveCredential(step.credentialId as string, "netlify", {
      accessToken: step.accessToken as string,
    });
    const result = await this.apiCall(
      { method: "GET", url: `${this.base}/sites`, headers: this.bearerHeaders(creds.accessToken) },
      ctx
    );
    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async getSite(step: Record<string, unknown>, ctx: HandlerContext) {
    const creds = this.resolveCredential(step.credentialId as string, "netlify", {
      accessToken: step.accessToken as string,
    });
    const result = await this.apiCall(
      {
        method: "GET",
        url: `${this.base}/sites/${this.sub(ctx, step.siteId as string)}`,
        headers: this.bearerHeaders(creds.accessToken),
      },
      ctx
    );
    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async triggerBuild(step: Record<string, unknown>, ctx: HandlerContext) {
    const creds = this.resolveCredential(step.credentialId as string, "netlify", {
      accessToken: step.accessToken as string,
    });
    const result = await this.apiCall(
      {
        method: "POST",
        url: `${this.base}/sites/${this.sub(ctx, step.siteId as string)}/builds`,
        headers: this.bearerHeaders(creds.accessToken),
        data: {},
      },
      ctx
    );
    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }
}

export const netlifyHandler = new NetlifyHandler();
