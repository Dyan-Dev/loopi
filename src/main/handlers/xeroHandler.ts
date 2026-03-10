import { BaseRestHandler, HandlerContext } from "./base/BaseRestHandler";
import { registerHandler } from "./base/handlerRegistry";

class XeroHandler extends BaseRestHandler {
  protected serviceName = "Xero";
  private base = "https://api.xero.com/api.xro/2.0";

  constructor() {
    super();
    registerHandler("xeroListContacts", this.listContacts.bind(this));
    registerHandler("xeroGetContact", this.getContact.bind(this));
    registerHandler("xeroCreateInvoice", this.createInvoice.bind(this));
    registerHandler("xeroListInvoices", this.listInvoices.bind(this));
  }

  private xeroHeaders(token: string, tenantId: string) {
    return { ...this.bearerHeaders(token), "xero-tenant-id": tenantId };
  }

  private async listContacts(step: Record<string, unknown>, ctx: HandlerContext) {
    const creds = this.resolveCredential(step.credentialId as string, "xero", {
      accessToken: step.accessToken as string,
    });
    const result = await this.apiCall(
      {
        method: "GET",
        url: `${this.base}/Contacts`,
        headers: this.xeroHeaders(creds.accessToken, this.sub(ctx, step.tenantId as string)),
      },
      ctx
    );
    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async getContact(step: Record<string, unknown>, ctx: HandlerContext) {
    const creds = this.resolveCredential(step.credentialId as string, "xero", {
      accessToken: step.accessToken as string,
    });
    const result = await this.apiCall(
      {
        method: "GET",
        url: `${this.base}/Contacts/${this.sub(ctx, step.contactId as string)}`,
        headers: this.xeroHeaders(creds.accessToken, this.sub(ctx, step.tenantId as string)),
      },
      ctx
    );
    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async createInvoice(step: Record<string, unknown>, ctx: HandlerContext) {
    const creds = this.resolveCredential(step.credentialId as string, "xero", {
      accessToken: step.accessToken as string,
    });
    const body: Record<string, unknown> = {
      Type: this.sub(ctx, step.type as string) || "ACCREC",
      Contact: { ContactID: this.sub(ctx, step.contactId as string) },
      LineItems: JSON.parse(this.sub(ctx, step.lineItems as string)),
    };
    if (step.dueDate) body.DueDate = this.sub(ctx, step.dueDate as string);
    const result = await this.apiCall(
      {
        method: "POST",
        url: `${this.base}/Invoices`,
        headers: this.xeroHeaders(creds.accessToken, this.sub(ctx, step.tenantId as string)),
        data: body,
      },
      ctx
    );
    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async listInvoices(step: Record<string, unknown>, ctx: HandlerContext) {
    const creds = this.resolveCredential(step.credentialId as string, "xero", {
      accessToken: step.accessToken as string,
    });
    const result = await this.apiCall(
      {
        method: "GET",
        url: `${this.base}/Invoices`,
        headers: this.xeroHeaders(creds.accessToken, this.sub(ctx, step.tenantId as string)),
      },
      ctx
    );
    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }
}

export const xeroHandler = new XeroHandler();
