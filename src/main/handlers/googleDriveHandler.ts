import { BaseRestHandler, HandlerContext } from "./base/BaseRestHandler";
import { registerHandler } from "./base/handlerRegistry";

const DRIVE_BASE_URL = "https://www.googleapis.com/drive/v3";
const DRIVE_UPLOAD_URL = "https://www.googleapis.com/upload/drive/v3";

/**
 * Google Drive REST API handler
 * API: https://www.googleapis.com/drive/v3
 */
class GoogleDriveHandler extends BaseRestHandler {
  protected serviceName = "Google Drive";

  constructor() {
    super();
    registerHandler("googleDriveUploadFile", this.uploadFile.bind(this));
    registerHandler("googleDriveListFiles", this.listFiles.bind(this));
    registerHandler("googleDriveCreateFolder", this.createFolder.bind(this));
    registerHandler("googleDriveDeleteFile", this.deleteFile.bind(this));
  }

  private async uploadFile(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const creds = this.resolveCredential(step.credentialId as string, "googleDrive", {
      accessToken: step.accessToken as string,
    });
    const token = creds.accessToken;
    const fileName = this.sub(ctx, step.fileName as string);
    const mimeType = this.sub(ctx, step.mimeType as string);
    const content = this.sub(ctx, step.content as string);

    const metadata: Record<string, unknown> = { name: fileName, mimeType };
    if (step.folderId) {
      metadata.parents = [this.sub(ctx, step.folderId as string)];
    }

    const boundary = "loopi_multipart_boundary";
    const delimiter = `--${boundary}`;
    const closeDelimiter = `--${boundary}--`;

    const multipartBody = [
      delimiter,
      "Content-Type: application/json; charset=UTF-8",
      "",
      JSON.stringify(metadata),
      delimiter,
      `Content-Type: ${mimeType}`,
      "Content-Transfer-Encoding: base64",
      "",
      content,
      closeDelimiter,
    ].join("\r\n");

    const result = await this.apiCall(
      {
        method: "POST",
        url: `${DRIVE_UPLOAD_URL}/files?uploadType=multipart`,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": `multipart/related; boundary=${boundary}`,
        },
        data: multipartBody,
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async listFiles(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const creds = this.resolveCredential(step.credentialId as string, "googleDrive", {
      accessToken: step.accessToken as string,
    });
    const token = creds.accessToken;

    const params = new URLSearchParams();
    if (step.query) {
      params.set("q", this.sub(ctx, step.query as string));
    } else if (step.folderId) {
      params.set("q", `'${this.sub(ctx, step.folderId as string)}' in parents`);
    }
    if (step.pageSize) params.set("pageSize", this.sub(ctx, step.pageSize as string));
    const qs = params.toString();

    const result = await this.apiCall(
      {
        method: "GET",
        url: `${DRIVE_BASE_URL}/files${qs ? `?${qs}` : ""}`,
        headers: this.bearerHeaders(token),
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async createFolder(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const creds = this.resolveCredential(step.credentialId as string, "googleDrive", {
      accessToken: step.accessToken as string,
    });
    const token = creds.accessToken;
    const name = this.sub(ctx, step.name as string);

    const body: Record<string, unknown> = {
      name,
      mimeType: "application/vnd.google-apps.folder",
    };
    if (step.parentId) {
      body.parents = [this.sub(ctx, step.parentId as string)];
    }

    const result = await this.apiCall(
      {
        method: "POST",
        url: `${DRIVE_BASE_URL}/files`,
        headers: this.bearerHeaders(token),
        data: body,
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async deleteFile(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const creds = this.resolveCredential(step.credentialId as string, "googleDrive", {
      accessToken: step.accessToken as string,
    });
    const token = creds.accessToken;
    const fileId = this.sub(ctx, step.fileId as string);

    const result = await this.apiCall(
      {
        method: "DELETE",
        url: `${DRIVE_BASE_URL}/files/${encodeURIComponent(fileId)}`,
        headers: this.bearerHeaders(token),
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }
}

export const googleDriveHandler = new GoogleDriveHandler();
