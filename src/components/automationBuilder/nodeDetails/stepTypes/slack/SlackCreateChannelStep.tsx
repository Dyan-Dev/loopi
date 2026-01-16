import { StepProps } from "@components/automationBuilder/nodeDetails/stepTypes/types";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { Switch } from "@components/ui/switch";
import { Textarea } from "@components/ui/textarea";
import { SlackCredentialField } from "./SlackCredentialField";

export function SlackCreateChannelStep({ step, id, onUpdate }: StepProps) {
  if (step.type !== "slackCreateChannel") return null;

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label className="text-xs">Channel Name</Label>
        <Input
          value={step.channelName || ""}
          placeholder="Channel name (e.g., general, my-project)"
          onChange={(e) =>
            onUpdate(id, "update", { step: { ...step, channelName: e.target.value } })
          }
          className="text-xs"
        />
      </div>

      <div className="flex items-center gap-2">
        <Switch
          checked={!!step.isPrivate}
          onCheckedChange={(checked) =>
            onUpdate(id, "update", { step: { ...step, isPrivate: checked } })
          }
          id={`${id}-private`}
        />
        <Label htmlFor={`${id}-private`} className="text-xs">
          Make Private Channel
        </Label>
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Channel Description (optional)</Label>
        <Textarea
          value={step.channelDescription || ""}
          placeholder="Description for the channel"
          onChange={(e) =>
            onUpdate(id, "update", { step: { ...step, channelDescription: e.target.value } })
          }
          className="text-xs"
          rows={3}
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
          placeholder="Variable name (e.g., newChannel)"
          onChange={(e) => onUpdate(id, "update", { step: { ...step, storeKey: e.target.value } })}
          className="text-xs"
        />
      </div>
    </div>
  );
}
