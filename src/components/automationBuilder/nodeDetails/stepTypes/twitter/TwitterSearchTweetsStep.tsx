import { StepProps } from "@components/automationBuilder/nodeDetails/stepTypes/types";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";

export function TwitterSearchTweetsStep({ step, id, onUpdate }: StepProps) {
  if (step.type !== "twitterSearchTweets") return null;

  return (
    <>
      <div className="space-y-2">
        <Label className="text-xs">Search Query</Label>
        <Input
          value={step.searchQuery || ""}
          placeholder="Search term or query"
          onChange={(e) =>
            onUpdate(id, "update", { step: { ...step, searchQuery: e.target.value } })
          }
          className="text-xs"
        />
        <p className="text-xs text-gray-500">
          Supports operators and variables like {"{"}
          {"{"}keyword{"}}"}
        </p>
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Max Results (Optional)</Label>
        <Input
          type="number"
          value={step.maxResults || ""}
          placeholder="10"
          onChange={(e) =>
            onUpdate(id, "update", { step: { ...step, maxResults: parseInt(e.target.value) } })
          }
          className="text-xs"
          min="1"
          max="100"
        />
        <p className="text-xs text-gray-500">Default: 10, Max: 100</p>
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Start Time (Optional)</Label>
        <Input
          type="datetime-local"
          value={step.startTime || ""}
          onChange={(e) => onUpdate(id, "update", { step: { ...step, startTime: e.target.value } })}
          className="text-xs"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs">End Time (Optional)</Label>
        <Input
          type="datetime-local"
          value={step.endTime || ""}
          onChange={(e) => onUpdate(id, "update", { step: { ...step, endTime: e.target.value } })}
          className="text-xs"
        />
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
        <Label className="text-xs">Store Results in Variable</Label>
        <Input
          value={step.storeKey || ""}
          placeholder="Variable name (e.g., searchResults)"
          onChange={(e) => onUpdate(id, "update", { step: { ...step, storeKey: e.target.value } })}
          className="text-xs"
        />
        <p className="text-xs text-gray-500">Results will be stored as an array of tweets</p>
      </div>
    </>
  );
}
