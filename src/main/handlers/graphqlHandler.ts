import { BaseRestHandler, HandlerContext } from "./base/BaseRestHandler";
import { registerHandler } from "./base/handlerRegistry";

/**
 * Generic GraphQL utility handler
 */
class GraphQLHandler extends BaseRestHandler {
  protected serviceName = "GraphQL";

  constructor() {
    super();
    registerHandler("graphqlQuery", this.query.bind(this));
  }

  private resolveAuth(step: Record<string, unknown>): Record<string, string> {
    if (step.credentialId) {
      const creds = this.resolveCredential(step.credentialId as string, "graphql", {
        accessToken: step.accessToken as string,
        apiKey: step.apiKey as string,
      });
      return creds;
    }
    const result: Record<string, string> = {};
    if (step.accessToken) result.accessToken = step.accessToken as string;
    if (step.apiKey) result.apiKey = step.apiKey as string;
    return result;
  }

  private async query(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const auth = this.resolveAuth(step);
    const url = this.sub(ctx, step.url as string);
    const queryText = this.sub(ctx, step.query as string);

    const data: Record<string, unknown> = { query: queryText };
    if (step.variables) data.variables = JSON.parse(this.sub(ctx, step.variables as string));

    let headers: Record<string, string> = { "Content-Type": "application/json" };

    if (auth.accessToken) {
      headers.Authorization = `Bearer ${auth.accessToken}`;
    } else if (auth.apiKey) {
      headers.Authorization = `Bearer ${auth.apiKey}`;
    }

    if (step.headers) {
      const customHeaders = JSON.parse(this.sub(ctx, step.headers as string));
      headers = { ...headers, ...customHeaders };
    }

    const result = await this.apiCall(
      {
        method: "POST",
        url,
        headers,
        data,
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }
}

export const graphqlHandler = new GraphQLHandler();
