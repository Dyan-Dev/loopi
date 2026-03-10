import { BaseRestHandler, HandlerContext } from "./base/BaseRestHandler";
import { registerHandler } from "./base/handlerRegistry";

class GrafanaHandler extends BaseRestHandler {
  protected serviceName = "Grafana";

  constructor() {
    super();
    registerHandler("grafanaListDashboards", this.listDashboards.bind(this));
    registerHandler("grafanaGetDashboard", this.getDashboard.bind(this));
    registerHandler("grafanaCreateAnnotation", this.createAnnotation.bind(this));
  }

  private async listDashboards(step: Record<string, unknown>, ctx: HandlerContext) {
    const creds = this.resolveCredential(step.credentialId as string, "grafana", {
      apiToken: step.apiToken as string,
    });
    const base = this.sub(ctx, step.baseUrl as string);
    const params = new URLSearchParams();
    if (step.query) params.append("query", this.sub(ctx, step.query as string));
    const result = await this.apiCall(
      {
        method: "GET",
        url: `${base}/api/search?${params}`,
        headers: this.bearerHeaders(creds.apiToken),
      },
      ctx
    );
    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async getDashboard(step: Record<string, unknown>, ctx: HandlerContext) {
    const creds = this.resolveCredential(step.credentialId as string, "grafana", {
      apiToken: step.apiToken as string,
    });
    const base = this.sub(ctx, step.baseUrl as string);
    const result = await this.apiCall(
      {
        method: "GET",
        url: `${base}/api/dashboards/uid/${this.sub(ctx, step.uid as string)}`,
        headers: this.bearerHeaders(creds.apiToken),
      },
      ctx
    );
    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async createAnnotation(step: Record<string, unknown>, ctx: HandlerContext) {
    const creds = this.resolveCredential(step.credentialId as string, "grafana", {
      apiToken: step.apiToken as string,
    });
    const base = this.sub(ctx, step.baseUrl as string);
    const body: Record<string, unknown> = { text: this.sub(ctx, step.text as string) };
    if (step.dashboardId) body.dashboardId = Number(this.sub(ctx, step.dashboardId as string));
    if (step.tags) body.tags = JSON.parse(this.sub(ctx, step.tags as string));
    if (step.time) body.time = Number(this.sub(ctx, step.time as string));
    if (step.timeEnd) body.timeEnd = Number(this.sub(ctx, step.timeEnd as string));
    const result = await this.apiCall(
      {
        method: "POST",
        url: `${base}/api/annotations`,
        headers: this.bearerHeaders(creds.apiToken),
        data: body,
      },
      ctx
    );
    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }
}

export const grafanaHandler = new GrafanaHandler();
