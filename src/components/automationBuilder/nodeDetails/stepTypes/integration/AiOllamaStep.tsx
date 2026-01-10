import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { Textarea } from "@components/ui/textarea";
import { StepProps } from "../types";

export function AiOllamaStep({ step, id, onUpdate }: StepProps) {
  if (step.type !== "aiOllama") return null;

  const updateField = <K extends keyof typeof step>(key: K, value: (typeof step)[K]) => {
    onUpdate(id, "update", { step: { ...step, [key]: value } });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-xs">Model</Label>
        <Input
          value={step.model || ""}
          placeholder="e.g., mistral, llama2, neural-chat"
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
          placeholder="http://localhost:11434"
          onChange={(e) => updateField("baseUrl", e.target.value)}
          className="text-xs"
        />
        <p className="text-[11px] text-muted-foreground">
          Ollama server endpoint. Default: http://localhost:11434
        </p>
      </div>

      <div className="space-y-2">
        <Label className="text-xs">System Prompt (optional)</Label>
        <Textarea
          value={step.systemPrompt || ""}
          placeholder="You are a helpful assistant."
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
          Supports variables like {`{{myVar}}`}. Returns a single text response.
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
