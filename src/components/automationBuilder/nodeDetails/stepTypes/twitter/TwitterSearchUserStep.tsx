import { StepProps } from "@components/automationBuilder/nodeDetails/stepTypes/types";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { TwitterCredentialField } from "./TwitterCredentialField";

export function TwitterSearchUserStep({ step, id, onUpdate }: StepProps) {
  if (step.type !== "twitterSearchUser") return null;

  return (
    <>
      <div className="space-y-2">
        <Label className="text-xs">Username</Label>
        <Input
          value={step.username || ""}
          placeholder="@username or username"
          onChange={(e) => onUpdate(id, "update", { step: { ...step, username: e.target.value } })}
          className="text-xs"
        />
        <p className="text-xs text-gray-500">
          Supports variables like {"{"}
          {"{"}targetUser{"}}"}
        </p>
      </div>

      <TwitterCredentialField
        credentialId={step.credentialId}
        apiKey={step.apiKey}
        apiSecret={step.apiSecret}
        accessToken={step.accessToken}
        accessSecret={step.accessSecret}
        onUpdate={(creds) => onUpdate(id, "update", { step: { ...step, ...creds } })}
      />

      <div className="space-y-2">
        <Label className="text-xs">Store User Data in Variable</Label>
        <Input
          value={step.storeKey || ""}
          placeholder="Variable name (e.g., userInfo)"
          onChange={(e) => onUpdate(id, "update", { step: { ...step, storeKey: e.target.value } })}
          className="text-xs"
        />
        <p className="text-xs text-gray-500">User data includes ID, followers, bio, etc.</p>
      </div>
    </>
  );
}
