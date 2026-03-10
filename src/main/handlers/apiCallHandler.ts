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
      contentType?: string;
      timeout?: number;
    },
    substituteVariables: (input?: string) => string,
    variables: Record<string, unknown>
  ): Promise<unknown> {
    try {
      const url = substituteVariables(step.url);
      const method = (step.method || "GET").toUpperCase();
      debugLogger.debug("API Call", `Making ${method} request to: ${url}`);

      const rawBody = step.body ? substituteVariables(step.body) : undefined;
      let data: unknown = undefined;
      if (rawBody) {
        const ct = step.contentType || "json";
        if (ct === "json") {
          try {
            data = JSON.parse(rawBody);
          } catch {
            data = rawBody;
          }
        } else if (ct === "form") {
          data = rawBody; // send as-is, let content-type header handle it
        } else {
          data = rawBody;
        }
      }

      const headers: Record<string, string> = {};
      if (step.headers) {
        for (const [k, v] of Object.entries(step.headers as Record<string, unknown>)) {
          headers[k] = substituteVariables(String(v));
        }
      }

      // Set content-type if not already set
      if (data && !headers["Content-Type"] && !headers["content-type"]) {
        const ct = step.contentType || "json";
        if (ct === "json") headers["Content-Type"] = "application/json";
        else if (ct === "form") headers["Content-Type"] = "application/x-www-form-urlencoded";
        else if (ct === "text") headers["Content-Type"] = "text/plain";
      }

      debugLogger.debug("API Call", `Request headers and data`, { headers, hasBody: !!data });
      const response = await axios({
        method,
        url,
        data,
        headers,
        timeout: step.timeout || 30_000,
        validateStatus: () => true, // don't throw on non-2xx
      });
      const dataOut = response.data;

      debugLogger.debug("API Call", `Response received`, {
        status: response.status,
        dataLength: JSON.stringify(dataOut).length,
      });

      // Store full response info including status
      const responseObj = {
        data: dataOut,
        status: response.status,
        headers: response.headers,
      };

      if (step.storeKey) {
        variables[step.storeKey] = responseObj;
        debugLogger.debug("API Call", `Stored API response in variable: ${step.storeKey}`);
      }

      return responseObj;
    } catch (error) {
      debugLogger.error("API Call", "API call failed", error);
      throw error;
    }
  }
}
