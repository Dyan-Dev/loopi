import { debugLogger } from "@main/debugLogger";
import axios from "axios";

/**
 * Handles API call automation steps
 */
export class ApiCallHandler {
  async executeApiCall(
    step: {
      url: string;
      method?: string;
      body?: string;
      headers?: Record<string, unknown>;
      storeKey?: string;
    },
    substituteVariables: (input?: string) => string,
    variables: Record<string, unknown>
  ): Promise<unknown> {
    try {
      const url = substituteVariables(step.url);
      const method = step.method || "GET";
      debugLogger.debug("API Call", `Making ${method} request to: ${url}`);

      const rawBody = step.body ? substituteVariables(step.body) : undefined;
      let data: unknown = undefined;
      if (rawBody) {
        try {
          data = JSON.parse(rawBody);
        } catch {
          data = rawBody;
        }
      }

      const headers: Record<string, string> = {};
      if (step.headers) {
        for (const [k, v] of Object.entries(step.headers as Record<string, unknown>)) {
          headers[k] = substituteVariables(String(v));
        }
      }

      debugLogger.debug("API Call", `Request headers and data`, { headers, hasBody: !!data });
      const response = await axios({ method, url, data, headers });
      const dataOut = response.data;

      debugLogger.debug("API Call", `Response received`, {
        status: response.status,
        dataLength: JSON.stringify(dataOut).length,
      });

      if (step.storeKey) {
        variables[step.storeKey] = dataOut;
        debugLogger.debug("API Call", `Stored API response in variable: ${step.storeKey}`);
      }

      return dataOut;
    } catch (error) {
      debugLogger.error("API Call", "API call failed", error);
      throw error;
    }
  }
}
