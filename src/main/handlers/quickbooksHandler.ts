import { BaseRestHandler, HandlerContext } from "./base/BaseRestHandler";
import { registerHandler } from "./base/handlerRegistry";

class QuickBooksHandler extends BaseRestHandler {
  protected serviceName = "QuickBooks";

  constructor() {
    super();
    registerHandler("quickbooksGetCompany", this.getCompany.bind(this));
    registerHandler("quickbooksCreateInvoice", this.createInvoice.bind(this));
    registerHandler("quickbooksListInvoices", this.listInvoices.bind(this));
    registerHandler("quickbooksQuery", this.query.bind(this));
  }

  private getBase(step: Record<string, unknown>, ctx: HandlerContext) {
    return `https://quickbooks.api.intuit.com/v3/company/${this.sub(ctx, step.realmId as string)}`;
  }

  private async getCompany(step: Record<string, unknown>, ctx: HandlerContext) {
    const creds = this.resolveCredential(step.credentialId as string, "quickbooks", {
      accessToken: step.accessToken as string,
    });
    const realmId = this.sub(ctx, step.realmId as string);
    const result = await this.apiCall(
      {
        method: "GET",
        url: `${this.getBase(step, ctx)}/companyinfo/${realmId}`,
        headers: { ...this.bearerHeaders(creds.accessToken), Accept: "application/json" },
      },
      ctx
    );
    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async createInvoice(step: Record<string, unknown>, ctx: HandlerContext) {
    const creds = this.resolveCredential(step.credentialId as string, "quickbooks", {
      accessToken: step.accessToken as string,
    });
    const body: Record<string, unknown> = {
      CustomerRef: { value: this.sub(ctx, step.customerRef as string) },
      Line: JSON.parse(this.sub(ctx, step.lineItems as string)),
    };
    const result = await this.apiCall(
      {
        method: "POST",
        url: `${this.getBase(step, ctx)}/invoice`,
        headers: { ...this.bearerHeaders(creds.accessToken), Accept: "application/json" },
        data: body,
      },
      ctx
    );
    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async listInvoices(step: Record<string, unknown>, ctx: HandlerContext) {
    const creds = this.resolveCredential(step.credentialId as string, "quickbooks", {
      accessToken: step.accessToken as string,
    });
    const q = this.sub(ctx, step.queryStr as string) || "SELECT * FROM Invoice";
    const result = await this.apiCall(
      {
        method: "GET",
        url: `${this.getBase(step, ctx)}/query?query=${encodeURIComponent(q)}`,
        headers: { ...this.bearerHeaders(creds.accessToken), Accept: "application/json" },
      },
      ctx
    );
    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async query(step: Record<string, unknown>, ctx: HandlerContext) {
    const creds = this.resolveCredential(step.credentialId as string, "quickbooks", {
      accessToken: step.accessToken as string,
    });
    const q = this.sub(ctx, step.queryStr as string);
    const result = await this.apiCall(
      {
        method: "GET",
        url: `${this.getBase(step, ctx)}/query?query=${encodeURIComponent(q)}`,
        headers: { ...this.bearerHeaders(creds.accessToken), Accept: "application/json" },
      },
      ctx
    );
    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }
}

export const quickbooksHandler = new QuickBooksHandler();
