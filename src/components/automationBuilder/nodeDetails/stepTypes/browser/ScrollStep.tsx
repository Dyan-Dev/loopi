import { SelectorButton } from "@components/automationBuilder/nodeDetails/customComponents";
import { StepProps } from "@components/automationBuilder/nodeDetails/stepTypes/types";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";

export function ScrollStep({ step, id, onUpdate, onPickWithSetter }: StepProps) {
  if (step.type !== "scroll") return null;

  const setType = (t: "toElement" | "byAmount") =>
    onUpdate(id, "update", { step: { ...step, scrollType: t } });

  return (
    <div className="space-y-2">
      <Label className="text-xs">Scroll Type</Label>
      <div className="flex gap-2">
        <button
          className={`px-2 py-1 rounded border text-xs ${step.scrollType === "toElement" ? "bg-gray-100" : ""}`}
          onClick={() => setType("toElement")}
        >
          To element
        </button>
        <button
          className={`px-2 py-1 rounded border text-xs ${step.scrollType === "byAmount" ? "bg-gray-100" : ""}`}
          onClick={() => setType("byAmount")}
        >
          By amount
        </button>
      </div>

      {step.scrollType === "toElement" && (
        <div>
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
                onPickWithSetter &&
                onPickWithSetter(
                  (selector) => onUpdate(id, "update", { step: { ...step, selector } }),
                  strategy
                )
              }
            />
          </div>
        </div>
      )}

      {step.scrollType === "byAmount" && (
        <div>
          <Label className="text-xs">Scroll Amount (pixels)</Label>
          <Input
            value={step.scrollAmount !== undefined ? String(step.scrollAmount) : ""}
            placeholder="e.g. 200"
            onChange={(e) =>
              onUpdate(id, "update", {
                step: { ...step, scrollAmount: parseInt(e.target.value || "0") },
              })
            }
            className="text-xs"
          />
        </div>
      )}
    </div>
  );
}

export default ScrollStep;
