import { BaseRestHandler, HandlerContext } from "./base/BaseRestHandler";
import { registerHandler } from "./base/handlerRegistry";

/**
 * Snowflake SQL REST API handler
 * API: https://{account}.snowflakecomputing.com/api/v2/
 */
class SnowflakeHandler extends BaseRestHandler {
  protected serviceName = "Snowflake";

  constructor() {
    super();
    registerHandler("snowflakeQuery", this.query.bind(this));
  }

  private resolveAuth(step: Record<string, unknown>): { accessToken: string } {
    const creds = this.resolveCredential(step.credentialId as string, "snowflake", {
      accessToken: step.accessToken as string,
    });
    return { accessToken: creds.accessToken };
  }

  private apiUrl(account: string): string {
    return `https://${account}.snowflakecomputing.com/api/v2`;
  }

  private async query(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const { accessToken } = this.resolveAuth(step);
    const account = this.sub(ctx, step.account as string);
    const queryText = this.sub(ctx, step.query as string);

    const data: Record<string, unknown> = {
      statement: queryText,
    };
    if (step.warehouse) data.warehouse = this.sub(ctx, step.warehouse as string);
    if (step.database) data.database = this.sub(ctx, step.database as string);
    if (step.schema) data.schema = this.sub(ctx, step.schema as string);

    const result = await this.apiCall(
      {
        method: "POST",
        url: `${this.apiUrl(account)}/statements`,
        headers: this.bearerHeaders(accessToken),
        data,
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }
}

export const snowflakeHandler = new SnowflakeHandler();
