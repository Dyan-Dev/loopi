import { BaseRestHandler, HandlerContext } from "./base/BaseRestHandler";
import { registerHandler } from "./base/handlerRegistry";

/**
 * Todoist API handler
 * API: https://api.todoist.com/rest/v2/
 */
class TodoistHandler extends BaseRestHandler {
  protected serviceName = "Todoist";
  private readonly baseUrl = "https://api.todoist.com/rest/v2";

  constructor() {
    super();
    registerHandler("todoistCreateTask", this.createTask.bind(this));
    registerHandler("todoistGetTask", this.getTask.bind(this));
    registerHandler("todoistListTasks", this.listTasks.bind(this));
    registerHandler("todoistCloseTask", this.closeTask.bind(this));
  }

  private resolveAuth(step: Record<string, unknown>): { apiToken: string } {
    const creds = this.resolveCredential(step.credentialId as string, "todoist", {
      apiToken: step.apiToken as string,
    });
    return { apiToken: creds.apiToken };
  }

  private async createTask(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const { apiToken } = this.resolveAuth(step);
    const content = this.sub(ctx, step.content as string);

    const data: Record<string, unknown> = { content };
    if (step.description) data.description = this.sub(ctx, step.description as string);
    if (step.projectId) data.project_id = this.sub(ctx, step.projectId as string);
    if (step.priority) data.priority = Number(this.sub(ctx, step.priority as string));
    if (step.dueString) data.due_string = this.sub(ctx, step.dueString as string);

    const result = await this.apiCall(
      {
        method: "POST",
        url: `${this.baseUrl}/tasks`,
        headers: this.bearerHeaders(apiToken),
        data,
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async getTask(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const { apiToken } = this.resolveAuth(step);
    const taskId = this.sub(ctx, step.taskId as string);

    const result = await this.apiCall(
      {
        method: "GET",
        url: `${this.baseUrl}/tasks/${taskId}`,
        headers: this.bearerHeaders(apiToken),
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async listTasks(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const { apiToken } = this.resolveAuth(step);

    const params: Record<string, unknown> = {};
    if (step.projectId) params.project_id = this.sub(ctx, step.projectId as string);

    const result = await this.apiCall(
      {
        method: "GET",
        url: `${this.baseUrl}/tasks`,
        headers: this.bearerHeaders(apiToken),
        params,
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async closeTask(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const { apiToken } = this.resolveAuth(step);
    const taskId = this.sub(ctx, step.taskId as string);

    const result = await this.apiCall(
      {
        method: "POST",
        url: `${this.baseUrl}/tasks/${taskId}/close`,
        headers: this.bearerHeaders(apiToken),
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }
}

export const todoistHandler = new TodoistHandler();
