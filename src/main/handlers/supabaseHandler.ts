import { BaseRestHandler, HandlerContext } from "./base/BaseRestHandler";
import { registerHandler } from "./base/handlerRegistry";

/**
 * Supabase REST API handler (PostgREST)
 * API: {projectUrl}/rest/v1
 */
class SupabaseHandler extends BaseRestHandler {
  protected serviceName = "Supabase";

  constructor() {
    super();
    registerHandler("supabaseSelect", this.select.bind(this));
    registerHandler("supabaseInsert", this.insert.bind(this));
    registerHandler("supabaseUpdate", this.update.bind(this));
    registerHandler("supabaseDelete", this.delete.bind(this));
  }

  private supabaseHeaders(anonKey: string): Record<string, string> {
    return {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      "Content-Type": "application/json",
    };
  }

  private async select(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const creds = this.resolveCredential(step.credentialId as string, "supabase", {
      apiKey: step.apiKey as string,
    });
    const anonKey = creds.apiKey;
    const projectUrl = this.sub(ctx, step.projectUrl as string);
    const table = this.sub(ctx, step.table as string);

    const params = new URLSearchParams();
    if (step.columns) params.set("select", this.sub(ctx, step.columns as string));
    if (step.filter) params.set(this.sub(ctx, step.filter as string), "");
    if (step.order) params.set("order", this.sub(ctx, step.order as string));
    if (step.limit) params.set("limit", this.sub(ctx, step.limit as string));
    const qs = params.toString();

    const result = await this.apiCall(
      {
        method: "GET",
        url: `${projectUrl}/rest/v1/${table}${qs ? `?${qs}` : ""}`,
        headers: this.supabaseHeaders(anonKey),
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async insert(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const creds = this.resolveCredential(step.credentialId as string, "supabase", {
      apiKey: step.apiKey as string,
    });
    const anonKey = creds.apiKey;
    const projectUrl = this.sub(ctx, step.projectUrl as string);
    const table = this.sub(ctx, step.table as string);
    const data = JSON.parse(this.sub(ctx, step.data as string));

    const result = await this.apiCall(
      {
        method: "POST",
        url: `${projectUrl}/rest/v1/${table}`,
        headers: {
          ...this.supabaseHeaders(anonKey),
          Prefer: "return=representation",
        },
        data,
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async update(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const creds = this.resolveCredential(step.credentialId as string, "supabase", {
      apiKey: step.apiKey as string,
    });
    const anonKey = creds.apiKey;
    const projectUrl = this.sub(ctx, step.projectUrl as string);
    const table = this.sub(ctx, step.table as string);
    const data = JSON.parse(this.sub(ctx, step.data as string));
    const filter = this.sub(ctx, step.filter as string);

    const result = await this.apiCall(
      {
        method: "PATCH",
        url: `${projectUrl}/rest/v1/${table}?${filter}`,
        headers: this.supabaseHeaders(anonKey),
        data,
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async delete(step: Record<string, unknown>, ctx: HandlerContext): Promise<unknown> {
    const creds = this.resolveCredential(step.credentialId as string, "supabase", {
      apiKey: step.apiKey as string,
    });
    const anonKey = creds.apiKey;
    const projectUrl = this.sub(ctx, step.projectUrl as string);
    const table = this.sub(ctx, step.table as string);
    const filter = this.sub(ctx, step.filter as string);

    const result = await this.apiCall(
      {
        method: "DELETE",
        url: `${projectUrl}/rest/v1/${table}?${filter}`,
        headers: this.supabaseHeaders(anonKey),
      },
      ctx
    );

    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }
}

export const supabaseHandler = new SupabaseHandler();
