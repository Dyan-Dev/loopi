import { StepProps } from "@components/automationBuilder/nodeDetails/stepTypes/types";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { DiscordCredentialField } from "./DiscordCredentialField";

export function DiscordListMessagesStep({ step, id, onUpdate }: StepProps) {
  if (step.type !== "discordListMessages") return null;

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
        <Label className="text-xs">Limit</Label>
        <Input
          type="number"
          value={step.limit?.toString() || "10"}
          placeholder="1-100"
          onChange={(e) =>
            onUpdate(id, "update", { step: { ...step, limit: Number(e.target.value) } })
          }
          className="text-xs"
        />
        <p className="text-[11px] text-muted-foreground">Discord allows up to 100 per request.</p>
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
          placeholder="Variable name (e.g., discordMessages)"
          onChange={(e) => onUpdate(id, "update", { step: { ...step, storeKey: e.target.value } })}
          className="text-xs"
        />
      </div>
    </div>
  );
}
