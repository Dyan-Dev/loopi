import { StepProps } from "@components/automationBuilder/nodeDetails/stepTypes/types";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { Textarea } from "@components/ui/textarea";
import { TwitterCredentialField } from "./TwitterCredentialField";

export function TwitterSendDMStep({ step, id, onUpdate }: StepProps) {
  if (step.type !== "twitterSendDM") return null;

  return (
    <>
      <div className="space-y-2">
        <Label className="text-xs">User ID</Label>
        <Input
          value={step.userId || ""}
          placeholder="Twitter user ID or @username"
          onChange={(e) => onUpdate(id, "update", { step: { ...step, userId: e.target.value } })}
          className="text-xs"
        />
        <p className="text-xs text-gray-500">
          Supports variables like {"{"}
          {"{"}recipientId{"}}"}
        </p>
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Message Text</Label>
        <Textarea
          value={step.text || ""}
          placeholder="Your message"
          onChange={(e) => onUpdate(id, "update", { step: { ...step, text: e.target.value } })}
          className="text-xs"
          rows={4}
        />
        <p className="text-xs text-gray-500">
          Supports variables like {"{"}
          {"{"}message{"}}"}
        </p>
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Media ID (Optional)</Label>
        <Input
          value={step.mediaId || ""}
          placeholder="Media ID to attach"
          onChange={(e) => onUpdate(id, "update", { step: { ...step, mediaId: e.target.value } })}
          className="text-xs"
        />
      </div>

      <TwitterCredentialField
        credentialId={step.credentialId}
        apiKey={step.apiKey}
        apiSecret={step.apiSecret}
        accessToken={step.accessToken}
        accessSecret={step.accessSecret}
        onUpdate={(creds) => onUpdate(id, "update", { step: { ...step, ...creds } })}
      />

      <div className="space-y-2">
        <Label className="text-xs">Store Response in Variable (Optional)</Label>
        <Input
          value={step.storeKey || ""}
          placeholder="Variable name (e.g., dmResponse)"
          onChange={(e) => onUpdate(id, "update", { step: { ...step, storeKey: e.target.value } })}
          className="text-xs"
        />
      </div>
    </>
  );
}
