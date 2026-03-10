import { BaseRestHandler, HandlerContext } from "./base/BaseRestHandler";
import { registerHandler } from "./base/handlerRegistry";

class CodaHandler extends BaseRestHandler {
  protected serviceName = "Coda";
  private base = "https://coda.io/apis/v1";

  constructor() {
    super();
    registerHandler("codaListDocs", this.listDocs.bind(this));
    registerHandler("codaGetDoc", this.getDoc.bind(this));
    registerHandler("codaListRows", this.listRows.bind(this));
    registerHandler("codaInsertRow", this.insertRow.bind(this));
  }

  private async listDocs(step: Record<string, unknown>, ctx: HandlerContext) {
    const creds = this.resolveCredential(step.credentialId as string, "coda", {
      apiToken: step.apiToken as string,
    });
    const result = await this.apiCall(
      { method: "GET", url: `${this.base}/docs`, headers: this.bearerHeaders(creds.apiToken) },
      ctx
    );
    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async getDoc(step: Record<string, unknown>, ctx: HandlerContext) {
    const creds = this.resolveCredential(step.credentialId as string, "coda", {
      apiToken: step.apiToken as string,
    });
    const result = await this.apiCall(
      {
        method: "GET",
        url: `${this.base}/docs/${this.sub(ctx, step.docId as string)}`,
        headers: this.bearerHeaders(creds.apiToken),
      },
      ctx
    );
    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async listRows(step: Record<string, unknown>, ctx: HandlerContext) {
    const creds = this.resolveCredential(step.credentialId as string, "coda", {
      apiToken: step.apiToken as string,
    });
    const docId = this.sub(ctx, step.docId as string);
    const tableId = this.sub(ctx, step.tableId as string);
    const result = await this.apiCall(
      {
        method: "GET",
        url: `${this.base}/docs/${docId}/tables/${tableId}/rows`,
        headers: this.bearerHeaders(creds.apiToken),
      },
      ctx
    );
    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async insertRow(step: Record<string, unknown>, ctx: HandlerContext) {
    const creds = this.resolveCredential(step.credentialId as string, "coda", {
      apiToken: step.apiToken as string,
    });
    const docId = this.sub(ctx, step.docId as string);
    const tableId = this.sub(ctx, step.tableId as string);
    const result = await this.apiCall(
      {
        method: "POST",
        url: `${this.base}/docs/${docId}/tables/${tableId}/rows`,
        headers: this.bearerHeaders(creds.apiToken),
        data: { rows: [{ cells: JSON.parse(this.sub(ctx, step.cells as string)) }] },
      },
      ctx
    );
    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }
}

export const codaHandler = new CodaHandler();
