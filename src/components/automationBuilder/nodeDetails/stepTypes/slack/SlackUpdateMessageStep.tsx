import { StepProps } from "@components/automationBuilder/nodeDetails/stepTypes/types";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { Textarea } from "@components/ui/textarea";
import { SlackCredentialField } from "./SlackCredentialField";

export function SlackUpdateMessageStep({ step, id, onUpdate }: StepProps) {
  if (step.type !== "slackUpdateMessage") return null;

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label className="text-xs">Channel ID</Label>
        <Input
          value={step.channelId || ""}
          placeholder="Channel ID (e.g., C123456)"
          onChange={(e) => onUpdate(id, "update", { step: { ...step, channelId: e.target.value } })}
          className="text-xs"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Message Timestamp</Label>
        <Input
          value={step.timestamp || ""}
          placeholder="Timestamp of message to update (e.g., 1503435956.000247)"
          onChange={(e) => onUpdate(id, "update", { step: { ...step, timestamp: e.target.value } })}
          className="text-xs"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Updated Message Text</Label>
        <Textarea
          value={step.text || ""}
          placeholder="New message content"
          onChange={(e) => onUpdate(id, "update", { step: { ...step, text: e.target.value } })}
          className="text-xs"
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Blocks JSON (optional)</Label>
        <Textarea
          value={step.blocksJson || ""}
          placeholder='{"type": "section", "text": {"type": "mrkdwn", "text": "..."}}'
          onChange={(e) =>
            onUpdate(id, "update", { step: { ...step, blocksJson: e.target.value } })
          }
          className="text-xs font-mono"
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
          placeholder="Variable name"
          onChange={(e) => onUpdate(id, "update", { step: { ...step, storeKey: e.target.value } })}
          className="text-xs"
        />
      </div>
    </div>
  );
}
