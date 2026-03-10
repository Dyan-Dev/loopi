import { BaseRestHandler, HandlerContext } from "./base/BaseRestHandler";
import { registerHandler } from "./base/handlerRegistry";

class ShopifyHandler extends BaseRestHandler {
  protected serviceName = "Shopify";

  constructor() {
    super();
    registerHandler("shopifyCreateProduct", this.createProduct.bind(this));
    registerHandler("shopifyGetProduct", this.getProduct.bind(this));
    registerHandler("shopifyListProducts", this.listProducts.bind(this));
    registerHandler("shopifyCreateOrder", this.createOrder.bind(this));
    registerHandler("shopifyGetOrder", this.getOrder.bind(this));
    registerHandler("shopifyListOrders", this.listOrders.bind(this));
  }

  private baseUrl(shop: string) {
    return `https://${shop}.myshopify.com/admin/api/2024-01`;
  }

  private shopifyHeaders(token: string) {
    return { "X-Shopify-Access-Token": token, "Content-Type": "application/json" };
  }

  private async createProduct(step: Record<string, unknown>, ctx: HandlerContext) {
    const creds = this.resolveCredential(step.credentialId as string, "shopify", {
      accessToken: step.accessToken as string,
    });
    const shop = this.sub(ctx, step.shop as string);
    const product: Record<string, unknown> = { title: this.sub(ctx, step.title as string) };
    if (step.bodyHtml) product.body_html = this.sub(ctx, step.bodyHtml as string);
    if (step.vendor) product.vendor = this.sub(ctx, step.vendor as string);
    if (step.productType) product.product_type = this.sub(ctx, step.productType as string);
    const result = await this.apiCall(
      {
        method: "POST",
        url: `${this.baseUrl(shop)}/products.json`,
        headers: this.shopifyHeaders(creds.accessToken),
        data: { product },
      },
      ctx
    );
    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async getProduct(step: Record<string, unknown>, ctx: HandlerContext) {
    const creds = this.resolveCredential(step.credentialId as string, "shopify", {
      accessToken: step.accessToken as string,
    });
    const shop = this.sub(ctx, step.shop as string);
    const result = await this.apiCall(
      {
        method: "GET",
        url: `${this.baseUrl(shop)}/products/${this.sub(ctx, step.productId as string)}.json`,
        headers: this.shopifyHeaders(creds.accessToken),
      },
      ctx
    );
    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async listProducts(step: Record<string, unknown>, ctx: HandlerContext) {
    const creds = this.resolveCredential(step.credentialId as string, "shopify", {
      accessToken: step.accessToken as string,
    });
    const shop = this.sub(ctx, step.shop as string);
    const params = new URLSearchParams();
    if (step.limit) params.append("limit", this.sub(ctx, step.limit as string));
    if (step.title) params.append("title", this.sub(ctx, step.title as string));
    const result = await this.apiCall(
      {
        method: "GET",
        url: `${this.baseUrl(shop)}/products.json?${params}`,
        headers: this.shopifyHeaders(creds.accessToken),
      },
      ctx
    );
    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async createOrder(step: Record<string, unknown>, ctx: HandlerContext) {
    const creds = this.resolveCredential(step.credentialId as string, "shopify", {
      accessToken: step.accessToken as string,
    });
    const shop = this.sub(ctx, step.shop as string);
    const order: Record<string, unknown> = {
      line_items: JSON.parse(this.sub(ctx, step.lineItems as string)),
    };
    if (step.customer) order.customer = JSON.parse(this.sub(ctx, step.customer as string));
    const result = await this.apiCall(
      {
        method: "POST",
        url: `${this.baseUrl(shop)}/orders.json`,
        headers: this.shopifyHeaders(creds.accessToken),
        data: { order },
      },
      ctx
    );
    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async getOrder(step: Record<string, unknown>, ctx: HandlerContext) {
    const creds = this.resolveCredential(step.credentialId as string, "shopify", {
      accessToken: step.accessToken as string,
    });
    const shop = this.sub(ctx, step.shop as string);
    const result = await this.apiCall(
      {
        method: "GET",
        url: `${this.baseUrl(shop)}/orders/${this.sub(ctx, step.orderId as string)}.json`,
        headers: this.shopifyHeaders(creds.accessToken),
      },
      ctx
    );
    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async listOrders(step: Record<string, unknown>, ctx: HandlerContext) {
    const creds = this.resolveCredential(step.credentialId as string, "shopify", {
      accessToken: step.accessToken as string,
    });
    const shop = this.sub(ctx, step.shop as string);
    const params = new URLSearchParams();
    if (step.status) params.append("status", this.sub(ctx, step.status as string));
    if (step.limit) params.append("limit", this.sub(ctx, step.limit as string));
    const result = await this.apiCall(
      {
        method: "GET",
        url: `${this.baseUrl(shop)}/orders.json?${params}`,
        headers: this.shopifyHeaders(creds.accessToken),
      },
      ctx
    );
    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }
}

export const shopifyHandler = new ShopifyHandler();
