import { StepProps } from "@components/automationBuilder/nodeDetails/stepTypes/types";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";

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
        <Input
          value={step.variableName || ""}
          placeholder="e.g. productTitle"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
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
