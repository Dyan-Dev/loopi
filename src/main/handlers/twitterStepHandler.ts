import { getCredential } from "@main/credentialsStore";
import { debugLogger } from "@main/debugLogger";
import axios from "axios";
import crypto from "crypto";

/**
 * Handles all Twitter/X-related automation steps
 */
export class TwitterStepHandler {
  /**
   * Resolve Twitter credentials from either credentialId or direct fields
   */
  static async resolveTwitterCredentials(step: {
    credentialId?: string;
    apiKey?: string;
    apiSecret?: string;
    accessToken?: string;
    accessSecret?: string;
  }): Promise<{
    apiKey: string;
    apiSecret: string;
    accessToken: string;
    accessSecret: string;
  }> {
    // If credentialId is provided, fetch from store
    if (step.credentialId) {
      const credential = await getCredential(step.credentialId);
      if (!credential || credential.type !== "twitter") {
        throw new Error("Invalid or missing Twitter credential");
      }
      return {
        apiKey: credential.data.apiKey || "",
        apiSecret: credential.data.apiSecret || "",
        accessToken: credential.data.accessToken || "",
        accessSecret: credential.data.accessSecret || "",
      };
    }

    // Otherwise use direct fields (legacy support)
    return {
      apiKey: step.apiKey || "",
      apiSecret: step.apiSecret || "",
      accessToken: step.accessToken || "",
      accessSecret: step.accessSecret || "",
    };
  }

  /**
   * Execute create tweet step
   */
  async executeCreateTweet(
    step: {
      text: string;
      replyToTweetId?: string;
      quoteTweetId?: string;
      mediaId?: string;
      storeKey?: string;
      credentialId?: string;
      apiKey?: string;
      apiSecret?: string;
      accessToken?: string;
      accessSecret?: string;
    },
    substituteVariables: (input?: string) => string,
    resolveTwitterCredentials: (
      step: Record<string, unknown>
    ) => Promise<{ apiKey: string; apiSecret: string; accessToken: string; accessSecret: string }>,
    variables: Record<string, unknown>
  ): Promise<unknown> {
    try {
      const text = substituteVariables(step.text);
      const { apiKey, apiSecret, accessToken, accessSecret } =
        await resolveTwitterCredentials(step);

      debugLogger.debug("Twitter Create Tweet", "Creating tweet", { text });

      const body: Record<string, unknown> = { text };

      if (step.replyToTweetId) {
        body.reply = {
          in_reply_to_tweet_id: substituteVariables(step.replyToTweetId),
        };
      }

      if (step.quoteTweetId) {
        body.quote_tweet_id = substituteVariables(step.quoteTweetId);
      }

      if (step.mediaId) {
        body.media = { media_ids: [substituteVariables(step.mediaId)] };
      }

      const oauth = this.generateTwitterOAuthHeader(
        "POST",
        "https://api.twitter.com/2/tweets",
        apiKey,
        apiSecret,
        accessToken,
        accessSecret
      );

      const response = await axios.post("https://api.twitter.com/2/tweets", body, {
        headers: {
          Authorization: oauth,
          "Content-Type": "application/json",
        },
      });

      debugLogger.debug("Twitter Create Tweet", "Tweet created successfully", {
        tweetId: response.data.data?.id,
      });

      if (step.storeKey) {
        variables[step.storeKey] = response.data.data;
      }

      return response.data.data;
    } catch (error) {
      debugLogger.error("Twitter Create Tweet", "Failed to create tweet", error);
      throw error;
    }
  }

  /**
   * Execute delete tweet step
   */
  async executeDeleteTweet(
    step: {
      tweetId: string;
      storeKey?: string;
      credentialId?: string;
      apiKey?: string;
      apiSecret?: string;
      accessToken?: string;
      accessSecret?: string;
    },
    substituteVariables: (input?: string) => string,
    resolveTwitterCredentials: (
      step: Record<string, unknown>
    ) => Promise<{ apiKey: string; apiSecret: string; accessToken: string; accessSecret: string }>,
    variables: Record<string, unknown>
  ): Promise<unknown> {
    try {
      const tweetId = this.extractTweetId(substituteVariables(step.tweetId));
      const { apiKey, apiSecret, accessToken, accessSecret } =
        await resolveTwitterCredentials(step);

      debugLogger.debug("Twitter Delete Tweet", "Deleting tweet", { tweetId });

      const oauth = this.generateTwitterOAuthHeader(
        "DELETE",
        `https://api.twitter.com/2/tweets/${tweetId}`,
        apiKey,
        apiSecret,
        accessToken,
        accessSecret
      );

      const response = await axios.delete(`https://api.twitter.com/2/tweets/${tweetId}`, {
        headers: { Authorization: oauth },
      });

      debugLogger.debug("Twitter Delete Tweet", "Tweet deleted successfully");

      if (step.storeKey) {
        variables[step.storeKey] = response.data;
      }

      return response.data;
    } catch (error) {
      debugLogger.error("Twitter Delete Tweet", "Failed to delete tweet", error);
      throw error;
    }
  }

  /**
   * Execute like tweet step
   */
  async executeLikeTweet(
    step: {
      tweetId: string;
      storeKey?: string;
      credentialId?: string;
      apiKey?: string;
      apiSecret?: string;
      accessToken?: string;
      accessSecret?: string;
    },
    substituteVariables: (input?: string) => string,
    resolveTwitterCredentials: (
      step: Record<string, unknown>
    ) => Promise<{ apiKey: string; apiSecret: string; accessToken: string; accessSecret: string }>,
    variables: Record<string, unknown>
  ): Promise<unknown> {
    try {
      const tweetId = this.extractTweetId(substituteVariables(step.tweetId));
      const { apiKey, apiSecret, accessToken, accessSecret } =
        await resolveTwitterCredentials(step);

      debugLogger.debug("Twitter Like Tweet", "Liking tweet", { tweetId });

      const userOauth = this.generateTwitterOAuthHeader(
        "GET",
        "https://api.twitter.com/2/users/me",
        apiKey,
        apiSecret,
        accessToken,
        accessSecret
      );

      const userResponse = await axios.get("https://api.twitter.com/2/users/me", {
        headers: { Authorization: userOauth },
      });

      const userId = userResponse.data.data.id;

      const likeOauth = this.generateTwitterOAuthHeader(
        "POST",
        `https://api.twitter.com/2/users/${userId}/likes`,
        apiKey,
        apiSecret,
        accessToken,
        accessSecret
      );

      const response = await axios.post(
        `https://api.twitter.com/2/users/${userId}/likes`,
        { tweet_id: tweetId },
        {
          headers: {
            Authorization: likeOauth,
            "Content-Type": "application/json",
          },
        }
      );

      debugLogger.debug("Twitter Like Tweet", "Tweet liked successfully");

      if (step.storeKey) {
        variables[step.storeKey] = response.data;
      }

      return response.data;
    } catch (error) {
      debugLogger.error("Twitter Like Tweet", "Failed to like tweet", error);
      throw error;
    }
  }

  /**
   * Execute retweet step
   */
  async executeRetweet(
    step: {
      tweetId: string;
      storeKey?: string;
      credentialId?: string;
      apiKey?: string;
      apiSecret?: string;
      accessToken?: string;
      accessSecret?: string;
    },
    substituteVariables: (input?: string) => string,
    resolveTwitterCredentials: (
      step: Record<string, unknown>
    ) => Promise<{ apiKey: string; apiSecret: string; accessToken: string; accessSecret: string }>,
    variables: Record<string, unknown>
  ): Promise<unknown> {
    try {
      const tweetId = this.extractTweetId(substituteVariables(step.tweetId));
      const { apiKey, apiSecret, accessToken, accessSecret } =
        await resolveTwitterCredentials(step);

      debugLogger.debug("Twitter Retweet", "Retweeting", { tweetId });

      const userOauth = this.generateTwitterOAuthHeader(
        "GET",
        "https://api.twitter.com/2/users/me",
        apiKey,
        apiSecret,
        accessToken,
        accessSecret
      );

      const userResponse = await axios.get("https://api.twitter.com/2/users/me", {
        headers: { Authorization: userOauth },
      });

      const userId = userResponse.data.data.id;

      const retweetOauth = this.generateTwitterOAuthHeader(
        "POST",
        `https://api.twitter.com/2/users/${userId}/retweets`,
        apiKey,
        apiSecret,
        accessToken,
        accessSecret
      );

      const response = await axios.post(
        `https://api.twitter.com/2/users/${userId}/retweets`,
        { tweet_id: tweetId },
        {
          headers: {
            Authorization: retweetOauth,
            "Content-Type": "application/json",
          },
        }
      );

      debugLogger.debug("Twitter Retweet", "Retweeted successfully");

      if (step.storeKey) {
        variables[step.storeKey] = response.data;
      }

      return response.data;
    } catch (error) {
      debugLogger.error("Twitter Retweet", "Failed to retweet", error);
      throw error;
    }
  }

  /**
   * Execute search tweets step
   */
  async executeSearchTweets(
    step: {
      searchQuery: string;
      maxResults?: number;
      startTime?: string;
      endTime?: string;
      storeKey?: string;
      credentialId?: string;
      apiKey?: string;
      apiSecret?: string;
      accessToken?: string;
      accessSecret?: string;
    },
    substituteVariables: (input?: string) => string,
    resolveTwitterCredentials: (
      step: Record<string, unknown>
    ) => Promise<{ apiKey: string; apiSecret: string; accessToken: string; accessSecret: string }>,
    variables: Record<string, unknown>
  ): Promise<unknown> {
    try {
      const searchQuery = substituteVariables(step.searchQuery);
      const { apiKey, apiSecret, accessToken, accessSecret } =
        await resolveTwitterCredentials(step);

      debugLogger.debug("Twitter Search Tweets", "Searching tweets", { searchQuery });

      const params: Record<string, string> = {
        query: searchQuery,
        max_results: String(step.maxResults || 10),
      };

      if (step.startTime) {
        params.start_time = new Date(step.startTime).toISOString();
      }

      if (step.endTime) {
        params.end_time = new Date(step.endTime).toISOString();
      }

      const queryString = new URLSearchParams(params).toString();
      const url = `https://api.twitter.com/2/tweets/search/recent?${queryString}`;

      const oauth = this.generateTwitterOAuthHeader(
        "GET",
        url,
        apiKey,
        apiSecret,
        accessToken,
        accessSecret
      );

      const response = await axios.get(url, {
        headers: { Authorization: oauth },
      });

      debugLogger.debug("Twitter Search Tweets", "Search completed", {
        resultsCount: response.data.data?.length || 0,
      });

      if (step.storeKey) {
        variables[step.storeKey] = response.data.data || [];
      }

      return response.data.data || [];
    } catch (error) {
      debugLogger.error("Twitter Search Tweets", "Failed to search tweets", error);
      throw error;
    }
  }

  /**
   * Execute send DM step
   */
  async executeSendDM(
    step: {
      userId: string;
      text: string;
      mediaId?: string;
      storeKey?: string;
      credentialId?: string;
      apiKey?: string;
      apiSecret?: string;
      accessToken?: string;
      accessSecret?: string;
    },
    substituteVariables: (input?: string) => string,
    resolveTwitterCredentials: (
      step: Record<string, unknown>
    ) => Promise<{ apiKey: string; apiSecret: string; accessToken: string; accessSecret: string }>,
    variables: Record<string, unknown>
  ): Promise<unknown> {
    try {
      const userId = substituteVariables(step.userId).replace("@", "");
      const text = substituteVariables(step.text);
      const { apiKey, apiSecret, accessToken, accessSecret } =
        await resolveTwitterCredentials(step);

      debugLogger.debug("Twitter Send DM", "Sending direct message", { userId });

      let recipientId = userId;
      if (!/^\d+$/.test(userId)) {
        const userOauth = this.generateTwitterOAuthHeader(
          "GET",
          `https://api.twitter.com/2/users/by/username/${userId}`,
          apiKey,
          apiSecret,
          accessToken,
          accessSecret
        );

        const userResponse = await axios.get(
          `https://api.twitter.com/2/users/by/username/${userId}`,
          {
            headers: { Authorization: userOauth },
          }
        );

        recipientId = userResponse.data.data.id;
      }

      const body: Record<string, unknown> = { text };

      if (step.mediaId) {
        body.attachments = [{ media_id: substituteVariables(step.mediaId) }];
      }

      const dmOauth = this.generateTwitterOAuthHeader(
        "POST",
        `https://api.twitter.com/2/dm_conversations/with/${recipientId}/messages`,
        apiKey,
        apiSecret,
        accessToken,
        accessSecret
      );

      const response = await axios.post(
        `https://api.twitter.com/2/dm_conversations/with/${recipientId}/messages`,
        body,
        {
          headers: {
            Authorization: dmOauth,
            "Content-Type": "application/json",
          },
        }
      );

      debugLogger.debug("Twitter Send DM", "Direct message sent successfully");

      if (step.storeKey) {
        variables[step.storeKey] = response.data;
      }

      return response.data;
    } catch (error) {
      debugLogger.error("Twitter Send DM", "Failed to send direct message", error);
      throw error;
    }
  }

  /**
   * Execute search user step
   */
  async executeSearchUser(
    step: {
      username: string;
      storeKey?: string;
      credentialId?: string;
      apiKey?: string;
      apiSecret?: string;
      accessToken?: string;
      accessSecret?: string;
    },
    substituteVariables: (input?: string) => string,
    resolveTwitterCredentials: (
      step: Record<string, unknown>
    ) => Promise<{ apiKey: string; apiSecret: string; accessToken: string; accessSecret: string }>,
    variables: Record<string, unknown>
  ): Promise<unknown> {
    try {
      const username = substituteVariables(step.username).replace("@", "");
      const { apiKey, apiSecret, accessToken, accessSecret } =
        await resolveTwitterCredentials(step);

      debugLogger.debug("Twitter Search User", "Searching user", { username });

      const oauth = this.generateTwitterOAuthHeader(
        "GET",
        `https://api.twitter.com/2/users/by/username/${username}`,
        apiKey,
        apiSecret,
        accessToken,
        accessSecret
      );

      const response = await axios.get(`https://api.twitter.com/2/users/by/username/${username}`, {
        headers: { Authorization: oauth },
      });

      debugLogger.debug("Twitter Search User", "User found", {
        userId: response.data.data?.id,
      });

      if (step.storeKey) {
        variables[step.storeKey] = response.data.data;
      }

      return response.data.data;
    } catch (error) {
      debugLogger.error("Twitter Search User", "Failed to search user", error);
      throw error;
    }
  }

  /**
   * Extract tweet ID from URL or return as-is if it's already an ID
   */
  private extractTweetId(input: string): string {
    if (/^\d+$/.test(input)) {
      return input;
    }

    try {
      const url = new URL(input);
      if (!/(twitter|x)\.com$/.test(url.hostname)) {
        throw new Error("Invalid Twitter/X domain");
      }
      const parts = url.pathname.split("/");
      if (parts.length >= 4 && parts[2] === "status" && /^\d+$/.test(parts[3])) {
        return parts[3];
      }
    } catch {
      // If parsing fails, return as-is
    }

    return input;
  }

  /**
   * Generate Twitter OAuth 1.0a Authorization header
   */
  private generateTwitterOAuthHeader(
    method: string,
    url: string,
    apiKey: string,
    apiSecret: string,
    accessToken: string,
    accessSecret: string
  ): string {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const nonce = crypto.randomBytes(32).toString("base64").replace(/\W/g, "");

    const oauthParams: Record<string, string> = {
      oauth_consumer_key: apiKey,
      oauth_nonce: nonce,
      oauth_signature_method: "HMAC-SHA1",
      oauth_timestamp: timestamp,
      oauth_token: accessToken,
      oauth_version: "1.0",
    };

    // Parse URL parameters
    const urlObj = new URL(url);
    const urlParams: Record<string, string> = {};
    urlObj.searchParams.forEach((value, key) => {
      urlParams[key] = value;
    });

    // Combine all parameters
    const allParams = { ...oauthParams, ...urlParams };

    // Create parameter string
    const sortedKeys = Object.keys(allParams).sort();
    const paramString = sortedKeys
      .map((key) => `${this.percentEncode(key)}=${this.percentEncode(allParams[key])}`)
      .join("&");

    // Create signature base string
    const baseUrl = `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`;
    const signatureBaseString = [
      method.toUpperCase(),
      this.percentEncode(baseUrl),
      this.percentEncode(paramString),
    ].join("&");

    // Create signing key
    const signingKey = `${this.percentEncode(apiSecret)}&${this.percentEncode(accessSecret)}`;

    // Generate signature
    const signature = crypto
      .createHmac("sha1", signingKey)
      .update(signatureBaseString)
      .digest("base64");

    oauthParams.oauth_signature = signature;

    // Create Authorization header
    const headerParts = Object.keys(oauthParams)
      .sort()
      .map((key) => `${this.percentEncode(key)}="${this.percentEncode(oauthParams[key])}"`)
      .join(", ");

    return `OAuth ${headerParts}`;
  }

  /**
   * Percent-encode per OAuth spec (RFC 3986)
   */
  private percentEncode(str: string): string {
    return encodeURIComponent(str)
      .replace(/!/g, "%21")
      .replace(/'/g, "%27")
      .replace(/\(/g, "%28")
      .replace(/\)/g, "%29")
      .replace(/\*/g, "%2A");
  }
}
