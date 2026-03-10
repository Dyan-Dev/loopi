import { BaseRestHandler, HandlerContext } from "./base/BaseRestHandler";
import { registerHandler } from "./base/handlerRegistry";

/**
 * Twilio REST API handler
 * API: https://api.twilio.com/2010-04-01/Accounts/{accountSid}/
 * NOTE: Twilio uses form-encoded POST bodies, not JSON
 */
class TwilioHandler extends BaseRestHandler {
  protected serviceName = "Twilio";

  constructor() {
    super();
    registerHandler("twilioSendSms", this.sendSms.bind(this));
    registerHandler("twilioMakeCall", this.makeCall.bind(this));
    registerHandler("twilioSendWhatsApp", this.sendWhatsApp.bind(this));
  }

  private buildBaseUrl(accountSid: string): string {
    return `https://api.twilio.com/2010-04-01/Accounts/${accountSid}`;
  }

  private formHeaders(accountSid: string, authToken: string): Record<string, string> {
    const encoded = Buffer.from(`${accountSid}:${authToken}`).toString("base64");
    return {
      Authorization: `Basic ${encoded}`,
      "Content-Type": "application/x-www-form-urlencoded",
    };
  }

  private async sendSms(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const creds = this.resolveCredential(step.credentialId as string, "twilio", {
      accountSid: step.accountSid as string,
      authToken: step.authToken as string,
    });
    const accountSid = creds.accountSid;
    const authToken = creds.authToken;
    const to = this.sub(ctx, step.to as string);
    const from = this.sub(ctx, step.from as string);
    const body = this.sub(ctx, step.body as string);

    const params = new URLSearchParams();
    params.set("To", to);
    params.set("From", from);
    params.set("Body", body);

    const result = await this.apiCall(
      {
        method: "POST",
        url: `${this.buildBaseUrl(accountSid)}/Messages.json`,
        headers: this.formHeaders(accountSid, authToken),
        data: params,
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async makeCall(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const creds = this.resolveCredential(step.credentialId as string, "twilio", {
      accountSid: step.accountSid as string,
      authToken: step.authToken as string,
    });
    const accountSid = creds.accountSid;
    const authToken = creds.authToken;
    const to = this.sub(ctx, step.to as string);
    const from = this.sub(ctx, step.from as string);
    const url = this.sub(ctx, step.url as string);

    const params = new URLSearchParams();
    params.set("To", to);
    params.set("From", from);
    params.set("Url", url);

    const result = await this.apiCall(
      {
        method: "POST",
        url: `${this.buildBaseUrl(accountSid)}/Calls.json`,
        headers: this.formHeaders(accountSid, authToken),
        data: params,
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async sendWhatsApp(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const creds = this.resolveCredential(step.credentialId as string, "twilio", {
      accountSid: step.accountSid as string,
      authToken: step.authToken as string,
    });
    const accountSid = creds.accountSid;
    const authToken = creds.authToken;
    const to = this.sub(ctx, step.to as string);
    const from = this.sub(ctx, step.from as string);
    const body = this.sub(ctx, step.body as string);

    const params = new URLSearchParams();
    params.set("To", `whatsapp:${to}`);
    params.set("From", `whatsapp:${from}`);
    params.set("Body", body);

    const result = await this.apiCall(
      {
        method: "POST",
        url: `${this.buildBaseUrl(accountSid)}/Messages.json`,
        headers: this.formHeaders(accountSid, authToken),
        data: params,
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }
}

export const twilioHandler = new TwilioHandler();
