import { BaseRestHandler, HandlerContext } from "./base/BaseRestHandler";
import { registerHandler } from "./base/handlerRegistry";

/**
 * Monday.com GraphQL API handler
 * API: https://api.monday.com/v2
 */
class MondayHandler extends BaseRestHandler {
  protected serviceName = "Monday";

  private readonly apiUrl = "https://api.monday.com/v2";

  constructor() {
    super();
    registerHandler("mondayCreateItem", this.createItem.bind(this));
    registerHandler("mondayGetItem", this.getItem.bind(this));
    registerHandler("mondayUpdateItem", this.updateItem.bind(this));
    registerHandler("mondayListItems", this.listItems.bind(this));
  }

  private resolveAuth(step: Record<string, unknown>): { apiToken: string } {
    const creds = this.resolveCredential(step.credentialId as string, "monday", {
      apiToken: step.apiToken as string,
    });
    return { apiToken: creds.apiToken };
  }

  private async createItem(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const { apiToken } = this.resolveAuth(step);
    const boardId = this.sub(ctx, step.boardId as string);
    const itemName = this.sub(ctx, step.itemName as string);
    const columnValues = step.columnValues ? this.sub(ctx, step.columnValues as string) : undefined;

    const query = columnValues
      ? `mutation { create_item (board_id: ${boardId}, item_name: "${itemName}", column_values: ${JSON.stringify(columnValues)}) { id name } }`
      : `mutation { create_item (board_id: ${boardId}, item_name: "${itemName}") { id name } }`;

    const result = await this.apiCall(
      {
        method: "POST",
        url: this.apiUrl,
        headers: this.bearerHeaders(apiToken),
        data: { query },
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async getItem(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const { apiToken } = this.resolveAuth(step);
    const itemId = this.sub(ctx, step.itemId as string);

    const query = `query { items (ids: [${itemId}]) { id name column_values { id title text value } } }`;

    const result = await this.apiCall(
      {
        method: "POST",
        url: this.apiUrl,
        headers: this.bearerHeaders(apiToken),
        data: { query },
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async updateItem(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const { apiToken } = this.resolveAuth(step);
    const boardId = this.sub(ctx, step.boardId as string);
    const itemId = this.sub(ctx, step.itemId as string);
    const columnValues = this.sub(ctx, step.columnValues as string);

    const query = `mutation { change_multiple_column_values (board_id: ${boardId}, item_id: ${itemId}, column_values: ${JSON.stringify(columnValues)}) { id name } }`;

    const result = await this.apiCall(
      {
        method: "POST",
        url: this.apiUrl,
        headers: this.bearerHeaders(apiToken),
        data: { query },
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async listItems(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const { apiToken } = this.resolveAuth(step);
    const boardId = this.sub(ctx, step.boardId as string);
    const limit = step.limit ? Number(this.sub(ctx, step.limit as string)) : 25;

    const query = `query { boards (ids: [${boardId}]) { items_page (limit: ${limit}) { items { id name column_values { id title text value } } } } }`;

    const result = await this.apiCall(
      {
        method: "POST",
        url: this.apiUrl,
        headers: this.bearerHeaders(apiToken),
        data: { query },
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }
}

export const mondayHandler = new MondayHandler();
