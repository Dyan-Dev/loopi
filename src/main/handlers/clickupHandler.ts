import { BaseRestHandler, HandlerContext } from "./base/BaseRestHandler";
import { registerHandler } from "./base/handlerRegistry";

/**
 * ClickUp REST API handler
 * API: https://api.clickup.com/api/v2/
 */
class ClickupHandler extends BaseRestHandler {
  protected serviceName = "ClickUp";

  private readonly baseUrl = "https://api.clickup.com/api/v2";

  constructor() {
    super();
    registerHandler("clickupCreateTask", this.createTask.bind(this));
    registerHandler("clickupGetTask", this.getTask.bind(this));
    registerHandler("clickupUpdateTask", this.updateTask.bind(this));
    registerHandler("clickupListTasks", this.listTasks.bind(this));
  }

  private resolveAuth(step: Record<string, unknown>): { apiToken: string } {
    const creds = this.resolveCredential(step.credentialId as string, "clickup", {
      apiToken: step.apiToken as string,
    });
    return { apiToken: creds.apiToken };
  }

  private async createTask(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const { apiToken } = this.resolveAuth(step);
    const listId = this.sub(ctx, step.listId as string);

    const taskData: Record<string, unknown> = {
      name: this.sub(ctx, step.name as string),
    };

    if (step.description) taskData.description = this.sub(ctx, step.description as string);
    if (step.priority) taskData.priority = Number(this.sub(ctx, step.priority as string));
    if (step.assignees) {
      const raw = this.sub(ctx, step.assignees as string);
      taskData.assignees = raw.split(",").map((a) => Number(a.trim()));
    }
    if (step.dueDate) taskData.due_date = this.sub(ctx, step.dueDate as string);

    const result = await this.apiCall(
      {
        method: "POST",
        url: `${this.baseUrl}/list/${listId}/task`,
        headers: this.bearerHeaders(apiToken),
        data: taskData,
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
        url: `${this.baseUrl}/task/${taskId}`,
        headers: this.bearerHeaders(apiToken),
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async updateTask(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const { apiToken } = this.resolveAuth(step);
    const taskId = this.sub(ctx, step.taskId as string);

    const taskData: Record<string, unknown> = {};
    if (step.name) taskData.name = this.sub(ctx, step.name as string);
    if (step.description) taskData.description = this.sub(ctx, step.description as string);
    if (step.status) taskData.status = this.sub(ctx, step.status as string);
    if (step.priority) taskData.priority = Number(this.sub(ctx, step.priority as string));

    const result = await this.apiCall(
      {
        method: "PUT",
        url: `${this.baseUrl}/task/${taskId}`,
        headers: this.bearerHeaders(apiToken),
        data: taskData,
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async listTasks(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const { apiToken } = this.resolveAuth(step);
    const listId = this.sub(ctx, step.listId as string);

    const result = await this.apiCall(
      {
        method: "GET",
        url: `${this.baseUrl}/list/${listId}/task`,
        headers: this.bearerHeaders(apiToken),
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }
}

export const clickupHandler = new ClickupHandler();
