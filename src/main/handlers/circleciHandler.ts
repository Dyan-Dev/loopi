import { BaseRestHandler, HandlerContext } from "./base/BaseRestHandler";
import { registerHandler } from "./base/handlerRegistry";

/**
 * CircleCI API handler
 * API: https://circleci.com/api/v2/
 */
class CircleCIHandler extends BaseRestHandler {
  protected serviceName = "CircleCI";
  private readonly baseUrl = "https://circleci.com/api/v2";

  constructor() {
    super();
    registerHandler("circleciGetPipeline", this.getPipeline.bind(this));
    registerHandler("circleciListPipelines", this.listPipelines.bind(this));
    registerHandler("circleciTriggerPipeline", this.triggerPipeline.bind(this));
  }

  private resolveAuth(step: Record<string, unknown>): { apiToken: string } {
    const creds = this.resolveCredential(step.credentialId as string, "circleci", {
      apiToken: step.apiToken as string,
    });
    return { apiToken: creds.apiToken };
  }

  private authHeaders(apiToken: string): Record<string, string> {
    return { "Circle-Token": apiToken, "Content-Type": "application/json" };
  }

  private async getPipeline(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const { apiToken } = this.resolveAuth(step);
    const pipelineId = this.sub(ctx, step.pipelineId as string);

    const result = await this.apiCall(
      {
        method: "GET",
        url: `${this.baseUrl}/pipeline/${pipelineId}`,
        headers: this.authHeaders(apiToken),
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async listPipelines(
    step: Record<string, unknown>,
    ctx: HandlerContext
  ): Promise<unknown> {
    const { apiToken } = this.resolveAuth(step);
    const projectSlug = this.sub(ctx, step.projectSlug as string);

    const result = await this.apiCall(
      {
        method: "GET",
        url: `${this.baseUrl}/project/${projectSlug}/pipeline`,
        headers: this.authHeaders(apiToken),
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async triggerPipeline(
    step: Record<string, unknown>,
    ctx: HandlerContext
  ): Promise<unknown> {
    const { apiToken } = this.resolveAuth(step);
    const projectSlug = this.sub(ctx, step.projectSlug as string);

    const data: Record<string, unknown> = {};
    if (step.branch) data.branch = this.sub(ctx, step.branch as string);
    if (step.parameters) data.parameters = JSON.parse(this.sub(ctx, step.parameters as string));

    const result = await this.apiCall(
      {
        method: "POST",
        url: `${this.baseUrl}/project/${projectSlug}/pipeline`,
        headers: this.authHeaders(apiToken),
        data,
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }
}

export const circleciHandler = new CircleCIHandler();
