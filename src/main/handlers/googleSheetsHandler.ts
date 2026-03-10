import { getCredential } from "@main/credentialsStore";
import { debugLogger } from "@main/debugLogger";
import axios, { type AxiosRequestConfig } from "axios";

const SHEETS_API_BASE = "https://sheets.googleapis.com/v4/spreadsheets";

/**
 * Google Sheets API handler
 * Uses API Key or Service Account for authentication
 * API: https://sheets.googleapis.com/v4
 */
export class GoogleSheetsHandler {
  private async resolveCredentials(step: {
    credentialId?: string;
    apiKey?: string;
  }): Promise<{ apiKey: string }> {
    if (step.credentialId) {
      const cred = getCredential(step.credentialId);
      if (cred?.data?.apiKey) return { apiKey: cred.data.apiKey };
      if (cred?.data?.accessToken) return { apiKey: cred.data.accessToken };
    }
    if (step.apiKey) return { apiKey: step.apiKey };
    throw new Error("Google Sheets API key or access token is required.");
  }

  private async callApi(
    apiKey: string,
    method: string,
    url: string,
    data?: unknown
  ): Promise<unknown> {
    debugLogger.debug("Google Sheets", `${method} ${url.substring(SHEETS_API_BASE.length)}`);
    const config: AxiosRequestConfig = {
      method: method as AxiosRequestConfig["method"],
      url,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      data,
    };
    const response = await axios(config);
    return response.data;
  }

  async executeReadRows(
    step: {
      spreadsheetId: string;
      range: string;
      firstRowHeaders?: boolean;
      credentialId?: string;
      apiKey?: string;
      storeKey?: string;
    },
    substituteVariables: (input?: string) => string,
    variables: Record<string, unknown>
  ): Promise<unknown> {
    const { apiKey } = await this.resolveCredentials(step);
    const spreadsheetId = substituteVariables(step.spreadsheetId);
    const range = substituteVariables(step.range);
    const url = `${SHEETS_API_BASE}/${spreadsheetId}/values/${encodeURIComponent(range)}`;

    const data = (await this.callApi(apiKey, "GET", url)) as { values?: string[][] };
    const rows = data.values || [];

    let result: unknown;
    if (step.firstRowHeaders && rows.length > 1) {
      const headers = rows[0];
      result = rows.slice(1).map((row) => {
        const obj: Record<string, string> = {};
        headers.forEach((h, i) => {
          obj[h] = row[i] || "";
        });
        return obj;
      });
    } else {
      result = rows;
    }

    if (step.storeKey) variables[step.storeKey] = result;
    debugLogger.debug("Google Sheets", `Read ${rows.length} rows from ${range}`);
    return result;
  }

  async executeAppendRow(
    step: {
      spreadsheetId: string;
      range: string;
      values: string;
      valueInputOption?: string;
      credentialId?: string;
      apiKey?: string;
      storeKey?: string;
    },
    substituteVariables: (input?: string) => string,
    variables: Record<string, unknown>
  ): Promise<unknown> {
    const { apiKey } = await this.resolveCredentials(step);
    const spreadsheetId = substituteVariables(step.spreadsheetId);
    const range = substituteVariables(step.range);
    const valueInput = step.valueInputOption || "USER_ENTERED";
    const url = `${SHEETS_API_BASE}/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=${valueInput}`;

    let values: unknown[][];
    try {
      const parsed = JSON.parse(substituteVariables(step.values));
      values = Array.isArray(parsed[0]) ? parsed : [parsed];
    } catch {
      // Treat as comma-separated single row
      values = [
        substituteVariables(step.values)
          .split(",")
          .map((v) => v.trim()),
      ];
    }

    const body = { values };
    const result = await this.callApi(apiKey, "POST", url, body);
    if (step.storeKey) variables[step.storeKey] = result;
    debugLogger.debug("Google Sheets", `Appended ${values.length} rows`);
    return result;
  }

  async executeUpdateRow(
    step: {
      spreadsheetId: string;
      range: string;
      values: string;
      valueInputOption?: string;
      credentialId?: string;
      apiKey?: string;
      storeKey?: string;
    },
    substituteVariables: (input?: string) => string,
    variables: Record<string, unknown>
  ): Promise<unknown> {
    const { apiKey } = await this.resolveCredentials(step);
    const spreadsheetId = substituteVariables(step.spreadsheetId);
    const range = substituteVariables(step.range);
    const valueInput = step.valueInputOption || "USER_ENTERED";
    const url = `${SHEETS_API_BASE}/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=${valueInput}`;

    let values: unknown[][];
    try {
      const parsed = JSON.parse(substituteVariables(step.values));
      values = Array.isArray(parsed[0]) ? parsed : [parsed];
    } catch {
      values = [
        substituteVariables(step.values)
          .split(",")
          .map((v) => v.trim()),
      ];
    }

    const body = { values };
    const result = await this.callApi(apiKey, "PUT", url, body);
    if (step.storeKey) variables[step.storeKey] = result;
    debugLogger.debug("Google Sheets", `Updated range ${range}`);
    return result;
  }

  async executeClearRange(
    step: {
      spreadsheetId: string;
      range: string;
      credentialId?: string;
      apiKey?: string;
      storeKey?: string;
    },
    substituteVariables: (input?: string) => string,
    variables: Record<string, unknown>
  ): Promise<unknown> {
    const { apiKey } = await this.resolveCredentials(step);
    const spreadsheetId = substituteVariables(step.spreadsheetId);
    const range = substituteVariables(step.range);
    const url = `${SHEETS_API_BASE}/${spreadsheetId}/values/${encodeURIComponent(range)}:clear`;

    const result = await this.callApi(apiKey, "POST", url, {});
    if (step.storeKey) variables[step.storeKey] = result;
    debugLogger.debug("Google Sheets", `Cleared range ${range}`);
    return result;
  }

  async executeGetSpreadsheet(
    step: {
      spreadsheetId: string;
      credentialId?: string;
      apiKey?: string;
      storeKey?: string;
    },
    substituteVariables: (input?: string) => string,
    variables: Record<string, unknown>
  ): Promise<unknown> {
    const { apiKey } = await this.resolveCredentials(step);
    const spreadsheetId = substituteVariables(step.spreadsheetId);
    const url = `${SHEETS_API_BASE}/${spreadsheetId}`;
    const result = await this.callApi(apiKey, "GET", url);
    if (step.storeKey) variables[step.storeKey] = result;
    return result;
  }
}
