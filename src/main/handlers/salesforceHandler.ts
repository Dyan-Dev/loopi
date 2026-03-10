import { BaseRestHandler, HandlerContext } from "./base/BaseRestHandler";
import { registerHandler } from "./base/handlerRegistry";

/**
 * Salesforce REST API handler
 * API: {instanceUrl}/services/data/v58.0
 */
class SalesforceHandler extends BaseRestHandler {
  protected serviceName = "Salesforce";

  constructor() {
    super();
    registerHandler("salesforceCreateRecord", this.createRecord.bind(this));
    registerHandler("salesforceGetRecord", this.getRecord.bind(this));
    registerHandler("salesforceUpdateRecord", this.updateRecord.bind(this));
    registerHandler("salesforceQuery", this.query.bind(this));
  }

  private async createRecord(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const creds = this.resolveCredential(step.credentialId as string, "salesforce", {
      accessToken: step.accessToken as string,
    });
    const token = creds.accessToken;
    const instanceUrl = this.sub(ctx, step.instanceUrl as string);
    const objectType = this.sub(ctx, step.objectType as string);
    const fields = JSON.parse(this.sub(ctx, step.fields as string));

    const result = await this.apiCall(
      {
        method: "POST",
        url: `${instanceUrl}/services/data/v58.0/sobjects/${objectType}/`,
        headers: this.bearerHeaders(token),
        data: fields,
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async getRecord(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const creds = this.resolveCredential(step.credentialId as string, "salesforce", {
      accessToken: step.accessToken as string,
    });
    const token = creds.accessToken;
    const instanceUrl = this.sub(ctx, step.instanceUrl as string);
    const objectType = this.sub(ctx, step.objectType as string);
    const recordId = this.sub(ctx, step.recordId as string);

    const result = await this.apiCall(
      {
        method: "GET",
        url: `${instanceUrl}/services/data/v58.0/sobjects/${objectType}/${recordId}`,
        headers: this.bearerHeaders(token),
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async updateRecord(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const creds = this.resolveCredential(step.credentialId as string, "salesforce", {
      accessToken: step.accessToken as string,
    });
    const token = creds.accessToken;
    const instanceUrl = this.sub(ctx, step.instanceUrl as string);
    const objectType = this.sub(ctx, step.objectType as string);
    const recordId = this.sub(ctx, step.recordId as string);
    const fields = JSON.parse(this.sub(ctx, step.fields as string));

    const result = await this.apiCall(
      {
        method: "PATCH",
        url: `${instanceUrl}/services/data/v58.0/sobjects/${objectType}/${recordId}`,
        headers: this.bearerHeaders(token),
        data: fields,
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async query(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const creds = this.resolveCredential(step.credentialId as string, "salesforce", {
      accessToken: step.accessToken as string,
    });
    const token = creds.accessToken;
    const instanceUrl = this.sub(ctx, step.instanceUrl as string);
    const soql = this.sub(ctx, step.soql as string);

    const result = await this.apiCall(
      {
        method: "GET",
        url: `${instanceUrl}/services/data/v58.0/query/?q=${encodeURIComponent(soql)}`,
        headers: this.bearerHeaders(token),
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }
}

export const salesforceHandler = new SalesforceHandler();
