import { BaseRestHandler, HandlerContext } from "./base/BaseRestHandler";
import { registerHandler } from "./base/handlerRegistry";

/**
 * Jenkins API handler
 * API: {baseUrl}/
 */
class JenkinsHandler extends BaseRestHandler {
  protected serviceName = "Jenkins";

  constructor() {
    super();
    registerHandler("jenkinsTriggerBuild", this.triggerBuild.bind(this));
    registerHandler("jenkinsGetBuild", this.getBuild.bind(this));
    registerHandler("jenkinsListJobs", this.listJobs.bind(this));
  }

  private resolveAuth(step: Record<string, unknown>): { username: string; apiToken: string } {
    const creds = this.resolveCredential(step.credentialId as string, "jenkins", {
      username: step.username as string,
      apiToken: step.apiToken as string,
    });
    return { username: creds.username, apiToken: creds.apiToken };
  }

  private apiUrl(baseUrl: string): string {
    return baseUrl.replace(/\/+$/, "");
  }

  private async triggerBuild(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const { username, apiToken } = this.resolveAuth(step);
    const baseUrl = this.sub(ctx, step.baseUrl as string);
    const jobName = this.sub(ctx, step.jobName as string);

    let url: string;
    let data: Record<string, unknown> | undefined;

    if (step.parameters) {
      const params = JSON.parse(this.sub(ctx, step.parameters as string));
      url = `${this.apiUrl(baseUrl)}/job/${jobName}/buildWithParameters`;
      data = params;
    } else {
      url = `${this.apiUrl(baseUrl)}/job/${jobName}/build`;
    }

    const result = await this.apiCall(
      {
        method: "POST",
        url,
        headers: this.basicHeaders(username, apiToken),
        data,
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async getBuild(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const { username, apiToken } = this.resolveAuth(step);
    const baseUrl = this.sub(ctx, step.baseUrl as string);
    const jobName = this.sub(ctx, step.jobName as string);
    const buildNumber = this.sub(ctx, step.buildNumber as string);

    const result = await this.apiCall(
      {
        method: "GET",
        url: `${this.apiUrl(baseUrl)}/job/${jobName}/${buildNumber}/api/json`,
        headers: this.basicHeaders(username, apiToken),
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async listJobs(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const { username, apiToken } = this.resolveAuth(step);
    const baseUrl = this.sub(ctx, step.baseUrl as string);

    const result = await this.apiCall(
      {
        method: "GET",
        url: `${this.apiUrl(baseUrl)}/api/json`,
        headers: this.basicHeaders(username, apiToken),
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }
}

export const jenkinsHandler = new JenkinsHandler();
