import { getCredential } from "@main/credentialsStore";
import { debugLogger } from "@main/debugLogger";
import axios, { type AxiosRequestConfig } from "axios";

export interface HandlerContext {
  substituteVariables: (input?: string) => string;
  variables: Record<string, unknown>;
}

export abstract class BaseRestHandler {
  protected abstract serviceName: string;

  protected resolveCredential(
    credentialId: string | undefined,
    credentialType: string,
    fields: Record<string, string | undefined>
  ): Record<string, string> {
    if (credentialId) {
      const cred = getCredential(credentialId);
      if (cred?.data) return cred.data;
    }
    const result: Record<string, string> = {};
    for (const [key, value] of Object.entries(fields)) {
      if (value) result[key] = value;
    }
    if (Object.keys(result).length === 0) {
      throw new Error(
        `${this.serviceName} credentials required. Add a credential or provide fields directly.`
      );
    }
    return result;
  }

  protected async apiCall(config: AxiosRequestConfig, ctx: HandlerContext): Promise<unknown> {
    debugLogger.debug(this.serviceName, `${config.method?.toUpperCase()} ${config.url}`);
    const response = await axios(config);
    return response.data;
  }

  protected storeResult(
    storeKey: string | undefined,
    result: unknown,
    variables: Record<string, unknown>
  ): void {
    if (storeKey) {
      variables[storeKey] = result;
      debugLogger.debug(this.serviceName, `Stored result in ${storeKey}`);
    }
  }

  protected sub(ctx: HandlerContext, value?: string): string {
    return ctx.substituteVariables(value);
  }

  protected bearerHeaders(token: string): Record<string, string> {
    return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  }

  protected basicHeaders(username: string, password: string): Record<string, string> {
    const encoded = Buffer.from(`${username}:${password}`).toString("base64");
    return { Authorization: `Basic ${encoded}`, "Content-Type": "application/json" };
  }
}
