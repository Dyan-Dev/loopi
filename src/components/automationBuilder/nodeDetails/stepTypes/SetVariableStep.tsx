import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";
import { StepProps } from "./types";

export function SetVariableStep({ step, id, onUpdate }: StepProps) {
  if (step.type !== "setVariable") return null;

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label className="text-xs">Variable Name</Label>
        <Input
          value={step.variableName || ""}
          placeholder="e.g. productTitle"
          onChange={(e) =>
            onUpdate(id, "update", { step: { ...step, variableName: e.target.value } })
          }
          className="text-xs"
        />
      </div>
      <div className="space-y-2">
        <Label className="text-xs">Value (supports {"{{otherVar}}"} references)</Label>
        <Input
          value={step.value || ""}
          placeholder="Use static text or {{otherVar}}"
          onChange={(e) => onUpdate(id, "update", { step: { ...step, value: e.target.value } })}
          className="text-xs"
        />
      </div>
    </div>
  );
}
