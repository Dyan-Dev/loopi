import { getCredential } from "@main/credentialsStore";
import { debugLogger } from "@main/debugLogger";
import axios, { type AxiosRequestConfig } from "axios";

const NOTION_API_VERSION = "2022-02-22";
const NOTION_BASE_URL = "https://api.notion.com/v1";

/**
 * Notion API handler
 * API: https://api.notion.com/v1
 */
export class NotionHandler {
  private async resolveCredentials(step: {
    credentialId?: string;
    apiKey?: string;
  }): Promise<{ apiKey: string }> {
    if (step.credentialId) {
      const cred = getCredential(step.credentialId);
      if (cred?.data?.apiKey) return { apiKey: cred.data.apiKey };
    }
    if (step.apiKey) return { apiKey: step.apiKey };
    throw new Error("Notion API key (integration secret) is required.");
  }

  private async callApi(
    apiKey: string,
    method: string,
    endpoint: string,
    data?: unknown
  ): Promise<unknown> {
    const url = `${NOTION_BASE_URL}${endpoint}`;
    debugLogger.debug("Notion", `${method} ${endpoint}`);
    const config: AxiosRequestConfig = {
      method: method as AxiosRequestConfig["method"],
      url,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Notion-Version": NOTION_API_VERSION,
        "Content-Type": "application/json",
      },
      data,
    };
    const response = await axios(config);
    return response.data;
  }

  async executeCreatePage(
    step: {
      parentId: string;
      parentType?: string;
      title: string;
      content?: string;
      properties?: string;
      credentialId?: string;
      apiKey?: string;
      storeKey?: string;
    },
    substituteVariables: (input?: string) => string,
    variables: Record<string, unknown>
  ): Promise<unknown> {
    const { apiKey } = await this.resolveCredentials(step);
    const parentId = substituteVariables(step.parentId);
    const parentType = step.parentType || "page_id";

    const body: Record<string, unknown> = {
      parent: { [parentType]: parentId },
      properties: {
        title: {
          title: [{ text: { content: substituteVariables(step.title) } }],
        },
      },
    };

    // Add extra properties if provided as JSON
    if (step.properties) {
      try {
        const extraProps = JSON.parse(substituteVariables(step.properties));
        body.properties = { ...(body.properties as Record<string, unknown>), ...extraProps };
      } catch {
        /* ignore invalid JSON */
      }
    }

    // Add content blocks
    if (step.content) {
      body.children = [
        {
          object: "block",
          type: "paragraph",
          paragraph: {
            rich_text: [{ type: "text", text: { content: substituteVariables(step.content) } }],
          },
        },
      ];
    }

    const result = await this.callApi(apiKey, "POST", "/pages", body);
    if (step.storeKey) variables[step.storeKey] = result;
    debugLogger.debug("Notion", "Page created successfully");
    return result;
  }

  async executeGetPage(
    step: {
      pageId: string;
      credentialId?: string;
      apiKey?: string;
      storeKey?: string;
    },
    substituteVariables: (input?: string) => string,
    variables: Record<string, unknown>
  ): Promise<unknown> {
    const { apiKey } = await this.resolveCredentials(step);
    const pageId = substituteVariables(step.pageId);
    const result = await this.callApi(apiKey, "GET", `/pages/${pageId}`);
    if (step.storeKey) variables[step.storeKey] = result;
    return result;
  }

  async executeUpdatePage(
    step: {
      pageId: string;
      properties: string;
      archived?: boolean;
      credentialId?: string;
      apiKey?: string;
      storeKey?: string;
    },
    substituteVariables: (input?: string) => string,
    variables: Record<string, unknown>
  ): Promise<unknown> {
    const { apiKey } = await this.resolveCredentials(step);
    const pageId = substituteVariables(step.pageId);
    const body: Record<string, unknown> = {};

    if (step.properties) {
      body.properties = JSON.parse(substituteVariables(step.properties));
    }
    if (step.archived !== undefined) {
      body.archived = step.archived;
    }

    const result = await this.callApi(apiKey, "PATCH", `/pages/${pageId}`, body);
    if (step.storeKey) variables[step.storeKey] = result;
    return result;
  }

  async executeQueryDatabase(
    step: {
      databaseId: string;
      filter?: string;
      sorts?: string;
      pageSize?: number;
      credentialId?: string;
      apiKey?: string;
      storeKey?: string;
    },
    substituteVariables: (input?: string) => string,
    variables: Record<string, unknown>
  ): Promise<unknown> {
    const { apiKey } = await this.resolveCredentials(step);
    const databaseId = substituteVariables(step.databaseId);
    const body: Record<string, unknown> = {};

    if (step.filter) {
      try {
        body.filter = JSON.parse(substituteVariables(step.filter));
      } catch {
        /* ignore */
      }
    }
    if (step.sorts) {
      try {
        body.sorts = JSON.parse(substituteVariables(step.sorts));
      } catch {
        /* ignore */
      }
    }
    if (step.pageSize) body.page_size = step.pageSize;

    const result = await this.callApi(apiKey, "POST", `/databases/${databaseId}/query`, body);
    if (step.storeKey) variables[step.storeKey] = result;
    debugLogger.debug("Notion", `Database queried: ${databaseId}`);
    return result;
  }

  async executeCreateDatabaseEntry(
    step: {
      databaseId: string;
      properties: string;
      credentialId?: string;
      apiKey?: string;
      storeKey?: string;
    },
    substituteVariables: (input?: string) => string,
    variables: Record<string, unknown>
  ): Promise<unknown> {
    const { apiKey } = await this.resolveCredentials(step);
    const databaseId = substituteVariables(step.databaseId);
    const properties = JSON.parse(substituteVariables(step.properties));

    const body = {
      parent: { database_id: databaseId },
      properties,
    };

    const result = await this.callApi(apiKey, "POST", "/pages", body);
    if (step.storeKey) variables[step.storeKey] = result;
    debugLogger.debug("Notion", "Database entry created");
    return result;
  }

  async executeSearch(
    step: {
      query: string;
      filterType?: string;
      pageSize?: number;
      credentialId?: string;
      apiKey?: string;
      storeKey?: string;
    },
    substituteVariables: (input?: string) => string,
    variables: Record<string, unknown>
  ): Promise<unknown> {
    const { apiKey } = await this.resolveCredentials(step);
    const body: Record<string, unknown> = {
      query: substituteVariables(step.query),
    };
    if (step.filterType) {
      body.filter = { value: step.filterType, property: "object" };
    }
    if (step.pageSize) body.page_size = step.pageSize;

    const result = await this.callApi(apiKey, "POST", "/search", body);
    if (step.storeKey) variables[step.storeKey] = result;
    return result;
  }
}
