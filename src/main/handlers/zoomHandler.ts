import { BaseRestHandler, HandlerContext } from "./base/BaseRestHandler";
import { registerHandler } from "./base/handlerRegistry";

const ZOOM_BASE_URL = "https://api.zoom.us/v2";

/**
 * Zoom REST API handler
 * API: https://api.zoom.us/v2/
 * Auth: Bearer (OAuth token)
 */
class ZoomHandler extends BaseRestHandler {
  protected serviceName = "Zoom";

  constructor() {
    super();
    registerHandler("zoomCreateMeeting", this.createMeeting.bind(this));
    registerHandler("zoomGetMeeting", this.getMeeting.bind(this));
    registerHandler("zoomListMeetings", this.listMeetings.bind(this));
  }

  private async createMeeting(
    step: Record<string, unknown>,
    ctx: HandlerContext
  ): Promise<unknown> {
    const creds = this.resolveCredential(step.credentialId as string, "zoom", {
      accessToken: step.accessToken as string,
    });
    const token = creds.accessToken;
    const topic = this.sub(ctx, step.topic as string);
    const type = step.type ? Number(this.sub(ctx, step.type as string)) : 2;

    const body: Record<string, unknown> = {
      topic,
      type,
    };

    if (step.startTime) body.start_time = this.sub(ctx, step.startTime as string);
    if (step.duration) body.duration = Number(this.sub(ctx, step.duration as string));
    if (step.timezone) body.timezone = this.sub(ctx, step.timezone as string);

    const result = await this.apiCall(
      {
        method: "POST",
        url: `${ZOOM_BASE_URL}/users/me/meetings`,
        headers: this.bearerHeaders(token),
        data: body,
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async getMeeting(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const creds = this.resolveCredential(step.credentialId as string, "zoom", {
      accessToken: step.accessToken as string,
    });
    const token = creds.accessToken;
    const meetingId = this.sub(ctx, step.meetingId as string);

    const result = await this.apiCall(
      {
        method: "GET",
        url: `${ZOOM_BASE_URL}/meetings/${meetingId}`,
        headers: this.bearerHeaders(token),
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async listMeetings(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const creds = this.resolveCredential(step.credentialId as string, "zoom", {
      accessToken: step.accessToken as string,
    });
    const token = creds.accessToken;
    const userId = this.sub(ctx, step.userId as string) || "me";

    const params = new URLSearchParams();
    if (step.pageSize) params.set("page_size", this.sub(ctx, step.pageSize as string));
    const qs = params.toString();

    const result = await this.apiCall(
      {
        method: "GET",
        url: `${ZOOM_BASE_URL}/users/${userId}/meetings${qs ? `?${qs}` : ""}`,
        headers: this.bearerHeaders(token),
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }
}

export const zoomHandler = new ZoomHandler();
