import { BaseRestHandler, HandlerContext } from "./base/BaseRestHandler";
import { registerHandler } from "./base/handlerRegistry";

/**
 * Redis handler
 * Uses the ioredis npm package for Redis connections.
 * Install: npm install ioredis
 */
export class RedisHandler extends BaseRestHandler {
  protected serviceName = "Redis";

  private async getClient(step: Record<string, unknown>, ctx: HandlerContext) {
    // biome-ignore lint/suspicious/noExplicitAny: dynamic import
    let Redis: any; // eslint-disable-line
    try {
      const mod = await import("ioredis");
      Redis = mod.default || mod;
    } catch {
      throw new Error("Redis driver not installed. Run: npm install ioredis");
    }

    const creds = this.resolveCredential(step.credentialId as string, "redis", {
      host: step.host as string,
      port: step.port as string,
      password: step.password as string,
    });

    const host = this.sub(ctx, creds.host || "localhost");
    const port = Number(creds.port) || 6379;
    const password = creds.password || undefined;
    const db = step.database !== undefined ? Number(step.database) : 0;

    const client = new Redis({
      host,
      port,
      password,
      db,
      connectTimeout: 10000,
      lazyConnect: true,
    });
    await client.connect();
    return client;
  }

  private async get(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const client = await this.getClient(step, ctx);
    try {
      const key = this.sub(ctx, step.key as string);
      const result = await client.get(key);
      this.storeResult(step.storeKey as string, result, ctx.variables);
      return result;
    } finally {
      await client.quit();
    }
  }

  private async set(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const client = await this.getClient(step, ctx);
    try {
      const key = this.sub(ctx, step.key as string);
      const value = this.sub(ctx, step.value as string);
      let result: string;
      if (step.ttl) {
        result = await client.set(key, value, "EX", Number(step.ttl));
      } else {
        result = await client.set(key, value);
      }
      this.storeResult(step.storeKey as string, result, ctx.variables);
      return result;
    } finally {
      await client.quit();
    }
  }

  private async delete(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const client = await this.getClient(step, ctx);
    try {
      const key = this.sub(ctx, step.key as string);
      const result = await client.del(key);
      this.storeResult(step.storeKey as string, result, ctx.variables);
      return result;
    } finally {
      await client.quit();
    }
  }

  private async keys(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const client = await this.getClient(step, ctx);
    try {
      const pattern = step.pattern ? this.sub(ctx, step.pattern as string) : "*";
      const result = await client.keys(pattern);
      this.storeResult(step.storeKey as string, result, ctx.variables);
      return result;
    } finally {
      await client.quit();
    }
  }

  private async hget(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const client = await this.getClient(step, ctx);
    try {
      const key = this.sub(ctx, step.key as string);
      const field = this.sub(ctx, step.field as string);
      const result = await client.hget(key, field);
      this.storeResult(step.storeKey as string, result, ctx.variables);
      return result;
    } finally {
      await client.quit();
    }
  }

  private async hset(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const client = await this.getClient(step, ctx);
    try {
      const key = this.sub(ctx, step.key as string);
      const field = this.sub(ctx, step.field as string);
      const value = this.sub(ctx, step.value as string);
      const result = await client.hset(key, field, value);
      this.storeResult(step.storeKey as string, result, ctx.variables);
      return result;
    } finally {
      await client.quit();
    }
  }

  register(): void {
    registerHandler("redisGet", (step, ctx) => this.get(step, ctx));
    registerHandler("redisSet", (step, ctx) => this.set(step, ctx));
    registerHandler("redisDelete", (step, ctx) => this.delete(step, ctx));
    registerHandler("redisKeys", (step, ctx) => this.keys(step, ctx));
    registerHandler("redisHget", (step, ctx) => this.hget(step, ctx));
    registerHandler("redisHset", (step, ctx) => this.hset(step, ctx));
  }
}

// Auto-register on import
const handler = new RedisHandler();
handler.register();
