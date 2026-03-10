import { BaseRestHandler, HandlerContext } from "./base/BaseRestHandler";
import { registerHandler } from "./base/handlerRegistry";

class BoxHandler extends BaseRestHandler {
  protected serviceName = "Box";
  private base = "https://api.box.com/2.0";

  constructor() {
    super();
    registerHandler("boxUploadFile", this.uploadFile.bind(this));
    registerHandler("boxListFiles", this.listFiles.bind(this));
    registerHandler("boxGetFile", this.getFile.bind(this));
    registerHandler("boxDeleteFile", this.deleteFile.bind(this));
  }

  private async uploadFile(step: Record<string, unknown>, ctx: HandlerContext) {
    const creds = this.resolveCredential(step.credentialId as string, "box", {
      accessToken: step.accessToken as string,
    });
    const result = await this.apiCall(
      {
        method: "POST",
        url: "https://upload.box.com/api/2.0/files/content",
        headers: {
          Authorization: `Bearer ${creds.accessToken}`,
          "Content-Type": "application/json",
        },
        data: {
          attributes: JSON.stringify({
            name: this.sub(ctx, step.fileName as string),
            parent: { id: this.sub(ctx, step.folderId as string) || "0" },
          }),
          file: this.sub(ctx, step.content as string),
        },
      },
      ctx
    );
    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async listFiles(step: Record<string, unknown>, ctx: HandlerContext) {
    const creds = this.resolveCredential(step.credentialId as string, "box", {
      accessToken: step.accessToken as string,
    });
    const folderId = this.sub(ctx, step.folderId as string) || "0";
    const params = new URLSearchParams();
    if (step.limit) params.append("limit", this.sub(ctx, step.limit as string));
    const result = await this.apiCall(
      {
        method: "GET",
        url: `${this.base}/folders/${folderId}/items?${params}`,
        headers: this.bearerHeaders(creds.accessToken),
      },
      ctx
    );
    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async getFile(step: Record<string, unknown>, ctx: HandlerContext) {
    const creds = this.resolveCredential(step.credentialId as string, "box", {
      accessToken: step.accessToken as string,
    });
    const result = await this.apiCall(
      {
        method: "GET",
        url: `${this.base}/files/${this.sub(ctx, step.fileId as string)}`,
        headers: this.bearerHeaders(creds.accessToken),
      },
      ctx
    );
    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async deleteFile(step: Record<string, unknown>, ctx: HandlerContext) {
    const creds = this.resolveCredential(step.credentialId as string, "box", {
      accessToken: step.accessToken as string,
    });
    const result = await this.apiCall(
      {
        method: "DELETE",
        url: `${this.base}/files/${this.sub(ctx, step.fileId as string)}`,
        headers: this.bearerHeaders(creds.accessToken),
      },
      ctx
    );
    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }
}

export const boxHandler = new BoxHandler();
