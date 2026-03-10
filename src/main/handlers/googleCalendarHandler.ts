import { BaseRestHandler, HandlerContext } from "./base/BaseRestHandler";
import { registerHandler } from "./base/handlerRegistry";

const CALENDAR_BASE_URL = "https://www.googleapis.com/calendar/v3";

/**
 * Google Calendar REST API handler
 * API: https://www.googleapis.com/calendar/v3
 */
class GoogleCalendarHandler extends BaseRestHandler {
  protected serviceName = "Google Calendar";

  constructor() {
    super();
    registerHandler("googleCalendarCreateEvent", this.createEvent.bind(this));
    registerHandler("googleCalendarGetEvents", this.getEvents.bind(this));
    registerHandler("googleCalendarUpdateEvent", this.updateEvent.bind(this));
    registerHandler("googleCalendarDeleteEvent", this.deleteEvent.bind(this));
  }

  private async createEvent(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const creds = this.resolveCredential(step.credentialId as string, "googleCalendar", {
      accessToken: step.accessToken as string,
    });
    const token = creds.accessToken;
    const calendarId = this.sub(ctx, step.calendarId as string) || "primary";

    const body: Record<string, unknown> = {
      summary: this.sub(ctx, step.summary as string),
      start: {
        dateTime: this.sub(ctx, step.startDateTime as string),
        timeZone: step.timeZone ? this.sub(ctx, step.timeZone as string) : undefined,
      },
      end: {
        dateTime: this.sub(ctx, step.endDateTime as string),
        timeZone: step.timeZone ? this.sub(ctx, step.timeZone as string) : undefined,
      },
    };

    if (step.description) body.description = this.sub(ctx, step.description as string);
    if (step.location) body.location = this.sub(ctx, step.location as string);
    if (step.attendees) {
      const emails = this.sub(ctx, step.attendees as string)
        .split(",")
        .map((e) => ({ email: e.trim() }));
      body.attendees = emails;
    }

    const result = await this.apiCall(
      {
        method: "POST",
        url: `${CALENDAR_BASE_URL}/calendars/${encodeURIComponent(calendarId)}/events`,
        headers: this.bearerHeaders(token),
        data: body,
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async getEvents(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const creds = this.resolveCredential(step.credentialId as string, "googleCalendar", {
      accessToken: step.accessToken as string,
    });
    const token = creds.accessToken;
    const calendarId = this.sub(ctx, step.calendarId as string) || "primary";

    const params = new URLSearchParams();
    if (step.timeMin) params.set("timeMin", this.sub(ctx, step.timeMin as string));
    if (step.timeMax) params.set("timeMax", this.sub(ctx, step.timeMax as string));
    if (step.maxResults) params.set("maxResults", this.sub(ctx, step.maxResults as string));
    if (step.q) params.set("q", this.sub(ctx, step.q as string));
    const qs = params.toString();

    const result = await this.apiCall(
      {
        method: "GET",
        url: `${CALENDAR_BASE_URL}/calendars/${encodeURIComponent(calendarId)}/events${qs ? `?${qs}` : ""}`,
        headers: this.bearerHeaders(token),
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async updateEvent(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const creds = this.resolveCredential(step.credentialId as string, "googleCalendar", {
      accessToken: step.accessToken as string,
    });
    const token = creds.accessToken;
    const calendarId = this.sub(ctx, step.calendarId as string) || "primary";
    const eventId = this.sub(ctx, step.eventId as string);

    const body: Record<string, unknown> = {};
    if (step.summary) body.summary = this.sub(ctx, step.summary as string);
    if (step.description) body.description = this.sub(ctx, step.description as string);
    if (step.startDateTime) {
      body.start = { dateTime: this.sub(ctx, step.startDateTime as string) };
    }
    if (step.endDateTime) {
      body.end = { dateTime: this.sub(ctx, step.endDateTime as string) };
    }

    const result = await this.apiCall(
      {
        method: "PATCH",
        url: `${CALENDAR_BASE_URL}/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
        headers: this.bearerHeaders(token),
        data: body,
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async deleteEvent(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const creds = this.resolveCredential(step.credentialId as string, "googleCalendar", {
      accessToken: step.accessToken as string,
    });
    const token = creds.accessToken;
    const calendarId = this.sub(ctx, step.calendarId as string) || "primary";
    const eventId = this.sub(ctx, step.eventId as string);

    const result = await this.apiCall(
      {
        method: "DELETE",
        url: `${CALENDAR_BASE_URL}/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
        headers: this.bearerHeaders(token),
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }
}

export const googleCalendarHandler = new GoogleCalendarHandler();
