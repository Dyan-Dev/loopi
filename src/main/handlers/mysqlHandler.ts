import { BaseRestHandler, HandlerContext } from "./base/BaseRestHandler";
import { registerHandler } from "./base/handlerRegistry";

/**
 * MySQL handler
 * Uses the mysql2/promise npm package for direct database connections.
 * Install: npm install mysql2
 */
export class MysqlHandler extends BaseRestHandler {
  protected serviceName = "MySQL";

  private resolveConnectionConfig(
    step: Record<string, unknown>,
    ctx: HandlerContext
  ): {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
  } {
    const creds = this.resolveCredential(step.credentialId as string, "mysql", {
      host: step.host as string,
      port: step.port as string,
      database: step.database as string,
      user: step.user as string,
      password: step.password as string,
    });
    return {
      host: this.sub(ctx, creds.host || "localhost"),
      port: Number(creds.port) || 3306,
      database: this.sub(ctx, creds.database),
      user: this.sub(ctx, creds.user),
      password: creds.password,
    };
  }

  private async getConnection(config: {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
  }) {
    let mysql;
    try {
      mysql = await import("mysql2/promise");
    } catch {
      throw new Error("MySQL driver not installed. Run: npm install mysql2");
    }
    const connection = await mysql.createConnection({
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.user,
      password: config.password,
      connectTimeout: 10000,
    });
    return connection;
  }

  private async query(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const config = this.resolveConnectionConfig(step, ctx);
    const query = this.sub(ctx, step.query as string);
    const connection = await this.getConnection(config);
    try {
      const [rows, fields] = await connection.execute(query);
      const output = {
        rows,
        fields: Array.isArray(fields)
          ? fields.map((f: { name: string; type: number }) => ({
              name: f.name,
              type: f.type,
            }))
          : undefined,
      };
      this.storeResult(step.storeKey as string, output, ctx.variables);
      return output;
    } finally {
      await connection.end();
    }
  }

  private async insert(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const config = this.resolveConnectionConfig(step, ctx);
    const table = this.sub(ctx, step.table as string);
    const columns = this.sub(ctx, step.columns as string);
    const valuesRaw = step.values as string;
    const values: string[] = JSON.parse(this.sub(ctx, valuesRaw));

    const placeholders = values.map(() => "?").join(", ");
    const sql = `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`;

    const connection = await this.getConnection(config);
    try {
      const [result] = await connection.execute(sql, values);
      const output = {
        insertId: (result as { insertId: number }).insertId,
        affectedRows: (result as { affectedRows: number }).affectedRows,
      };
      this.storeResult(step.storeKey as string, output, ctx.variables);
      return output;
    } finally {
      await connection.end();
    }
  }

  private async select(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const config = this.resolveConnectionConfig(step, ctx);
    const table = this.sub(ctx, step.table as string);
    const cols = step.columns ? this.sub(ctx, step.columns as string) : "*";

    let sql = `SELECT ${cols} FROM ${table}`;
    if (step.where) sql += ` WHERE ${this.sub(ctx, step.where as string)}`;
    if (step.orderBy) sql += ` ORDER BY ${this.sub(ctx, step.orderBy as string)}`;
    if (step.limit) sql += ` LIMIT ${Number(step.limit)}`;

    const connection = await this.getConnection(config);
    try {
      const [rows] = await connection.execute(sql);
      const output = { rows };
      this.storeResult(step.storeKey as string, output, ctx.variables);
      return output;
    } finally {
      await connection.end();
    }
  }

  private async update(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const config = this.resolveConnectionConfig(step, ctx);
    const table = this.sub(ctx, step.table as string);
    const setObj: Record<string, unknown> = JSON.parse(this.sub(ctx, step.set as string));
    const where = this.sub(ctx, step.where as string);

    const setClauses: string[] = [];
    const setValues: unknown[] = [];
    for (const [key, value] of Object.entries(setObj)) {
      setClauses.push(`${key} = ?`);
      setValues.push(value);
    }

    const sql = `UPDATE ${table} SET ${setClauses.join(", ")} WHERE ${where}`;

    const connection = await this.getConnection(config);
    try {
      const [result] = await connection.execute(sql, setValues);
      const output = {
        affectedRows: (result as { affectedRows: number }).affectedRows,
        changedRows: (result as { changedRows: number }).changedRows,
      };
      this.storeResult(step.storeKey as string, output, ctx.variables);
      return output;
    } finally {
      await connection.end();
    }
  }

  register(): void {
    registerHandler("mysqlQuery", (step, ctx) => this.query(step, ctx));
    registerHandler("mysqlInsert", (step, ctx) => this.insert(step, ctx));
    registerHandler("mysqlSelect", (step, ctx) => this.select(step, ctx));
    registerHandler("mysqlUpdate", (step, ctx) => this.update(step, ctx));
  }
}

// Auto-register on import
const handler = new MysqlHandler();
handler.register();
