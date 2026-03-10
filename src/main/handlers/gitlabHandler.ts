import { BaseRestHandler, HandlerContext } from "./base/BaseRestHandler";
import { registerHandler } from "./base/handlerRegistry";

class GitLabHandler extends BaseRestHandler {
  protected serviceName = "GitLab";

  constructor() {
    super();
    registerHandler("gitlabCreateIssue", this.createIssue.bind(this));
    registerHandler("gitlabGetIssue", this.getIssue.bind(this));
    registerHandler("gitlabListIssues", this.listIssues.bind(this));
    registerHandler("gitlabCreateMergeRequest", this.createMergeRequest.bind(this));
  }

  private getBase(step: Record<string, unknown>, ctx: HandlerContext) {
    return (this.sub(ctx, step.baseUrl as string) || "https://gitlab.com") + "/api/v4";
  }

  private headers(token: string) {
    return { "PRIVATE-TOKEN": token, "Content-Type": "application/json" };
  }

  private async createIssue(step: Record<string, unknown>, ctx: HandlerContext) {
    const creds = this.resolveCredential(step.credentialId as string, "gitlab", {
      privateToken: step.privateToken as string,
    });
    const base = this.getBase(step, ctx);
    const projectId = encodeURIComponent(this.sub(ctx, step.projectId as string));
    const body: Record<string, unknown> = { title: this.sub(ctx, step.title as string) };
    if (step.description) body.description = this.sub(ctx, step.description as string);
    if (step.labels) body.labels = this.sub(ctx, step.labels as string);
    if (step.assigneeIds)
      body.assignee_ids = this.sub(ctx, step.assigneeIds as string)
        .split(",")
        .map(Number);
    const result = await this.apiCall(
      {
        method: "POST",
        url: `${base}/projects/${projectId}/issues`,
        headers: this.headers(creds.privateToken),
        data: body,
      },
      ctx
    );
    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async getIssue(step: Record<string, unknown>, ctx: HandlerContext) {
    const creds = this.resolveCredential(step.credentialId as string, "gitlab", {
      privateToken: step.privateToken as string,
    });
    const base = this.getBase(step, ctx);
    const projectId = encodeURIComponent(this.sub(ctx, step.projectId as string));
    const result = await this.apiCall(
      {
        method: "GET",
        url: `${base}/projects/${projectId}/issues/${this.sub(ctx, step.issueIid as string)}`,
        headers: this.headers(creds.privateToken),
      },
      ctx
    );
    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async listIssues(step: Record<string, unknown>, ctx: HandlerContext) {
    const creds = this.resolveCredential(step.credentialId as string, "gitlab", {
      privateToken: step.privateToken as string,
    });
    const base = this.getBase(step, ctx);
    const projectId = encodeURIComponent(this.sub(ctx, step.projectId as string));
    const params = new URLSearchParams();
    if (step.state) params.append("state", this.sub(ctx, step.state as string));
    if (step.labels) params.append("labels", this.sub(ctx, step.labels as string));
    if (step.perPage) params.append("per_page", this.sub(ctx, step.perPage as string));
    const result = await this.apiCall(
      {
        method: "GET",
        url: `${base}/projects/${projectId}/issues?${params}`,
        headers: this.headers(creds.privateToken),
      },
      ctx
    );
    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async createMergeRequest(step: Record<string, unknown>, ctx: HandlerContext) {
    const creds = this.resolveCredential(step.credentialId as string, "gitlab", {
      privateToken: step.privateToken as string,
    });
    const base = this.getBase(step, ctx);
    const projectId = encodeURIComponent(this.sub(ctx, step.projectId as string));
    const body: Record<string, unknown> = {
      source_branch: this.sub(ctx, step.sourceBranch as string),
      target_branch: this.sub(ctx, step.targetBranch as string),
      title: this.sub(ctx, step.title as string),
    };
    if (step.description) body.description = this.sub(ctx, step.description as string);
    const result = await this.apiCall(
      {
        method: "POST",
        url: `${base}/projects/${projectId}/merge_requests`,
        headers: this.headers(creds.privateToken),
        data: body,
      },
      ctx
    );
    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }
}

export const gitlabHandler = new GitLabHandler();
