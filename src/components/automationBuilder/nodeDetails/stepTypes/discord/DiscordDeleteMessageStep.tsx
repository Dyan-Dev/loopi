import { StepProps } from "@components/automationBuilder/nodeDetails/stepTypes/types";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { DiscordCredentialField } from "./DiscordCredentialField";

export function DiscordDeleteMessageStep({ step, id, onUpdate }: StepProps) {
  if (step.type !== "discordDeleteMessage") return null;

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label className="text-xs">Channel ID</Label>
        <Input
          value={step.channelId || ""}
          placeholder="Channel ID"
          onChange={(e) => onUpdate(id, "update", { step: { ...step, channelId: e.target.value } })}
          className="text-xs"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Message ID</Label>
        <Input
          value={step.messageId || ""}
          placeholder="Message ID"
          onChange={(e) => onUpdate(id, "update", { step: { ...step, messageId: e.target.value } })}
          className="text-xs"
        />
      </div>

      <DiscordCredentialField
        credentialId={step.credentialId}
        botToken={step.botToken}
        onUpdate={(creds) => onUpdate(id, "update", { step: { ...step, ...creds } })}
      />
    </div>
  );
}
