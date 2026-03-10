import { BaseRestHandler, HandlerContext } from "./base/BaseRestHandler";
import { registerHandler } from "./base/handlerRegistry";

const CALENDLY_BASE_URL = "https://api.calendly.com";

/**
 * Calendly API handler
 * API: https://api.calendly.com/
 */
class CalendlyHandler extends BaseRestHandler {
  protected serviceName = "Calendly";

  constructor() {
    super();
    registerHandler("calendlyGetUser", this.getUser.bind(this));
    registerHandler("calendlyListEvents", this.listEvents.bind(this));
    registerHandler("calendlyListEventTypes", this.listEventTypes.bind(this));
  }

  private resolveAuth(step: Record<string, unknown>): { accessToken: string } {
    const creds = this.resolveCredential(step.credentialId as string, "calendly", {
      accessToken: step.accessToken as string,
    });
    return { accessToken: creds.accessToken };
  }

  private async getUser(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const { accessToken } = this.resolveAuth(step);

    const result = await this.apiCall(
      {
        method: "GET",
        url: `${CALENDLY_BASE_URL}/users/me`,
        headers: this.bearerHeaders(accessToken),
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async listEvents(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const { accessToken } = this.resolveAuth(step);
    const userUri = this.sub(ctx, step.userUri as string);

    const params = new URLSearchParams();
    params.set("user", userUri);
    if (step.minStartTime) params.set("min_start_time", this.sub(ctx, step.minStartTime as string));
    if (step.maxStartTime) params.set("max_start_time", this.sub(ctx, step.maxStartTime as string));
    if (step.count) params.set("count", this.sub(ctx, step.count as string));
    const qs = params.toString();

    const result = await this.apiCall(
      {
        method: "GET",
        url: `${CALENDLY_BASE_URL}/scheduled_events${qs ? `?${qs}` : ""}`,
        headers: this.bearerHeaders(accessToken),
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async listEventTypes(
    step: Record<string, unknown>,
    ctx: HandlerContext
  ): Promise<unknown> {
    const { accessToken } = this.resolveAuth(step);
    const userUri = this.sub(ctx, step.userUri as string);

    const params = new URLSearchParams();
    params.set("user", userUri);
    if (step.count) params.set("count", this.sub(ctx, step.count as string));
    const qs = params.toString();

    const result = await this.apiCall(
      {
        method: "GET",
        url: `${CALENDLY_BASE_URL}/event_types${qs ? `?${qs}` : ""}`,
        headers: this.bearerHeaders(accessToken),
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }
}

export const calendlyHandler = new CalendlyHandler();
