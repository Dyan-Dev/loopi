import { BaseRestHandler, HandlerContext } from "./base/BaseRestHandler";
import { registerHandler } from "./base/handlerRegistry";

class SpotifyHandler extends BaseRestHandler {
  protected serviceName = "Spotify";
  private base = "https://api.spotify.com/v1";

  constructor() {
    super();
    registerHandler("spotifySearch", this.search.bind(this));
    registerHandler("spotifyGetTrack", this.getTrack.bind(this));
    registerHandler("spotifyGetPlaylist", this.getPlaylist.bind(this));
  }

  private async search(step: Record<string, unknown>, ctx: HandlerContext) {
    const creds = this.resolveCredential(step.credentialId as string, "spotify", {
      accessToken: step.accessToken as string,
    });
    const params = new URLSearchParams({
      q: this.sub(ctx, step.query as string),
      type: this.sub(ctx, step.type as string) || "track",
    });
    if (step.limit) params.append("limit", this.sub(ctx, step.limit as string));
    const result = await this.apiCall(
      {
        method: "GET",
        url: `${this.base}/search?${params}`,
        headers: this.bearerHeaders(creds.accessToken),
      },
      ctx
    );
    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async getTrack(step: Record<string, unknown>, ctx: HandlerContext) {
    const creds = this.resolveCredential(step.credentialId as string, "spotify", {
      accessToken: step.accessToken as string,
    });
    const result = await this.apiCall(
      {
        method: "GET",
        url: `${this.base}/tracks/${this.sub(ctx, step.trackId as string)}`,
        headers: this.bearerHeaders(creds.accessToken),
      },
      ctx
    );
    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }

  private async getPlaylist(step: Record<string, unknown>, ctx: HandlerContext) {
    const creds = this.resolveCredential(step.credentialId as string, "spotify", {
      accessToken: step.accessToken as string,
    });
    const result = await this.apiCall(
      {
        method: "GET",
        url: `${this.base}/playlists/${this.sub(ctx, step.playlistId as string)}`,
        headers: this.bearerHeaders(creds.accessToken),
      },
      ctx
    );
    this.storeResult(step.storeKey as string, result, ctx.variables);
    return result;
  }
}

export const spotifyHandler = new SpotifyHandler();
