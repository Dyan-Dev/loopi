import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";
import { StepProps } from "./types";

export function ModifyVariableStep({ step, id, onUpdate }: StepProps) {
  if (step.type !== "modifyVariable") return null;

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label className="text-xs">Variable Name</Label>
        <Input
          value={step.variableName || ""}
          placeholder="variable name"
          onChange={(e) =>
            onUpdate(id, "update", { step: { ...step, variableName: e.target.value } })
          }
          className="text-xs"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Operation</Label>
        <select
          className="w-full text-xs p-1 border rounded"
          value={step.operation || "set"}
          onChange={(e) => onUpdate(id, "update", { step: { ...step, operation: e.target.value } })}
        >
          <option value="set">Set</option>
          <option value="increment">Increment</option>
          <option value="decrement">Decrement</option>
          <option value="append">Append</option>
        </select>
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Value</Label>
        <Input
          value={step.value || ""}
          placeholder="Value or {{otherVar}}"
          onChange={(e) => onUpdate(id, "update", { step: { ...step, value: e.target.value } })}
          className="text-xs"
        />
      </div>
    </div>
  );
}
