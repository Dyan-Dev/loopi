import { getCredential } from "@main/credentialsStore";
import { debugLogger } from "@main/debugLogger";

/**
 * PostgreSQL handler
 * Uses pg library for direct database connections
 */
export class PostgresHandler {
  private async resolveCredentials(step: {
    credentialId?: string;
    host?: string;
    port?: string;
    database?: string;
    user?: string;
    password?: string;
    ssl?: boolean;
  }): Promise<{
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
    ssl: boolean;
  }> {
    if (step.credentialId) {
      const cred = getCredential(step.credentialId);
      if (cred?.data) {
        return {
          host: cred.data.host || "localhost",
          port: Number(cred.data.port) || 5432,
          database: cred.data.database || "postgres",
          user: cred.data.user || "postgres",
          password: cred.data.password || "",
          ssl: cred.data.ssl === "true",
        };
      }
    }
    return {
      host: step.host || "localhost",
      port: Number(step.port) || 5432,
      database: step.database || "postgres",
      user: step.user || "postgres",
      password: step.password || "",
      ssl: step.ssl || false,
    };
  }

  private async getClient(connectionConfig: {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
    ssl: boolean;
  }) {
    // Dynamic import to avoid requiring pg when not used
    const { Client } = await import("pg");
    const client = new Client({
      host: connectionConfig.host,
      port: connectionConfig.port,
      database: connectionConfig.database,
      user: connectionConfig.user,
      password: connectionConfig.password,
      ssl: connectionConfig.ssl ? { rejectUnauthorized: false } : false,
      connectionTimeoutMillis: 10000,
    });
    await client.connect();
    return client;
  }

  async executeQuery(
    step: {
      query: string;
      credentialId?: string;
      host?: string;
      port?: string;
      database?: string;
      user?: string;
      password?: string;
      ssl?: boolean;
      storeKey?: string;
    },
    substituteVariables: (input?: string) => string,
    variables: Record<string, unknown>
  ): Promise<unknown> {
    const config = await this.resolveCredentials(step);
    const query = substituteVariables(step.query);
    debugLogger.debug("Postgres", `Executing query: ${query.substring(0, 100)}...`);

    const client = await this.getClient(config);
    try {
      const result = await client.query(query);
      const output = {
        rows: result.rows,
        rowCount: result.rowCount,
        fields: result.fields?.map((f: { name: string; dataTypeID: number }) => ({
          name: f.name,
          dataTypeID: f.dataTypeID,
        })),
      };
      if (step.storeKey) variables[step.storeKey] = output;
      debugLogger.debug("Postgres", `Query returned ${result.rowCount} rows`);
      return output;
    } finally {
      await client.end();
    }
  }

  async executeInsert(
    step: {
      table: string;
      columns: string;
      values: string;
      returning?: string;
      credentialId?: string;
      host?: string;
      port?: string;
      database?: string;
      user?: string;
      password?: string;
      ssl?: boolean;
      storeKey?: string;
    },
    substituteVariables: (input?: string) => string,
    variables: Record<string, unknown>
  ): Promise<unknown> {
    const config = await this.resolveCredentials(step);
    const table = substituteVariables(step.table);
    const columns = substituteVariables(step.columns);
    const values = substituteVariables(step.values);
    const returning = step.returning ? ` RETURNING ${substituteVariables(step.returning)}` : "";

    const query = `INSERT INTO ${table} (${columns}) VALUES (${values})${returning}`;
    debugLogger.debug("Postgres", `Insert into ${table}`);

    const client = await this.getClient(config);
    try {
      const result = await client.query(query);
      const output = { rows: result.rows, rowCount: result.rowCount };
      if (step.storeKey) variables[step.storeKey] = output;
      return output;
    } finally {
      await client.end();
    }
  }

  async executeSelect(
    step: {
      table: string;
      columns?: string;
      where?: string;
      orderBy?: string;
      limit?: string;
      credentialId?: string;
      host?: string;
      port?: string;
      database?: string;
      user?: string;
      password?: string;
      ssl?: boolean;
      storeKey?: string;
    },
    substituteVariables: (input?: string) => string,
    variables: Record<string, unknown>
  ): Promise<unknown> {
    const config = await this.resolveCredentials(step);
    const table = substituteVariables(step.table);
    const cols = step.columns ? substituteVariables(step.columns) : "*";
    let query = `SELECT ${cols} FROM ${table}`;
    if (step.where) query += ` WHERE ${substituteVariables(step.where)}`;
    if (step.orderBy) query += ` ORDER BY ${substituteVariables(step.orderBy)}`;
    if (step.limit) query += ` LIMIT ${substituteVariables(step.limit)}`;

    debugLogger.debug("Postgres", `Select from ${table}`);

    const client = await this.getClient(config);
    try {
      const result = await client.query(query);
      const output = { rows: result.rows, rowCount: result.rowCount };
      if (step.storeKey) variables[step.storeKey] = output;
      return output;
    } finally {
      await client.end();
    }
  }

  async executeUpdate(
    step: {
      table: string;
      set: string;
      where: string;
      returning?: string;
      credentialId?: string;
      host?: string;
      port?: string;
      database?: string;
      user?: string;
      password?: string;
      ssl?: boolean;
      storeKey?: string;
    },
    substituteVariables: (input?: string) => string,
    variables: Record<string, unknown>
  ): Promise<unknown> {
    const config = await this.resolveCredentials(step);
    const table = substituteVariables(step.table);
    const set = substituteVariables(step.set);
    const where = substituteVariables(step.where);
    const returning = step.returning ? ` RETURNING ${substituteVariables(step.returning)}` : "";

    const query = `UPDATE ${table} SET ${set} WHERE ${where}${returning}`;
    debugLogger.debug("Postgres", `Update ${table}`);

    const client = await this.getClient(config);
    try {
      const result = await client.query(query);
      const output = { rows: result.rows, rowCount: result.rowCount };
      if (step.storeKey) variables[step.storeKey] = output;
      return output;
    } finally {
      await client.end();
    }
  }
}
