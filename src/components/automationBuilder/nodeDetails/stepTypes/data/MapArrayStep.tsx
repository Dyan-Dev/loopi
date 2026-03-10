import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { Textarea } from "@components/ui/textarea";
import { StepProps } from "../types";

export function MapArrayStep({ step, id, onUpdate }: StepProps) {
  if (step.type !== "mapArray") return null;

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label className="text-xs">Source Array Variable</Label>
        <Input
          value={step.sourceVariable || ""}
          placeholder="e.g. items"
          onChange={(e) =>
            onUpdate(id, "update", { step: { ...step, sourceVariable: e.target.value } })
          }
          className="text-xs"
        />
      </div>
      <div className="space-y-2">
        <Label className="text-xs">Transform Expression</Label>
        <Textarea
          value={step.expression || ""}
          placeholder="e.g. item.name  or  item.price * 1.1"
          onChange={(e) =>
            onUpdate(id, "update", { step: { ...step, expression: e.target.value } })
          }
          className="text-xs min-h-16 font-mono"
        />
        <p className="text-xs text-gray-500">
          Use <code>item</code> for current element, <code>index</code> for position. Simple field
          names (e.g. "name") extract that field from each item.
        </p>
      </div>
      <div className="space-y-2">
        <Label className="text-xs">Store Result As</Label>
        <Input
          value={step.storeKey || ""}
          placeholder="e.g. mappedItems"
          onChange={(e) => onUpdate(id, "update", { step: { ...step, storeKey: e.target.value } })}
          className="text-xs"
        />
      </div>
    </div>
  );
}
