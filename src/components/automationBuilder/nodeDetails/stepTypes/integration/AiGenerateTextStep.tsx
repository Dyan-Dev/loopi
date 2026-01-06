import { Button } from "@components/ui/button";
import { CredentialSelector } from "@components/ui/credential-selector";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select";
import { Textarea } from "@components/ui/textarea";
import { useState } from "react";
import { StepProps } from "../types";

export function AiGenerateTextStep({ step, id, onUpdate }: StepProps) {
  if (step.type !== "aiGenerateText") return null;

  const [useManualKey, setUseManualKey] = useState(!step.credentialId && !!step.apiKey);

  const handleAuthToggle = () => {
    const nextManual = !useManualKey;
    setUseManualKey(nextManual);
    if (!nextManual) {
      onUpdate(id, "update", { step: { ...step, apiKey: undefined } });
    } else {
      onUpdate(id, "update", { step: { ...step, credentialId: undefined } });
    }
  };

  const updateField = <K extends keyof typeof step>(key: K, value: (typeof step)[K]) => {
    onUpdate(id, "update", { step: { ...step, [key]: value } });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-xs">Provider</Label>
        <Select
          value={step.provider}
          onValueChange={(value) => updateField("provider", value as typeof step.provider)}
        >
          <SelectTrigger className="text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="openai">OpenAI</SelectItem>
            <SelectItem value="anthropic">Anthropic</SelectItem>
            <SelectItem value="ollama">Ollama</SelectItem>
            <SelectItem value="openaiCompatible">OpenAI-Compatible</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Model</Label>
        <Input
          value={step.model || ""}
          placeholder="e.g., gpt-4o-mini, claude-3-5-sonnet"
          onChange={(e) => updateField("model", e.target.value)}
          className="text-xs"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label className="text-xs">Temperature</Label>
          <Input
            type="number"
            min={0}
            max={1}
            step={0.1}
            value={step.temperature ?? 0}
            onChange={(e) => updateField("temperature", Number(e.target.value))}
            className="text-xs"
          />
          <p className="text-[11px] text-muted-foreground">Default 0 for deterministic replies.</p>
        </div>
        <div className="space-y-2">
          <Label className="text-xs">Max Tokens</Label>
          <Input
            type="number"
            min={1}
            value={step.maxTokens ?? 256}
            onChange={(e) => updateField("maxTokens", Number(e.target.value))}
            className="text-xs"
          />
          <p className="text-[11px] text-muted-foreground">
            Caps output size to keep runs predictable.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label className="text-xs">Top P (optional)</Label>
          <Input
            type="number"
            min={0}
            max={1}
            step={0.05}
            value={step.topP ?? ""}
            onChange={(e) =>
              updateField("topP", e.target.value === "" ? undefined : Number(e.target.value))
            }
            className="text-xs"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs">Timeout (ms, optional)</Label>
          <Input
            type="number"
            min={1000}
            step={500}
            value={step.timeoutMs ?? ""}
            onChange={(e) =>
              updateField("timeoutMs", e.target.value === "" ? undefined : Number(e.target.value))
            }
            className="text-xs"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Base URL</Label>
        <Input
          value={step.baseUrl || ""}
          placeholder="https://api.openai.com/v1"
          onChange={(e) => updateField("baseUrl", e.target.value)}
          className="text-xs"
        />
        <p className="text-[11px] text-muted-foreground">
          Set custom gateway URLs for self-hosted or proxy deployments (e.g., Ollama, VLLM).
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs">Authentication</Label>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={handleAuthToggle}
            className="text-xs h-7"
          >
            {useManualKey ? "Use Saved Credential" : "Enter API Key"}
          </Button>
        </div>
        {useManualKey ? (
          <Input
            type="password"
            value={step.apiKey || ""}
            placeholder="API key"
            onChange={(e) => updateField("apiKey", e.target.value)}
            className="text-xs"
          />
        ) : (
          <CredentialSelector
            value={step.credentialId}
            onChange={(credId) => updateField("credentialId", credId)}
            type="apiKey"
            label=""
          />
        )}
      </div>

      <div className="space-y-2">
        <Label className="text-xs">System Prompt (optional)</Label>
        <Textarea
          value={step.systemPrompt || ""}
          placeholder="You are a concise assistant."
          onChange={(e) => updateField("systemPrompt", e.target.value)}
          className="text-xs min-h-16"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs">User Prompt</Label>
        <Textarea
          value={step.prompt || ""}
          placeholder="Summarize {{extractedText}} in one sentence."
          onChange={(e) => updateField("prompt", e.target.value)}
          className="text-xs min-h-24"
        />
        <p className="text-[11px] text-muted-foreground">
          {
            "Supports variables like {{myVar}}. Avoid loops or tool-calls; this node returns a single text reply."
          }
        </p>
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Store Output As</Label>
        <Input
          value={step.storeKey || ""}
          placeholder="aiResponse"
          onChange={(e) => updateField("storeKey", e.target.value)}
          className="text-xs"
        />
      </div>
    </div>
  );
}
