import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { Switch } from "@components/ui/switch";
import { StepProps } from "../types";

export function JsonStringifyStep({ step, id, onUpdate }: StepProps) {
  if (step.type !== "jsonStringify") return null;

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label className="text-xs">Source Variable</Label>
        <Input
          value={step.sourceVariable || ""}
          placeholder="e.g. dataObject"
          onChange={(e) =>
            onUpdate(id, "update", { step: { ...step, sourceVariable: e.target.value } })
          }
          className="text-xs"
        />
        <p className="text-xs text-gray-500">Variable containing an object or array</p>
      </div>
      <div className="flex items-center gap-2">
        <Switch
          checked={step.pretty || false}
          onCheckedChange={(v) => onUpdate(id, "update", { step: { ...step, pretty: v } })}
        />
        <Label className="text-xs">Pretty print (indented)</Label>
      </div>
      <div className="space-y-2">
        <Label className="text-xs">Store Result As</Label>
        <Input
          value={step.storeKey || ""}
          placeholder="e.g. jsonString"
          onChange={(e) => onUpdate(id, "update", { step: { ...step, storeKey: e.target.value } })}
          className="text-xs"
        />
      </div>
    </div>
  );
}
