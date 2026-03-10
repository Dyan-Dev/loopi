import { BaseRestHandler, HandlerContext } from "./base/BaseRestHandler";
import { registerHandler } from "./base/handlerRegistry";

class WooCommerceHandler extends BaseRestHandler {
  protected serviceName = "WooCommerce";

  constructor() {
    super();
    registerHandler("wooCreateProduct", this.createProduct.bind(this));
    registerHandler("wooGetProduct", this.getProduct.bind(this));
    registerHandler("wooListProducts", this.listProducts.bind(this));
    registerHandler("wooCreateOrder", this.createOrder.bind(this));
    registerHandler("wooGetOrder", this.getOrder.bind(this));
    registerHandler("wooListOrders", this.listOrders.bind(this));
  }

  private getBase(step: Record<string, unknown>, ctx: HandlerContext) {
    return `${this.sub(ctx, step.storeUrl as string)}/wp-json/wc/v3`;
  }

  private auth(creds: Record<string, string>) {
    return this.basicHeaders(creds.consumerKey, creds.consumerSecret);
  }

  private async createProduct(step: Record<string, unknown>, ctx: HandlerContext) {
    const creds = this.resolveCredential(step.credentialId as string, "woocommerce", {
      consumerKey: step.consumerKey as string,
      consumerSecret: step.consumerSecret as string,
    });
    const body: Record<string, unknown> = { name: this.sub(ctx, step.name as string) };
    if (step.type) body.type = this.sub(ctx, step.type as string);
    if (step.regularPrice) body.regular_price = this.sub(ctx, step.regularPrice as string);
    if (step.description) body.description = this.sub(ctx, step.description as string);
    const result = await this.apiCall(
      {
        method: "POST",
        url: `${this.getBase(step, ctx)}/products`,
        headers: this.auth(creds),
        data: body,
      },
      ctx
    );
    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async getProduct(step: Record<string, unknown>, ctx: HandlerContext) {
    const creds = this.resolveCredential(step.credentialId as string, "woocommerce", {
      consumerKey: step.consumerKey as string,
      consumerSecret: step.consumerSecret as string,
    });
    const result = await this.apiCall(
      {
        method: "GET",
        url: `${this.getBase(step, ctx)}/products/${this.sub(ctx, step.productId as string)}`,
        headers: this.auth(creds),
      },
      ctx
    );
    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async listProducts(step: Record<string, unknown>, ctx: HandlerContext) {
    const creds = this.resolveCredential(step.credentialId as string, "woocommerce", {
      consumerKey: step.consumerKey as string,
      consumerSecret: step.consumerSecret as string,
    });
    const params = new URLSearchParams();
    if (step.perPage) params.append("per_page", this.sub(ctx, step.perPage as string));
    if (step.status) params.append("status", this.sub(ctx, step.status as string));
    const result = await this.apiCall(
      {
        method: "GET",
        url: `${this.getBase(step, ctx)}/products?${params}`,
        headers: this.auth(creds),
      },
      ctx
    );
    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async createOrder(step: Record<string, unknown>, ctx: HandlerContext) {
    const creds = this.resolveCredential(step.credentialId as string, "woocommerce", {
      consumerKey: step.consumerKey as string,
      consumerSecret: step.consumerSecret as string,
    });
    const body: Record<string, unknown> = {
      line_items: JSON.parse(this.sub(ctx, step.lineItems as string)),
    };
    if (step.billing) body.billing = JSON.parse(this.sub(ctx, step.billing as string));
    const result = await this.apiCall(
      {
        method: "POST",
        url: `${this.getBase(step, ctx)}/orders`,
        headers: this.auth(creds),
        data: body,
      },
      ctx
    );
    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async getOrder(step: Record<string, unknown>, ctx: HandlerContext) {
    const creds = this.resolveCredential(step.credentialId as string, "woocommerce", {
      consumerKey: step.consumerKey as string,
      consumerSecret: step.consumerSecret as string,
    });
    const result = await this.apiCall(
      {
        method: "GET",
        url: `${this.getBase(step, ctx)}/orders/${this.sub(ctx, step.orderId as string)}`,
        headers: this.auth(creds),
      },
      ctx
    );
    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async listOrders(step: Record<string, unknown>, ctx: HandlerContext) {
    const creds = this.resolveCredential(step.credentialId as string, "woocommerce", {
      consumerKey: step.consumerKey as string,
      consumerSecret: step.consumerSecret as string,
    });
    const params = new URLSearchParams();
    if (step.status) params.append("status", this.sub(ctx, step.status as string));
    if (step.perPage) params.append("per_page", this.sub(ctx, step.perPage as string));
    const result = await this.apiCall(
      {
        method: "GET",
        url: `${this.getBase(step, ctx)}/orders?${params}`,
        headers: this.auth(creds),
      },
      ctx
    );
    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }
}

export const woocommerceHandler = new WooCommerceHandler();
