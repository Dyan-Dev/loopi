import { StepProps } from "@components/automationBuilder/nodeDetails/stepTypes/types";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { Switch } from "@components/ui/switch";
import { SlackCredentialField } from "./SlackCredentialField";

export function SlackListChannelsStep({ step, id, onUpdate }: StepProps) {
  if (step.type !== "slackListChannels") return null;

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label className="text-xs">Limit (optional)</Label>
        <Input
          type="number"
          value={step.limit || ""}
          placeholder="Maximum number of channels to return (default: all)"
          onChange={(e) =>
            onUpdate(id, "update", {
              step: { ...step, limit: e.target.value ? parseInt(e.target.value) : undefined },
            })
          }
          className="text-xs"
        />
      </div>

      <div className="flex items-center gap-2">
        <Switch
          checked={!!step.excludeArchived}
          onCheckedChange={(checked) =>
            onUpdate(id, "update", { step: { ...step, excludeArchived: checked } })
          }
          id={`${id}-exclude-archived`}
        />
        <Label htmlFor={`${id}-exclude-archived`} className="text-xs">
          Exclude Archived Channels
        </Label>
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
          placeholder="Variable name (e.g., channels)"
          onChange={(e) => onUpdate(id, "update", { step: { ...step, storeKey: e.target.value } })}
          className="text-xs"
        />
      </div>
    </div>
  );
}
