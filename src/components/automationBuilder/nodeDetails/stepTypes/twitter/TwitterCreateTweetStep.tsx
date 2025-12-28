import { StepProps } from "@components/automationBuilder/nodeDetails/stepTypes/types";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { Textarea } from "@components/ui/textarea";

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

      <div className="space-y-2">
        <Label className="text-xs">API Key</Label>
        <Input
          value={step.apiKey || ""}
          placeholder="Your Twitter API Key"
          onChange={(e) => onUpdate(id, "update", { step: { ...step, apiKey: e.target.value } })}
          className="text-xs"
          type="password"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs">API Secret</Label>
        <Input
          value={step.apiSecret || ""}
          placeholder="Your Twitter API Secret"
          onChange={(e) => onUpdate(id, "update", { step: { ...step, apiSecret: e.target.value } })}
          className="text-xs"
          type="password"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Access Token</Label>
        <Input
          value={step.accessToken || ""}
          placeholder="Your Twitter Access Token"
          onChange={(e) =>
            onUpdate(id, "update", { step: { ...step, accessToken: e.target.value } })
          }
          className="text-xs"
          type="password"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Access Token Secret</Label>
        <Input
          value={step.accessSecret || ""}
          placeholder="Your Twitter Access Token Secret"
          onChange={(e) =>
            onUpdate(id, "update", { step: { ...step, accessSecret: e.target.value } })
          }
          className="text-xs"
          type="password"
        />
      </div>

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
