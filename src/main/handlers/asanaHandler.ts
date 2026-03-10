import { BaseRestHandler, HandlerContext } from "./base/BaseRestHandler";
import { registerHandler } from "./base/handlerRegistry";

/**
 * Asana REST API handler
 * API: https://app.asana.com/api/1.0/
 */
class AsanaHandler extends BaseRestHandler {
  protected serviceName = "Asana";

  private readonly baseUrl = "https://app.asana.com/api/1.0";

  constructor() {
    super();
    registerHandler("asanaCreateTask", this.createTask.bind(this));
    registerHandler("asanaGetTask", this.getTask.bind(this));
    registerHandler("asanaUpdateTask", this.updateTask.bind(this));
    registerHandler("asanaListTasks", this.listTasks.bind(this));
  }

  private resolveAuth(step: Record<string, unknown>): { accessToken: string } {
    const creds = this.resolveCredential(step.credentialId as string, "asana", {
      accessToken: step.accessToken as string,
    });
    return { accessToken: creds.accessToken };
  }

  private async createTask(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const { accessToken } = this.resolveAuth(step);
    const workspace = this.sub(ctx, step.workspace as string);

    const taskData: Record<string, unknown> = {
      workspace,
      name: this.sub(ctx, step.name as string),
    };

    if (step.projectId) taskData.projects = [this.sub(ctx, step.projectId as string)];
    if (step.notes) taskData.notes = this.sub(ctx, step.notes as string);
    if (step.assignee) taskData.assignee = this.sub(ctx, step.assignee as string);
    if (step.dueOn) taskData.due_on = this.sub(ctx, step.dueOn as string);

    const result = await this.apiCall(
      {
        method: "POST",
        url: `${this.baseUrl}/tasks`,
        headers: this.bearerHeaders(accessToken),
        data: { data: taskData },
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async getTask(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const { accessToken } = this.resolveAuth(step);
    const taskId = this.sub(ctx, step.taskId as string);

    const result = await this.apiCall(
      {
        method: "GET",
        url: `${this.baseUrl}/tasks/${taskId}`,
        headers: this.bearerHeaders(accessToken),
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async updateTask(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const { accessToken } = this.resolveAuth(step);
    const taskId = this.sub(ctx, step.taskId as string);

    const taskData: Record<string, unknown> = {};
    if (step.name) taskData.name = this.sub(ctx, step.name as string);
    if (step.notes) taskData.notes = this.sub(ctx, step.notes as string);
    if (step.completed !== undefined) taskData.completed = step.completed;
    if (step.dueOn) taskData.due_on = this.sub(ctx, step.dueOn as string);

    const result = await this.apiCall(
      {
        method: "PUT",
        url: `${this.baseUrl}/tasks/${taskId}`,
        headers: this.bearerHeaders(accessToken),
        data: { data: taskData },
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async listTasks(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const { accessToken } = this.resolveAuth(step);
    const projectId = this.sub(ctx, step.projectId as string);

    const result = await this.apiCall(
      {
        method: "GET",
        url: `${this.baseUrl}/tasks?project=${projectId}`,
        headers: this.bearerHeaders(accessToken),
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }
}

export const asanaHandler = new AsanaHandler();
