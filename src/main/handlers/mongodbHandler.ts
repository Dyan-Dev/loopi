import { BaseRestHandler, HandlerContext } from "./base/BaseRestHandler";
import { registerHandler } from "./base/handlerRegistry";

/**
 * MongoDB handler
 * Uses the mongodb npm package for direct database connections.
 * Install: npm install mongodb
 */
export class MongodbHandler extends BaseRestHandler {
  protected serviceName = "MongoDB";

  private async find(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    let MongoClient;
    try {
      ({ MongoClient } = await import("mongodb"));
    } catch {
      throw new Error("MongoDB driver not installed. Run: npm install mongodb");
    }

    const creds = this.resolveCredential(step.credentialId as string, "mongodb", {
      connectionString: step.connectionString as string,
    });
    const client = new MongoClient(creds.connectionString);
    try {
      await client.connect();
      const db = client.db(this.sub(ctx, step.database as string));
      const collection = db.collection(this.sub(ctx, step.collection as string));

      const filter = step.filter ? JSON.parse(this.sub(ctx, step.filter as string)) : {};
      const options: Record<string, unknown> = {};
      if (step.projection) {
        options.projection = JSON.parse(this.sub(ctx, step.projection as string));
      }

      let cursor = collection.find(filter, options);
      if (step.sort) {
        cursor = cursor.sort(JSON.parse(this.sub(ctx, step.sort as string)));
      }
      if (step.limit) {
        cursor = cursor.limit(Number(step.limit));
      }

      const result = await cursor.toArray();
      this.storeResult(step.storeKey as string, result, ctx.variables);
      return result;
    } finally {
      await client.close();
    }
  }

  private async insertOne(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    let MongoClient;
    try {
      ({ MongoClient } = await import("mongodb"));
    } catch {
      throw new Error("MongoDB driver not installed. Run: npm install mongodb");
    }

    const creds = this.resolveCredential(step.credentialId as string, "mongodb", {
      connectionString: step.connectionString as string,
    });
    const client = new MongoClient(creds.connectionString);
    try {
      await client.connect();
      const db = client.db(this.sub(ctx, step.database as string));
      const collection = db.collection(this.sub(ctx, step.collection as string));

      const document = JSON.parse(this.sub(ctx, step.document as string));
      const result = await collection.insertOne(document);
      const output = { insertedId: result.insertedId, acknowledged: result.acknowledged };
      this.storeResult(step.storeKey as string, output, ctx.variables);
      return output;
    } finally {
      await client.close();
    }
  }

  private async updateOne(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    let MongoClient;
    try {
      ({ MongoClient } = await import("mongodb"));
    } catch {
      throw new Error("MongoDB driver not installed. Run: npm install mongodb");
    }

    const creds = this.resolveCredential(step.credentialId as string, "mongodb", {
      connectionString: step.connectionString as string,
    });
    const client = new MongoClient(creds.connectionString);
    try {
      await client.connect();
      const db = client.db(this.sub(ctx, step.database as string));
      const collection = db.collection(this.sub(ctx, step.collection as string));

      const filter = JSON.parse(this.sub(ctx, step.filter as string));
      const update = JSON.parse(this.sub(ctx, step.update as string));
      const result = await collection.updateOne(filter, update);
      const output = {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount,
        acknowledged: result.acknowledged,
      };
      this.storeResult(step.storeKey as string, output, ctx.variables);
      return output;
    } finally {
      await client.close();
    }
  }

  private async deleteOne(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    let MongoClient;
    try {
      ({ MongoClient } = await import("mongodb"));
    } catch {
      throw new Error("MongoDB driver not installed. Run: npm install mongodb");
    }

    const creds = this.resolveCredential(step.credentialId as string, "mongodb", {
      connectionString: step.connectionString as string,
    });
    const client = new MongoClient(creds.connectionString);
    try {
      await client.connect();
      const db = client.db(this.sub(ctx, step.database as string));
      const collection = db.collection(this.sub(ctx, step.collection as string));

      const filter = JSON.parse(this.sub(ctx, step.filter as string));
      const result = await collection.deleteOne(filter);
      const output = {
        deletedCount: result.deletedCount,
        acknowledged: result.acknowledged,
      };
      this.storeResult(step.storeKey as string, output, ctx.variables);
      return output;
    } finally {
      await client.close();
    }
  }

  private async aggregate(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    let MongoClient;
    try {
      ({ MongoClient } = await import("mongodb"));
    } catch {
      throw new Error("MongoDB driver not installed. Run: npm install mongodb");
    }

    const creds = this.resolveCredential(step.credentialId as string, "mongodb", {
      connectionString: step.connectionString as string,
    });
    const client = new MongoClient(creds.connectionString);
    try {
      await client.connect();
      const db = client.db(this.sub(ctx, step.database as string));
      const collection = db.collection(this.sub(ctx, step.collection as string));

      const pipelineRaw = step.pipeline as string[];
      const pipeline = pipelineRaw.map((stage) => JSON.parse(this.sub(ctx, stage)));
      const result = await collection.aggregate(pipeline).toArray();
      this.storeResult(step.storeKey as string, result, ctx.variables);
      return result;
    } finally {
      await client.close();
    }
  }

  register(): void {
    registerHandler("mongodbFind", (step, ctx) => this.find(step, ctx));
    registerHandler("mongodbInsertOne", (step, ctx) => this.insertOne(step, ctx));
    registerHandler("mongodbUpdateOne", (step, ctx) => this.updateOne(step, ctx));
    registerHandler("mongodbDeleteOne", (step, ctx) => this.deleteOne(step, ctx));
    registerHandler("mongodbAggregate", (step, ctx) => this.aggregate(step, ctx));
  }
}

// Auto-register on import
const handler = new MongodbHandler();
handler.register();
