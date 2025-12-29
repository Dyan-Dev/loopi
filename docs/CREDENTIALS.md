# Credentials Management

The Loopi Credentials Management system provides a secure way to store and reuse API keys, secrets, and authentication tokens across your automations.

## Overview

Instead of entering API credentials manually for each automation step, you can save them once in the Credentials Manager and reference them across multiple steps and automations.

## Features

- **Encrypted Storage**: All credentials are encrypted using AES-256-CBC encryption before being saved to disk
- **Multiple Credential Types**: Support for Twitter, OAuth 2.0, API Keys, Basic Auth, and Custom credentials
- **Reusable**: Use the same credential across multiple automation steps
- **Secure**: Credentials are never exposed in logs or UI (shown as ••••••••)
- **Easy Management**: Add, edit, and delete credentials from the Settings page

## Credential Types

### Twitter/X
Store Twitter API v2 credentials for posting tweets, sending DMs, searching, etc.

**Required fields:**
- API Key
- API Secret
- Access Token
- Access Token Secret

### OAuth 2.0
Generic OAuth 2.0 credentials for third-party services.

**Required fields:**
- Client ID
- Client Secret
- Redirect URI

### API Key
Simple API key authentication.

**Required fields:**
- API Key
- API URL (optional)

### Basic Auth
Username and password authentication.

**Required fields:**
- Username
- Password

### Custom
For custom authentication schemes not covered by the above types.

## Using Credentials

### Adding a Credential

1. Go to Settings → Credentials tab
2. Click "Add Credential"
3. Enter a descriptive name (e.g., "My Twitter Account")
4. Select the credential type
5. Fill in the required fields
6. Click "Add Credential"

### Using in Automation Steps

1. When configuring a Twitter step (or other step that supports credentials)
2. You'll see an "Authentication" section
3. By default, you can select from your saved credentials
4. Click "Enter Manually" to switch to direct input if needed
5. Select your saved credential from the dropdown
6. The step will automatically use those credentials during execution

### Editing Credentials

1. Go to Settings → Credentials
2. Click "Edit" on the credential you want to modify
3. Update the fields (all fields are shown, even if stored as •••••••)
4. Click "Save Changes"

### Deleting Credentials

1. Go to Settings → Credentials
2. Click the trash icon on the credential you want to remove
3. Confirm deletion

⚠️ **Warning**: Deleting a credential will cause any automation steps using it to fail. Make sure to update those steps first.

## Security

### Encryption
Credentials are encrypted using:
- Algorithm: AES-256-CBC
- Key Derivation: PBKDF2 with 100,000 iterations
- Random IV for each encryption operation

### Storage Location
Encrypted credentials are stored in:
```
<userData>/credentials.json.enc
```

Where `<userData>` is your Electron app's user data directory (platform-specific).

### Best Practices

1. **Don't share credentials files**: The encryption is tied to your machine
2. **Regular rotation**: Rotate API keys and tokens periodically
3. **Least privilege**: Use credentials with minimal required permissions
4. **Delete unused credentials**: Remove credentials you no longer need
5. **Backup carefully**: If backing up credentials, ensure secure storage

## API Reference

### IPC Methods

The credentials API is exposed to the renderer process via IPC:

```typescript
// List all credentials
const credentials = await window.electronAPI.credentials.list();

// Get a specific credential
const credential = await window.electronAPI.credentials.get("credential-id");

// Add a new credential
await window.electronAPI.credentials.add({
  name: "My API Key",
  type: "apiKey",
  data: { apiKey: "sk_test_123..." }
});

// Update a credential
await window.electronAPI.credentials.update("credential-id", {
  name: "Updated Name",
  data: { apiKey: "sk_live_456..." }
});

// Delete a credential
await window.electronAPI.credentials.delete("credential-id");
```

### Type Definitions

```typescript
interface Credential {
  id: string;
  name: string;
  type: "twitter" | "oauth" | "apiKey" | "basic" | "custom";
  createdAt: string;
  updatedAt: string;
  data: Record<string, string>;
}
```

## Migration from Direct Input

If you have existing automations that use direct credential input:

1. Create a credential in the Credentials Manager with those values
2. Edit each step and switch to "Use Saved Credential"
3. Select the credential from the dropdown
4. The step will now use the saved credential

**Legacy Support**: Steps with direct credential fields will continue to work. The system checks for `credentialId` first, then falls back to direct fields.

## Troubleshooting

### "Invalid or missing credential" error
- The credential ID may have been deleted
- The credential type doesn't match the step type
- Re-select the credential or create a new one

### Credentials not showing in dropdown
- Check that you've created credentials of the correct type
- Click the refresh button (+ icon) to reload
- Verify credentials exist in Settings → Credentials

### Can't edit/delete credential
- Close any open automation builders first
- Check file permissions on the credentials file
- Restart the application

## Examples

### Twitter Automation with Saved Credentials

```json
{
  "type": "twitterCreateTweet",
  "text": "Hello from Loopi!",
  "credentialId": "cred-abc123",
  "storeKey": "tweetResult"
}
```

### API Call with API Key Credential

```json
{
  "type": "apiCall",
  "method": "GET",
  "url": "https://api.example.com/data",
  "credentialId": "cred-def456"
}
```
