import { BaseRestHandler, HandlerContext } from "./base/BaseRestHandler";
import { registerHandler } from "./base/handlerRegistry";

class GhostHandler extends BaseRestHandler {
  protected serviceName = "Ghost";

  constructor() {
    super();
    registerHandler("ghostCreatePost", this.createPost.bind(this));
    registerHandler("ghostGetPost", this.getPost.bind(this));
    registerHandler("ghostListPosts", this.listPosts.bind(this));
  }

  private ghostHeaders(apiKey: string) {
    return { Authorization: `Ghost ${apiKey}`, "Content-Type": "application/json" };
  }

  private async createPost(step: Record<string, unknown>, ctx: HandlerContext) {
    const creds = this.resolveCredential(step.credentialId as string, "ghost", {
      apiKey: step.apiKey as string,
    });
    const apiUrl = this.sub(ctx, step.apiUrl as string);
    const post: Record<string, unknown> = { title: this.sub(ctx, step.title as string) };
    if (step.html) post.html = this.sub(ctx, step.html as string);
    if (step.status) post.status = this.sub(ctx, step.status as string);
    const result = await this.apiCall(
      {
        method: "POST",
        url: `${apiUrl}/ghost/api/admin/posts/`,
        headers: this.ghostHeaders(creds.apiKey),
        data: { posts: [post] },
      },
      ctx
    );
    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async getPost(step: Record<string, unknown>, ctx: HandlerContext) {
    const creds = this.resolveCredential(step.credentialId as string, "ghost", {
      apiKey: step.apiKey as string,
    });
    const apiUrl = this.sub(ctx, step.apiUrl as string);
    const result = await this.apiCall(
      {
        method: "GET",
        url: `${apiUrl}/ghost/api/admin/posts/${this.sub(ctx, step.postId as string)}/`,
        headers: this.ghostHeaders(creds.apiKey),
      },
      ctx
    );
    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async listPosts(step: Record<string, unknown>, ctx: HandlerContext) {
    const creds = this.resolveCredential(step.credentialId as string, "ghost", {
      apiKey: step.apiKey as string,
    });
    const apiUrl = this.sub(ctx, step.apiUrl as string);
    const params = new URLSearchParams();
    if (step.limit) params.append("limit", this.sub(ctx, step.limit as string));
    if (step.status) params.append("filter", `status:${this.sub(ctx, step.status as string)}`);
    const result = await this.apiCall(
      {
        method: "GET",
        url: `${apiUrl}/ghost/api/admin/posts/?${params}`,
        headers: this.ghostHeaders(creds.apiKey),
      },
      ctx
    );
    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }
}

export const ghostHandler = new GhostHandler();
