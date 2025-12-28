import { AutomationStep } from "@app-types/steps";
import axios from "axios";
import crypto from "crypto";
import { BrowserWindow } from "electron";
import fs from "fs";
import { debugLogger } from "./debugLogger";

/**
 * Handles execution of automation steps in the browser window
 */
export class AutomationExecutor {
  /** Unified variable storage - automatically typed by input
   * Variables are automatically typed based on input:
   * "42" → number, "true" → boolean, objects/arrays stay as-is, else string
   */
  private variables: Record<string, unknown> = {};

  /**
   * Initialize executor variable context
   */
  initVariables(vars?: Record<string, unknown>) {
    this.variables = { ...(vars || {}) };
  }

  /**
   * Expose a shallow copy of current variables (for logging / IPC)
   */
  getVariables(): Record<string, unknown> {
    return { ...this.variables };
  }

  /**
   * Get a variable value, supporting dot notation and array indexing
   * e.g., "userinfo.name" → nested property
   * e.g., "users[0]" → first array element
   * e.g., "users[0].name" → property of array element
   */
  private getVariableValue(path: string): unknown {
    // Parse path into tokens: handles both . and [index] syntax
    const tokens: (string | number)[] = [];
    let current = "";
    let i = 0;

    while (i < path.length) {
      const char = path[i];

      if (char === ".") {
        if (current) tokens.push(current);
        current = "";
        i++;
      } else if (char === "[") {
        // Handle array index [0], [1], etc.
        if (current) tokens.push(current);
        current = "";
        i++;
        let indexStr = "";
        while (i < path.length && path[i] !== "]") {
          indexStr += path[i];
          i++;
        }
        if (path[i] === "]") i++; // Skip closing ]
        const index = parseInt(indexStr, 10);
        if (!isNaN(index)) tokens.push(index);
      } else {
        current += char;
        i++;
      }
    }

    if (current) tokens.push(current);

    // Navigate through tokens
    if (tokens.length === 0) return "";

    let value: unknown = this.variables[String(tokens[0])];

    for (let i = 1; i < tokens.length; i++) {
      if (value === null || value === undefined) return "";

      const token = tokens[i];

      if (typeof token === "number") {
        // Array indexing
        if (Array.isArray(value)) {
          value = value[token];
        } else {
          return "";
        }
      } else {
        // Property access
        if (typeof value === "object") {
          value = (value as Record<string, unknown>)[token];
        } else {
          return "";
        }
      }
    }

    return value;
  }

  /**
   * Auto-detect and convert variable value to appropriate type
   */
  private parseValue(input: string): unknown {
    // Try JSON parse first (objects, arrays, null)
    try {
      const parsed = JSON.parse(input);
      return parsed;
    } catch {
      // Not JSON, try other types
    }

    // Boolean conversion
    if (input === "true") return true;
    if (input === "false") return false;

    // Number conversion
    if (!isNaN(Number(input)) && input !== "") {
      return Number(input);
    }

    // Default to string
    return input;
  }

  /**
   * Replace {{varName}} and {{varName.property}} tokens in a string with current variable values.
   * Supports dot notation for nested property access and array indexing.
   * Variables are automatically typed based on their value.
   * Examples: {{var}}, {{var.prop}}, {{array[0]}}, {{array[0].name}}
   */
  private substituteVariables(input?: string): string {
    if (!input) return "";
    // Match {{varName}}, {{varName.property}}, {{array[0]}}, etc.
    return input.replace(/\{\{\s*([a-zA-Z0-9_[\].]+)\s*\}\}/g, (_, path) => {
      const value = this.getVariableValue(path);
      if (value === null || value === undefined) return "";
      if (typeof value === "object") return JSON.stringify(value);
      return String(value);
    });
  }

  /**
   * Executes a single automation step
   * @param browserWindow - The browser window to execute the step in
   * @param step - The step configuration object
   */
  async executeStep(browserWindow: BrowserWindow, step: AutomationStep): Promise<unknown> {
    const wc = browserWindow.webContents;
    const startTime = performance.now();

    debugLogger.debug("Step Execution", `Starting ${step.type} step`, {
      stepId: step.id,
      type: step.type,
    });

    try {
      let result: unknown;

      switch (step.type) {
        case "navigate": {
          const url = this.substituteVariables(step.value);
          debugLogger.debug("Navigate", `Loading URL: ${url}`);
          await wc.loadURL(url);
          result = undefined;
          break;
        }

        case "click": {
          const clickSelector = this.substituteVariables(step.selector);
          debugLogger.debug("Click", `Clicking element with selector: ${clickSelector}`);
          await wc.executeJavaScript(`
            (() => {
              const sel = ${JSON.stringify(clickSelector)};
              let el = null;
              try { el = document.querySelector(sel); } catch(e) {}
              if (!el) {
                try { const r = document.evaluate(sel, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null); el = r.singleNodeValue; } catch(e2) {}
              }
              if (el) el.click();
            })();
          `);
          result = undefined;
          break;
        }

        case "type": {
          const typeSelector = this.substituteVariables(step.selector);
          const typeValue = this.substituteVariables(step.value);
          debugLogger.debug("Type", `Typing into selector: ${typeSelector}`, { value: typeValue });
          await wc.executeJavaScript(`
            (() => {
              const sel = ${JSON.stringify(typeSelector)};
              let el = null;
              try { el = document.querySelector(sel); } catch(e) {}
              if (!el) {
                try { const r = document.evaluate(sel, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null); el = r.singleNodeValue; } catch(e2) {}
              }
              if (el) {
                el.focus();
                el.value = ${JSON.stringify(typeValue)};
                el.dispatchEvent(new Event('input', { bubbles: true }));
              }
            })();
          `);
          result = undefined;
          break;
        }

        case "wait": {
          const waitStr = this.substituteVariables(step.value);
          const ms = parseInt(waitStr) * 1000;
          debugLogger.debug("Wait", `Waiting for ${waitStr} seconds`);
          await new Promise((resolve) => {
            setTimeout(resolve, isNaN(ms) ? 0 : ms);
          });
          result = undefined;
          break;
        }

        case "screenshot": {
          debugLogger.debug("Screenshot", "Capturing page screenshot");
          const img = await wc.capturePage();
          const timestamp = new Date().toISOString().replace(/[-:.]/g, "").slice(0, 15);
          const savePath = step.savePath || `screenshot_${timestamp}.png`;
          await fs.promises.writeFile(savePath, img.toPNG());
          debugLogger.info("Screenshot", `Screenshot saved to: ${savePath}`);
          result = img.toPNG().toString("base64");
          break;
        }

        case "extract": {
          const extractSelector = this.substituteVariables(step.selector);
          debugLogger.debug("Extract", `Extracting text from selector: ${extractSelector}`);
          const extracted = await wc.executeJavaScript(`
            (() => {
              const sel = ${JSON.stringify(extractSelector)};
              let el = null;
              try { el = document.querySelector(sel); } catch(e) {}
              if (!el) {
                try { const r = document.evaluate(sel, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null); el = r.singleNodeValue; } catch(e2) {}
              }
              return el?.innerText || "";
            })();
          `);
          if (step.storeKey) {
            this.variables[step.storeKey] = extracted;
            debugLogger.debug("Extract", `Stored extracted value in variable: ${step.storeKey}`, {
              value: extracted,
            });
          }
          result = extracted;
          break;
        }

        case "apiCall": {
          try {
            const url = this.substituteVariables(step.url);
            const method = step.method || "GET";
            debugLogger.debug("API Call", `Making ${method} request to: ${url}`);

            const rawBody = step.body ? this.substituteVariables(step.body) : undefined;
            let data: unknown = undefined;
            if (rawBody) {
              try {
                data = JSON.parse(rawBody);
              } catch {
                data = rawBody;
              }
            }
            const headers: Record<string, string> = {};
            if (step.headers) {
              for (const [k, v] of Object.entries(step.headers as Record<string, unknown>)) {
                headers[k] = this.substituteVariables(String(v));
              }
            }

            debugLogger.debug("API Call", `Request headers and data`, { headers, hasBody: !!data });
            const response = await axios({ method, url, data, headers });
            const dataOut = response.data;

            debugLogger.debug("API Call", `Response received`, {
              status: response.status,
              dataLength: JSON.stringify(dataOut).length,
            });

            if (step.storeKey) {
              this.variables[step.storeKey] = dataOut;
              debugLogger.debug("API Call", `Stored API response in variable: ${step.storeKey}`);
            }
            result = dataOut;
          } catch (error) {
            debugLogger.error("API Call", "API call failed", error);
            throw error;
          }
          break;
        }

        case "scroll": {
          if (step.scrollType === "toElement") {
            const scrollSelector = this.substituteVariables(step.selector || "");
            debugLogger.debug("Scroll", `Scrolling to element: ${scrollSelector}`);
            await wc.executeJavaScript(`
              (() => {
                const sel = ${JSON.stringify(scrollSelector)};
                let el = null;
                try { el = document.querySelector(sel); } catch(e) {}
                if (!el) {
                  try { const r = document.evaluate(sel, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null); el = r.singleNodeValue; } catch(e2) {}
                }
                if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
              })();
            `);
          } else if (step.scrollType === "byAmount") {
            debugLogger.debug("Scroll", `Scrolling by ${step.scrollAmount} pixels`);
            await wc.executeJavaScript(`window.scrollBy(0, ${step.scrollAmount || 0});`);
          }
          result = undefined;
          break;
        }

        case "selectOption": {
          const selectSelector = this.substituteVariables(step.selector);
          const optionValue = this.substituteVariables(step.optionValue);
          debugLogger.debug("Select Option", `Selecting option in: ${selectSelector}`, {
            optionValue,
          });
          await wc.executeJavaScript(`
            (() => {
              const sel = ${JSON.stringify(selectSelector)};
              let select = null;
              try { select = document.querySelector(sel); } catch(e) {}
              if (!select) {
                try { const r = document.evaluate(sel, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null); select = r.singleNodeValue; } catch(e2) {}
              }
              if (select) {
                ${step.optionValue ? `select.value = ${JSON.stringify(optionValue)};` : `select.selectedIndex = ${step.optionIndex || 0};`}
                select.dispatchEvent(new Event('change', { bubbles: true }));
              }
            })();
          `);
          result = undefined;
          break;
        }

        case "fileUpload": {
          const fuSelector = this.substituteVariables(step.selector);
          const fuFilePath = this.substituteVariables(step.filePath);
          debugLogger.debug("File Upload", `Uploading file to: ${fuSelector}`, {
            filePath: fuFilePath,
          });
          await wc.executeJavaScript(`
            (() => {
              const sel = ${JSON.stringify(fuSelector)};
              let input = null;
              try { input = document.querySelector(sel); } catch(e) {}
              if (!input) {
                try { const r = document.evaluate(sel, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null); input = r.singleNodeValue; } catch(e2) {}
              }
              if (input) {
                const file = new File([""], ${JSON.stringify(fuFilePath)}, { type: "text/plain" });
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                input.files = dataTransfer.files;
                input.dispatchEvent(new Event('change', { bubbles: true }));
              }
            })();
          `);
          result = undefined;
          break;
        }

        case "hover": {
          const hoverSelector = this.substituteVariables(step.selector);
          debugLogger.debug("Hover", `Hovering over element: ${hoverSelector}`);
          await wc.executeJavaScript(`
            (() => {
              const sel = ${JSON.stringify(hoverSelector)};
              let el = null;
              try { el = document.querySelector(sel); } catch(e) {}
              if (!el) {
                try { const r = document.evaluate(sel, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null); el = r.singleNodeValue; } catch(e2) {}
              }
              if (el) {
                const event = new MouseEvent('mouseover', { bubbles: true });
                el.dispatchEvent(event);
              }
            })();
          `);
          result = undefined;
          break;
        }

        case "setVariable": {
          const varName = step.variableName;
          const rawValue = this.substituteVariables(step.value);
          const value = this.parseValue(rawValue);
          this.variables[varName] = value;
          debugLogger.debug("Set Variable", `Variable '${varName}' set`, { value });
          result = value;
          break;
        }

        case "modifyVariable": {
          const name = step.variableName;
          const raw = this.substituteVariables(step.value);
          const op = step.operation;
          const current = this.variables[name];

          if (op === "set") {
            const value = this.parseValue(raw);
            this.variables[name] = value;
            debugLogger.debug("Modify Variable", `Variable '${name}' modified (set)`, { value });
            result = value;
          } else if (op === "increment") {
            const num = typeof current === "number" ? current : parseFloat(String(current) || "0");
            const by = parseFloat(raw || "1");
            const res = num + by;
            this.variables[name] = res;
            debugLogger.debug("Modify Variable", `Variable '${name}' incremented`, {
              from: num,
              by,
              to: res,
            });
            result = res;
          } else if (op === "decrement") {
            const num = typeof current === "number" ? current : parseFloat(String(current) || "0");
            const by = parseFloat(raw || "1");
            const res = num - by;
            this.variables[name] = res;
            debugLogger.debug("Modify Variable", `Variable '${name}' decremented`, {
              from: num,
              by,
              to: res,
            });
            result = res;
          } else if (op === "append") {
            const res = String(current || "") + raw;
            this.variables[name] = res;
            debugLogger.debug("Modify Variable", `Variable '${name}' appended`, { result: res });
            result = res;
          }
          break;
        }

        case "twitterCreateTweet": {
          try {
            const text = this.substituteVariables(step.text);
            const apiKey = this.substituteVariables(step.apiKey);
            const apiSecret = this.substituteVariables(step.apiSecret);
            const accessToken = this.substituteVariables(step.accessToken);
            const accessSecret = this.substituteVariables(step.accessSecret);

            debugLogger.debug("Twitter Create Tweet", "Creating tweet", { text });

            const body: Record<string, unknown> = { text };

            if (step.replyToTweetId) {
              body.reply = {
                in_reply_to_tweet_id: this.substituteVariables(step.replyToTweetId),
              };
            }

            if (step.quoteTweetId) {
              body.quote_tweet_id = this.substituteVariables(step.quoteTweetId);
            }

            if (step.mediaId) {
              body.media = { media_ids: [this.substituteVariables(step.mediaId)] };
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
              this.variables[step.storeKey] = response.data.data;
            }

            result = response.data.data;
          } catch (error) {
            debugLogger.error("Twitter Create Tweet", "Failed to create tweet", error);
            throw error;
          }
          break;
        }

        case "twitterDeleteTweet": {
          try {
            const tweetId = this.extractTweetId(this.substituteVariables(step.tweetId));
            const apiKey = this.substituteVariables(step.apiKey);
            const apiSecret = this.substituteVariables(step.apiSecret);
            const accessToken = this.substituteVariables(step.accessToken);
            const accessSecret = this.substituteVariables(step.accessSecret);

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
              this.variables[step.storeKey] = response.data;
            }

            result = response.data;
          } catch (error) {
            debugLogger.error("Twitter Delete Tweet", "Failed to delete tweet", error);
            throw error;
          }
          break;
        }

        case "twitterLikeTweet": {
          try {
            const tweetId = this.extractTweetId(this.substituteVariables(step.tweetId));
            const apiKey = this.substituteVariables(step.apiKey);
            const apiSecret = this.substituteVariables(step.apiSecret);
            const accessToken = this.substituteVariables(step.accessToken);
            const accessSecret = this.substituteVariables(step.accessSecret);

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
              this.variables[step.storeKey] = response.data;
            }

            result = response.data;
          } catch (error) {
            debugLogger.error("Twitter Like Tweet", "Failed to like tweet", error);
            throw error;
          }
          break;
        }

        case "twitterRetweet": {
          try {
            const tweetId = this.extractTweetId(this.substituteVariables(step.tweetId));
            const apiKey = this.substituteVariables(step.apiKey);
            const apiSecret = this.substituteVariables(step.apiSecret);
            const accessToken = this.substituteVariables(step.accessToken);
            const accessSecret = this.substituteVariables(step.accessSecret);

            debugLogger.debug("Twitter Retweet", "Retweeting", { tweetId });

            // Get current user ID
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
              this.variables[step.storeKey] = response.data;
            }

            result = response.data;
          } catch (error) {
            debugLogger.error("Twitter Retweet", "Failed to retweet", error);
            throw error;
          }
          break;
        }

        case "twitterSearchTweets": {
          try {
            const searchQuery = this.substituteVariables(step.searchQuery);
            const apiKey = this.substituteVariables(step.apiKey);
            const apiSecret = this.substituteVariables(step.apiSecret);
            const accessToken = this.substituteVariables(step.accessToken);
            const accessSecret = this.substituteVariables(step.accessSecret);

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
              this.variables[step.storeKey] = response.data.data || [];
            }

            result = response.data.data || [];
          } catch (error) {
            debugLogger.error("Twitter Search Tweets", "Failed to search tweets", error);
            throw error;
          }
          break;
        }

        case "twitterSendDM": {
          try {
            const userId = this.substituteVariables(step.userId).replace("@", "");
            const text = this.substituteVariables(step.text);
            const apiKey = this.substituteVariables(step.apiKey);
            const apiSecret = this.substituteVariables(step.apiSecret);
            const accessToken = this.substituteVariables(step.accessToken);
            const accessSecret = this.substituteVariables(step.accessSecret);

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
              body.attachments = [{ media_id: this.substituteVariables(step.mediaId) }];
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
              this.variables[step.storeKey] = response.data;
            }

            result = response.data;
          } catch (error) {
            debugLogger.error("Twitter Send DM", "Failed to send direct message", error);
            throw error;
          }
          break;
        }

        case "twitterSearchUser": {
          try {
            const username = this.substituteVariables(step.username).replace("@", "");
            const apiKey = this.substituteVariables(step.apiKey);
            const apiSecret = this.substituteVariables(step.apiSecret);
            const accessToken = this.substituteVariables(step.accessToken);
            const accessSecret = this.substituteVariables(step.accessSecret);

            debugLogger.debug("Twitter Search User", "Searching user", { username });

            const oauth = this.generateTwitterOAuthHeader(
              "GET",
              `https://api.twitter.com/2/users/by/username/${username}`,
              apiKey,
              apiSecret,
              accessToken,
              accessSecret
            );

            const response = await axios.get(
              `https://api.twitter.com/2/users/by/username/${username}`,
              {
                headers: { Authorization: oauth },
              }
            );

            debugLogger.debug("Twitter Search User", "User found", {
              userId: response.data.data?.id,
            });

            if (step.storeKey) {
              this.variables[step.storeKey] = response.data.data;
            }

            result = response.data.data;
          } catch (error) {
            debugLogger.error("Twitter Search User", "Failed to search user", error);
            throw error;
          }
          break;
        }
      }

      const duration = performance.now() - startTime;
      debugLogger.logOperation(
        "Step Execution",
        `${step.type} step completed successfully`,
        duration
      );
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      debugLogger.error(
        "Step Execution",
        `${step.type} step failed after ${duration.toFixed(2)}ms`,
        error
      );
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

  /**
   * Evaluates a conditional node (elementExists or valueMatches)
   */
  async evaluateConditional(
    browserWindow: BrowserWindow,
    config: {
      conditionType: string;
      selector: string;
      expectedValue?: string;
      nodeId?: string;
      condition?: string;
      transformType?: string;
      transformPattern?: string;
      transformReplace?: string;
      transformChars?: string;
      parseAsNumber?: boolean;
    }
  ): Promise<{
    conditionResult: boolean;
    effectiveSelector?: string | null;
  }> {
    const wc = browserWindow.webContents;
    const { conditionType, selector, expectedValue } = config;
    const startTime = performance.now();

    debugLogger.debug("Conditional", `Evaluating ${conditionType} condition`, {
      selector,
      expectedValue,
    });

    const runtimeSelector = this.substituteVariables(selector);

    const applyTransform = (raw: string) => {
      if (!raw) return raw;
      const t = config.transformType || "none";
      let s = raw;
      if (t === "stripCurrency") {
        s = s.replace(/[$€£,\s]/g, "");
      } else if (t === "stripNonNumeric") {
        s = s.replace(/[^0-9.-]/g, "");
      } else if (t === "removeChars" && config.transformChars) {
        const chars = config.transformChars.split("");
        for (const c of chars) s = s.split(c).join("");
      } else if (t === "regexReplace" && config.transformPattern) {
        try {
          const re = new RegExp(config.transformPattern, "g");
          s = s.replace(re, config.transformReplace ?? "");
        } catch (_e) {
          debugLogger.warn("Conditional", "Invalid regex pattern", {
            pattern: config.transformPattern,
          });
        }
      }
      return s;
    };

    let conditionResult = false;

    if (conditionType === "elementExists") {
      conditionResult = await wc.executeJavaScript(`
        (() => {
          const sel = ${JSON.stringify(runtimeSelector)};
          let el = null;
          try { el = document.querySelector(sel); } catch(e) {}
          if (!el) {
            try { const r = document.evaluate(sel, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null); el = r.singleNodeValue; } catch(e2) {}
          }
          return !!el;
        })();
      `);
      debugLogger.debug("Conditional", `Element ${conditionResult ? "found" : "not found"}`, {
        selector: runtimeSelector,
      });
    } else if (conditionType === "valueMatches") {
      const rawValue: string = await wc.executeJavaScript(`
        (() => {
          const sel = ${JSON.stringify(runtimeSelector)};
          let el = null;
          try { el = document.querySelector(sel); } catch(e) {}
          if (!el) {
            try { const r = document.evaluate(sel, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null); el = r.singleNodeValue; } catch(e2) {}
          }
          return el?.innerText || "";
        })();
      `);
      const transformed = applyTransform(rawValue);
      const expected = this.substituteVariables(expectedValue || "");
      const op = config.condition || "equals";

      debugLogger.debug("Conditional", "Value matching", {
        rawValue,
        transformed,
        expected,
        operator: op,
      });

      if (config.parseAsNumber) {
        const a = parseFloat(transformed.replace(/[^0-9.-]/g, ""));
        const b = parseFloat(expected.replace(/[^0-9.-]/g, ""));
        conditionResult =
          !isNaN(a) &&
          !isNaN(b) &&
          (op === "greaterThan"
            ? a > b
            : op === "lessThan"
              ? a < b
              : op === "contains"
                ? transformed.includes(expected)
                : a === b);
        debugLogger.debug(
          "Conditional",
          `Numeric comparison: ${a} ${op} ${b} = ${conditionResult}`
        );
      } else {
        conditionResult =
          op === "contains"
            ? transformed.includes(expected)
            : op === "greaterThan"
              ? parseFloat(transformed) > parseFloat(expected)
              : op === "lessThan"
                ? parseFloat(transformed) < parseFloat(expected)
                : transformed === expected;
      }
    }

    const duration = performance.now() - startTime;
    debugLogger.logOperation("Conditional", `Condition evaluated to: ${conditionResult}`, duration);

    return { conditionResult, effectiveSelector: runtimeSelector };
  }
}
