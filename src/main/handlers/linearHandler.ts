import { BaseRestHandler, HandlerContext } from "./base/BaseRestHandler";
import { registerHandler } from "./base/handlerRegistry";

/**
 * Linear GraphQL API handler
 * API: https://api.linear.app/graphql
 */
class LinearHandler extends BaseRestHandler {
  protected serviceName = "Linear";

  private readonly apiUrl = "https://api.linear.app/graphql";

  constructor() {
    super();
    registerHandler("linearCreateIssue", this.createIssue.bind(this));
    registerHandler("linearGetIssue", this.getIssue.bind(this));
    registerHandler("linearUpdateIssue", this.updateIssue.bind(this));
    registerHandler("linearListIssues", this.listIssues.bind(this));
  }

  private resolveAuth(step: Record<string, unknown>): { apiKey: string } {
    const creds = this.resolveCredential(step.credentialId as string, "linear", {
      apiKey: step.apiKey as string,
    });
    return { apiKey: creds.apiKey };
  }

  private async graphql(
    apiKey: string,
    query: string,
    variables: Record<string, unknown>,
    ctx: HandlerContext
  ): Promise<unknown> {
    const result = await this.apiCall(
      {
        method: "POST",
        url: this.apiUrl,
        headers: this.bearerHeaders(apiKey),
        data: { query, variables },
      },
      ctx
    );
    return result;
  }

  private async createIssue(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const { apiKey } = this.resolveAuth(step);
    const teamId = this.sub(ctx, step.teamId as string);
    const title = this.sub(ctx, step.title as string);

    const input: Record<string, unknown> = { teamId, title };
    if (step.description) input.description = this.sub(ctx, step.description as string);
    if (step.priority) input.priority = Number(this.sub(ctx, step.priority as string));
    if (step.assigneeId) input.assigneeId = this.sub(ctx, step.assigneeId as string);

    const query = `
      mutation IssueCreate($input: IssueCreateInput!) {
        issueCreate(input: $input) {
          success
          issue {
            id
            identifier
            title
            url
          }
        }
      }
    `;

    const result = await this.graphql(apiKey, query, { input }, ctx);
    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async getIssue(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const { apiKey } = this.resolveAuth(step);
    const issueId = this.sub(ctx, step.issueId as string);

    const query = `
      query Issue($id: String!) {
        issue(id: $id) {
          id
          identifier
          title
          description
          priority
          state { name }
          assignee { name email }
          url
        }
      }
    `;

    const result = await this.graphql(apiKey, query, { id: issueId }, ctx);
    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async updateIssue(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const { apiKey } = this.resolveAuth(step);
    const issueId = this.sub(ctx, step.issueId as string);

    const input: Record<string, unknown> = {};
    if (step.title) input.title = this.sub(ctx, step.title as string);
    if (step.description) input.description = this.sub(ctx, step.description as string);
    if (step.stateId) input.stateId = this.sub(ctx, step.stateId as string);
    if (step.priority) input.priority = Number(this.sub(ctx, step.priority as string));

    const query = `
      mutation IssueUpdate($id: String!, $input: IssueUpdateInput!) {
        issueUpdate(id: $id, input: $input) {
          success
          issue {
            id
            identifier
            title
            url
          }
        }
      }
    `;

    const result = await this.graphql(apiKey, query, { id: issueId, input }, ctx);
    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async listIssues(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const { apiKey } = this.resolveAuth(step);

    const filter: Record<string, unknown> = {};
    if (step.teamId) filter.team = { id: { eq: this.sub(ctx, step.teamId as string) } };

    const first = step.first ? Number(this.sub(ctx, step.first as string)) : 50;

    const query = `
      query Issues($filter: IssueFilter, $first: Int) {
        issues(filter: $filter, first: $first) {
          nodes {
            id
            identifier
            title
            priority
            state { name }
            assignee { name }
            url
          }
        }
      }
    `;

    const result = await this.graphql(apiKey, query, { filter, first }, ctx);
    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }
}

export const linearHandler = new LinearHandler();
