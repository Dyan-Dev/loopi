import { StepProps } from "@components/automationBuilder/nodeDetails/stepTypes/types";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { Switch } from "@components/ui/switch";
import { Textarea } from "@components/ui/textarea";

export function DiscordSendWebhookStep({ step, id, onUpdate }: StepProps) {
  if (step.type !== "discordSendWebhook") return null;

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label className="text-xs">Webhook URL</Label>
        <Input
          value={step.webhookUrl || ""}
          placeholder="https://discord.com/api/webhooks/..."
          onChange={(e) =>
            onUpdate(id, "update", { step: { ...step, webhookUrl: e.target.value } })
          }
          className="text-xs"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Message Content</Label>
        <Textarea
          value={step.content || ""}
          placeholder="Message content"
          onChange={(e) => onUpdate(id, "update", { step: { ...step, content: e.target.value } })}
          className="text-xs"
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Username (optional)</Label>
        <Input
          value={step.username || ""}
          placeholder="Display name override"
          onChange={(e) => onUpdate(id, "update", { step: { ...step, username: e.target.value } })}
          className="text-xs"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Avatar URL (optional)</Label>
        <Input
          value={step.avatarUrl || ""}
          placeholder="Avatar image URL"
          onChange={(e) => onUpdate(id, "update", { step: { ...step, avatarUrl: e.target.value } })}
          className="text-xs"
        />
      </div>

      <div className="flex items-center gap-2">
        <Switch
          checked={!!step.tts}
          onCheckedChange={(checked) => onUpdate(id, "update", { step: { ...step, tts: checked } })}
          id={`${id}-tts-webhook`}
        />
        <Label htmlFor={`${id}-tts-webhook`} className="text-xs">
          Text to Speech
        </Label>
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Embeds JSON (optional)</Label>
        <Textarea
          value={step.embedsJson || ""}
          placeholder='[{"title":"Hello","description":"World"}]'
          onChange={(e) =>
            onUpdate(id, "update", { step: { ...step, embedsJson: e.target.value } })
          }
          className="text-xs font-mono"
          rows={3}
        />
        <p className="text-[11px] text-muted-foreground">
          Provide an array of embed objects as JSON.
        </p>
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Store Response (optional)</Label>
        <Input
          value={step.storeKey || ""}
          placeholder="Variable name"
          onChange={(e) => onUpdate(id, "update", { step: { ...step, storeKey: e.target.value } })}
          className="text-xs"
        />
      </div>
    </div>
  );
}
