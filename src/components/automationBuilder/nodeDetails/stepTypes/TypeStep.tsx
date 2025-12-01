import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";
import { SelectorButton } from "../customComponents";
import { StepProps } from "./types";

export function TypeStep({ step, id, onUpdate, onPickWithSetter }: StepProps) {
  if (step.type !== "type") return null;

  return (
    <>
      <div className="space-y-2">
        <Label className="text-xs">CSS Selector</Label>
        <div className="flex gap-2">
          <Input
            value={step.selector || ""}
            placeholder="CSS Selector"
            onChange={(e) =>
              onUpdate(id, "update", { step: { ...step, selector: e.target.value } })
            }
            className="text-xs flex-1"
          />
          <SelectorButton
            onPick={async () =>
              onPickWithSetter((selector) =>
                onUpdate(id, "update", { step: { ...step, selector } })
              )
            }
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Text to Type</Label>
        <Input
          value={step.value || ""}
          placeholder="Text to type"
          onChange={(e) => onUpdate(id, "update", { step: { ...step, value: e.target.value } })}
          className="text-xs"
        />
      </div>
    </>
  );
}
