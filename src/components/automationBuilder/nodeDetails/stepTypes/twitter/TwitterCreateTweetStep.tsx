import { StepProps } from "@components/automationBuilder/nodeDetails/stepTypes/types";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { Textarea } from "@components/ui/textarea";
import { TwitterCredentialField } from "./TwitterCredentialField";

export function TwitterCreateTweetStep({ step, id, onUpdate }: StepProps) {
  if (step.type !== "twitterCreateTweet") return null;

  return (
    <>
      <div className="space-y-2">
        <Label className="text-xs">Tweet Text</Label>
        <Textarea
          value={step.text || ""}
          placeholder="What's happening?"
          onChange={(e) => onUpdate(id, "update", { step: { ...step, text: e.target.value } })}
          className="text-xs"
          rows={4}
        />
        <p className="text-xs text-gray-500">
          Max 280 characters. Supports variables like {"{"}
          {"{"}message{"}}"}
        </p>
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
        <Label className="text-xs">Reply to Tweet ID (Optional)</Label>
        <Input
          value={step.replyToTweetId || ""}
          placeholder="Tweet ID to reply to"
          onChange={(e) =>
            onUpdate(id, "update", { step: { ...step, replyToTweetId: e.target.value } })
          }
          className="text-xs"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Quote Tweet ID (Optional)</Label>
        <Input
          value={step.quoteTweetId || ""}
          placeholder="Tweet ID to quote"
          onChange={(e) =>
            onUpdate(id, "update", { step: { ...step, quoteTweetId: e.target.value } })
          }
          className="text-xs"
        />
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

      <div className="space-y-2">
        <Label className="text-xs">Store Response in Variable (Optional)</Label>
        <Input
          value={step.storeKey || ""}
          placeholder="Variable name (e.g., tweetResponse)"
          onChange={(e) => onUpdate(id, "update", { step: { ...step, storeKey: e.target.value } })}
          className="text-xs"
        />
        <p className="text-xs text-gray-500">
          Leave empty to skip. Response will include tweet ID and details.
        </p>
      </div>
    </>
  );
}
