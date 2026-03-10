import { BaseRestHandler, HandlerContext } from "./base/BaseRestHandler";
import { registerHandler } from "./base/handlerRegistry";

/**
 * Sentry API handler
 * API: https://sentry.io/api/0/
 */
class SentryHandler extends BaseRestHandler {
  protected serviceName = "Sentry";
  private readonly baseUrl = "https://sentry.io/api/0";

  constructor() {
    super();
    registerHandler("sentryListIssues", this.listIssues.bind(this));
    registerHandler("sentryGetIssue", this.getIssue.bind(this));
    registerHandler("sentryListProjects", this.listProjects.bind(this));
  }

  private resolveAuth(step: Record<string, unknown>): { authToken: string } {
    const creds = this.resolveCredential(step.credentialId as string, "sentry", {
      authToken: step.authToken as string,
    });
    return { authToken: creds.authToken };
  }

  private async listIssues(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const { authToken } = this.resolveAuth(step);
    const organizationSlug = this.sub(ctx, step.organizationSlug as string);
    const projectSlug = this.sub(ctx, step.projectSlug as string);

    const params: Record<string, unknown> = {};
    if (step.query) params.query = this.sub(ctx, step.query as string);

    const result = await this.apiCall(
      {
        method: "GET",
        url: `${this.baseUrl}/projects/${organizationSlug}/${projectSlug}/issues/`,
        headers: this.bearerHeaders(authToken),
        params,
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async getIssue(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const { authToken } = this.resolveAuth(step);
    const issueId = this.sub(ctx, step.issueId as string);

    const result = await this.apiCall(
      {
        method: "GET",
        url: `${this.baseUrl}/issues/${issueId}/`,
        headers: this.bearerHeaders(authToken),
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async listProjects(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const { authToken } = this.resolveAuth(step);
    const organizationSlug = this.sub(ctx, step.organizationSlug as string);

    const result = await this.apiCall(
      {
        method: "GET",
        url: `${this.baseUrl}/organizations/${organizationSlug}/projects/`,
        headers: this.bearerHeaders(authToken),
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }
}

export const sentryHandler = new SentryHandler();
