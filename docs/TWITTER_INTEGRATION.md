# Twitter/X Integration Guide

Complete guide for using Twitter/X automation steps in Loopi.

## Overview

The Twitter integration allows you to automate interactions with Twitter/X, including:
- Creating, deleting, and searching tweets
- Liking and retweeting tweets
- Sending direct messages
- Searching for users
- Full variable support for dynamic content

## Prerequisites

### Twitter API Credentials

You need Twitter API v2 credentials to use these steps:

1. **API Key** (Consumer Key)
2. **API Secret** (Consumer Secret)
3. **Access Token**
4. **Access Token Secret**

### Getting Credentials

1. Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Create a new app or use an existing one
3. Navigate to "Keys and tokens"
4. Generate/copy your credentials
5. Ensure your app has the appropriate permissions (Read, Write, and Direct Messages)

## Step Types

### 1. Create Tweet

Post a new tweet to Twitter/X.

**Fields:**
- **Tweet Text**: Content of the tweet (max 280 characters)
- **API Key**: Your Twitter API Key
- **API Secret**: Your Twitter API Secret
- **Access Token**: Your Access Token
- **Access Token Secret**: Your Access Token Secret
- **Reply to Tweet ID** (optional): Tweet ID to reply to
- **Quote Tweet ID** (optional): Tweet ID to quote
- **Media ID** (optional): Media ID to attach
- **Store Response in Variable** (optional): Variable to store the response

**Example:**
```json
{
  "type": "twitterCreateTweet",
  "text": "Hello from Loopi! #automation",
  "apiKey": "your_api_key",
  "apiSecret": "your_api_secret",
  "accessToken": "your_access_token",
  "accessSecret": "your_access_secret",
  "storeKey": "tweetData"
}
```

**With Variables:**
```json
{
  "type": "twitterCreateTweet",
  "text": "The price is now {{currentPrice}}! Check it out.",
  "replyToTweetId": "{{targetTweetId}}",
  "storeKey": "newTweet"
}
```

### 2. Delete Tweet

Delete a tweet from your account.

**Fields:**
- **Tweet ID**: ID or URL of the tweet to delete
- **API Credentials**: API Key, Secret, Access Token, Access Secret
- **Store Response in Variable** (optional)

**Example:**
```json
{
  "type": "twitterDeleteTweet",
  "tweetId": "1234567890123456789",
  "apiKey": "your_api_key",
  "apiSecret": "your_api_secret",
  "accessToken": "your_access_token",
  "accessSecret": "your_access_secret"
}
```

**Tweet ID Formats:**
- Direct ID: `1234567890123456789`
- Full URL: `https://twitter.com/username/status/1234567890123456789`
- X.com URL: `https://x.com/username/status/1234567890123456789`
- Variable: `{{tweetId}}`

### 3. Like Tweet

Like a tweet on Twitter/X.

**Fields:**
- **Tweet ID**: ID or URL of the tweet to like
- **API Credentials**: API Key, Secret, Access Token, Access Secret
- **Store Response in Variable** (optional)

**Example:**
```json
{
  "type": "twitterLikeTweet",
  "tweetId": "{{foundTweet.id}}",
  "apiKey": "your_api_key",
  "storeKey": "likeResult"
}
```

### 4. Retweet

Retweet a tweet to your timeline.

**Fields:**
- **Tweet ID**: ID or URL of the tweet to retweet
- **API Credentials**: API Key, Secret, Access Token, Access Secret
- **Store Response in Variable** (optional)

**Example:**
```json
{
  "type": "twitterRetweet",
  "tweetId": "https://twitter.com/user/status/123456789",
  "apiKey": "your_api_key",
  "storeKey": "retweetResult"
}
```

### 5. Search Tweets

Search for tweets using Twitter's search API (last 7 days for standard access).

**Fields:**
- **Search Query**: Search term or query with operators
- **Max Results** (optional): Number of results (1-100, default: 10)
- **Start Time** (optional): Filter tweets after this date
- **End Time** (optional): Filter tweets before this date
- **API Credentials**: API Key, Secret, Access Token, Access Secret
- **Store Results in Variable**: Variable to store search results

**Search Operators:**
- `from:username` - Tweets from specific user
- `to:username` - Replies to specific user
- `#hashtag` - Tweets with hashtag
- `"exact phrase"` - Exact phrase matching
- `keyword1 OR keyword2` - Either keyword
- `keyword1 AND keyword2` - Both keywords
- `-keyword` - Exclude keyword

**Example:**
```json
{
  "type": "twitterSearchTweets",
  "searchQuery": "automation -bot lang:en",
  "maxResults": 20,
  "apiKey": "your_api_key",
  "storeKey": "searchResults"
}
```

**Using Results:**
```json
{
  "type": "setVariable",
  "variableName": "firstTweetId",
  "value": "{{searchResults[0].id}}"
}
```

### 6. Send Direct Message

Send a direct message to a Twitter user.

**Fields:**
- **User ID**: Twitter user ID or @username
- **Message Text**: Content of the message
- **Media ID** (optional): Media ID to attach
- **API Credentials**: API Key, Secret, Access Token, Access Secret
- **Store Response in Variable** (optional)

**Example:**
```json
{
  "type": "twitterSendDM",
  "userId": "@targetuser",
  "text": "Hello! This is an automated message from Loopi.",
  "apiKey": "your_api_key",
  "storeKey": "dmResponse"
}
```

**With Variables:**
```json
{
  "type": "twitterSendDM",
  "userId": "{{foundUser.id}}",
  "text": "Hi {{foundUser.name}}, your order is ready!",
  "storeKey": "dmResponse"
}
```

### 7. Search User

Search for a Twitter user by username.

**Fields:**
- **Username**: Twitter username (with or without @)
- **API Credentials**: API Key, Secret, Access Token, Access Secret
- **Store User Data in Variable**: Variable to store user information

**Example:**
```json
{
  "type": "twitterSearchUser",
  "username": "elonmusk",
  "apiKey": "your_api_key",
  "storeKey": "userInfo"
}
```

**User Data Available:**
- `{{userInfo.id}}` - User ID
- `{{userInfo.name}}` - Display name
- `{{userInfo.username}}` - Username (handle)
- Additional fields available in the response

## Complete Workflow Examples

### Example 1: Automated Tweet Thread

```json
{
  "nodes": [
    {
      "type": "twitterCreateTweet",
      "text": "Thread 1/3: Introduction to automation",
      "storeKey": "tweet1"
    },
    {
      "type": "twitterCreateTweet",
      "text": "Thread 2/3: Benefits of automation",
      "replyToTweetId": "{{tweet1.id}}",
      "storeKey": "tweet2"
    },
    {
      "type": "twitterCreateTweet",
      "text": "Thread 3/3: Get started today!",
      "replyToTweetId": "{{tweet2.id}}",
      "storeKey": "tweet3"
    }
  ]
}
```

### Example 2: Monitor and Respond

```json
{
  "nodes": [
    {
      "type": "twitterSearchTweets",
      "searchQuery": "from:mycompany help OR support",
      "maxResults": 10,
      "storeKey": "supportTweets"
    },
    {
      "type": "twitterCreateTweet",
      "text": "@{{supportTweets[0].author_id}} Thank you for reaching out! Our team will assist you shortly.",
      "replyToTweetId": "{{supportTweets[0].id}}"
    }
  ]
}
```

### Example 3: Engagement Automation

```json
{
  "nodes": [
    {
      "type": "twitterSearchTweets",
      "searchQuery": "#OpenSource #JavaScript",
      "maxResults": 5,
      "storeKey": "relevantTweets"
    },
    {
      "type": "twitterLikeTweet",
      "tweetId": "{{relevantTweets[0].id}}"
    },
    {
      "type": "twitterRetweet",
      "tweetId": "{{relevantTweets[0].id}}"
    }
  ]
}
```

## Best Practices

### Security

1. **Never commit credentials**: Use environment variables or secure storage
2. **Store credentials encrypted**: Consider using credential management
3. **Rotate credentials regularly**: Update API keys periodically
4. **Use read-only when possible**: Limit permissions to what's needed

### Rate Limits

Twitter API has rate limits. For standard access:
- **Post Tweet**: 200 requests per 15 minutes
- **Delete Tweet**: 50 requests per 15 minutes
- **Search Tweets**: 450 requests per 15 minutes
- **User Lookup**: 900 requests per 15 minutes

Add `wait` steps between requests for large-scale automation:

```json
{
  "type": "wait",
  "value": "5"
}
```

### Error Handling

Use conditional nodes to handle failures:

```json
{
  "type": "conditional",
  "conditionType": "valueMatches",
  "selector": "{{tweetResponse}}",
  "condition": "contains",
  "expectedValue": "error"
}
```

### Variable Management

1. **Store responses**: Always use `storeKey` to capture responses
2. **Check data**: Use conditionals to verify data before use
3. **Clean variables**: Reset variables when starting new workflows

## Troubleshooting

### Common Issues

**"Invalid or expired token"**
- Check your API credentials are correct
- Ensure access tokens haven't expired
- Verify app permissions in Twitter Developer Portal

**"This request is not authorized"**
- Confirm your app has the required access level
- Check if you're trying to perform actions beyond your permission level

**"Rate limit exceeded"**
- Add wait steps between requests
- Reduce the frequency of your automation
- Consider upgrading your Twitter API access level

**"Tweet not found"**
- Verify the tweet ID is correct
- Ensure the tweet hasn't been deleted
- Check if the tweet is from a protected account

**"User not found"**
- Verify the username is correct (without extra spaces)
- Check if the user account is suspended or deleted

## Additional Resources

- [Twitter API Documentation](https://developer.twitter.com/en/docs/twitter-api)
- [Twitter API v2 Rate Limits](https://developer.twitter.com/en/docs/twitter-api/rate-limits)
- [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
- [Loopi Documentation](../README.md)

## Support

For issues or questions:
- Open an issue on [GitHub](https://github.com/Dyan-Dev/loopi/issues)
- Check the [community discussions](https://github.com/Dyan-Dev/loopi/discussions)
- Email support: support@dyan.live
