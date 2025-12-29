import { StepProps } from "@components/automationBuilder/nodeDetails/stepTypes/types";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { TwitterCredentialField } from "./TwitterCredentialField";

export function TwitterDeleteTweetStep({ step, id, onUpdate }: StepProps) {
  if (step.type !== "twitterDeleteTweet") return null;

  return (
    <>
      <div className="space-y-2">
        <Label className="text-xs">Tweet ID</Label>
        <Input
          value={step.tweetId || ""}
          placeholder="Tweet ID or URL"
          onChange={(e) => onUpdate(id, "update", { step: { ...step, tweetId: e.target.value } })}
          className="text-xs"
        />
        <p className="text-xs text-gray-500">
          Supports variables like {"{"}
          {"{"}tweetId{"}}"}
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
        <Label className="text-xs">Store Response in Variable (Optional)</Label>
        <Input
          value={step.storeKey || ""}
          placeholder="Variable name (e.g., deleteResponse)"
          onChange={(e) => onUpdate(id, "update", { step: { ...step, storeKey: e.target.value } })}
          className="text-xs"
        />
      </div>
    </>
  );
}
