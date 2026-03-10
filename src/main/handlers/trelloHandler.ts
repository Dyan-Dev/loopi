import { BaseRestHandler, HandlerContext } from "./base/BaseRestHandler";
import { registerHandler } from "./base/handlerRegistry";

/**
 * Trello REST API handler
 * API: https://api.trello.com/1
 */
class TrelloHandler extends BaseRestHandler {
  protected serviceName = "Trello";

  private readonly baseUrl = "https://api.trello.com/1";

  constructor() {
    super();
    registerHandler("trelloCreateCard", this.createCard.bind(this));
    registerHandler("trelloGetCard", this.getCard.bind(this));
    registerHandler("trelloMoveCard", this.moveCard.bind(this));
    registerHandler("trelloListCards", this.listCards.bind(this));
    registerHandler("trelloListBoards", this.listBoards.bind(this));
  }

  private authParams(apiKey: string, apiToken: string): string {
    return `key=${encodeURIComponent(apiKey)}&token=${encodeURIComponent(apiToken)}`;
  }

  private async createCard(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const creds = this.resolveCredential(step.credentialId as string, "trello", {
      apiKey: step.apiKey as string,
      apiToken: step.apiToken as string,
    });
    const auth = this.authParams(creds.apiKey, creds.apiToken);
    const listId = this.sub(ctx, step.listId as string);
    const name = this.sub(ctx, step.name as string);

    const params = new URLSearchParams();
    params.set("idList", listId);
    params.set("name", name);
    if (step.description) params.set("desc", this.sub(ctx, step.description as string));

    const result = await this.apiCall(
      {
        method: "POST",
        url: `${this.baseUrl}/cards?${params.toString()}&${auth}`,
        headers: { "Content-Type": "application/json" },
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async getCard(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const creds = this.resolveCredential(step.credentialId as string, "trello", {
      apiKey: step.apiKey as string,
      apiToken: step.apiToken as string,
    });
    const auth = this.authParams(creds.apiKey, creds.apiToken);
    const cardId = this.sub(ctx, step.cardId as string);

    const result = await this.apiCall(
      {
        method: "GET",
        url: `${this.baseUrl}/cards/${cardId}?${auth}`,
        headers: { "Content-Type": "application/json" },
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async moveCard(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const creds = this.resolveCredential(step.credentialId as string, "trello", {
      apiKey: step.apiKey as string,
      apiToken: step.apiToken as string,
    });
    const auth = this.authParams(creds.apiKey, creds.apiToken);
    const cardId = this.sub(ctx, step.cardId as string);
    const listId = this.sub(ctx, step.listId as string);

    const result = await this.apiCall(
      {
        method: "PUT",
        url: `${this.baseUrl}/cards/${cardId}?idList=${encodeURIComponent(listId)}&${auth}`,
        headers: { "Content-Type": "application/json" },
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async listCards(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const creds = this.resolveCredential(step.credentialId as string, "trello", {
      apiKey: step.apiKey as string,
      apiToken: step.apiToken as string,
    });
    const auth = this.authParams(creds.apiKey, creds.apiToken);
    const listId = this.sub(ctx, step.listId as string);

    const result = await this.apiCall(
      {
        method: "GET",
        url: `${this.baseUrl}/lists/${listId}/cards?${auth}`,
        headers: { "Content-Type": "application/json" },
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async listBoards(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const creds = this.resolveCredential(step.credentialId as string, "trello", {
      apiKey: step.apiKey as string,
      apiToken: step.apiToken as string,
    });
    const auth = this.authParams(creds.apiKey, creds.apiToken);
    const memberId = this.sub(ctx, (step.memberId as string) || "me");

    const result = await this.apiCall(
      {
        method: "GET",
        url: `${this.baseUrl}/members/${memberId}/boards?${auth}`,
        headers: { "Content-Type": "application/json" },
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }
}

export const trelloHandler = new TrelloHandler();
