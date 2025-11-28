import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";
import { SelectorButton } from "../customComponents";
import { StepProps } from "./types";

export function ScrollStep({ step, id, onUpdate, onPickWithSetter }: StepProps) {
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
          <Label className="text-xs">CSS Selector</Label>
          <div className="flex gap-2">
            <Input
              value={step.selector || ""}
              placeholder="CSS Selector"
              onChange={(e) => onUpdate(id, "update", { step: { ...step, selector: e.target.value } })}
              className="text-xs flex-1"
            />
            <SelectorButton onPick={async () => onPickWithSetter && onPickWithSetter((selector) => onUpdate(id, "update", { step: { ...step, selector } }))} />
          </div>
        </div>
      )}

      {step.scrollType === "byAmount" && (
        <div>
          <Label className="text-xs">Scroll Amount (pixels)</Label>
          <Input
            value={step.scrollAmount !== undefined ? String(step.scrollAmount) : ""}
            placeholder="e.g. 200"
            onChange={(e) => onUpdate(id, "update", { step: { ...step, scrollAmount: parseInt(e.target.value || "0") } })}
            className="text-xs"
          />
        </div>
      )}
    </div>
  );
}

export default ScrollStep;
