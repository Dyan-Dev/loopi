import { StepProps } from "@components/automationBuilder/nodeDetails/stepTypes/types";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { Switch } from "@components/ui/switch";
import { Textarea } from "@components/ui/textarea";
import { SlackCredentialField } from "./SlackCredentialField";

export function SlackSendMessageStep({ step, id, onUpdate }: StepProps) {
  if (step.type !== "slackSendMessage") return null;

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label className="text-xs">Channel ID</Label>
        <Input
          value={step.channelId || ""}
          placeholder="Channel ID or name (e.g., C123456 or #general)"
          onChange={(e) => onUpdate(id, "update", { step: { ...step, channelId: e.target.value } })}
          className="text-xs"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Message Text</Label>
        <Textarea
          value={step.text || ""}
          placeholder="Message content (supports variables like {{variableName}})"
          onChange={(e) => onUpdate(id, "update", { step: { ...step, text: e.target.value } })}
          className="text-xs"
          rows={4}
        />
      </div>

      <div className="flex items-center gap-2">
        <Switch
          checked={!!step.mrkdwn}
          onCheckedChange={(checked) =>
            onUpdate(id, "update", { step: { ...step, mrkdwn: checked } })
          }
          id={`${id}-mrkdwn`}
        />
        <Label htmlFor={`${id}-mrkdwn`} className="text-xs">
          Enable Markdown
        </Label>
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Thread Timestamp (optional)</Label>
        <Input
          value={step.threadTs || ""}
          placeholder="Leave empty for main channel, or use message timestamp for thread"
          onChange={(e) => onUpdate(id, "update", { step: { ...step, threadTs: e.target.value } })}
          className="text-xs"
        />
      </div>

      <div className="flex items-center gap-2">
        <Switch
          checked={!!step.replyBroadcast}
          onCheckedChange={(checked) =>
            onUpdate(id, "update", { step: { ...step, replyBroadcast: checked } })
          }
          id={`${id}-broadcast`}
        />
        <Label htmlFor={`${id}-broadcast`} className="text-xs">
          Reply Broadcast
        </Label>
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Blocks JSON (optional)</Label>
        <Textarea
          value={step.blocksJson || ""}
          placeholder='{"type": "section", "text": {"type": "mrkdwn", "text": "..."}}'
          onChange={(e) =>
            onUpdate(id, "update", { step: { ...step, blocksJson: e.target.value } })
          }
          className="text-xs font-mono text-xs"
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
          placeholder="Variable name (e.g., slackMessage)"
          onChange={(e) => onUpdate(id, "update", { step: { ...step, storeKey: e.target.value } })}
          className="text-xs"
        />
      </div>
    </div>
  );
}
