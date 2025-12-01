import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";
import { StepProps } from "./types";

export function WaitStep({ step, id, onUpdate }: StepProps) {
  if (step.type !== "wait") return null;

  return (
    <div className="space-y-2">
      <Label className="text-xs">Duration (seconds)</Label>
      <Input
        type="number"
        value={step.value || "1"}
        placeholder="Milliseconds to wait"
        onChange={(e) => onUpdate(id, "update", { step: { ...step, value: e.target.value } })}
        className="text-xs"
      />
    </div>
  );
}
