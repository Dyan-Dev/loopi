import { getCredential } from "@main/credentialsStore";
import { debugLogger } from "@main/debugLogger";
import axios, { type AxiosRequestConfig } from "axios";

/**
 * GitHub API handler
 * API: https://api.github.com
 */
export class GithubHandler {
  private async resolveCredentials(step: {
    credentialId?: string;
    accessToken?: string;
  }): Promise<{ accessToken: string; baseUrl: string }> {
    if (step.credentialId) {
      const cred = getCredential(step.credentialId);
      if (cred?.data?.accessToken) {
        return {
          accessToken: cred.data.accessToken,
          baseUrl: cred.data.baseUrl || "https://api.github.com",
        };
      }
    }
    if (step.accessToken) {
      return { accessToken: step.accessToken, baseUrl: "https://api.github.com" };
    }
    throw new Error("GitHub access token is required.");
  }

  private async callApi(
    token: string,
    baseUrl: string,
    method: string,
    endpoint: string,
    data?: unknown
  ): Promise<unknown> {
    const url = `${baseUrl}${endpoint}`;
    debugLogger.debug("GitHub", `${method} ${endpoint}`);
    const config: AxiosRequestConfig = {
      method: method as AxiosRequestConfig["method"],
      url,
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "Loopi-Automation",
      },
      data,
    };
    const response = await axios(config);
    return response.data;
  }

  async executeCreateIssue(
    step: {
      owner: string;
      repo: string;
      title: string;
      body?: string;
      labels?: string;
      assignees?: string;
      credentialId?: string;
      accessToken?: string;
      storeKey?: string;
    },
    substituteVariables: (input?: string) => string,
    variables: Record<string, unknown>
  ): Promise<unknown> {
    const { accessToken, baseUrl } = await this.resolveCredentials(step);
    const owner = substituteVariables(step.owner);
    const repo = substituteVariables(step.repo);
    const body: Record<string, unknown> = {
      title: substituteVariables(step.title),
    };
    if (step.body) body.body = substituteVariables(step.body);
    if (step.labels)
      body.labels = substituteVariables(step.labels)
        .split(",")
        .map((l) => l.trim());
    if (step.assignees)
      body.assignees = substituteVariables(step.assignees)
        .split(",")
        .map((a) => a.trim());

    const result = await this.callApi(
      accessToken,
      baseUrl,
      "POST",
      `/repos/${owner}/${repo}/issues`,
      body
    );
    if (step.storeKey) variables[step.storeKey] = result;
    debugLogger.debug("GitHub", `Issue created in ${owner}/${repo}`);
    return result;
  }

  async executeGetIssue(
    step: {
      owner: string;
      repo: string;
      issueNumber: string;
      credentialId?: string;
      accessToken?: string;
      storeKey?: string;
    },
    substituteVariables: (input?: string) => string,
    variables: Record<string, unknown>
  ): Promise<unknown> {
    const { accessToken, baseUrl } = await this.resolveCredentials(step);
    const owner = substituteVariables(step.owner);
    const repo = substituteVariables(step.repo);
    const num = substituteVariables(step.issueNumber);
    const result = await this.callApi(
      accessToken,
      baseUrl,
      "GET",
      `/repos/${owner}/${repo}/issues/${num}`
    );
    if (step.storeKey) variables[step.storeKey] = result;
    return result;
  }

  async executeListIssues(
    step: {
      owner: string;
      repo: string;
      state?: string;
      labels?: string;
      perPage?: string;
      credentialId?: string;
      accessToken?: string;
      storeKey?: string;
    },
    substituteVariables: (input?: string) => string,
    variables: Record<string, unknown>
  ): Promise<unknown> {
    const { accessToken, baseUrl } = await this.resolveCredentials(step);
    const owner = substituteVariables(step.owner);
    const repo = substituteVariables(step.repo);
    const params = new URLSearchParams();
    if (step.state) params.set("state", step.state);
    if (step.labels) params.set("labels", substituteVariables(step.labels));
    params.set("per_page", step.perPage || "30");
    const qs = params.toString();
    const result = await this.callApi(
      accessToken,
      baseUrl,
      "GET",
      `/repos/${owner}/${repo}/issues?${qs}`
    );
    if (step.storeKey) variables[step.storeKey] = result;
    return result;
  }

  async executeCreateComment(
    step: {
      owner: string;
      repo: string;
      issueNumber: string;
      body: string;
      credentialId?: string;
      accessToken?: string;
      storeKey?: string;
    },
    substituteVariables: (input?: string) => string,
    variables: Record<string, unknown>
  ): Promise<unknown> {
    const { accessToken, baseUrl } = await this.resolveCredentials(step);
    const owner = substituteVariables(step.owner);
    const repo = substituteVariables(step.repo);
    const num = substituteVariables(step.issueNumber);
    const result = await this.callApi(
      accessToken,
      baseUrl,
      "POST",
      `/repos/${owner}/${repo}/issues/${num}/comments`,
      {
        body: substituteVariables(step.body),
      }
    );
    if (step.storeKey) variables[step.storeKey] = result;
    return result;
  }

  async executeGetRepo(
    step: {
      owner: string;
      repo: string;
      credentialId?: string;
      accessToken?: string;
      storeKey?: string;
    },
    substituteVariables: (input?: string) => string,
    variables: Record<string, unknown>
  ): Promise<unknown> {
    const { accessToken, baseUrl } = await this.resolveCredentials(step);
    const owner = substituteVariables(step.owner);
    const repo = substituteVariables(step.repo);
    const result = await this.callApi(accessToken, baseUrl, "GET", `/repos/${owner}/${repo}`);
    if (step.storeKey) variables[step.storeKey] = result;
    return result;
  }

  async executeListRepos(
    step: {
      owner?: string;
      type?: string;
      perPage?: string;
      credentialId?: string;
      accessToken?: string;
      storeKey?: string;
    },
    substituteVariables: (input?: string) => string,
    variables: Record<string, unknown>
  ): Promise<unknown> {
    const { accessToken, baseUrl } = await this.resolveCredentials(step);
    const params = new URLSearchParams();
    params.set("per_page", step.perPage || "30");
    if (step.type) params.set("type", step.type);
    const qs = params.toString();
    const endpoint = step.owner
      ? `/users/${substituteVariables(step.owner)}/repos?${qs}`
      : `/user/repos?${qs}`;
    const result = await this.callApi(accessToken, baseUrl, "GET", endpoint);
    if (step.storeKey) variables[step.storeKey] = result;
    return result;
  }

  async executeCreateRelease(
    step: {
      owner: string;
      repo: string;
      tagName: string;
      name?: string;
      body?: string;
      draft?: boolean;
      prerelease?: boolean;
      credentialId?: string;
      accessToken?: string;
      storeKey?: string;
    },
    substituteVariables: (input?: string) => string,
    variables: Record<string, unknown>
  ): Promise<unknown> {
    const { accessToken, baseUrl } = await this.resolveCredentials(step);
    const owner = substituteVariables(step.owner);
    const repo = substituteVariables(step.repo);
    const data: Record<string, unknown> = {
      tag_name: substituteVariables(step.tagName),
    };
    if (step.name) data.name = substituteVariables(step.name);
    if (step.body) data.body = substituteVariables(step.body);
    if (step.draft !== undefined) data.draft = step.draft;
    if (step.prerelease !== undefined) data.prerelease = step.prerelease;
    const result = await this.callApi(
      accessToken,
      baseUrl,
      "POST",
      `/repos/${owner}/${repo}/releases`,
      data
    );
    if (step.storeKey) variables[step.storeKey] = result;
    return result;
  }
}
