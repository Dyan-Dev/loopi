import { BaseRestHandler, HandlerContext } from "./base/BaseRestHandler";
import { registerHandler } from "./base/handlerRegistry";

/**
 * ConvertKit API handler
 * API: https://api.convertkit.com/v3/
 */
class ConvertKitHandler extends BaseRestHandler {
  protected serviceName = "ConvertKit";
  private readonly baseUrl = "https://api.convertkit.com/v3";

  constructor() {
    super();
    registerHandler("convertkitAddSubscriber", this.addSubscriber.bind(this));
    registerHandler("convertkitGetSubscriber", this.getSubscriber.bind(this));
    registerHandler("convertkitListSubscribers", this.listSubscribers.bind(this));
  }

  private resolveAuth(step: Record<string, unknown>): { apiSecret: string } {
    const creds = this.resolveCredential(step.credentialId as string, "convertkit", {
      apiSecret: step.apiSecret as string,
    });
    return { apiSecret: creds.apiSecret };
  }

  private async addSubscriber(
    step: Record<string, unknown>,
    ctx: HandlerContext
  ): Promise<unknown> {
    const { apiSecret } = this.resolveAuth(step);
    const formId = this.sub(ctx, step.formId as string);
    const email = this.sub(ctx, step.email as string);

    const data: Record<string, unknown> = {
      api_secret: apiSecret,
      email,
    };
    if (step.firstName) data.first_name = this.sub(ctx, step.firstName as string);

    const result = await this.apiCall(
      {
        method: "POST",
        url: `${this.baseUrl}/forms/${formId}/subscribe`,
        headers: { "Content-Type": "application/json" },
        data,
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async getSubscriber(
    step: Record<string, unknown>,
    ctx: HandlerContext
  ): Promise<unknown> {
    const { apiSecret } = this.resolveAuth(step);
    const subscriberId = this.sub(ctx, step.subscriberId as string);

    const result = await this.apiCall(
      {
        method: "GET",
        url: `${this.baseUrl}/subscribers/${subscriberId}`,
        headers: { "Content-Type": "application/json" },
        params: { api_secret: apiSecret },
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async listSubscribers(
    step: Record<string, unknown>,
    ctx: HandlerContext
  ): Promise<unknown> {
    const { apiSecret } = this.resolveAuth(step);

    const params: Record<string, unknown> = { api_secret: apiSecret };
    if (step.page) params.page = Number(this.sub(ctx, step.page as string));

    const result = await this.apiCall(
      {
        method: "GET",
        url: `${this.baseUrl}/subscribers`,
        headers: { "Content-Type": "application/json" },
        params,
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }
}

export const convertkitHandler = new ConvertKitHandler();
