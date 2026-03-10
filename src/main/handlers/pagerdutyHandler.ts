import { BaseRestHandler, HandlerContext } from "./base/BaseRestHandler";
import { registerHandler } from "./base/handlerRegistry";

/**
 * PagerDuty API handler
 * API: https://api.pagerduty.com/
 */
class PagerDutyHandler extends BaseRestHandler {
  protected serviceName = "PagerDuty";
  private readonly baseUrl = "https://api.pagerduty.com";

  constructor() {
    super();
    registerHandler("pagerdutyCreateIncident", this.createIncident.bind(this));
    registerHandler("pagerdutyGetIncident", this.getIncident.bind(this));
    registerHandler("pagerdutyListIncidents", this.listIncidents.bind(this));
  }

  private resolveAuth(step: Record<string, unknown>): { apiToken: string } {
    const creds = this.resolveCredential(step.credentialId as string, "pagerduty", {
      apiToken: step.apiToken as string,
    });
    return { apiToken: creds.apiToken };
  }

  private async createIncident(
    step: Record<string, unknown>,
    ctx: HandlerContext
  ): Promise<unknown> {
    const { apiToken } = this.resolveAuth(step);
    const serviceId = this.sub(ctx, step.serviceId as string);
    const title = this.sub(ctx, step.title as string);

    const incident: Record<string, unknown> = {
      type: "incident",
      title,
      service: { id: serviceId, type: "service_reference" },
    };
    if (step.urgency) incident.urgency = this.sub(ctx, step.urgency as string);
    if (step.body) {
      incident.body = {
        type: "incident_body",
        details: this.sub(ctx, step.body as string),
      };
    }

    const result = await this.apiCall(
      {
        method: "POST",
        url: `${this.baseUrl}/incidents`,
        headers: this.bearerHeaders(apiToken),
        data: { incident },
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async getIncident(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const { apiToken } = this.resolveAuth(step);
    const incidentId = this.sub(ctx, step.incidentId as string);

    const result = await this.apiCall(
      {
        method: "GET",
        url: `${this.baseUrl}/incidents/${incidentId}`,
        headers: this.bearerHeaders(apiToken),
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async listIncidents(
    step: Record<string, unknown>,
    ctx: HandlerContext
  ): Promise<unknown> {
    const { apiToken } = this.resolveAuth(step);

    const params: Record<string, unknown> = {};
    if (step.serviceIds)
      params["service_ids[]"] = (step.serviceIds as string).split(",").map((s) => s.trim());
    if (step.statuses)
      params["statuses[]"] = (step.statuses as string).split(",").map((s) => s.trim());
    if (step.limit) params.limit = Number(this.sub(ctx, step.limit as string));

    const result = await this.apiCall(
      {
        method: "GET",
        url: `${this.baseUrl}/incidents`,
        headers: this.bearerHeaders(apiToken),
        params,
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }
}

export const pagerdutyHandler = new PagerDutyHandler();
