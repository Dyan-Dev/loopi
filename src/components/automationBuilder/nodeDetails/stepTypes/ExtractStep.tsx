import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";
import { SelectorButton } from "../customComponents";
import { StepProps } from "./types";

export function ExtractStep({ step, id, onUpdate, onPickWithSetter }: StepProps) {
  if (step.type !== "extract") return null;

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
        <Label className="text-xs">Store in Variable</Label>
        <Input
          value={step.storeKey || ""}
          placeholder="e.g., productPrice, title"
          onChange={(e) => onUpdate(id, "update", { step: { ...step, storeKey: e.target.value } })}
          className="text-xs"
        />
      </div>
    </>
  );
}
