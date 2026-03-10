import { BaseRestHandler, HandlerContext } from "./base/BaseRestHandler";
import { registerHandler } from "./base/handlerRegistry";

class DropboxHandler extends BaseRestHandler {
  protected serviceName = "Dropbox";

  constructor() {
    super();
    registerHandler("dropboxUploadFile", this.uploadFile.bind(this));
    registerHandler("dropboxListFiles", this.listFiles.bind(this));
    registerHandler("dropboxDownloadFile", this.downloadFile.bind(this));
    registerHandler("dropboxDeleteFile", this.deleteFile.bind(this));
  }

  private async uploadFile(step: Record<string, unknown>, ctx: HandlerContext) {
    const creds = this.resolveCredential(step.credentialId as string, "dropbox", {
      accessToken: step.accessToken as string,
    });
    const path = this.sub(ctx, step.path as string);
    const mode = (step.mode as string) || "add";
    const result = await this.apiCall(
      {
        method: "POST",
        url: "https://content.dropboxapi.com/2/files/upload",
        headers: {
          Authorization: `Bearer ${creds.accessToken}`,
          "Content-Type": "application/octet-stream",
          "Dropbox-API-Arg": JSON.stringify({ path, mode, autorename: true }),
        },
        data: this.sub(ctx, step.content as string),
      },
      ctx
    );
    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async listFiles(step: Record<string, unknown>, ctx: HandlerContext) {
    const creds = this.resolveCredential(step.credentialId as string, "dropbox", {
      accessToken: step.accessToken as string,
    });
    const result = await this.apiCall(
      {
        method: "POST",
        url: "https://api.dropboxapi.com/2/files/list_folder",
        headers: this.bearerHeaders(creds.accessToken),
        data: { path: this.sub(ctx, step.path as string) || "" },
      },
      ctx
    );
    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async downloadFile(step: Record<string, unknown>, ctx: HandlerContext) {
    const creds = this.resolveCredential(step.credentialId as string, "dropbox", {
      accessToken: step.accessToken as string,
    });
    const result = await this.apiCall(
      {
        method: "POST",
        url: "https://content.dropboxapi.com/2/files/download",
        headers: {
          Authorization: `Bearer ${creds.accessToken}`,
          "Dropbox-API-Arg": JSON.stringify({ path: this.sub(ctx, step.path as string) }),
        },
      },
      ctx
    );
    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async deleteFile(step: Record<string, unknown>, ctx: HandlerContext) {
    const creds = this.resolveCredential(step.credentialId as string, "dropbox", {
      accessToken: step.accessToken as string,
    });
    const result = await this.apiCall(
      {
        method: "POST",
        url: "https://api.dropboxapi.com/2/files/delete_v2",
        headers: this.bearerHeaders(creds.accessToken),
        data: { path: this.sub(ctx, step.path as string) },
      },
      ctx
    );
    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }
}

export const dropboxHandler = new DropboxHandler();
