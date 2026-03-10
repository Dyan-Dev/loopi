import axios from "axios";
import { BaseRestHandler, HandlerContext } from "./base/BaseRestHandler";
import { registerHandler } from "./base/handlerRegistry";

class PayPalHandler extends BaseRestHandler {
  protected serviceName = "PayPal";

  constructor() {
    super();
    registerHandler("paypalCreateOrder", this.createOrder.bind(this));
    registerHandler("paypalGetOrder", this.getOrder.bind(this));
    registerHandler("paypalCaptureOrder", this.captureOrder.bind(this));
    registerHandler("paypalListTransactions", this.listTransactions.bind(this));
  }

  private async getToken(baseUrl: string, clientId: string, clientSecret: string): Promise<string> {
    const res = await axios.post(`${baseUrl}/v1/oauth2/token`, "grant_type=client_credentials", {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      auth: { username: clientId, password: clientSecret },
    });
    return res.data.access_token;
  }

  private getBase(step: Record<string, unknown>, ctx: HandlerContext) {
    return this.sub(ctx, step.baseUrl as string) || "https://api-m.paypal.com";
  }

  private async createOrder(step: Record<string, unknown>, ctx: HandlerContext) {
    const creds = this.resolveCredential(step.credentialId as string, "paypal", {
      clientId: step.clientId as string,
      clientSecret: step.clientSecret as string,
    });
    const baseUrl = this.getBase(step, ctx);
    const token = await this.getToken(baseUrl, creds.clientId, creds.clientSecret);
    const result = await this.apiCall(
      {
        method: "POST",
        url: `${baseUrl}/v2/checkout/orders`,
        headers: this.bearerHeaders(token),
        data: {
          intent: this.sub(ctx, step.intent as string) || "CAPTURE",
          purchase_units: [
            {
              amount: {
                currency_code: this.sub(ctx, step.currencyCode as string) || "USD",
                value: this.sub(ctx, step.amount as string),
              },
            },
          ],
        },
      },
      ctx
    );
    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async getOrder(step: Record<string, unknown>, ctx: HandlerContext) {
    const creds = this.resolveCredential(step.credentialId as string, "paypal", {
      clientId: step.clientId as string,
      clientSecret: step.clientSecret as string,
    });
    const baseUrl = this.getBase(step, ctx);
    const token = await this.getToken(baseUrl, creds.clientId, creds.clientSecret);
    const result = await this.apiCall(
      {
        method: "GET",
        url: `${baseUrl}/v2/checkout/orders/${this.sub(ctx, step.orderId as string)}`,
        headers: this.bearerHeaders(token),
      },
      ctx
    );
    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async captureOrder(step: Record<string, unknown>, ctx: HandlerContext) {
    const creds = this.resolveCredential(step.credentialId as string, "paypal", {
      clientId: step.clientId as string,
      clientSecret: step.clientSecret as string,
    });
    const baseUrl = this.getBase(step, ctx);
    const token = await this.getToken(baseUrl, creds.clientId, creds.clientSecret);
    const result = await this.apiCall(
      {
        method: "POST",
        url: `${baseUrl}/v2/checkout/orders/${this.sub(ctx, step.orderId as string)}/capture`,
        headers: this.bearerHeaders(token),
        data: {},
      },
      ctx
    );
    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async listTransactions(step: Record<string, unknown>, ctx: HandlerContext) {
    const creds = this.resolveCredential(step.credentialId as string, "paypal", {
      clientId: step.clientId as string,
      clientSecret: step.clientSecret as string,
    });
    const baseUrl = this.getBase(step, ctx);
    const token = await this.getToken(baseUrl, creds.clientId, creds.clientSecret);
    const params = new URLSearchParams({
      start_date: this.sub(ctx, step.startDate as string),
      end_date: this.sub(ctx, step.endDate as string),
    });
    const result = await this.apiCall(
      {
        method: "GET",
        url: `${baseUrl}/v1/reporting/transactions?${params}`,
        headers: this.bearerHeaders(token),
      },
      ctx
    );
    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }
}

export const paypalHandler = new PayPalHandler();
