import { StepProps } from "@components/automationBuilder/nodeDetails/stepTypes/types";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { Textarea } from "@components/ui/textarea";
import { SlackCredentialField } from "./SlackCredentialField";

export function SlackInviteUsersStep({ step, id, onUpdate }: StepProps) {
  if (step.type !== "slackInviteUsers") return null;

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
        <Label className="text-xs">User IDs</Label>
        <Textarea
          value={Array.isArray(step.userIds) ? step.userIds.join("\n") : step.userIds || ""}
          placeholder="User IDs (one per line) or comma-separated"
          onChange={(e) => {
            const userIds = e.target.value
              .split("\n")
              .map((s) => s.trim())
              .filter((s) => s);
            onUpdate(id, "update", { step: { ...step, userIds } });
          }}
          className="text-xs"
          rows={4}
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
