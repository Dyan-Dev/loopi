import { SelectorButton } from "@components/automationBuilder/nodeDetails/customComponents";
import { StepProps } from "@components/automationBuilder/nodeDetails/stepTypes/types";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";

export function SelectOptionStep({ step, id, onUpdate, onPickWithSetter }: StepProps) {
  // Narrow the union type to the specific `selectOption` step so
  // TypeScript knows `selector`, `optionValue`, and `optionIndex` exist.
  if (step.type !== "selectOption") {
    return null;
  }

  return (
    <>
      <div className="space-y-2">
        <Label className="text-xs">Selector</Label>
        <div className="flex gap-2">
          <Input
            value={step.selector || ""}
            placeholder="Selector"
            onChange={(e) =>
              onUpdate(id, "update", { step: { ...step, selector: e.target.value } })
            }
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

      <div className="space-y-2">
        <Label className="text-xs">Option Value</Label>
        <Input
          value={step.optionValue || ""}
          placeholder="Option value to select"
          onChange={(e) =>
            onUpdate(id, "update", { step: { ...step, optionValue: e.target.value } })
          }
          className="text-xs"
        />
      </div>
      <div className="space-y-2">
        <Label className="text-xs">Option Index</Label>
        <Input
          type="number"
          value={step.optionIndex || ""}
          placeholder="Option index to select"
          onChange={(e) =>
            onUpdate(id, "update", { step: { ...step, optionIndex: Number(e.target.value) } })
          }
          className="text-xs"
        />
      </div>
    </>
  );
}
