import { StepProps } from "@components/automationBuilder/nodeDetails/stepTypes/types";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { SlackCredentialField } from "./SlackCredentialField";

export function SlackListUsersStep({ step, id, onUpdate }: StepProps) {
  if (step.type !== "slackListUsers") return null;

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label className="text-xs">Limit (optional)</Label>
        <Input
          type="number"
          value={step.limit || ""}
          placeholder="Maximum number of users (default: all)"
          onChange={(e) =>
            onUpdate(id, "update", {
              step: { ...step, limit: e.target.value ? parseInt(e.target.value) : undefined },
            })
          }
          className="text-xs"
        />
      </div>

      <SlackCredentialField
        credentialId={step.credentialId}
        apiToken={step.apiToken}
        botToken={step.botToken}
        onUpdate={(creds) => onUpdate(id, "update", { step: { ...step, ...creds } })}
      />

      <div className="space-y-2">
        <Label className="text-xs">Store Response (optional)</Label>
        <Input
          value={step.storeKey || ""}
          placeholder="Variable name (e.g., users)"
          onChange={(e) => onUpdate(id, "update", { step: { ...step, storeKey: e.target.value } })}
          className="text-xs"
        />
      </div>
    </div>
  );
}
