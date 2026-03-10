import { BaseRestHandler, HandlerContext } from "./base/BaseRestHandler";
import { registerHandler } from "./base/handlerRegistry";

/**
 * NocoDB API handler
 * API: {baseUrl}/api/v1/
 */
class NocoDBHandler extends BaseRestHandler {
  protected serviceName = "NocoDB";

  constructor() {
    super();
    registerHandler("nocodbListRows", this.listRows.bind(this));
    registerHandler("nocodbGetRow", this.getRow.bind(this));
    registerHandler("nocodbCreateRow", this.createRow.bind(this));
    registerHandler("nocodbUpdateRow", this.updateRow.bind(this));
  }

  private resolveAuth(step: Record<string, unknown>): { apiToken: string } {
    const creds = this.resolveCredential(step.credentialId as string, "nocodb", {
      apiToken: step.apiToken as string,
    });
    return { apiToken: creds.apiToken };
  }

  private apiUrl(baseUrl: string): string {
    return `${baseUrl.replace(/\/+$/, "")}/api/v1`;
  }

  private authHeaders(apiToken: string): Record<string, string> {
    return { "xc-auth": apiToken, "Content-Type": "application/json" };
  }

  private async listRows(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const { apiToken } = this.resolveAuth(step);
    const baseUrl = this.sub(ctx, step.baseUrl as string);
    const tableId = this.sub(ctx, step.tableId as string);

    const params: Record<string, unknown> = {};
    if (step.limit) params.limit = Number(this.sub(ctx, step.limit as string));
    if (step.offset) params.offset = Number(this.sub(ctx, step.offset as string));
    if (step.where) params.where = this.sub(ctx, step.where as string);

    const result = await this.apiCall(
      {
        method: "GET",
        url: `${this.apiUrl(baseUrl)}/db/data/noco/${tableId}`,
        headers: this.authHeaders(apiToken),
        params,
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async getRow(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const { apiToken } = this.resolveAuth(step);
    const baseUrl = this.sub(ctx, step.baseUrl as string);
    const tableId = this.sub(ctx, step.tableId as string);
    const rowId = this.sub(ctx, step.rowId as string);

    const result = await this.apiCall(
      {
        method: "GET",
        url: `${this.apiUrl(baseUrl)}/db/data/noco/${tableId}/${rowId}`,
        headers: this.authHeaders(apiToken),
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async createRow(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const { apiToken } = this.resolveAuth(step);
    const baseUrl = this.sub(ctx, step.baseUrl as string);
    const tableId = this.sub(ctx, step.tableId as string);
    const data = JSON.parse(this.sub(ctx, step.data as string));

    const result = await this.apiCall(
      {
        method: "POST",
        url: `${this.apiUrl(baseUrl)}/db/data/noco/${tableId}`,
        headers: this.authHeaders(apiToken),
        data,
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async updateRow(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const { apiToken } = this.resolveAuth(step);
    const baseUrl = this.sub(ctx, step.baseUrl as string);
    const tableId = this.sub(ctx, step.tableId as string);
    const rowId = this.sub(ctx, step.rowId as string);
    const data = JSON.parse(this.sub(ctx, step.data as string));

    const result = await this.apiCall(
      {
        method: "PATCH",
        url: `${this.apiUrl(baseUrl)}/db/data/noco/${tableId}/${rowId}`,
        headers: this.authHeaders(apiToken),
        data,
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }
}

export const nocodbHandler = new NocoDBHandler();
