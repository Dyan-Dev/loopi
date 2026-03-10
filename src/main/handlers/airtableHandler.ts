import { BaseRestHandler, HandlerContext } from "./base/BaseRestHandler";
import { registerHandler } from "./base/handlerRegistry";

/**
 * Airtable REST API handler
 * API: https://api.airtable.com/v0
 */
class AirtableHandler extends BaseRestHandler {
  protected serviceName = "Airtable";

  constructor() {
    super();
    registerHandler("airtableCreateRecord", this.createRecord.bind(this));
    registerHandler("airtableGetRecord", this.getRecord.bind(this));
    registerHandler("airtableListRecords", this.listRecords.bind(this));
    registerHandler("airtableUpdateRecord", this.updateRecord.bind(this));
    registerHandler("airtableDeleteRecord", this.deleteRecord.bind(this));
  }

  private async createRecord(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const creds = this.resolveCredential(step.credentialId as string, "airtable", {
      apiKey: step.apiKey as string,
    });
    const token = creds.apiKey;
    const baseId = this.sub(ctx, step.baseId as string);
    const tableName = this.sub(ctx, step.tableName as string);
    const fields = JSON.parse(this.sub(ctx, step.fields as string));

    const result = await this.apiCall(
      {
        method: "POST",
        url: `https://api.airtable.com/v0/${baseId}/${tableName}`,
        headers: this.bearerHeaders(token),
        data: { fields },
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async getRecord(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const creds = this.resolveCredential(step.credentialId as string, "airtable", {
      apiKey: step.apiKey as string,
    });
    const token = creds.apiKey;
    const baseId = this.sub(ctx, step.baseId as string);
    const tableName = this.sub(ctx, step.tableName as string);
    const recordId = this.sub(ctx, step.recordId as string);

    const result = await this.apiCall(
      {
        method: "GET",
        url: `https://api.airtable.com/v0/${baseId}/${tableName}/${recordId}`,
        headers: this.bearerHeaders(token),
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async listRecords(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const creds = this.resolveCredential(step.credentialId as string, "airtable", {
      apiKey: step.apiKey as string,
    });
    const token = creds.apiKey;
    const baseId = this.sub(ctx, step.baseId as string);
    const tableName = this.sub(ctx, step.tableName as string);

    const params = new URLSearchParams();
    if (step.maxRecords) params.set("maxRecords", this.sub(ctx, step.maxRecords as string));
    if (step.filterFormula)
      params.set("filterByFormula", this.sub(ctx, step.filterFormula as string));
    const qs = params.toString();

    const result = await this.apiCall(
      {
        method: "GET",
        url: `https://api.airtable.com/v0/${baseId}/${tableName}${qs ? `?${qs}` : ""}`,
        headers: this.bearerHeaders(token),
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async updateRecord(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const creds = this.resolveCredential(step.credentialId as string, "airtable", {
      apiKey: step.apiKey as string,
    });
    const token = creds.apiKey;
    const baseId = this.sub(ctx, step.baseId as string);
    const tableName = this.sub(ctx, step.tableName as string);
    const recordId = this.sub(ctx, step.recordId as string);
    const fields = JSON.parse(this.sub(ctx, step.fields as string));

    const result = await this.apiCall(
      {
        method: "PATCH",
        url: `https://api.airtable.com/v0/${baseId}/${tableName}/${recordId}`,
        headers: this.bearerHeaders(token),
        data: { fields },
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async deleteRecord(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const creds = this.resolveCredential(step.credentialId as string, "airtable", {
      apiKey: step.apiKey as string,
    });
    const token = creds.apiKey;
    const baseId = this.sub(ctx, step.baseId as string);
    const tableName = this.sub(ctx, step.tableName as string);
    const recordId = this.sub(ctx, step.recordId as string);

    const result = await this.apiCall(
      {
        method: "DELETE",
        url: `https://api.airtable.com/v0/${baseId}/${tableName}/${recordId}`,
        headers: this.bearerHeaders(token),
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }
}

export const airtableHandler = new AirtableHandler();
