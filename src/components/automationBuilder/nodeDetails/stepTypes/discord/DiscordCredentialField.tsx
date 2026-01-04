import { Button } from "@components/ui/button";
import { CredentialSelector } from "@components/ui/credential-selector";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { useState } from "react";

interface DiscordCredentialFieldProps {
  credentialId?: string;
  botToken?: string;
  onUpdate: (updates: { credentialId?: string; botToken?: string }) => void;
}

export function DiscordCredentialField({
  credentialId,
  botToken,
  onUpdate,
}: DiscordCredentialFieldProps) {
  const [useManualCredentials, setUseManualCredentials] = useState(
    !credentialId && !!botToken
  );

  const handleToggle = () => {
    setUseManualCredentials(!useManualCredentials);
    if (useManualCredentials) {
      // Switching to saved credentials - clear manual fields
      onUpdate({
        credentialId: undefined,
        botToken: undefined,
      });
    }
  };

  return (
    <div className="space-y-3">
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
          type="discord"
          value={credentialId}
          onChange={(id) =>
            onUpdate({
              credentialId: id,
              botToken: undefined,
            })
          }
          label=""
        />
      ) : (
        <>
          <div className="space-y-2">
            <Label className="text-xs">Bot Token</Label>
            <Input
              value={botToken || ""}
              placeholder="Your Discord Bot Token"
              onChange={(e) =>
                onUpdate({
                  botToken: e.target.value,
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
