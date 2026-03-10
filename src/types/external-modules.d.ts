// Type declarations for optional dynamic imports
// These modules are dynamically imported at runtime and may not be installed
// Using permissive types since these are optional runtime dependencies

declare module "mongodb" {
  export class MongoClient {
    constructor(uri: string);
    connect(): Promise<void>;
    db(name?: string): Db;
    close(): Promise<void>;
  }
  export interface Db {
    collection(name: string): Collection;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export interface Collection<T = any> {
    find(filter?: Record<string, unknown>, options?: Record<string, unknown>): Cursor;
    findOne(filter?: Record<string, unknown>): Promise<T | null>;
    insertOne(
      doc: Record<string, unknown>
    ): Promise<{ insertedId: unknown; acknowledged: boolean }>;
    updateOne(
      filter: Record<string, unknown>,
      update: Record<string, unknown>
    ): Promise<{ modifiedCount: number; matchedCount: number; acknowledged: boolean }>;
    deleteOne(
      filter: Record<string, unknown>
    ): Promise<{ deletedCount: number; acknowledged: boolean }>;
    aggregate(pipeline: Record<string, unknown>[]): Cursor;
  }
  export interface Cursor {
    sort(sort: Record<string, unknown>): Cursor;
    limit(n: number): Cursor;
    toArray(): Promise<Record<string, unknown>[]>;
  }
}

declare module "mysql2/promise" {
  export function createConnection(config: Record<string, unknown>): Promise<Connection>;
  export interface Connection {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    execute(sql: string, values?: unknown[]): Promise<[any, any]>;
    end(): Promise<void>;
  }
}

declare module "ioredis" {
  class Redis {
    constructor(options?: Record<string, unknown>);
    connect(): Promise<void>;
    get(key: string): Promise<string | null>;
    set(key: string, value: string, ...args: unknown[]): Promise<string>;
    del(...keys: string[]): Promise<number>;
    keys(pattern: string): Promise<string[]>;
    hget(key: string, field: string): Promise<string | null>;
    hset(key: string, field: string, value: string): Promise<number>;
    disconnect(): void;
  }
  export default Redis;
}

declare module "@aws-sdk/client-s3" {
  export class S3Client {
    constructor(config: Record<string, unknown>);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    send(command: unknown): Promise<any>;
  }
  export class PutObjectCommand {
    constructor(params: Record<string, unknown>);
  }
  export class GetObjectCommand {
    constructor(params: Record<string, unknown>);
  }
  export class ListObjectsV2Command {
    constructor(params: Record<string, unknown>);
  }
  export class DeleteObjectCommand {
    constructor(params: Record<string, unknown>);
  }
}

declare module "pg" {
  export class Client {
    constructor(config: Record<string, unknown>);
    connect(): Promise<void>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    query(text: string, values?: unknown[]): Promise<any>;
    end(): Promise<void>;
  }
}
