import { BaseRestHandler, HandlerContext } from "./base/BaseRestHandler";
import { registerHandler } from "./base/handlerRegistry";

class RedditHandler extends BaseRestHandler {
  protected serviceName = "Reddit";
  private base = "https://oauth.reddit.com";

  constructor() {
    super();
    registerHandler("redditGetPost", this.getPost.bind(this));
    registerHandler("redditListPosts", this.listPosts.bind(this));
    registerHandler("redditSubmitPost", this.submitPost.bind(this));
  }

  private async getPost(step: Record<string, unknown>, ctx: HandlerContext) {
    const creds = this.resolveCredential(step.credentialId as string, "reddit", {
      accessToken: step.accessToken as string,
    });
    const result = await this.apiCall(
      {
        method: "GET",
        url: `${this.base}/r/${this.sub(ctx, step.subreddit as string)}/comments/${this.sub(ctx, step.postId as string)}`,
        headers: this.bearerHeaders(creds.accessToken),
      },
      ctx
    );
    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async listPosts(step: Record<string, unknown>, ctx: HandlerContext) {
    const creds = this.resolveCredential(step.credentialId as string, "reddit", {
      accessToken: step.accessToken as string,
    });
    const sort = this.sub(ctx, step.sort as string) || "hot";
    const params = new URLSearchParams();
    if (step.limit) params.append("limit", this.sub(ctx, step.limit as string));
    const result = await this.apiCall(
      {
        method: "GET",
        url: `${this.base}/r/${this.sub(ctx, step.subreddit as string)}/${sort}?${params}`,
        headers: this.bearerHeaders(creds.accessToken),
      },
      ctx
    );
    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async submitPost(step: Record<string, unknown>, ctx: HandlerContext) {
    const creds = this.resolveCredential(step.credentialId as string, "reddit", {
      accessToken: step.accessToken as string,
    });
    const body = new URLSearchParams({
      sr: this.sub(ctx, step.subreddit as string),
      title: this.sub(ctx, step.title as string),
      kind: this.sub(ctx, step.kind as string) || "self",
    });
    if (step.text) body.append("text", this.sub(ctx, step.text as string));
    if (step.url) body.append("url", this.sub(ctx, step.url as string));
    const result = await this.apiCall(
      {
        method: "POST",
        url: `${this.base}/api/submit`,
        headers: {
          ...this.bearerHeaders(creds.accessToken),
          "Content-Type": "application/x-www-form-urlencoded",
        },
        data: body.toString(),
      },
      ctx
    );
    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }
}

export const redditHandler = new RedditHandler();
