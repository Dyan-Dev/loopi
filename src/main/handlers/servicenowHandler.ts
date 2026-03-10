import { BaseRestHandler, HandlerContext } from "./base/BaseRestHandler";
import { registerHandler } from "./base/handlerRegistry";

class ServiceNowHandler extends BaseRestHandler {
  protected serviceName = "ServiceNow";

  constructor() {
    super();
    registerHandler("servicenowCreateIncident", this.createIncident.bind(this));
    registerHandler("servicenowGetIncident", this.getIncident.bind(this));
    registerHandler("servicenowListIncidents", this.listIncidents.bind(this));
    registerHandler("servicenowUpdateIncident", this.updateIncident.bind(this));
  }

  private getBase(step: Record<string, unknown>, ctx: HandlerContext) {
    return `${this.sub(ctx, step.instanceUrl as string)}/api/now`;
  }

  private async createIncident(step: Record<string, unknown>, ctx: HandlerContext) {
    const creds = this.resolveCredential(step.credentialId as string, "servicenow", {
      username: step.username as string,
      password: step.password as string,
    });
    const body: Record<string, unknown> = {
      short_description: this.sub(ctx, step.shortDescription as string),
    };
    if (step.description) body.description = this.sub(ctx, step.description as string);
    if (step.urgency) body.urgency = this.sub(ctx, step.urgency as string);
    if (step.impact) body.impact = this.sub(ctx, step.impact as string);
    const result = await this.apiCall(
      {
        method: "POST",
        url: `${this.getBase(step, ctx)}/table/incident`,
        headers: {
          ...this.basicHeaders(creds.username, creds.password),
          Accept: "application/json",
        },
        data: body,
      },
      ctx
    );
    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async getIncident(step: Record<string, unknown>, ctx: HandlerContext) {
    const creds = this.resolveCredential(step.credentialId as string, "servicenow", {
      username: step.username as string,
      password: step.password as string,
    });
    const result = await this.apiCall(
      {
        method: "GET",
        url: `${this.getBase(step, ctx)}/table/incident/${this.sub(ctx, step.sysId as string)}`,
        headers: {
          ...this.basicHeaders(creds.username, creds.password),
          Accept: "application/json",
        },
      },
      ctx
    );
    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async listIncidents(step: Record<string, unknown>, ctx: HandlerContext) {
    const creds = this.resolveCredential(step.credentialId as string, "servicenow", {
      username: step.username as string,
      password: step.password as string,
    });
    const params = new URLSearchParams();
    if (step.limit) params.append("sysparm_limit", this.sub(ctx, step.limit as string));
    if (step.query) params.append("sysparm_query", this.sub(ctx, step.query as string));
    const result = await this.apiCall(
      {
        method: "GET",
        url: `${this.getBase(step, ctx)}/table/incident?${params}`,
        headers: {
          ...this.basicHeaders(creds.username, creds.password),
          Accept: "application/json",
        },
      },
      ctx
    );
    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async updateIncident(step: Record<string, unknown>, ctx: HandlerContext) {
    const creds = this.resolveCredential(step.credentialId as string, "servicenow", {
      username: step.username as string,
      password: step.password as string,
    });
    const body: Record<string, unknown> = {};
    if (step.shortDescription)
      body.short_description = this.sub(ctx, step.shortDescription as string);
    if (step.state) body.state = this.sub(ctx, step.state as string);
    const result = await this.apiCall(
      {
        method: "PATCH",
        url: `${this.getBase(step, ctx)}/table/incident/${this.sub(ctx, step.sysId as string)}`,
        headers: {
          ...this.basicHeaders(creds.username, creds.password),
          Accept: "application/json",
        },
        data: body,
      },
      ctx
    );
    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }
}

export const servicenowHandler = new ServiceNowHandler();
