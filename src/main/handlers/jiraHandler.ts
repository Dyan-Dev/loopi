import { BaseRestHandler, HandlerContext } from "./base/BaseRestHandler";
import { registerHandler } from "./base/handlerRegistry";

/**
 * Jira REST API handler
 * API: https://{domain}/rest/api/3/
 */
class JiraHandler extends BaseRestHandler {
  protected serviceName = "Jira";

  constructor() {
    super();
    registerHandler("jiraCreateIssue", this.createIssue.bind(this));
    registerHandler("jiraGetIssue", this.getIssue.bind(this));
    registerHandler("jiraUpdateIssue", this.updateIssue.bind(this));
    registerHandler("jiraAddComment", this.addComment.bind(this));
    registerHandler("jiraListIssues", this.listIssues.bind(this));
  }

  private resolveAuth(step: Record<string, unknown>): { email: string; apiToken: string } {
    const creds = this.resolveCredential(step.credentialId as string, "jira", {
      email: step.email as string,
      apiToken: step.apiToken as string,
    });
    return { email: creds.email, apiToken: creds.apiToken };
  }

  private baseUrl(domain: string): string {
    return `https://${domain}/rest/api/3`;
  }

  private async createIssue(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const { email, apiToken } = this.resolveAuth(step);
    const domain = this.sub(ctx, step.domain as string);
    const projectKey = this.sub(ctx, step.projectKey as string);
    const issueType = this.sub(ctx, step.issueType as string);
    const summary = this.sub(ctx, step.summary as string);

    const issueFields: Record<string, unknown> = {
      project: { key: projectKey },
      issuetype: { name: issueType },
      summary,
    };

    if (step.description) {
      issueFields.description = {
        type: "doc",
        version: 1,
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: this.sub(ctx, step.description as string) }],
          },
        ],
      };
    }
    if (step.priority) issueFields.priority = { name: this.sub(ctx, step.priority as string) };
    if (step.assignee) issueFields.assignee = { accountId: this.sub(ctx, step.assignee as string) };

    const result = await this.apiCall(
      {
        method: "POST",
        url: `${this.baseUrl(domain)}/issue`,
        headers: this.basicHeaders(email, apiToken),
        data: { fields: issueFields },
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async getIssue(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const { email, apiToken } = this.resolveAuth(step);
    const domain = this.sub(ctx, step.domain as string);
    const issueKey = this.sub(ctx, step.issueKey as string);

    const result = await this.apiCall(
      {
        method: "GET",
        url: `${this.baseUrl(domain)}/issue/${issueKey}`,
        headers: this.basicHeaders(email, apiToken),
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async updateIssue(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const { email, apiToken } = this.resolveAuth(step);
    const domain = this.sub(ctx, step.domain as string);
    const issueKey = this.sub(ctx, step.issueKey as string);
    const fields = JSON.parse(this.sub(ctx, step.fields as string));

    const result = await this.apiCall(
      {
        method: "PUT",
        url: `${this.baseUrl(domain)}/issue/${issueKey}`,
        headers: this.basicHeaders(email, apiToken),
        data: { fields },
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async addComment(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const { email, apiToken } = this.resolveAuth(step);
    const domain = this.sub(ctx, step.domain as string);
    const issueKey = this.sub(ctx, step.issueKey as string);
    const bodyText = this.sub(ctx, step.body as string);

    const result = await this.apiCall(
      {
        method: "POST",
        url: `${this.baseUrl(domain)}/issue/${issueKey}/comment`,
        headers: this.basicHeaders(email, apiToken),
        data: {
          body: {
            type: "doc",
            version: 1,
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: bodyText }],
              },
            ],
          },
        },
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async listIssues(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const { email, apiToken } = this.resolveAuth(step);
    const domain = this.sub(ctx, step.domain as string);

    const body: Record<string, unknown> = {};
    if (step.jql) body.jql = this.sub(ctx, step.jql as string);
    if (step.maxResults) body.maxResults = Number(this.sub(ctx, step.maxResults as string));

    const result = await this.apiCall(
      {
        method: "POST",
        url: `${this.baseUrl(domain)}/search`,
        headers: this.basicHeaders(email, apiToken),
        data: body,
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }
}

export const jiraHandler = new JiraHandler();
