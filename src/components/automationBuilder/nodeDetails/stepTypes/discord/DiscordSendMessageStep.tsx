import { StepProps } from "@components/automationBuilder/nodeDetails/stepTypes/types";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { Switch } from "@components/ui/switch";
import { Textarea } from "@components/ui/textarea";
import { DiscordCredentialField } from "./DiscordCredentialField";

export function DiscordSendMessageStep({ step, id, onUpdate }: StepProps) {
  if (step.type !== "discordSendMessage") return null;

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
        <Label className="text-xs">Message Content</Label>
        <Textarea
          value={step.content || ""}
          placeholder="Message content (supports variables like {{name}})"
          onChange={(e) => onUpdate(id, "update", { step: { ...step, content: e.target.value } })}
          className="text-xs"
          rows={4}
        />
      </div>

      <div className="flex items-center gap-2">
        <Switch
          checked={!!step.tts}
          onCheckedChange={(checked) => onUpdate(id, "update", { step: { ...step, tts: checked } })}
          id={`${id}-tts`}
        />
        <Label htmlFor={`${id}-tts`} className="text-xs">
          Text to Speech
        </Label>
      </div>

      <DiscordCredentialField
        credentialId={step.credentialId}
        botToken={step.botToken}
        onUpdate={(creds) => onUpdate(id, "update", { step: { ...step, ...creds } })}
      />

      <div className="space-y-2">
        <Label className="text-xs">Store Response (optional)</Label>
        <Input
          value={step.storeKey || ""}
          placeholder="Variable name (e.g., discordMessage)"
          onChange={(e) => onUpdate(id, "update", { step: { ...step, storeKey: e.target.value } })}
          className="text-xs"
        />
      </div>
    </div>
  );
}
