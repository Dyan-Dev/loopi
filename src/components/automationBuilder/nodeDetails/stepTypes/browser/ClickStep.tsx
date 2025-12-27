import { SelectorButton } from "@components/automationBuilder/nodeDetails/customComponents";
import { StepProps } from "@components/automationBuilder/nodeDetails/stepTypes/types";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";

export function ClickStep({ step, id, onUpdate, onPickWithSetter }: StepProps) {
  if (step.type !== "click") return null;

  return (
    <div className="space-y-2">
      <Label className="text-xs">Selector</Label>
      <div className="flex gap-2">
        <Input
          value={step.selector || ""}
          placeholder="Selector"
          onChange={(e) => onUpdate(id, "update", { step: { ...step, selector: e.target.value } })}
          className="text-xs flex-1"
        />
        <SelectorButton
          onPick={async (strategy) =>
            onPickWithSetter(
              (selector) => onUpdate(id, "update", { step: { ...step, selector } }),
              strategy
            )
          }
        />
      </div>
    </div>
  );
}
