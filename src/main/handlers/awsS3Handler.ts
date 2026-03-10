import { BaseRestHandler, HandlerContext } from "./base/BaseRestHandler";
import { registerHandler } from "./base/handlerRegistry";

/**
 * AWS S3 handler
 * Uses the @aws-sdk/client-s3 npm package.
 * Install: npm install @aws-sdk/client-s3
 */
export class AwsS3Handler extends BaseRestHandler {
  protected serviceName = "AWS S3";

  private async getS3Client(step: Record<string, unknown>, ctx: HandlerContext) {
    let S3Client;
    try {
      ({ S3Client } = await import("@aws-sdk/client-s3"));
    } catch {
      throw new Error("AWS S3 SDK not installed. Run: npm install @aws-sdk/client-s3");
    }

    const creds = this.resolveCredential(step.credentialId as string, "awsS3", {
      accessKeyId: step.accessKeyId as string,
      secretAccessKey: step.secretAccessKey as string,
      region: step.region as string,
    });

    const region = this.sub(ctx, creds.region || "us-east-1");
    const client = new S3Client({
      region,
      credentials: {
        accessKeyId: creds.accessKeyId,
        secretAccessKey: creds.secretAccessKey,
      },
    });
    return client;
  }

  private async putObject(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const { PutObjectCommand } = await import("@aws-sdk/client-s3");
    const client = await this.getS3Client(step, ctx);

    const bucket = this.sub(ctx, step.bucket as string);
    const key = this.sub(ctx, step.key as string);
    const body = this.sub(ctx, step.body as string);

    const params: {
      Bucket: string;
      Key: string;
      Body: string;
      ContentType?: string;
    } = {
      Bucket: bucket,
      Key: key,
      Body: body,
    };
    if (step.contentType) {
      params.ContentType = this.sub(ctx, step.contentType as string);
    }

    const result = await client.send(new PutObjectCommand(params));
    const output = {
      etag: result.ETag,
      versionId: result.VersionId,
    };
    this.storeResult(step.storeKey as string, output, ctx.variables);
    return output;
  }

  private async getObject(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const { GetObjectCommand } = await import("@aws-sdk/client-s3");
    const client = await this.getS3Client(step, ctx);

    const bucket = this.sub(ctx, step.bucket as string);
    const key = this.sub(ctx, step.key as string);

    const result = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));

    const bodyContents = await result.Body?.transformToString();
    const output = {
      body: bodyContents,
      contentType: result.ContentType,
      contentLength: result.ContentLength,
      etag: result.ETag,
      lastModified: result.LastModified?.toISOString(),
    };
    this.storeResult(step.storeKey as string, output, ctx.variables);
    return output;
  }

  private async listObjects(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const { ListObjectsV2Command } = await import("@aws-sdk/client-s3");
    const client = await this.getS3Client(step, ctx);

    const bucket = this.sub(ctx, step.bucket as string);
    const params: {
      Bucket: string;
      Prefix?: string;
      MaxKeys?: number;
    } = { Bucket: bucket };

    if (step.prefix) {
      params.Prefix = this.sub(ctx, step.prefix as string);
    }
    if (step.maxKeys) {
      params.MaxKeys = Number(step.maxKeys);
    }

    const result = await client.send(new ListObjectsV2Command(params));
    const output = {
      contents: result.Contents?.map((obj: Record<string, unknown>) => ({
        key: obj.Key,
        size: obj.Size,
        lastModified:
          obj.LastModified instanceof Date
            ? obj.LastModified.toISOString()
            : String(obj.LastModified || ""),
        etag: obj.ETag,
      })),
      keyCount: result.KeyCount,
      isTruncated: result.IsTruncated,
    };
    this.storeResult(step.storeKey as string, output, ctx.variables);
    return output;
  }

  private async deleteObject(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const { DeleteObjectCommand } = await import("@aws-sdk/client-s3");
    const client = await this.getS3Client(step, ctx);

    const bucket = this.sub(ctx, step.bucket as string);
    const key = this.sub(ctx, step.key as string);

    const result = await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
    const output = {
      deleteMarker: result.DeleteMarker,
      versionId: result.VersionId,
    };
    this.storeResult(step.storeKey as string, output, ctx.variables);
    return output;
  }

  register(): void {
    registerHandler("s3PutObject", (step, ctx) => this.putObject(step, ctx));
    registerHandler("s3GetObject", (step, ctx) => this.getObject(step, ctx));
    registerHandler("s3ListObjects", (step, ctx) => this.listObjects(step, ctx));
    registerHandler("s3DeleteObject", (step, ctx) => this.deleteObject(step, ctx));
  }
}

// Auto-register on import
const handler = new AwsS3Handler();
handler.register();
