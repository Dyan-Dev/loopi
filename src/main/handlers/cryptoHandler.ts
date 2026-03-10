import crypto from "crypto";
import { BaseRestHandler, HandlerContext } from "./base/BaseRestHandler";
import { registerHandler } from "./base/handlerRegistry";

/**
 * Crypto utilities handler (no external API)
 * Uses Node.js crypto module for hashing, HMAC, encryption, and decryption.
 */
class CryptoHandler extends BaseRestHandler {
  protected serviceName = "Crypto";

  constructor() {
    super();
    registerHandler("cryptoHash", this.hash.bind(this));
    registerHandler("cryptoHmac", this.hmac.bind(this));
    registerHandler("cryptoEncrypt", this.encrypt.bind(this));
    registerHandler("cryptoDecrypt", this.decrypt.bind(this));
  }

  private async hash(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const algorithm = this.sub(ctx, step.algorithm as string);
    const data = this.sub(ctx, step.data as string);
    const encoding = (this.sub(ctx, step.encoding as string) ||
      "hex") as crypto.BinaryToTextEncoding;

    const hash = crypto.createHash(algorithm).update(data).digest(encoding);
    const result = { hash, algorithm, encoding };

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async hmac(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const algorithm = this.sub(ctx, step.algorithm as string);
    const data = this.sub(ctx, step.data as string);
    const secret = this.sub(ctx, step.secret as string);
    const encoding = (this.sub(ctx, step.encoding as string) ||
      "hex") as crypto.BinaryToTextEncoding;

    const hmac = crypto.createHmac(algorithm, secret).update(data).digest(encoding);
    const result = { hmac, algorithm, encoding };

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async encrypt(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const algorithm = this.sub(ctx, step.algorithm as string) || "aes-256-cbc";
    const data = this.sub(ctx, step.data as string);
    const key = this.sub(ctx, step.key as string);

    const keyBuffer = crypto.createHash("sha256").update(key).digest();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, keyBuffer, iv);

    let encrypted = cipher.update(data, "utf8", "hex");
    encrypted += cipher.final("hex");

    const result = {
      encrypted,
      iv: iv.toString("hex"),
      algorithm,
    };

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async decrypt(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const algorithm = this.sub(ctx, step.algorithm as string) || "aes-256-cbc";
    const data = this.sub(ctx, step.data as string);
    const key = this.sub(ctx, step.key as string);

    const parsed = JSON.parse(data);
    const keyBuffer = crypto.createHash("sha256").update(key).digest();
    const iv = Buffer.from(parsed.iv, "hex");
    const decipher = crypto.createDecipheriv(algorithm, keyBuffer, iv);

    let decrypted = decipher.update(parsed.encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    const result = { decrypted, algorithm };

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }
}

export const cryptoHandler = new CryptoHandler();
