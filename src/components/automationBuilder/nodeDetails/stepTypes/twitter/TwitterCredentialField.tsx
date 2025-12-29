import { Button } from "@components/ui/button";
import { CredentialSelector } from "@components/ui/credential-selector";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { useState } from "react";

interface TwitterCredentialFieldProps {
  credentialId?: string;
  apiKey?: string;
  apiSecret?: string;
  accessToken?: string;
  accessSecret?: string;
  onUpdate: (update: {
    credentialId?: string;
    apiKey?: string;
    apiSecret?: string;
    accessToken?: string;
    accessSecret?: string;
  }) => void;
}

export function TwitterCredentialField({
  credentialId,
  apiKey,
  apiSecret,
  accessToken,
  accessSecret,
  onUpdate,
}: TwitterCredentialFieldProps) {
  const [useManualCredentials, setUseManualCredentials] = useState(
    !credentialId && (!!apiKey || !!apiSecret || !!accessToken || !!accessSecret)
  );

  const handleToggle = () => {
    setUseManualCredentials(!useManualCredentials);
    if (useManualCredentials) {
      // Switching to saved credentials - clear manual fields
      onUpdate({
        credentialId: undefined,
        apiKey: undefined,
        apiSecret: undefined,
        accessToken: undefined,
        accessSecret: undefined,
      });
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs">Authentication</Label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleToggle}
          className="text-xs h-7"
        >
          {useManualCredentials ? "Use Saved Credential" : "Enter Manually"}
        </Button>
      </div>

      {!useManualCredentials ? (
        <CredentialSelector
          value={credentialId}
          onChange={(credId) =>
            onUpdate({
              credentialId: credId,
              apiKey: undefined,
              apiSecret: undefined,
              accessToken: undefined,
              accessSecret: undefined,
            })
          }
          type="twitter"
          label=""
        />
      ) : (
        <>
          <div className="space-y-2">
            <Label className="text-xs">API Key</Label>
            <Input
              value={apiKey || ""}
              placeholder="Your Twitter API Key"
              onChange={(e) =>
                onUpdate({
                  apiKey: e.target.value,
                  credentialId: undefined,
                })
              }
              className="text-xs"
              type="password"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs">API Secret</Label>
            <Input
              value={apiSecret || ""}
              placeholder="Your Twitter API Secret"
              onChange={(e) =>
                onUpdate({
                  apiSecret: e.target.value,
                  credentialId: undefined,
                })
              }
              className="text-xs"
              type="password"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Access Token</Label>
            <Input
              value={accessToken || ""}
              placeholder="Your Twitter Access Token"
              onChange={(e) =>
                onUpdate({
                  accessToken: e.target.value,
                  credentialId: undefined,
                })
              }
              className="text-xs"
              type="password"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Access Token Secret</Label>
            <Input
              value={accessSecret || ""}
              placeholder="Your Twitter Access Token Secret"
              onChange={(e) =>
                onUpdate({
                  accessSecret: e.target.value,
                  credentialId: undefined,
                })
              }
              className="text-xs"
              type="password"
            />
          </div>
        </>
      )}
    </div>
  );
}
