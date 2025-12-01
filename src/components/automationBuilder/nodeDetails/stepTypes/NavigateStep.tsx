import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";
import { StepProps } from "./types";

export function NavigateStep({ step, id, onUpdate }: StepProps) {
  if (step.type !== "navigate") return null;

  return (
    <div className="space-y-2">
      <Label className="text-xs">URL</Label>
      <Input
        value={step.value || ""}
        placeholder="https://google.com"
        onChange={(e) => onUpdate(id, "update", { step: { ...step, value: e.target.value } })}
        className="text-xs"
      />
    </div>
  );
}
