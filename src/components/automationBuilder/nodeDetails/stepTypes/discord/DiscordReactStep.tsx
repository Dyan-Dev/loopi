import { StepProps } from "@components/automationBuilder/nodeDetails/stepTypes/types";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { DiscordCredentialField } from "./DiscordCredentialField";

export function DiscordReactStep({ step, id, onUpdate }: StepProps) {
  if (step.type !== "discordReactMessage") return null;

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

      <div className="space-y-2">
        <Label className="text-xs">Emoji</Label>
        <Input
          value={step.emoji || ""}
          placeholder=":smile: or unicode codepoint"
          onChange={(e) => onUpdate(id, "update", { step: { ...step, emoji: e.target.value } })}
          className="text-xs"
        />
        <p className="text-[11px] text-muted-foreground">Use unicode or custom emoji name:id</p>
      </div>

      <DiscordCredentialField
        credentialId={step.credentialId}
        botToken={step.botToken}
        onUpdate={(creds) => onUpdate(id, "update", { step: { ...step, ...creds } })}
      />
    </div>
  );
}
