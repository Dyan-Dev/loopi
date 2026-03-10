import { BaseRestHandler, HandlerContext } from "./base/BaseRestHandler";
import { registerHandler } from "./base/handlerRegistry";

const TYPEFORM_BASE_URL = "https://api.typeform.com";

/**
 * Typeform API handler
 * API: https://api.typeform.com/
 */
class TypeformHandler extends BaseRestHandler {
  protected serviceName = "Typeform";

  constructor() {
    super();
    registerHandler("typeformGetForm", this.getForm.bind(this));
    registerHandler("typeformListForms", this.listForms.bind(this));
    registerHandler("typeformGetResponses", this.getResponses.bind(this));
  }

  private resolveAuth(step: Record<string, unknown>): { accessToken: string } {
    const creds = this.resolveCredential(step.credentialId as string, "typeform", {
      accessToken: step.accessToken as string,
    });
    return { accessToken: creds.accessToken };
  }

  private async getForm(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const { accessToken } = this.resolveAuth(step);
    const formId = this.sub(ctx, step.formId as string);

    const result = await this.apiCall(
      {
        method: "GET",
        url: `${TYPEFORM_BASE_URL}/forms/${formId}`,
        headers: this.bearerHeaders(accessToken),
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async listForms(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const { accessToken } = this.resolveAuth(step);

    const params = new URLSearchParams();
    if (step.pageSize) params.set("page_size", this.sub(ctx, step.pageSize as string));
    const qs = params.toString();

    const result = await this.apiCall(
      {
        method: "GET",
        url: `${TYPEFORM_BASE_URL}/forms${qs ? `?${qs}` : ""}`,
        headers: this.bearerHeaders(accessToken),
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async getResponses(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const { accessToken } = this.resolveAuth(step);
    const formId = this.sub(ctx, step.formId as string);

    const params = new URLSearchParams();
    if (step.pageSize) params.set("page_size", this.sub(ctx, step.pageSize as string));
    if (step.since) params.set("since", this.sub(ctx, step.since as string));
    const qs = params.toString();

    const result = await this.apiCall(
      {
        method: "GET",
        url: `${TYPEFORM_BASE_URL}/forms/${formId}/responses${qs ? `?${qs}` : ""}`,
        headers: this.bearerHeaders(accessToken),
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }
}

export const typeformHandler = new TypeformHandler();
