import { BaseRestHandler, HandlerContext } from "./base/BaseRestHandler";
import { registerHandler } from "./base/handlerRegistry";

class PipedriveHandler extends BaseRestHandler {
  protected serviceName = "Pipedrive";
  private base = "https://api.pipedrive.com/v1";

  constructor() {
    super();
    registerHandler("pipedriveCreateDeal", this.createDeal.bind(this));
    registerHandler("pipedriveGetDeal", this.getDeal.bind(this));
    registerHandler("pipedriveListDeals", this.listDeals.bind(this));
    registerHandler("pipedriveCreatePerson", this.createPerson.bind(this));
  }

  private async createDeal(step: Record<string, unknown>, ctx: HandlerContext) {
    const creds = this.resolveCredential(step.credentialId as string, "pipedrive", {
      apiToken: step.apiToken as string,
    });
    const body: Record<string, unknown> = { title: this.sub(ctx, step.title as string) };
    if (step.value) body.value = this.sub(ctx, step.value as string);
    if (step.currency) body.currency = this.sub(ctx, step.currency as string);
    if (step.personId) body.person_id = Number(this.sub(ctx, step.personId as string));
    if (step.orgId) body.org_id = Number(this.sub(ctx, step.orgId as string));
    const result = await this.apiCall(
      {
        method: "POST",
        url: `${this.base}/deals?api_token=${creds.apiToken}`,
        headers: { "Content-Type": "application/json" },
        data: body,
      },
      ctx
    );
    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async getDeal(step: Record<string, unknown>, ctx: HandlerContext) {
    const creds = this.resolveCredential(step.credentialId as string, "pipedrive", {
      apiToken: step.apiToken as string,
    });
    const result = await this.apiCall(
      {
        method: "GET",
        url: `${this.base}/deals/${this.sub(ctx, step.dealId as string)}?api_token=${creds.apiToken}`,
      },
      ctx
    );
    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async listDeals(step: Record<string, unknown>, ctx: HandlerContext) {
    const creds = this.resolveCredential(step.credentialId as string, "pipedrive", {
      apiToken: step.apiToken as string,
    });
    const params = new URLSearchParams({ api_token: creds.apiToken });
    if (step.limit) params.append("limit", this.sub(ctx, step.limit as string));
    if (step.status) params.append("status", this.sub(ctx, step.status as string));
    const result = await this.apiCall({ method: "GET", url: `${this.base}/deals?${params}` }, ctx);
    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async createPerson(step: Record<string, unknown>, ctx: HandlerContext) {
    const creds = this.resolveCredential(step.credentialId as string, "pipedrive", {
      apiToken: step.apiToken as string,
    });
    const body: Record<string, unknown> = { name: this.sub(ctx, step.name as string) };
    if (step.email) body.email = [{ value: this.sub(ctx, step.email as string), primary: true }];
    if (step.phone) body.phone = [{ value: this.sub(ctx, step.phone as string), primary: true }];
    const result = await this.apiCall(
      {
        method: "POST",
        url: `${this.base}/persons?api_token=${creds.apiToken}`,
        headers: { "Content-Type": "application/json" },
        data: body,
      },
      ctx
    );
    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }
}

export const pipedriveHandler = new PipedriveHandler();
