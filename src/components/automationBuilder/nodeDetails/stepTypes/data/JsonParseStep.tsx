import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { StepProps } from "../types";

export function JsonParseStep({ step, id, onUpdate }: StepProps) {
  if (step.type !== "jsonParse") return null;

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label className="text-xs">Source Variable</Label>
        <Input
          value={step.sourceVariable || ""}
          placeholder="e.g. apiResponse"
          onChange={(e) =>
            onUpdate(id, "update", { step: { ...step, sourceVariable: e.target.value } })
          }
          className="text-xs"
        />
        <p className="text-xs text-gray-500">Variable containing a JSON string</p>
      </div>
      <div className="space-y-2">
        <Label className="text-xs">Store Result As</Label>
        <Input
          value={step.storeKey || ""}
          placeholder="e.g. parsedData"
          onChange={(e) => onUpdate(id, "update", { step: { ...step, storeKey: e.target.value } })}
          className="text-xs"
        />
      </div>
    </div>
  );
}
