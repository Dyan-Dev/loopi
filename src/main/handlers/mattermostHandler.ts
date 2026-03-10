import { BaseRestHandler, HandlerContext } from "./base/BaseRestHandler";
import { registerHandler } from "./base/handlerRegistry";

/**
 * Mattermost API handler
 * API: {baseUrl}/api/v4/
 */
class MattermostHandler extends BaseRestHandler {
  protected serviceName = "Mattermost";

  constructor() {
    super();
    registerHandler("mattermostSendMessage", this.sendMessage.bind(this));
    registerHandler("mattermostGetChannel", this.getChannel.bind(this));
    registerHandler("mattermostListChannels", this.listChannels.bind(this));
  }

  private resolveAuth(step: Record<string, unknown>): { accessToken: string } {
    const creds = this.resolveCredential(step.credentialId as string, "mattermost", {
      accessToken: step.accessToken as string,
    });
    return { accessToken: creds.accessToken };
  }

  private apiUrl(baseUrl: string): string {
    return `${baseUrl.replace(/\/+$/, "")}/api/v4`;
  }

  private async sendMessage(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const { accessToken } = this.resolveAuth(step);
    const baseUrl = this.sub(ctx, step.baseUrl as string);
    const channelId = this.sub(ctx, step.channelId as string);
    const message = this.sub(ctx, step.message as string);

    const result = await this.apiCall(
      {
        method: "POST",
        url: `${this.apiUrl(baseUrl)}/posts`,
        headers: this.bearerHeaders(accessToken),
        data: { channel_id: channelId, message },
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async getChannel(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const { accessToken } = this.resolveAuth(step);
    const baseUrl = this.sub(ctx, step.baseUrl as string);
    const channelId = this.sub(ctx, step.channelId as string);

    const result = await this.apiCall(
      {
        method: "GET",
        url: `${this.apiUrl(baseUrl)}/channels/${channelId}`,
        headers: this.bearerHeaders(accessToken),
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async listChannels(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const { accessToken } = this.resolveAuth(step);
    const baseUrl = this.sub(ctx, step.baseUrl as string);
    const teamId = this.sub(ctx, step.teamId as string);

    const result = await this.apiCall(
      {
        method: "GET",
        url: `${this.apiUrl(baseUrl)}/teams/${teamId}/channels`,
        headers: this.bearerHeaders(accessToken),
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }
}

export const mattermostHandler = new MattermostHandler();
