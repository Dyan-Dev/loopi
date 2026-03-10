import { BaseRestHandler, HandlerContext } from "./base/BaseRestHandler";
import { registerHandler } from "./base/handlerRegistry";

const WHATSAPP_BASE_URL = "https://graph.facebook.com/v18.0";

/**
 * WhatsApp Cloud API handler
 * API: https://graph.facebook.com/v18.0/
 */
class WhatsAppHandler extends BaseRestHandler {
  protected serviceName = "WhatsApp";

  constructor() {
    super();
    registerHandler("whatsappSendMessage", this.sendMessage.bind(this));
    registerHandler("whatsappSendTemplate", this.sendTemplate.bind(this));
    registerHandler("whatsappGetMedia", this.getMedia.bind(this));
  }

  private resolveAuth(step: Record<string, unknown>): { accessToken: string } {
    const creds = this.resolveCredential(step.credentialId as string, "whatsapp", {
      accessToken: step.accessToken as string,
    });
    return { accessToken: creds.accessToken };
  }

  private async sendMessage(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const { accessToken } = this.resolveAuth(step);
    const phoneNumberId = this.sub(ctx, step.phoneNumberId as string);
    const to = this.sub(ctx, step.to as string);
    const messageType = this.sub(ctx, step.messageType as string) || "text";

    const body: Record<string, unknown> = {
      messaging_product: "whatsapp",
      to,
      type: messageType,
    };

    if (messageType === "text") {
      body.text = { body: this.sub(ctx, step.text as string) };
    } else if (messageType === "image") {
      body.image = { link: this.sub(ctx, step.mediaUrl as string) };
    } else if (messageType === "document") {
      body.document = { link: this.sub(ctx, step.mediaUrl as string) };
    }

    const result = await this.apiCall(
      {
        method: "POST",
        url: `${WHATSAPP_BASE_URL}/${phoneNumberId}/messages`,
        headers: this.bearerHeaders(accessToken),
        data: body,
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async sendTemplate(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const { accessToken } = this.resolveAuth(step);
    const phoneNumberId = this.sub(ctx, step.phoneNumberId as string);
    const to = this.sub(ctx, step.to as string);
    const templateName = this.sub(ctx, step.templateName as string);
    const languageCode = this.sub(ctx, step.languageCode as string);

    const template: Record<string, unknown> = {
      name: templateName,
      language: { code: languageCode },
    };

    if (step.components) {
      try {
        template.components = JSON.parse(this.sub(ctx, step.components as string));
      } catch {
        /* ignore parse errors */
      }
    }

    const body: Record<string, unknown> = {
      messaging_product: "whatsapp",
      to,
      type: "template",
      template,
    };

    const result = await this.apiCall(
      {
        method: "POST",
        url: `${WHATSAPP_BASE_URL}/${phoneNumberId}/messages`,
        headers: this.bearerHeaders(accessToken),
        data: body,
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async getMedia(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const { accessToken } = this.resolveAuth(step);
    const mediaId = this.sub(ctx, step.mediaId as string);

    const result = await this.apiCall(
      {
        method: "GET",
        url: `${WHATSAPP_BASE_URL}/${mediaId}`,
        headers: this.bearerHeaders(accessToken),
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }
}

export const whatsappHandler = new WhatsAppHandler();
