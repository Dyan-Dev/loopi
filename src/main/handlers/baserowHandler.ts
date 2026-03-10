import { BaseRestHandler, HandlerContext } from "./base/BaseRestHandler";
import { registerHandler } from "./base/handlerRegistry";

class BaserowHandler extends BaseRestHandler {
  protected serviceName = "Baserow";

  constructor() {
    super();
    registerHandler("baserowListRows", this.listRows.bind(this));
    registerHandler("baserowGetRow", this.getRow.bind(this));
    registerHandler("baserowCreateRow", this.createRow.bind(this));
    registerHandler("baserowUpdateRow", this.updateRow.bind(this));
  }

  private headers(token: string) {
    return { Authorization: `Token ${token}`, "Content-Type": "application/json" };
  }

  private async listRows(step: Record<string, unknown>, ctx: HandlerContext) {
    const creds = this.resolveCredential(step.credentialId as string, "baserow", {
      apiToken: step.apiToken as string,
    });
    const base = this.sub(ctx, step.baseUrl as string);
    const params = new URLSearchParams();
    if (step.page) params.append("page", this.sub(ctx, step.page as string));
    if (step.size) params.append("size", this.sub(ctx, step.size as string));
    const result = await this.apiCall(
      {
        method: "GET",
        url: `${base}/api/database/rows/table/${this.sub(ctx, step.tableId as string)}/?${params}`,
        headers: this.headers(creds.apiToken),
      },
      ctx
    );
    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async getRow(step: Record<string, unknown>, ctx: HandlerContext) {
    const creds = this.resolveCredential(step.credentialId as string, "baserow", {
      apiToken: step.apiToken as string,
    });
    const base = this.sub(ctx, step.baseUrl as string);
    const result = await this.apiCall(
      {
        method: "GET",
        url: `${base}/api/database/rows/table/${this.sub(ctx, step.tableId as string)}/${this.sub(ctx, step.rowId as string)}/`,
        headers: this.headers(creds.apiToken),
      },
      ctx
    );
    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async createRow(step: Record<string, unknown>, ctx: HandlerContext) {
    const creds = this.resolveCredential(step.credentialId as string, "baserow", {
      apiToken: step.apiToken as string,
    });
    const base = this.sub(ctx, step.baseUrl as string);
    const result = await this.apiCall(
      {
        method: "POST",
        url: `${base}/api/database/rows/table/${this.sub(ctx, step.tableId as string)}/`,
        headers: this.headers(creds.apiToken),
        data: JSON.parse(this.sub(ctx, step.data as string)),
      },
      ctx
    );
    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async updateRow(step: Record<string, unknown>, ctx: HandlerContext) {
    const creds = this.resolveCredential(step.credentialId as string, "baserow", {
      apiToken: step.apiToken as string,
    });
    const base = this.sub(ctx, step.baseUrl as string);
    const result = await this.apiCall(
      {
        method: "PATCH",
        url: `${base}/api/database/rows/table/${this.sub(ctx, step.tableId as string)}/${this.sub(ctx, step.rowId as string)}/`,
        headers: this.headers(creds.apiToken),
        data: JSON.parse(this.sub(ctx, step.data as string)),
      },
      ctx
    );
    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }
}

export const baserowHandler = new BaserowHandler();
