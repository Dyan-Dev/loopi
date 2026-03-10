import { BaseRestHandler, HandlerContext } from "./base/BaseRestHandler";
import { registerHandler } from "./base/handlerRegistry";

class WordpressHandler extends BaseRestHandler {
  protected serviceName = "WordPress";

  constructor() {
    super();
    registerHandler("wordpressCreatePost", this.createPost.bind(this));
    registerHandler("wordpressGetPost", this.getPost.bind(this));
    registerHandler("wordpressListPosts", this.listPosts.bind(this));
    registerHandler("wordpressUpdatePost", this.updatePost.bind(this));
  }

  private getBase(step: Record<string, unknown>, ctx: HandlerContext) {
    return `${this.sub(ctx, step.siteUrl as string)}/wp-json/wp/v2`;
  }

  private async createPost(step: Record<string, unknown>, ctx: HandlerContext) {
    const creds = this.resolveCredential(step.credentialId as string, "wordpress", {
      username: step.username as string,
      password: step.password as string,
    });
    const body: Record<string, unknown> = {
      title: this.sub(ctx, step.title as string),
      content: this.sub(ctx, step.content as string),
    };
    if (step.status) body.status = this.sub(ctx, step.status as string);
    const result = await this.apiCall(
      {
        method: "POST",
        url: `${this.getBase(step, ctx)}/posts`,
        headers: this.basicHeaders(creds.username, creds.password),
        data: body,
      },
      ctx
    );
    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async getPost(step: Record<string, unknown>, ctx: HandlerContext) {
    const creds = this.resolveCredential(step.credentialId as string, "wordpress", {
      username: step.username as string,
      password: step.password as string,
    });
    const result = await this.apiCall(
      {
        method: "GET",
        url: `${this.getBase(step, ctx)}/posts/${this.sub(ctx, step.postId as string)}`,
        headers: this.basicHeaders(creds.username, creds.password),
      },
      ctx
    );
    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async listPosts(step: Record<string, unknown>, ctx: HandlerContext) {
    const creds = this.resolveCredential(step.credentialId as string, "wordpress", {
      username: step.username as string,
      password: step.password as string,
    });
    const params = new URLSearchParams();
    if (step.perPage) params.append("per_page", this.sub(ctx, step.perPage as string));
    if (step.status) params.append("status", this.sub(ctx, step.status as string));
    const result = await this.apiCall(
      {
        method: "GET",
        url: `${this.getBase(step, ctx)}/posts?${params}`,
        headers: this.basicHeaders(creds.username, creds.password),
      },
      ctx
    );
    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async updatePost(step: Record<string, unknown>, ctx: HandlerContext) {
    const creds = this.resolveCredential(step.credentialId as string, "wordpress", {
      username: step.username as string,
      password: step.password as string,
    });
    const body: Record<string, unknown> = {};
    if (step.title) body.title = this.sub(ctx, step.title as string);
    if (step.content) body.content = this.sub(ctx, step.content as string);
    if (step.status) body.status = this.sub(ctx, step.status as string);
    const result = await this.apiCall(
      {
        method: "PUT",
        url: `${this.getBase(step, ctx)}/posts/${this.sub(ctx, step.postId as string)}`,
        headers: this.basicHeaders(creds.username, creds.password),
        data: body,
      },
      ctx
    );
    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }
}

export const wordpressHandler = new WordpressHandler();
