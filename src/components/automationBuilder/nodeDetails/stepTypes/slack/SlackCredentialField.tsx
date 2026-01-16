import { Button } from "@components/ui/button";
import { CredentialSelector } from "@components/ui/credential-selector";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { useState } from "react";

interface SlackCredentialFieldProps {
  credentialId?: string;
  apiToken?: string;
  botToken?: string;
  onUpdate: (creds: { credentialId?: string; apiToken?: string; botToken?: string }) => void;
}

export function SlackCredentialField({
  credentialId,
  apiToken,
  botToken,
  onUpdate,
}: SlackCredentialFieldProps) {
  const [useManualCredentials, setUseManualCredentials] = useState(!credentialId && !!apiToken);

  const handleToggle = () => {
    setUseManualCredentials(!useManualCredentials);
    if (useManualCredentials) {
      // Switching to saved credentials - clear manual fields
      onUpdate({
        credentialId: undefined,
        apiToken: undefined,
        botToken: undefined,
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
          type="slack"
          value={credentialId}
          onChange={(id) =>
            onUpdate({
              credentialId: id,
              apiToken: undefined,
              botToken: undefined,
            })
          }
          label=""
        />
      ) : (
        <>
          <div className="space-y-2">
            <Label className="text-xs">API Token</Label>
            <Input
              type="password"
              value={apiToken || ""}
              placeholder="xoxb-... (bot token) or xoxp-... (user token)"
              onChange={(e) =>
                onUpdate({
                  apiToken: e.target.value,
                  credentialId: undefined,
                })
              }
              className="text-xs"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Bot Token (optional)</Label>
            <Input
              type="password"
              value={botToken || ""}
              placeholder="xoxb-... (alternative bot token)"
              onChange={(e) =>
                onUpdate({
                  botToken: e.target.value,
                  credentialId: undefined,
                })
              }
              className="text-xs"
            />
          </div>
        </>
      )}
    </div>
  );
}
